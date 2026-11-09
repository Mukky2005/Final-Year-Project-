import pytest
from app.database import SessionLocal, init_db
from app.seed import seed_database
from app.models import Tenant, User, Role, Document, DocumentChunk
from app.services.retrieval import retrieval_service
from app.services.llm import llm_service

@pytest.fixture(scope="module")
def db_session():
    init_db()
    seed_database()
    db = SessionLocal()
    yield db
    db.close()

def test_mvp_01_admin_membership(db_session):
    """MVP-01: Tenant Admin signs in and is bound to Company ABC."""
    admin = db_session.query(User).filter(User.email == "admin@companyabc.com").first()
    assert admin is not None
    assert admin.tenant.tenant_name == "Company ABC"
    assert admin.role.is_admin is True

def test_mvp_02_roles_exist(db_session):
    """MVP-02: Seeded roles: Tech, Finance, Business Analyst."""
    tenant = db_session.query(Tenant).filter(Tenant.tenant_name == "Company ABC").first()
    roles = db_session.query(Role).filter(Role.tenant_id == tenant.tenant_id).all()
    names = [r.role_name for r in roles]
    assert "Tenant Administrator" in names
    assert "Tech Employee" in names
    assert "Finance Employee" in names
    assert "Business Analyst" in names

def test_mvp_03_and_04_documents_indexed(db_session):
    """MVP-03 & MVP-04: Tech & Finance documents uploaded once and indexed with pgvector."""
    tech_doc = db_session.query(Document).filter(Document.title.ilike("%Laptop Security%")).first()
    assert tech_doc is not None
    assert tech_doc.status == "INDEXED"

    finance_doc = db_session.query(Document).filter(Document.title.ilike("%Reimbursement%")).first()
    assert finance_doc is not None
    assert finance_doc.status == "INDEXED"

def test_mvp_05_tech_employee_authorized_retrieval(db_session):
    """MVP-05: Tech employee asks question answered by technical policy."""
    tech_user = db_session.query(User).filter(User.email == "tech@companyabc.com").first()
    chunks, count, total = retrieval_service.retrieve_authorized_chunks(
        db=db_session,
        user=tech_user,
        query_text="What is the laptop disk encryption and SSH rotation policy?"
    )
    assert count > 0
    assert any("laptop" in c["snippet"].lower() or "ssh" in c["snippet"].lower() for c in chunks)

def test_mvp_06_tech_employee_forbidden_finance_policy(db_session):
    """
    MVP-06: CRITICAL ACCESS CONTROL BOUNDARY
    Tech employee asking for finance policy MUST NOT retrieve finance chunks!
    """
    tech_user = db_session.query(User).filter(User.email == "tech@companyabc.com").first()
    chunks, count, total = retrieval_service.retrieve_authorized_chunks(
        db=db_session,
        user=tech_user,
        query_text="What is the employee meal per-diem and expense reimbursement rate?"
    )
    # Filtered chunks must not contain finance documents
    finance_chunks = [c for c in chunks if "reimbursement" in c["document_title"].lower() or "meal" in c["snippet"].lower()]
    assert len(finance_chunks) == 0, "SECURITY BREACH: Finance chunk retrieved for Tech Employee!"

def test_mvp_07_finance_employee_authorized_retrieval(db_session):
    """MVP-07: Finance employee asks finance question and retrieves finance policy."""
    finance_user = db_session.query(User).filter(User.email == "finance@companyabc.com").first()
    chunks, count, total = retrieval_service.retrieve_authorized_chunks(
        db=db_session,
        user=finance_user,
        query_text="How do I submit an expense reimbursement?"
    )
    assert count > 0
    assert any("reimbursement" in c["snippet"].lower() or "meal" in c["snippet"].lower() for c in chunks)

def test_mvp_08_ba_authorized_retrieval(db_session):
    """MVP-08: Business Analyst asks BA policy question and retrieves reporting guidelines."""
    ba_user = db_session.query(User).filter(User.email == "ba@companyabc.com").first()
    chunks, count, total = retrieval_service.retrieve_authorized_chunks(
        db=db_session,
        user=ba_user,
        query_text="What are the reporting standards and PII data masking requirements?"
    )
    assert count > 0
    assert any("pii" in c["snippet"].lower() or "tableau" in c["snippet"].lower() for c in chunks)

def test_mvp_09_all_employees_visibility(db_session):
    """MVP-09: Document assigned to ALL_TENANT_EMPLOYEES is retrievable by both Tech and Finance."""
    tech_user = db_session.query(User).filter(User.email == "tech@companyabc.com").first()
    finance_user = db_session.query(User).filter(User.email == "finance@companyabc.com").first()

    tech_chunks, _, _ = retrieval_service.retrieve_authorized_chunks(
        db_session, tech_user, "Where is the emergency evacuation assembly point?"
    )
    fin_chunks, _, _ = retrieval_service.retrieve_authorized_chunks(
        db_session, finance_user, "Where is the emergency evacuation assembly point?"
    )

    assert any("assembly point" in c["snippet"].lower() for c in tech_chunks)
    assert any("assembly point" in c["snippet"].lower() for c in fin_chunks)

