from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models import Tenant, Document, DocumentChunk, User
from app.schemas import TenantResponse
from app.auth import get_current_user

router = APIRouter(prefix="/api/tenants", tags=["Tenants"])

@router.get("/current", response_model=TenantResponse)
def get_current_tenant(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    tenant = db.query(Tenant).filter(Tenant.tenant_id == current_user.tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")

    doc_count = db.query(func.count(Document.document_id)).filter(Document.tenant_id == tenant.tenant_id).scalar() or 0
    chunk_count = db.query(func.count(DocumentChunk.chunk_id)).filter(DocumentChunk.tenant_id == tenant.tenant_id).scalar() or 0
    user_count = db.query(func.count(User.user_id)).filter(User.tenant_id == tenant.tenant_id).scalar() or 0

    return TenantResponse(
        tenant_id=tenant.tenant_id,
        tenant_name=tenant.tenant_name,
        status=tenant.status,
        created_at=tenant.created_at,
        document_count=doc_count,
        chunk_count=chunk_count,
        user_count=user_count
    )

