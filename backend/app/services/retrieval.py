import logging
from typing import List, Dict, Any, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, func, cast
from sqlalchemy.dialects.postgresql import JSONB
from app.models import DocumentChunk, Document, User, Role
from app.services.embedding import embedding_service

logger = logging.getLogger(__name__)

class RetrievalService:
    @staticmethod
    def retrieve_authorized_chunks(
        db: Session,
        user: User,
        query_text: str,
        top_k: int = 4,
        simulate_role_id: str = None
    ) -> Tuple[List[Dict[str, Any]], int, int]:
        """
        THE CORE SECURITY BOUNDARY:
        Retrieves only chunks matching:
        1. Tenant isolation: chunk.tenant_id == user.tenant_id
        2. Role authorization:
           - User is Tenant Admin (testing own tenant), OR
           - chunk.visibility_scope == 'ALL_TENANT_EMPLOYEES', OR
           - user's active role_id is in chunk.allowed_role_ids (or simulated role_id if Admin is simulating)

        Returns:
            (authorized_chunks, authorized_count, total_tenant_chunks_count)
        """
        # Resolve effective role
        effective_role_id = user.role_id
        is_admin = bool(user.role and user.role.is_admin)

        if simulate_role_id and is_admin:
            # Admin can simulate testing as a specific role within their own tenant
            effective_role_id = simulate_role_id
            simulated_role = db.query(Role).filter(
                Role.role_id == simulate_role_id,
                Role.tenant_id == user.tenant_id
            ).first()
            is_admin = bool(simulated_role and simulated_role.is_admin)

        # 1. Count total chunks belonging to this tenant for transparency in UI/Audit
        total_tenant_chunks = db.query(func.count(DocumentChunk.chunk_id)).filter(
            DocumentChunk.tenant_id == user.tenant_id
        ).scalar() or 0

        # 2. Build strict authorization condition
        if is_admin and not simulate_role_id:
            # Tenant Admin has full visibility into their OWN tenant's documents
            auth_filter = (DocumentChunk.tenant_id == user.tenant_id)
        else:
            auth_filter = and_(
                DocumentChunk.tenant_id == user.tenant_id,
                or_(
                    DocumentChunk.visibility_scope == "ALL_TENANT_EMPLOYEES",
                    # Check if effective_role_id is in allowed_role_ids JSONB array
                    cast(DocumentChunk.allowed_role_ids, JSONB).contains([effective_role_id])
                )
            )

        # 3. Generate query vector
        query_vector = embedding_service.get_embedding(query_text)

        # 4. Perform vector similarity search filtered at the SQL level
        # Uses pgvector's cosine distance operator (<=>)
        results = db.query(
            DocumentChunk,
            Document.title.label("doc_title"),
            DocumentChunk.embedding.cosine_distance(query_vector).label("distance")
        ).join(
            Document, Document.document_id == DocumentChunk.document_id
        ).filter(
            auth_filter,
            Document.status == "INDEXED"
        ).order_by(
            "distance"
        ).limit(top_k).all()

        authorized_chunks = []
        for chunk, doc_title, distance in results:
            # Cosine similarity is 1.0 - distance
            similarity = max(0.0, 1.0 - float(distance)) if distance is not None else 0.0
            # Filter out chunks that have virtually zero relevance (e.g. similarity < 0.25)
            # unless it's a direct fallback
            if similarity < 0.20 and len(results) > 1:
                continue

            authorized_chunks.append({
                "chunk_id": chunk.chunk_id,
                "document_id": chunk.document_id,
                "document_title": doc_title,
                "source_reference": chunk.source_reference or f"Chunk #{chunk.chunk_index + 1}",
                "chunk_index": chunk.chunk_index,
                "snippet": chunk.chunk_text,
                "similarity_score": round(similarity, 4),
                "visibility_scope": chunk.visibility_scope,
                "allowed_role_ids": chunk.allowed_role_ids
            })

        logger.info(
            f"[RETRIEVAL] Tenant={user.tenant_id} User={user.email} Role={effective_role_id} "
            f"AuthorizedReturned={len(authorized_chunks)} TotalTenantChunks={total_tenant_chunks}"
        )

        return authorized_chunks, len(authorized_chunks), total_tenant_chunks

retrieval_service = RetrievalService()
