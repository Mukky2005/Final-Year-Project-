import logging
from sqlalchemy.orm import Session
from app.database import SessionLocal, init_db
from app.models import Tenant, Role, User, Document, DocumentRoleAccess, DocumentChunk, Conversation, Message
from app.auth import get_password_hash
from app.services.chunker import TextChunker
from app.services.embedding import embedding_service

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def seed_database(db: Session = None, force_reseed: bool = False):
    close_at_end = False
    if db is None:
        init_db()
        db = SessionLocal()
        close_at_end = True

    try:
        if force_reseed:
            logger.info("Force reseed requested. Cleaning existing records...")
            db.query(Message).delete()
            db.query(Conversation).delete()
            db.query(DocumentChunk).delete()
            db.query(DocumentRoleAccess).delete()
            db.query(Document).delete()
            db.query(User).delete()
            db.query(Role).delete()
            db.query(Tenant).delete()
            db.commit()
        else:
            # Check if already seeded with all demo roles including XYZ compliance
            existing_compliance = db.query(User).filter(User.email == "compliance@companyxyz.com").first()
            if existing_compliance:
                logger.info("Database already seeded with all demo roles. Skipping initial seeding.")
                return

        logger.info("Starting complete database seeding for Company ABC and Company XYZ...")

        # -------------------------------------------------------------
        # TENANT 1: Company ABC
        # -------------------------------------------------------------
        tenant_abc = Tenant(
            tenant_name="Company ABC",
            status="ACTIVE"
        )
        db.add(tenant_abc)
        db.flush()
        abc_id = tenant_abc.tenant_id

        # Roles for Company ABC
        role_admin = Role(
            tenant_id=abc_id,
            role_name="Tenant Administrator",
            is_admin=True,
            description="Company ABC Administrator with document and employee management rights"
        )
        role_tech = Role(
            tenant_id=abc_id,
            role_name="Tech Employee",
            is_admin=False,
            description="Engineering and IT staff permitted to access technical documentation"
        )
        role_finance = Role(
            tenant_id=abc_id,
            role_name="Finance Employee",
            is_admin=False,
            description="Accounting and finance staff permitted to access financial policies"
        )
        role_ba = Role(
            tenant_id=abc_id,
            role_name="Business Analyst",
            is_admin=False,
            description="Data and business analysis staff permitted to access reporting standards"
        )
        db.add_all([role_admin, role_tech, role_finance, role_ba])
        db.flush()

        # Users for Company ABC
        pw_hash = get_password_hash("password123")
        user_admin = User(
            tenant_id=abc_id,
            role_id=role_admin.role_id,
            email="admin@companyabc.com",
            full_name="ABC Tenant Admin",
            password_hash=pw_hash,
            is_active=True
        )
        user_tech = User(
            tenant_id=abc_id,
            role_id=role_tech.role_id,
            email="tech@companyabc.com",
            full_name="Employee 001 (Tech)",
            password_hash=pw_hash,
            is_active=True
        )
        user_finance = User(
            tenant_id=abc_id,
            role_id=role_finance.role_id,
            email="finance@companyabc.com",
            full_name="Employee 002 (Finance)",
            password_hash=pw_hash,
            is_active=True
        )
        user_ba = User(
            tenant_id=abc_id,
            role_id=role_ba.role_id,
            email="ba@companyabc.com",
            full_name="Employee 003 (Business Analyst)",
            password_hash=pw_hash,
            is_active=True
        )
        db.add_all([user_admin, user_tech, user_finance, user_ba])
        db.flush()

        # Helper to index seed documents
        def create_seed_doc(tenant_id, owner_id, title, filename, text, visibility, role_ids):
            doc = Document(
                tenant_id=tenant_id,
                title=title,
                filename=filename,
                file_type="txt",
                file_size=len(text.encode('utf-8')),
                owner_admin_id=owner_id,
                status="INDEXED"
            )
            db.add(doc)
            db.flush()

            if visibility == "ALL_TENANT_EMPLOYEES":
                db.add(DocumentRoleAccess(
                    document_id=doc.document_id,
                    role_id=None,
                    visibility_scope="ALL_TENANT_EMPLOYEES"
                ))
            else:
                for rid in role_ids:
                    db.add(DocumentRoleAccess(
                        document_id=doc.document_id,
                        role_id=rid,
                        visibility_scope="ROLE_SCOPED"
                    ))
            db.flush()

            raw_chunks = TextChunker.chunk_extracted_sections([("Policy Section", text)])
            vectors = embedding_service.get_embeddings([c[1] for c in raw_chunks])
            for (idx, chunk_text, src_ref), vec in zip(raw_chunks, vectors):
                chunk = DocumentChunk(
                    document_id=doc.document_id,
                    tenant_id=tenant_id,
                    chunk_index=idx,
                    chunk_text=chunk_text,
                    embedding=vec,
                    source_reference=src_ref,
                    visibility_scope=visibility,
                    allowed_role_ids=role_ids if visibility == "ROLE_SCOPED" else []
                )
                db.add(chunk)
            db.flush()
            return doc

        # Doc 1: Technical Policy -> Tech Employee Only
        tech_text = (
            "Company ABC Technical Laptop Security & Engineering Standards 2026.\n"
            "All company-issued laptops must have Full Disk Encryption (FileVault on macOS or BitLocker on Windows) enabled at all times. "
            "Engineers must rotate SSH deployment keys every 60 days without exception. "
            "Connecting unauthorized USB storage devices to developer machines is strictly prohibited by Infosec. "
            "All code commits to GitHub Enterprise repositories require GPG signing and mandatory two-factor authentication (2FA). "
            "Production deployments to the Kubernetes cluster require dual approval from a Senior Site Reliability Engineer."
        )
        doc_tech = create_seed_doc(
            tenant_id=abc_id,
            owner_id=user_admin.user_id,
            title="Engineering & Laptop Security Policy",
            filename="engineering_security_policy.txt",
            text=tech_text,
            visibility="ROLE_SCOPED",
            role_ids=[role_tech.role_id]
        )

        # Doc 2: Finance Policy -> Finance Employee Only
        finance_text = (
            "Company ABC Employee Travel & Expense Reimbursement Policy 2026.\n"
            "To submit an expense reimbursement, employees must file their report via the ERP portal by the 5th business day of each month. "
            "The standard daily meal per-diem allowance during business travel is $75 per day. "
            "An itemized receipt is mandatory for any individual business expense exceeding $25. "
            "Business flight bookings must be submitted through Concur at least 14 days in advance to secure commercial corporate rates. "
            "Personal vehicle mileage for official client visits is reimbursed at the rate of $0.67 per mile."
        )
        doc_finance = create_seed_doc(
            tenant_id=abc_id,
            owner_id=user_admin.user_id,
            title="Travel & Expense Reimbursement Policy",
            filename="finance_reimbursement_policy.txt",
            text=finance_text,
            visibility="ROLE_SCOPED",
            role_ids=[role_finance.role_id]
        )

        # Doc 3: Business Analyst Policy -> Business Analyst Only
        ba_text = (
            "Company ABC Business Intelligence & Data Reporting Standard Operating Procedure.\n"
            "All enterprise reporting dashboards in Tableau and Looker must adhere to the 3-year data retention schedule. "
            "Customer personally identifiable information (PII) must be masked using salted SHA-256 hashing before ingestion into analytics datamarts. "
            "Any modification to core business KPI metrics requires explicit written sign-off from the Lead Business Analyst. "
            "Daily executive summary reports must complete scheduled data warehouse synchronization by 04:00 UTC."
        )
        doc_ba = create_seed_doc(
            tenant_id=abc_id,
            owner_id=user_admin.user_id,
            title="BI & Enterprise Data Reporting Standards",
            filename="bi_reporting_standards.txt",
            text=ba_text,
            visibility="ROLE_SCOPED",
            role_ids=[role_ba.role_id]
        )

        # Doc 4: Company-Wide Policy -> ALL_TENANT_EMPLOYEES
        all_emp_text = (
            "Company ABC General Employee Handbook & Office Guidelines.\n"
            "Core business collaboration hours are Monday through Friday from 10:00 AM to 4:00 PM local time. "
            "In case of an office emergency or fire alarm, all employees must immediately evacuate to designated Assembly Point B in the West parking lot. "
            "Company ABC provides an annual continuous learning and development stipend of $1,500 for each full-time employee. "
            "The company maintains a strict zero-tolerance policy against workplace harassment, discrimination, or intimidation."
        )
        doc_all_abc = create_seed_doc(
            tenant_id=abc_id,
            owner_id=user_admin.user_id,
            title="General Code of Conduct & Office Standards",
            filename="code_of_conduct.txt",
            text=all_emp_text,
            visibility="ALL_TENANT_EMPLOYEES",
            role_ids=[]
        )

        # -------------------------------------------------------------
        # TENANT 2: Company XYZ (Multi-Tenant & Multi-Role)
        # -------------------------------------------------------------
        tenant_xyz = Tenant(
            tenant_name="Company XYZ",
            status="ACTIVE"
        )
        db.add(tenant_xyz)
        db.flush()
        xyz_id = tenant_xyz.tenant_id

        role_xyz_admin = Role(
            tenant_id=xyz_id,
            role_name="Tenant Administrator",
            is_admin=True,
            description="Company XYZ Administrator"
        )
        role_xyz_tech = Role(
            tenant_id=xyz_id,
            role_name="Quantum Tech Engineer",
            is_admin=False,
            description="XYZ Quantum Computing & Infrastructure Engineering Staff"
        )
        role_xyz_secops = Role(
            tenant_id=xyz_id,
            role_name="Security Operations Analyst",
            is_admin=False,
            description="XYZ Cyber Threat Monitoring & Incident Response Staff"
        )
        role_xyz_compliance = Role(
            tenant_id=xyz_id,
            role_name="Compliance & Legal Officer",
            is_admin=False,
            description="XYZ International Export Control, AI Safety, and Whistleblower Protection Staff"
        )
        db.add_all([role_xyz_admin, role_xyz_tech, role_xyz_secops, role_xyz_compliance])
        db.flush()

        user_xyz_admin = User(
            tenant_id=xyz_id,
            role_id=role_xyz_admin.role_id,
            email="admin@companyxyz.com",
            full_name="XYZ Administrator",
            password_hash=pw_hash,
            is_active=True
        )
        user_xyz_tech = User(
            tenant_id=xyz_id,
            role_id=role_xyz_tech.role_id,
            email="tech@companyxyz.com",
            full_name="XYZ Quantum Tech Staff",
            password_hash=pw_hash,
            is_active=True
        )
        user_xyz_secops = User(
            tenant_id=xyz_id,
            role_id=role_xyz_secops.role_id,
            email="secops@companyxyz.com",
            full_name="XYZ SecOps Analyst",
            password_hash=pw_hash,
            is_active=True
        )
        user_xyz_compliance = User(
            tenant_id=xyz_id,
            role_id=role_xyz_compliance.role_id,
            email="compliance@companyxyz.com",
            full_name="XYZ Compliance Officer",
            password_hash=pw_hash,
            is_active=True
        )
        db.add_all([user_xyz_admin, user_xyz_tech, user_xyz_secops, user_xyz_compliance])
        db.flush()

        # XYZ Document 1: Quantum Tech Only
        xyz_secret_text = (
            "Company XYZ Confidential Proprietary Quantum Architecture Protocol.\n"
            "The Project Titan quantum cryptographic gateway runs exclusively on internal secure port 9999. "
            "The master security bypass token for Company XYZ Titan nodes is TITAN-XYZ-CONFIDENTIAL-8888. "
            "Quantum key distribution (QKD) channels refresh every 10 milliseconds over dedicated dark fiber loops. "
            "Never disclose this proprietary protocol to external entities or other companies."
        )
        doc_xyz_titan = create_seed_doc(
            tenant_id=xyz_id,
            owner_id=user_xyz_admin.user_id,
            title="Company XYZ Proprietary Quantum Architecture",
            filename="xyz_proprietary.txt",
            text=xyz_secret_text,
            visibility="ROLE_SCOPED",
            role_ids=[role_xyz_tech.role_id]
        )

        # XYZ Document 2: SecOps Analyst Only
        xyz_secops_text = (
            "Company XYZ Threat Level Incident Response & Subnet Containment Charter 2026.\n"
            "All Level-4 ransomware or data exfiltration events require immediate physical and logical subnet isolation within 15 minutes. "
            "Volatile memory dumps from compromised hosts must be transferred directly to encrypted offline vault storage 'vault-xyz-secops'. "
            "The Chief Information Security Officer (CISO) and the Board of Directors must receive formal containment reports within 2 hours of incident declaration. "
            "Do not disclose incident details to unvetted internal staff or external parties without legal sign-off."
        )
        doc_xyz_secops = create_seed_doc(
            tenant_id=xyz_id,
            owner_id=user_xyz_admin.user_id,
            title="Company XYZ Cyber Incident Response Charter",
            filename="xyz_secops_charter.txt",
            text=xyz_secops_text,
            visibility="ROLE_SCOPED",
            role_ids=[role_xyz_secops.role_id]
        )

        # XYZ Document 3: Compliance & Legal Officer Only
        xyz_compliance_text = (
            "Company XYZ Export Control, ITAR Classification & AI Governance Policy 2026.\n"
            "Under US Export Administration Regulations (EAR99/ITAR), proprietary quantum algorithmic weights and entanglement encryption keys are classified as Category 5 dual-use cryptographic munitions. "
            "Cross-border transfer or foreign national access to Project Titan codebase requires an approved export license from the Department of State. "
            "Internal whistleblower complaints regarding export violations or unethical AI capability misuse must be logged securely to legal counsel at whistleblower@companyxyz.com with guaranteed non-retaliation."
        )
        doc_xyz_compliance = create_seed_doc(
            tenant_id=xyz_id,
            owner_id=user_xyz_admin.user_id,
            title="Company XYZ Export Control & AI Governance Policy",
            filename="xyz_export_compliance_policy.txt",
            text=xyz_compliance_text,
            visibility="ROLE_SCOPED",
            role_ids=[role_xyz_compliance.role_id]
        )

        # XYZ Document 4: Company-Wide for XYZ
        xyz_all_text = (
            "Company XYZ Global Facility & Sector 7 Operational Standards.\n"
            "Access to Company XYZ Sector 7 cleanrooms requires dual-factor biometric retina verification in addition to RFID smartcard badges. "
            "Visitors must be registered 24 hours in advance and escorted at all times by a permanent employee. "
            "The Company XYZ emergency security operations hotline is extension 4999."
        )
        doc_xyz_all = create_seed_doc(
            tenant_id=xyz_id,
            owner_id=user_xyz_admin.user_id,
            title="Company XYZ Facility & Sector 7 Guidelines",
            filename="xyz_facility_guidelines.txt",
            text=xyz_all_text,
            visibility="ALL_TENANT_EMPLOYEES",
            role_ids=[]
        )

        # -------------------------------------------------------------
        # SEED SEPARATE CONVERSATIONS AND HISTORIES FOR EVERY DEMO ROLE
        # -------------------------------------------------------------
        def create_seed_conversation(tenant_id, user, title, q, a, sources):
            conv = Conversation(
                tenant_id=tenant_id,
                user_id=user.user_id,
                title=title
            )
            db.add(conv)
            db.flush()
            db.add(Message(
                conversation_id=conv.conversation_id,
                role="user",
                content=q,
                retrieved_sources=[]
            ))
            db.add(Message(
                conversation_id=conv.conversation_id,
                role="assistant",
                content=a,
                retrieved_sources=sources
            ))
            db.flush()

        # 1. Tech Employee ABC past chat
        create_seed_conversation(
            tenant_id=abc_id,
            user=user_tech,
            title="Laptop & SSH Policy",
            q="What is the laptop disk encryption and SSH rotation policy?",
            a="According to the Engineering & Laptop Security Policy:\n• All company-issued laptops must have Full Disk Encryption (FileVault on macOS or BitLocker on Windows) enabled at all times.\n• Engineers must rotate SSH deployment keys every 60 days without exception.",
            sources=[{
                "document_id": doc_tech.document_id,
                "document_title": "Engineering & Laptop Security Policy",
                "source_reference": "Policy Section",
                "chunk_index": 0,
                "similarity_score": 0.82,
                "snippet": "All company-issued laptops must have Full Disk Encryption enabled at all times. Engineers must rotate SSH deployment keys every 60 days without exception."
            }]
        )

        # 2. Finance Employee ABC past chat
        create_seed_conversation(
            tenant_id=abc_id,
            user=user_finance,
            title="Expense Filing & Per-Diem",
            q="What is the daily meal per-diem and expense filing deadline?",
            a="Based on the Travel & Expense Reimbursement Policy:\n• The standard daily meal per-diem allowance during business travel is $75 per day.\n• Expense reimbursement reports must be submitted via the ERP portal by the 5th business day of each month.",
            sources=[{
                "document_id": doc_finance.document_id,
                "document_title": "Travel & Expense Reimbursement Policy",
                "source_reference": "Policy Section",
                "chunk_index": 0,
                "similarity_score": 0.85,
                "snippet": "The standard daily meal per-diem allowance during business travel is $75 per day. To submit an expense reimbursement, employees must file their report via the ERP portal by the 5th business day of each month."
            }]
        )

        # 3. Business Analyst ABC past chat
        create_seed_conversation(
            tenant_id=abc_id,
            user=user_ba,
            title="BI Data Retention & PII",
            q="What are the data retention and PII masking rules?",
            a="According to the BI & Enterprise Data Reporting Standards:\n• All reporting dashboards in Tableau and Looker must adhere to the 3-year data retention schedule.\n• Customer PII must be masked using salted SHA-256 hashing before ingestion into analytics datamarts.",
            sources=[{
                "document_id": doc_ba.document_id,
                "document_title": "BI & Enterprise Data Reporting Standards",
                "source_reference": "Policy Section",
                "chunk_index": 0,
                "similarity_score": 0.81,
                "snippet": "All enterprise reporting dashboards in Tableau and Looker must adhere to the 3-year data retention schedule. Customer personally identifiable information (PII) must be masked using salted SHA-256 hashing."
            }]
        )

        # 4. Tech Employee XYZ past chat (Company XYZ)
        create_seed_conversation(
            tenant_id=xyz_id,
            user=user_xyz_tech,
            title="Titan Quantum Gateway",
            q="What is the Titan port and master security bypass token?",
            a="Based on the Company XYZ Proprietary Quantum Architecture:\n• The Project Titan quantum cryptographic gateway runs on port 9999.\n• The master security bypass token is TITAN-XYZ-CONFIDENTIAL-8888.",
            sources=[{
                "document_id": doc_xyz_titan.document_id,
                "document_title": "Company XYZ Proprietary Quantum Architecture",
                "source_reference": "Policy Section",
                "chunk_index": 0,
                "similarity_score": 0.88,
                "snippet": "The Project Titan quantum cryptographic gateway runs exclusively on internal secure port 9999. The master security bypass token for Company XYZ Titan nodes is TITAN-XYZ-CONFIDENTIAL-8888."
            }]
        )

        # 5. SecOps Analyst XYZ past chat (Company XYZ)
        create_seed_conversation(
            tenant_id=xyz_id,
            user=user_xyz_secops,
            title="Subnet Isolation Protocols",
            q="What are the subnet isolation rules for Level-4 security incidents?",
            a="According to the Company XYZ Cyber Incident Response Charter:\n• All Level-4 ransomware or data exfiltration events require immediate subnet isolation within 15 minutes.\n• Memory dumps must be archived to encrypted offline vault storage 'vault-xyz-secops'.",
            sources=[{
                "document_id": doc_xyz_secops.document_id,
                "document_title": "Company XYZ Cyber Incident Response Charter",
                "source_reference": "Policy Section",
                "chunk_index": 0,
                "similarity_score": 0.86,
                "snippet": "All Level-4 ransomware or data exfiltration events require immediate physical and logical subnet isolation within 15 minutes. Volatile memory dumps must be transferred directly to encrypted offline vault storage 'vault-xyz-secops'."
            }]
        )

        # 6. Compliance & Legal Officer XYZ past chat (Company XYZ)
        create_seed_conversation(
            tenant_id=xyz_id,
            user=user_xyz_compliance,
            title="Export Control & ITAR Munitions",
            q="What is the export control classification for quantum algorithms and the whistleblower channel?",
            a="Based on the Company XYZ Export Control & AI Governance Policy:\n• Proprietary quantum algorithmic weights are classified as Category 5 dual-use cryptographic munitions under EAR99/ITAR.\n• Whistleblower reports must be filed securely with legal counsel at whistleblower@companyxyz.com with guaranteed non-retaliation.",
            sources=[{
                "document_id": doc_xyz_compliance.document_id,
                "document_title": "Company XYZ Export Control & AI Governance Policy",
                "source_reference": "Policy Section",
                "chunk_index": 0,
                "similarity_score": 0.89,
                "snippet": "Under US Export Administration Regulations (EAR99/ITAR), proprietary quantum algorithmic weights and entanglement encryption keys are classified as Category 5 dual-use cryptographic munitions. Whistleblower complaints must be logged securely to legal counsel at whistleblower@companyxyz.com."
            }]
        )

        db.commit()
        logger.info("Successfully completed full multi-tenant, multi-role seed with separate histories!")

    except Exception as e:
        db.rollback()
        logger.error(f"Seeding failed: {e}")
        raise e
    finally:
        if close_at_end:
            db.close()

if __name__ == "__main__":
    seed_database(force_reseed=True)
