from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Role
from app.schemas import UserResponse, UserCreate, UserUpdateRole
from app.auth import require_admin, get_password_hash
from app.services.audit import audit_service

router = APIRouter(prefix="/api/employees", tags=["Employees"])

@router.get("", response_model=List[UserResponse])
def list_employees(
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """List all employees belonging to the admin's tenant."""
    users = db.query(User).filter(User.tenant_id == admin.tenant_id).order_by(User.created_at).all()
    results = []
    for u in users:
        results.append(UserResponse(
            user_id=u.user_id,
            tenant_id=u.tenant_id,
            role_id=u.role_id,
            role_name=u.role.role_name if u.role else "Unknown",
            is_admin=u.role.is_admin if u.role else False,
            email=u.email,
            full_name=u.full_name,
            is_active=u.is_active,
            created_at=u.created_at
        ))
    return results

@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_employee(
    req: UserCreate,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Admin invites/creates an employee within their tenant."""
    existing = db.query(User).filter(User.email == req.email.lower().strip()).first()
    if existing:
        raise HTTPException(status_code=400, detail="User with this email already exists.")

    # Validate role belongs to this tenant
    role = db.query(Role).filter(Role.role_id == req.role_id, Role.tenant_id == admin.tenant_id).first()
    if not role:
        raise HTTPException(status_code=400, detail="Invalid role specified for your tenant.")

    new_user = User(
        tenant_id=admin.tenant_id,
        role_id=role.role_id,
        email=req.email.lower().strip(),
        full_name=req.full_name.strip(),
        password_hash=get_password_hash(req.password),
        is_active=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    audit_service.log_event(
        db=db,
        tenant_id=admin.tenant_id,
        actor_id=admin.user_id,
        actor_email=admin.email,
        actor_role=admin.role.role_name,
        action="EMPLOYEE_INVITED_OR_CREATED",
        outcome="SUCCESS",
        details={"user_id": new_user.user_id, "email": new_user.email, "role": role.role_name}
    )

    return UserResponse(
        user_id=new_user.user_id,
        tenant_id=new_user.tenant_id,
        role_id=new_user.role_id,
        role_name=role.role_name,
        is_admin=role.is_admin,
        email=new_user.email,
        full_name=new_user.full_name,
        is_active=new_user.is_active,
        created_at=new_user.created_at
    )

@router.patch("/{user_id}/role", response_model=UserResponse)
def update_employee_role(
    user_id: str,
    req: UserUpdateRole,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Admin reassigns employee role; takes effect immediately for subsequent queries (FR-05)."""
    user = db.query(User).filter(User.user_id == user_id, User.tenant_id == admin.tenant_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Employee not found in your tenant.")

    new_role = db.query(Role).filter(Role.role_id == req.role_id, Role.tenant_id == admin.tenant_id).first()
    if not new_role:
        raise HTTPException(status_code=400, detail="Invalid role for your tenant.")

    old_role_name = user.role.role_name if user.role else "None"
    user.role_id = new_role.role_id
    db.commit()
    db.refresh(user)

    audit_service.log_event(
        db=db,
        tenant_id=admin.tenant_id,
        actor_id=admin.user_id,
        actor_email=admin.email,
        actor_role=admin.role.role_name,
        action="ROLE_REASSIGNED",
        outcome="SUCCESS",
        details={
            "user_id": user.user_id,
            "email": user.email,
            "old_role": old_role_name,
            "new_role": new_role.role_name
        }
    )

    return UserResponse(
        user_id=user.user_id,
        tenant_id=user.tenant_id,
        role_id=user.role_id,
        role_name=new_role.role_name,
        is_admin=new_role.is_admin,
        email=user.email,
        full_name=user.full_name,
        is_active=user.is_active,
        created_at=user.created_at
    )

@router.patch("/{user_id}/status")
def toggle_employee_status(
    user_id: str,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Activate or deactivate employee account."""
    user = db.query(User).filter(User.user_id == user_id, User.tenant_id == admin.tenant_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Employee not found.")
    if user.user_id == admin.user_id:
        raise HTTPException(status_code=400, detail="Admin cannot deactivate own account.")

    user.is_active = not user.is_active
    db.commit()

    audit_service.log_event(
        db=db,
        tenant_id=admin.tenant_id,
        actor_id=admin.user_id,
        actor_email=admin.email,
        actor_role=admin.role.role_name,
        action="ACCOUNT_STATUS_TOGGLED",
        outcome="SUCCESS",
        details={"user_id": user.user_id, "is_active": user.is_active}
    )

    return {"user_id": user.user_id, "is_active": user.is_active}

