from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import AuditEvent, User
from app.schemas import AuditEventResponse
from app.auth import require_admin

router = APIRouter(prefix="/api/audit", tags=["Audit & Security"])

@router.get("/events", response_model=List[AuditEventResponse])
def get_audit_events(
    limit: int = 50,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Retrieve security audit events for the administrator's tenant (FR-19)."""
    events = db.query(AuditEvent).filter(
        AuditEvent.tenant_id == admin.tenant_id
    ).order_by(AuditEvent.timestamp.desc()).limit(limit).all()
    return events

