from pydantic import BaseModel
from typing import List, Optional, Any, Dict
from datetime import datetime

# Auth & User schemas
class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user_id: str
    full_name: str
    email: str
    role_id: str
    role_name: str
    is_admin: bool
    tenant_id: str
    tenant_name: str

class LoginRequest(BaseModel):
    email: str
    password: str

class SwitchUserRequest(BaseModel):
    user_id: str

class UserResponse(BaseModel):
    user_id: str
    tenant_id: str
    role_id: str
    role_name: str
    is_admin: bool
    email: str
    full_name: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class UserCreate(BaseModel):
    email: str
    full_name: str
    password: str = "password123"
    role_id: str

class UserUpdateRole(BaseModel):
    role_id: str

# Role schemas
class RoleResponse(BaseModel):
    role_id: str
    tenant_id: str
    role_name: str
    is_admin: bool
    description: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class RoleCreate(BaseModel):
    role_name: str
    description: Optional[str] = None
    is_admin: bool = False

# Tenant schemas
class TenantResponse(BaseModel):
    tenant_id: str
    tenant_name: str
    status: str
    created_at: datetime
    document_count: Optional[int] = 0
    user_count: Optional[int] = 0
    chunk_count: Optional[int] = 0

    class Config:
        from_attributes = True

# Document schemas
class DocumentAccessInfo(BaseModel):
    role_id: Optional[str] = None
    role_name: Optional[str] = None
    visibility_scope: str

class DocumentResponse(BaseModel):
    document_id: str
    tenant_id: str
    title: str
    filename: str
    file_type: str
    file_size: int
    version: int
    status: str
    error_message: Optional[str] = None
    allowed_roles: List[str]  # Role names
    allowed_role_ids: List[str]
    visibility_scope: str  # ROLE_SCOPED or ALL_TENANT_EMPLOYEES
    chunk_count: int
    created_at: datetime

    class Config:
        from_attributes = True

# Retrieval & Chat schemas
class SourceReference(BaseModel):
    document_id: str
    document_title: str
    source_reference: Optional[str] = "Section"
    chunk_index: int
    similarity_score: float
    snippet: str

class ChatQueryRequest(BaseModel):
    conversation_id: Optional[str] = None
    question: str
    simulate_role_id: Optional[str] = None  # Admin only: to test access as another role

class ChatQueryResponse(BaseModel):
    conversation_id: str
    question: str
    answer: str
    retrieved_sources: List[SourceReference]
    authorized_chunks_count: int
    total_tenant_chunks_count: int
    user_role: str
    tenant_name: str
    is_grounded: bool

class MessageResponse(BaseModel):
    message_id: str
    conversation_id: str
    role: str
    content: str
    retrieved_sources: List[Dict[str, Any]]
    created_at: datetime

    class Config:
        from_attributes = True

class ConversationResponse(BaseModel):
    conversation_id: str
    tenant_id: str
    user_id: str
    title: str
    created_at: datetime
    messages: List[MessageResponse] = []

    class Config:
        from_attributes = True

# Audit schemas
class AuditEventResponse(BaseModel):
    event_id: str
    tenant_id: str
    actor_id: str
    actor_email: Optional[str]
    actor_role: str
    action: str
    outcome: str
    details: Dict[str, Any]
    timestamp: datetime

    class Config:
        from_attributes = True
