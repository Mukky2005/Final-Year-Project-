import logging
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models import Document, DocumentRoleAccess, DocumentChunk, Role, User
from app.services.extractor import DocumentExtractor
from app.services.chunker import TextChunker
from app.services.embedding import embedding_service
from app.services.audit import audit_service

logger = logging.getLogger(__name__)

class IngestionService:
    @staticmethod
    def ingest_document(
        db: Session,
        admin_user: User,
        title: str,
        filename: str,
        file_bytes: bytes,
        allowed_role_ids: Optional[List[str]] = None,
        is_all_employees: bool = False
    ) -> Document:
        """
        Orchestrates full ingestion:
        - Upload once, assign access by role
        - Extraction -> Chunking -> Embedding -> Vector storage
        - Atomic & fail-closed
        """
        tenant_id = admin_user.tenant_id
        file_size = len(file_bytes)
        ext = filename.split(".")[-1].lower() if "." in filename else "txt"

        visibility_scope = "ALL_TENANT_EMPLOYEES" if is_all_employees else "ROLE_SCOPED"
        effective_role_ids = [] if is_all_employees else (allowed_role_ids or [])

        # Validate roles belong to this tenant
        if not is_all_employees and effective_role_ids:
            valid_roles = db.query(Role.role_id).filter(
                Role.tenant_id == tenant_id,
                Role.role_id.in_(effective_role_ids)
            ).all()
            effective_role_ids = [r[0] for r in valid_roles]

        # 1. Create Document record
        doc = Document(
            tenant_id=tenant_id,
            title=title,
            filename=filename,
            file_type=ext,
            file_size=file_size,
            owner_admin_id=admin_user.user_id,
            status="PROCESSING"
        )
        db.add(doc)
        db.flush()

        # 2. Create DocumentRoleAccess records
        if is_all_employees:
            access = DocumentRoleAccess(
                document_id=doc.document_id,
                role_id=None,
                visibility_scope="ALL_TENANT_EMPLOYEES"
            )
            db.add(access)
        else:
            for r_id in effective_role_ids:
                access = DocumentRoleAccess(
                    document_id=doc.document_id,
                    role_id=r_id,
                    visibility_scope="ROLE_SCOPED"
                )
                db.add(access)

        db.flush()

        try:
            # 3. Extract text
            sections = DocumentExtractor.extract(file_bytes, filename)
            if not sections:
                raise ValueError("Could not extract any readable text from document.")

            # 4. Deterministic Chunking
            raw_chunks = TextChunker.chunk_extracted_sections(sections)
            if not raw_chunks:
                raise ValueError("No valid text chunks generated from extracted text.")

            chunk_texts = [c[1] for c in raw_chunks]

            # 5. Embedding Generation
            vectors = embedding_service.get_embeddings(chunk_texts)

            # 6. Store Chunks in PostgreSQL with pgvector
            for (idx, text_chunk, src_ref), vector in zip(raw_chunks, vectors):
                chunk = DocumentChunk(
                    document_id=doc.document_id,
                    tenant_id=tenant_id,
                    chunk_index=idx,
                    chunk_text=text_chunk,
                    embedding=vector,
                    source_reference=src_ref,
                    visibility_scope=visibility_scope,
                    allowed_role_ids=effective_role_ids
                )
                db.add(chunk)

            doc.status = "INDEXED"
            db.commit()
            db.refresh(doc)

            # Log Audit Event
            audit_service.log_event(
                db=db,
                tenant_id=tenant_id,
                actor_id=admin_user.user_id,
                actor_email=admin_user.email,
                actor_role=admin_user.role.role_name if admin_user.role else "Admin",
                action="DOCUMENT_UPLOAD_AND_INDEXED",
                outcome="SUCCESS",
                details={
                    "document_id": doc.document_id,
                    "title": doc.title,
                    "chunks_count": len(raw_chunks),
                    "visibility_scope": visibility_scope,
                    "allowed_role_ids": effective_role_ids
                }
            )
            return doc

        except Exception as e:
            db.rollback()
            logger.error(f"Ingestion failed for doc {title}: {e}")
            doc.status = "FAILED"
            doc.error_message = str(e)
            db.commit()

            # Clean up any partial chunks if failed
            db.query(DocumentChunk).filter(DocumentChunk.document_id == doc.document_id).delete()
            db.commit()

            audit_service.log_event(
                db=db,
                tenant_id=tenant_id,
                actor_id=admin_user.user_id,
                actor_email=admin_user.email,
                actor_role=admin_user.role.role_name if admin_user.role else "Admin",
                action="DOCUMENT_UPLOAD_FAILED",
                outcome="ERROR",
                details={"title": title, "error": str(e)}
            )
            raise e

ingestion_service = IngestionService()

