from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Role, Tenant
from app.schemas import TokenResponse, LoginRequest, SwitchUserRequest, UserResponse
from app.auth import verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email.lower().strip()).first()
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated"
        )

    token = create_access_token(data={"sub": user.user_id})
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user_id=user.user_id,
        full_name=user.full_name,
        email=user.email,
        role_id=user.role.role_id,
        role_name=user.role.role_name,
        is_admin=user.role.is_admin,
        tenant_id=user.tenant.tenant_id,
        tenant_name=user.tenant.tenant_name
    )

@router.get("/demo-users")
def get_demo_users(db: Session = Depends(get_db)):
    """Provides easy demo users for rapid testing of all personas."""
    users = db.query(User).join(Tenant).join(Role).all()
    results = []
    for u in users:
        results.append({
            "user_id": u.user_id,
            "email": u.email,
            "full_name": u.full_name,
            "role_id": u.role.role_id,
            "role_name": u.role.role_name,
            "is_admin": u.role.is_admin,
            "tenant_id": u.tenant.tenant_id,
            "tenant_name": u.tenant.tenant_name,
            "is_active": u.is_active
        })
    return results

@router.post("/switch-user", response_model=TokenResponse)
def switch_user(req: SwitchUserRequest, db: Session = Depends(get_db)):
    """Switches active demo user persona."""
    user = db.query(User).filter(User.user_id == req.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="User is deactivated")

    token = create_access_token(data={"sub": user.user_id})
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user_id=user.user_id,
        full_name=user.full_name,
        email=user.email,
        role_id=user.role.role_id,
        role_name=user.role.role_name,
        is_admin=user.role.is_admin,
        tenant_id=user.tenant.tenant_id,
        tenant_name=user.tenant.tenant_name
    )

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return UserResponse(
        user_id=current_user.user_id,
        tenant_id=current_user.tenant_id,
        role_id=current_user.role_id,
        role_name=current_user.role.role_name,
        is_admin=current_user.role.is_admin,
        email=current_user.email,
        full_name=current_user.full_name,
        is_active=current_user.is_active,
        created_at=current_user.created_at
    )

