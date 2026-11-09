import logging
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models import AuditEvent, User

logger = logging.getLogger(__name__)

class AuditService:
    @staticmethod
    def log_event(
        db: Session,
        tenant_id: str,
        actor_id: str,
        actor_role: str,
        action: str,
        outcome: str = "SUCCESS",
        actor_email: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None
    ) -> AuditEvent:
        event = AuditEvent(
            tenant_id=tenant_id,
            actor_id=actor_id,
            actor_email=actor_email,
            actor_role=actor_role,
            action=action,
            outcome=outcome,
            details=details or {}
        )
        db.add(event)
        try:
            db.commit()
            db.refresh(event)
        except Exception as e:
            db.rollback()
            logger.error(f"Failed to record audit event: {e}")
        return event

audit_service = AuditService()

