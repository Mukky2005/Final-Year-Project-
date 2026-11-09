# TRUSTRA
**AI that knows what you are allowed to know.**
*Enterprise Multi-Tenant & Role-Isolated Knowledge Engine (MVP 1.0)*

A tenant-isolated web application allowing companies to manage internal policy documents and give employees role-appropriate answers without exposing documents assigned to other roles or tenants.

---

## 🛡️ Central Product & Security Rule

> **Tenant and role authorization MUST be applied before retrieved content reaches the language model.**
>
> A system prompt reminds the model of the user role, but it is **not** the security boundary. The PostgreSQL `pgvector` database query and server-side authorization logic enforce which chunks are retrieved. Unauthorized chunks never enter model context.

```
┌────────────────────────────────────────────────────────┐
│ 1. User signs in (JWT validated, tenant/role resolved) │
└──────────────────────────┬─────────────────────────────┘
                           ▼
┌────────────────────────────────────────────────────────┐
│ 2. Pre-LLM Database Gate (pgvector cosine search)      │
│    WHERE tenant_id = user.tenant_id                   │
│      AND (visibility = 'ALL' OR role_id IN allowed)   │
└──────────────────────────┬─────────────────────────────┘
                           ▼
┌────────────────────────────────────────────────────────┐
│ 3. Context Construction: Authorized Chunks Only        │
│    (If 0 authorized chunks: FAIL CLOSED immediately)   │
└──────────────────────────┬─────────────────────────────┘
                           ▼
┌────────────────────────────────────────────────────────┐
│ 4. Local Ollama LLM (llama3.2) Grounded Answer + Source│
└────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start with Docker

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) & Docker Compose
- [Ollama](https://ollama.com/) running locally with models:
  ```bash
  ollama pull nomic-embed-text
  ollama pull llama3.2
  ```

### 1. Launch with Docker Compose
Run the entire stack (PostgreSQL with pgvector, FastAPI Backend, and React Frontend):
```bash
docker compose up -d --build
```

### 2. Access the Application
- **Frontend Web UI**: [http://localhost:3000](http://localhost:3000)
- **FastAPI Backend Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **PostgreSQL Database**: `localhost:5432` (`user: postgres`, `password: postgrespassword`, `db: enterprise_knowledge`)

---

## 👥 Seeded Tenants & Demo Accounts

All accounts use default password: `password123`

| Tenant | Name | Email | Role | Permitted Knowledge Scope |
|---|---|---|---|---|
| **Company ABC** | ABC Tenant Admin | `admin@companyabc.com` | Tenant Administrator | Full admin rights over Company ABC documents & employees |
| **Company ABC** | Employee 001 | `tech@companyabc.com` | Tech Employee | Engineering policies, laptop security, and company-wide handbook |
| **Company ABC** | Employee 002 | `finance@companyabc.com` | Finance Employee | Expense reimbursements, travel policies, and company-wide handbook |
| **Company ABC** | Employee 003 | `ba@companyabc.com` | Business Analyst | BI data standards, PII masking rules, and company-wide handbook |
| **Company XYZ** | XYZ Administrator | `admin@companyxyz.com` | Tenant Administrator | Company XYZ Admin rights & Sector 7 facility policies |
| **Company XYZ** | XYZ Quantum Tech Staff | `tech@companyxyz.com` | Quantum Tech Engineer | Project Titan port 9999, secret bypass tokens, and QKD channels |
| **Company XYZ** | XYZ SecOps Analyst | `secops@companyxyz.com` | Security Operations Analyst | Level-4 ransomware containment, volatile memory vault, CISO SLA |
| **Company XYZ** | XYZ Compliance Officer | `compliance@companyxyz.com` | Compliance & Legal Officer | US Export Controls (EAR99/ITAR Cat 5), State Dept licensing, whistleblower |

> **Pro Tip**: Use the **Persona Switcher** in the top-right corner of the web UI to jump between roles with 1 click!

---

## 📋 Features Overview

1. **Public Landing / About Page**: Explains the platform value proposition, security model, and interactive persona switcher.
2. **Tenant Admin Dashboard**:
   - Live tenant metrics (documents, vector chunks, employees, roles).
   - **Upload Once, Assign by Role**: Upload `.pdf`, `.docx`, or `.txt`, assign to single role, multiple roles, or "All Tenant Employees".
   - **Employee & Role Management**: Reassign employee roles on the fly (takes effect immediately on subsequent queries), invite employees, create custom roles.
   - **Knowledge Access Simulator**: Test questions as Admin or previewing as any employee role.
3. **Employee Knowledge Chat**:
   - Department-scoped RAG chat interface.
   - Grounded citations showing document title, page/section reference, similarity score, and chunk snippet.
   - Fail-closed behavior: Clear notification if information is outside permitted scope.
   - User-scoped conversation history.
4. **Security Audit Explorer**: Live stream of retrieval events, showing authorized vs blocked chunks for full transparency.
5. **Interactive MVP Test Suite**: Built-in 1-click test runner validating MVP-01 through MVP-12 with visual badges.

---

## 🧪 Acceptance Test Suite (PRD MVP-01 to MVP-12)

Run the automated pytest suite locally:
```bash
PYTHONPATH=./backend ./backend/venv/bin/pytest backend/tests -v
```

All 12 acceptance criteria pass:
- **MVP-01**: Admin sign-in & tenant scoping
- **MVP-02**: Seeded roles (Tech, Finance, Business Analyst)
- **MVP-03**: Technical policy uploaded & assigned to Tech Employee
- **MVP-04**: Finance policy uploaded & assigned to Finance Employee
- **MVP-05**: Tech employee queries technical policy → receives grounded answer with citations
- **MVP-06**: **CRITICAL** — Tech employee queries finance policy → 0 finance chunks retrieved; fail-closed
- **MVP-07**: Finance employee queries finance policy → receives grounded answer with citations
- **MVP-08**: Business Analyst queries BA policy → receives grounded answer with citations
- **MVP-09**: Admin assigns document to multiple roles or all employees → retrievable without duplicate uploads
- **MVP-10**: Request-level tenant_id tampering prevented by server-side membership binding
- **MVP-11**: Document deletion invalidates all associated vector embeddings
- **MVP-12**: Multi-tenant isolation test: Company ABC cannot retrieve Company XYZ documents

# Final-Year-Project-
