from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Role, User
from app.schemas import RoleResponse, RoleCreate
from app.auth import get_current_user, require_admin
from app.services.audit import audit_service

router = APIRouter(prefix="/api/roles", tags=["Roles"])

@router.get("", response_model=List[RoleResponse])
def get_roles(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all roles defined within the authenticated user's tenant."""
    roles = db.query(Role).filter(Role.tenant_id == current_user.tenant_id).order_by(Role.created_at).all()
    return roles

@router.post("", response_model=RoleResponse, status_code=status.HTTP_201_CREATED)
def create_role(
    req: RoleCreate,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Allows Tenant Administrator to create a custom role (FR-06)."""
    # Check if role with same name exists in this tenant
    existing = db.query(Role).filter(
        Role.tenant_id == admin.tenant_id,
        Role.role_name == req.role_name.strip()
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="A role with this name already exists in your tenant.")

    role = Role(
        tenant_id=admin.tenant_id,
        role_name=req.role_name.strip(),
        description=req.description,
        is_admin=req.is_admin
    )
    db.add(role)
    db.commit()
    db.refresh(role)

    audit_service.log_event(
        db=db,
        tenant_id=admin.tenant_id,
        actor_id=admin.user_id,
        actor_email=admin.email,
        actor_role=admin.role.role_name,
        action="ROLE_CREATED",
        outcome="SUCCESS",
        details={"role_id": role.role_id, "role_name": role.role_name}
    )

    return role

