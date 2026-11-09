from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Conversation, Message, User, Role
from app.schemas import (
    ChatQueryRequest,
    ChatQueryResponse,
    ConversationResponse,
    SourceReference
)
from app.auth import get_current_user
from app.services.retrieval import retrieval_service
from app.services.llm import llm_service
from app.services.audit import audit_service

router = APIRouter(prefix="/api/chat", tags=["Chat & Retrieval"])

@router.post("/query", response_model=ChatQueryResponse)
def query_knowledge(
    req: ChatQueryRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    CRITICAL WORKFLOW (PRD Section 7, FR-13, FR-14, FR-15):
    1. Authenticate employee identity.
    2. Server resolves tenant_id and active role from database membership.
    3. Mandatory database retrieval filter: tenant_id AND (role_id OR ALL_TENANT_EMPLOYEES).
    4. Only authorized chunks reach Ollama context.
    5. Returns grounded answer + citations.
    """
    question = req.question.strip()
    if not question:
        raise HTTPException(status_code=400, detail="Question cannot be empty.")

    # 1. Database-enforced role and tenant retrieval
    authorized_chunks, auth_count, total_tenant_chunks = retrieval_service.retrieve_authorized_chunks(
        db=db,
        user=current_user,
        query_text=question,
        top_k=4,
        simulate_role_id=req.simulate_role_id
    )

    role_name = current_user.role.role_name if current_user.role else "Employee"
    if req.simulate_role_id and current_user.role.is_admin:
        sim_role = db.query(Role).filter(Role.role_id == req.simulate_role_id).first()
        if sim_role:
            role_name = f"{sim_role.role_name} (Simulated by Admin)"

    tenant_name = current_user.tenant.tenant_name

    # 2. If NO authorized chunks found, fail closed immediately (FR-15, MVP-06)
    if not authorized_chunks:
        answer = "I do not have sufficient information in your permitted knowledge scope to answer this question."
        is_grounded = False
        audit_outcome = "DENIED/INSUFFICIENT_SCOPE"
    else:
        # 3. Construct prompt with ONLY authorized chunks and call Ollama
        answer = llm_service.generate_grounded_answer(
            tenant_name=tenant_name,
            user_role_name=role_name,
            question=question,
            authorized_contexts=authorized_chunks
        )
        is_grounded = "insufficient information" not in answer.lower()
        audit_outcome = "SUCCESS"

    # 4. Format citations
    source_refs = []
    for c in authorized_chunks:
        source_refs.append(SourceReference(
            document_id=c["document_id"],
            document_title=c["document_title"],
            source_reference=c.get("source_reference", "Section"),
            chunk_index=c["chunk_index"],
            similarity_score=c["similarity_score"],
            snippet=c["snippet"]
        ))

    # 5. Persist Conversation & Message (FR-17: user & tenant scoped)
    conversation = None
    if req.conversation_id:
        conversation = db.query(Conversation).filter(
            Conversation.conversation_id == req.conversation_id,
            Conversation.tenant_id == current_user.tenant_id,
            Conversation.user_id == current_user.user_id
        ).first()

    if not conversation:
        conversation = Conversation(
            tenant_id=current_user.tenant_id,
            user_id=current_user.user_id,
            title=question[:40] + ("..." if len(question) > 40 else "")
        )
        db.add(conversation)
        db.flush()

    # User message
    user_msg = Message(
        conversation_id=conversation.conversation_id,
        role="user",
        content=question,
        retrieved_sources=[]
    )
    # Assistant message
    assistant_msg = Message(
        conversation_id=conversation.conversation_id,
        role="assistant",
        content=answer,
        retrieved_sources=[s.dict() for s in source_refs]
    )
    db.add(user_msg)
    db.add(assistant_msg)
    db.commit()

    # 6. Record Audit Event
    audit_service.log_event(
        db=db,
        tenant_id=current_user.tenant_id,
        actor_id=current_user.user_id,
        actor_email=current_user.email,
        actor_role=role_name,
        action="KNOWLEDGE_QUERY",
        outcome=audit_outcome,
        details={
            "question": question,
            "authorized_chunks_count": auth_count,
            "total_tenant_chunks": total_tenant_chunks,
            "citations_count": len(source_refs),
            "simulated": bool(req.simulate_role_id)
        }
    )

    return ChatQueryResponse(
        conversation_id=conversation.conversation_id,
        question=question,
        answer=answer,
        retrieved_sources=source_refs,
        authorized_chunks_count=auth_count,
        total_tenant_chunks_count=total_tenant_chunks,
        user_role=role_name,
        tenant_name=tenant_name,
        is_grounded=is_grounded
    )

@router.get("/conversations", response_model=List[ConversationResponse])
def get_user_conversations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve employee's own conversation history (FR-17)."""
    convs = db.query(Conversation).filter(
        Conversation.tenant_id == current_user.tenant_id,
        Conversation.user_id == current_user.user_id
    ).order_by(Conversation.created_at.desc()).all()
    return convs

@router.get("/conversations/{conversation_id}", response_model=ConversationResponse)
def get_conversation_detail(
    conversation_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """View messages for a specific conversation."""
    conv = db.query(Conversation).filter(
        Conversation.conversation_id == conversation_id,
        Conversation.tenant_id == current_user.tenant_id,
        Conversation.user_id == current_user.user_id
    ).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found.")
    return conv

@router.delete("/conversations/{conversation_id}")
def delete_conversation(
    conversation_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a conversation."""
    conv = db.query(Conversation).filter(
        Conversation.conversation_id == conversation_id,
        Conversation.tenant_id == current_user.tenant_id,
        Conversation.user_id == current_user.user_id
    ).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found.")
    db.delete(conv)
    db.commit()
    return {"message": "Conversation deleted."}

