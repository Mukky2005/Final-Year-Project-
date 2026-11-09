import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, Integer, DateTime, ForeignKey, Text, JSON
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from pgvector.sqlalchemy import Vector
from app.database import Base
from app.config import settings

class Tenant(Base):
    __tablename__ = "tenants"

    tenant_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_name = Column(String(255), nullable=False)
    status = Column(String(50), default="ACTIVE")
    database_reference = Column(String(255), default="default")
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    roles = relationship("Role", back_populates="tenant", cascade="all, delete-orphan")
    users = relationship("User", back_populates="tenant", cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="tenant", cascade="all, delete-orphan")
    chunks = relationship("DocumentChunk", back_populates="tenant", cascade="all, delete-orphan")
    conversations = relationship("Conversation", back_populates="tenant", cascade="all, delete-orphan")
    audit_events = relationship("AuditEvent", back_populates="tenant", cascade="all, delete-orphan")


class Role(Base):
    __tablename__ = "roles"

    role_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String(36), ForeignKey("tenants.tenant_id", ondelete="CASCADE"), nullable=False)
    role_name = Column(String(100), nullable=False)
    is_admin = Column(Boolean, default=False)
    description = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    tenant = relationship("Tenant", back_populates="roles")
    users = relationship("User", back_populates="role")
    document_accesses = relationship("DocumentRoleAccess", back_populates="role", cascade="all, delete-orphan")


class User(Base):
    __tablename__ = "users"

    user_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String(36), ForeignKey("tenants.tenant_id", ondelete="CASCADE"), nullable=False)
    role_id = Column(String(36), ForeignKey("roles.role_id"), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    password_hash = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    tenant = relationship("Tenant", back_populates="users")
    role = relationship("Role", back_populates="users")
    conversations = relationship("Conversation", back_populates="user", cascade="all, delete-orphan")


class Document(Base):
    __tablename__ = "documents"

    document_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String(36), ForeignKey("tenants.tenant_id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    filename = Column(String(255), nullable=False)
    file_type = Column(String(50), nullable=False)
    file_size = Column(Integer, default=0)
    owner_admin_id = Column(String(36), ForeignKey("users.user_id"), nullable=False)
    version = Column(Integer, default=1)
    status = Column(String(50), default="QUEUED")  # QUEUED, PROCESSING, INDEXED, FAILED
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    tenant = relationship("Tenant", back_populates="documents")
    role_accesses = relationship("DocumentRoleAccess", back_populates="document", cascade="all, delete-orphan")
    chunks = relationship("DocumentChunk", back_populates="document", cascade="all, delete-orphan")


class DocumentRoleAccess(Base):
    __tablename__ = "document_role_access"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    document_id = Column(String(36), ForeignKey("documents.document_id", ondelete="CASCADE"), nullable=False)
    role_id = Column(String(36), ForeignKey("roles.role_id", ondelete="CASCADE"), nullable=True)
    visibility_scope = Column(String(50), default="ROLE_SCOPED")  # ROLE_SCOPED or ALL_TENANT_EMPLOYEES

    document = relationship("Document", back_populates="role_accesses")
    role = relationship("Role", back_populates="document_accesses")


class DocumentChunk(Base):
    __tablename__ = "document_chunks"

    chunk_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    document_id = Column(String(36), ForeignKey("documents.document_id", ondelete="CASCADE"), nullable=False)
    tenant_id = Column(String(36), ForeignKey("tenants.tenant_id", ondelete="CASCADE"), nullable=False)
    chunk_index = Column(Integer, nullable=False)
    chunk_text = Column(Text, nullable=False)
    embedding = Column(Vector(settings.EMBEDDING_DIMENSION), nullable=False)
    source_reference = Column(String(255), nullable=True)  # e.g., "Page 1", "Section 2"
    visibility_scope = Column(String(50), default="ROLE_SCOPED")  # ROLE_SCOPED or ALL_TENANT_EMPLOYEES
    allowed_role_ids = Column(JSONB, default=list)  # list of role_ids

    document = relationship("Document", back_populates="chunks")
    tenant = relationship("Tenant", back_populates="chunks")


class Conversation(Base):
    __tablename__ = "conversations"

    conversation_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String(36), ForeignKey("tenants.tenant_id", ondelete="CASCADE"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), default="New Query")
    created_at = Column(DateTime, default=datetime.utcnow)

    tenant = relationship("Tenant", back_populates="conversations")
    user = relationship("User", back_populates="conversations")
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan", order_by="Message.created_at")


class Message(Base):
    __tablename__ = "messages"

    message_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    conversation_id = Column(String(36), ForeignKey("conversations.conversation_id", ondelete="CASCADE"), nullable=False)
    role = Column(String(20), nullable=False)  # "user" or "assistant"
    content = Column(Text, nullable=False)
    retrieved_sources = Column(JSON, default=list)  # citations list with doc title, section, chunk_id
    created_at = Column(DateTime, default=datetime.utcnow)

    conversation = relationship("Conversation", back_populates="messages")


class AuditEvent(Base):
    __tablename__ = "audit_events"

    event_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String(36), ForeignKey("tenants.tenant_id", ondelete="CASCADE"), nullable=False)
    actor_id = Column(String(36), nullable=False)
    actor_email = Column(String(255), nullable=True)
    actor_role = Column(String(100), nullable=False)
    action = Column(String(100), nullable=False)
    outcome = Column(String(50), default="SUCCESS")  # SUCCESS, DENIED, ERROR
    details = Column(JSON, default=dict)
    timestamp = Column(DateTime, default=datetime.utcnow)

    tenant = relationship("Tenant", back_populates="audit_events")
