import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models import Document, DocumentRoleAccess, DocumentChunk, Role, User
from app.schemas import DocumentResponse
from app.auth import require_admin
from app.services.ingestion import ingestion_service
from app.services.audit import audit_service

router = APIRouter(prefix="/api/documents", tags=["Documents"])

@router.get("", response_model=List[DocumentResponse])
def list_documents(
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Lists all documents uploaded to this tenant."""
    docs = db.query(Document).filter(
        Document.tenant_id == admin.tenant_id
    ).order_by(Document.created_at.desc()).all()

    results = []
    for doc in docs:
        # Get allowed roles
        accesses = db.query(DocumentRoleAccess).filter(DocumentRoleAccess.document_id == doc.document_id).all()
        is_all = any(a.visibility_scope == "ALL_TENANT_EMPLOYEES" for a in accesses)
        
        allowed_roles = []
        allowed_role_ids = []
        if is_all:
            allowed_roles = ["All Tenant Employees"]
            visibility_scope = "ALL_TENANT_EMPLOYEES"
        else:
            visibility_scope = "ROLE_SCOPED"
            for a in accesses:
                if a.role:
                    allowed_roles.append(a.role.role_name)
                    allowed_role_ids.append(a.role_id)

        # Chunk count
        chunk_count = db.query(func.count(DocumentChunk.chunk_id)).filter(
            DocumentChunk.document_id == doc.document_id
        ).scalar() or 0

        results.append(DocumentResponse(
            document_id=doc.document_id,
            tenant_id=doc.tenant_id,
            title=doc.title,
            filename=doc.filename,
            file_type=doc.file_type,
            file_size=doc.file_size,
            version=doc.version,
            status=doc.status,
            error_message=doc.error_message,
            allowed_roles=allowed_roles,
            allowed_role_ids=allowed_role_ids,
            visibility_scope=visibility_scope,
            chunk_count=chunk_count,
            created_at=doc.created_at
        ))
    return results

@router.post("/upload", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    file: UploadFile = File(...),
    title: str = Form(...),
    allowed_role_ids: Optional[str] = Form(None),  # JSON string or comma-separated
    is_all_employees: bool = Form(False),
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Upload once, assign access by role (PRD 6.1, FR-07, FR-08).
    Extracts text, chunks it, generates vectors via Ollama, and indexes into pgvector.
    """
    # Validate extension
    allowed_exts = ["txt", "pdf", "docx", "md"]
    ext = file.filename.split(".")[-1].lower() if "." in file.filename else ""
    if ext not in allowed_exts:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format '{ext}'. Supported formats: {', '.join(allowed_exts)}"
        )

    # Read content & validate size (max 20MB)
    content = await file.read()
    if len(content) > 20 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File size exceeds maximum limit of 20MB.")
    if len(content) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    # Parse allowed_role_ids
    parsed_role_ids = []
    if not is_all_employees and allowed_role_ids:
        try:
            # Try JSON array first
            parsed_role_ids = json.loads(allowed_role_ids)
        except Exception:
            # Fallback to comma separated
            parsed_role_ids = [r.strip() for r in allowed_role_ids.split(",") if r.strip()]

    if not is_all_employees and not parsed_role_ids:
        raise HTTPException(
            status_code=400,
            detail="Please select at least one employee role or choose 'All tenant employees'."
        )

    try:
        doc = ingestion_service.ingest_document(
            db=db,
            admin_user=admin,
            title=title.strip(),
            filename=file.filename,
            file_bytes=content,
            allowed_role_ids=parsed_role_ids,
            is_all_employees=is_all_employees
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Document ingestion failed: {str(e)}")

    # Fetch role names for response
    chunk_count = db.query(func.count(DocumentChunk.chunk_id)).filter(
        DocumentChunk.document_id == doc.document_id
    ).scalar() or 0

    allowed_roles = []
    if is_all_employees:
        allowed_roles = ["All Tenant Employees"]
    else:
        roles = db.query(Role.role_name).filter(Role.role_id.in_(parsed_role_ids)).all()
        allowed_roles = [r[0] for r in roles]

    return DocumentResponse(
        document_id=doc.document_id,
        tenant_id=doc.tenant_id,
        title=doc.title,
        filename=doc.filename,
        file_type=doc.file_type,
        file_size=doc.file_size,
        version=doc.version,
        status=doc.status,
        error_message=doc.error_message,
        allowed_roles=allowed_roles,
        allowed_role_ids=parsed_role_ids,
        visibility_scope="ALL_TENANT_EMPLOYEES" if is_all_employees else "ROLE_SCOPED",
        chunk_count=chunk_count,
        created_at=doc.created_at
    )

@router.delete("/{document_id}")
def delete_document(
    document_id: str,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    FR-18, MVP-11: Deletion removes or invalidates all associated chunks and embeddings.
    """
    doc = db.query(Document).filter(
        Document.document_id == document_id,
        Document.tenant_id == admin.tenant_id
    ).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found in your tenant.")

    title = doc.title
    # Delete chunks first (or cascade)
    db.query(DocumentChunk).filter(DocumentChunk.document_id == document_id).delete()
    db.delete(doc)
    db.commit()

    audit_service.log_event(
        db=db,
        tenant_id=admin.tenant_id,
        actor_id=admin.user_id,
        actor_email=admin.email,
        actor_role=admin.role.role_name,
        action="DOCUMENT_DELETED",
        outcome="SUCCESS",
        details={"document_id": document_id, "title": title}
    )

    return {"message": f"Document '{title}' and all associated vectors deleted successfully."}