def test_mvp_12_cross_tenant_isolation(db_session):
    """
    MVP-12: Multi-tenant isolation test.
    Company ABC users cannot retrieve Company XYZ documents.
    """
    tech_abc = db_session.query(User).filter(User.email == "tech@companyabc.com").first()
    tech_xyz = db_session.query(User).filter(User.email == "tech@companyxyz.com").first()

    # ABC user asks about Company XYZ secret
    abc_chunks, _, _ = retrieval_service.retrieve_authorized_chunks(
        db_session, tech_abc, "What is the Project Titan port and secret token?"
    )
    # Check that no Titan chunk reached ABC user
    assert not any("titan" in c["snippet"].lower() for c in abc_chunks), "CROSS-TENANT LEAK: Company ABC retrieved Company XYZ chunks!"

    # XYZ user asking same question CAN retrieve their own tenant's chunks
    xyz_chunks, _, _ = retrieval_service.retrieve_authorized_chunks(
        db_session, tech_xyz, "What is the Project Titan port and secret token?"
    )
    assert any("titan" in c["snippet"].lower() for c in xyz_chunks)

def test_company_xyz_intra_tenant_role_isolation(db_session):
    """
    Verifies intra-company role isolation in Company XYZ:
    Quantum Tech cannot access SecOps Incident Response Charter or Compliance Policy,
    SecOps cannot access Quantum Titan architecture or Compliance Policy,
    and Compliance cannot access Quantum Titan architecture.
    """
    tech_xyz = db_session.query(User).filter(User.email == "tech@companyxyz.com").first()
    secops_xyz = db_session.query(User).filter(User.email == "secops@companyxyz.com").first()
    comp_xyz = db_session.query(User).filter(User.email == "compliance@companyxyz.com").first()

    assert tech_xyz is not None
    assert secops_xyz is not None
    assert comp_xyz is not None

    # SecOps asks for Quantum Titan secrets -> must NOT get Titan Quantum Architecture chunks
    secops_chunks, _, _ = retrieval_service.retrieve_authorized_chunks(
        db_session, secops_xyz, "What is the Project Titan port and secret master bypass token?"
    )
    assert not any("quantum architecture" in c["document_title"].lower() or "bypass token" in c["snippet"].lower() for c in secops_chunks), "SECURITY LEAK: SecOps retrieved Quantum Tech secret!"

    # Tech asks for SecOps Level-4 incident response -> must NOT get SecOps chunks
    tech_chunks, _, _ = retrieval_service.retrieve_authorized_chunks(
        db_session, tech_xyz, "What are the Level-4 incident subnet isolation rules and memory dump storage?"
    )
    assert not any("subnet isolation" in c["snippet"].lower() or "secops charter" in c["document_title"].lower() for c in tech_chunks), "SECURITY LEAK: Tech retrieved SecOps Incident policy!"

    # Compliance asks for Quantum Titan secret -> must NOT get Quantum Tech secret chunks
    comp_chunks, _, _ = retrieval_service.retrieve_authorized_chunks(
        db_session, comp_xyz, "What is the Project Titan port and secret master bypass token?"
    )
    assert not any("quantum architecture" in c["document_title"].lower() or "bypass token" in c["snippet"].lower() for c in comp_chunks), "SECURITY LEAK: Compliance retrieved Quantum Tech secret!"

    # Compliance asks for their OWN policy -> allowed
    comp_legit, _, _ = retrieval_service.retrieve_authorized_chunks(
        db_session, comp_xyz, "What is the export control classification for quantum algorithms?"
    )
    assert any("export" in c["snippet"].lower() or "munitions" in c["snippet"].lower() for c in comp_legit)

    # SecOps asks for their OWN policy -> allowed
    secops_legit, _, _ = retrieval_service.retrieve_authorized_chunks(
        db_session, secops_xyz, "What are the Level-4 incident subnet isolation rules and memory dump storage?"
    )
    assert any("subnet isolation" in c["snippet"].lower() for c in secops_legit)

def test_separate_conversation_history_per_user(db_session):
    """
    Verifies that conversations and histories are strictly isolated per user and tenant.
    Every demo role has their own conversation history.
    """
    from app.models import Conversation
    tech_user = db_session.query(User).filter(User.email == "tech@companyabc.com").first()
    finance_user = db_session.query(User).filter(User.email == "finance@companyabc.com").first()

    tech_convs = db_session.query(Conversation).filter(Conversation.user_id == tech_user.user_id).all()
    fin_convs = db_session.query(Conversation).filter(Conversation.user_id == finance_user.user_id).all()

    assert len(tech_convs) > 0
    assert len(fin_convs) > 0

    tech_conv_ids = {c.conversation_id for c in tech_convs}
    fin_conv_ids = {c.conversation_id for c in fin_convs}

    # Zero overlap between users' conversations
    assert tech_conv_ids.isdisjoint(fin_conv_ids)

