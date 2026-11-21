-- ==============================================================================
-- PostgreSQL Native Row-Level Security (RLS) Migration
-- Enforces physical multi-tenant isolation at the database engine level (Section IV.D).
-- ==============================================================================

-- 1. Enable and Force Row-Level Security on Core Tenant Data Tables
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents FORCE ROW LEVEL SECURITY;

ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_chunks FORCE ROW LEVEL SECURITY;

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations FORCE ROW LEVEL SECURITY;

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages FORCE ROW LEVEL SECURITY;

ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_events FORCE ROW LEVEL SECURITY;

-- 2. Documents Tenant Isolation Policy
DROP POLICY IF EXISTS tenant_isolation_documents ON documents;
CREATE POLICY tenant_isolation_documents ON documents
  FOR ALL
  USING (
    current_setting('app.current_tenant_id', true) = 'SYSTEM_ADMIN'
    OR tenant_id = current_setting('app.current_tenant_id', true)
  );

-- 3. Document Chunks (pgvector vectors) Tenant Isolation Policy
DROP POLICY IF EXISTS tenant_isolation_chunks ON document_chunks;
CREATE POLICY tenant_isolation_chunks ON document_chunks
  FOR ALL
  USING (
    current_setting('app.current_tenant_id', true) = 'SYSTEM_ADMIN'
    OR tenant_id = current_setting('app.current_tenant_id', true)
  );

-- 4. Conversations Tenant Isolation Policy
DROP POLICY IF EXISTS tenant_isolation_conversations ON conversations;
CREATE POLICY tenant_isolation_conversations ON conversations
  FOR ALL
  USING (
    current_setting('app.current_tenant_id', true) = 'SYSTEM_ADMIN'
    OR tenant_id = current_setting('app.current_tenant_id', true)
  );

-- 5. Messages Tenant Isolation Policy (Scoped through conversation's tenant)
DROP POLICY IF EXISTS tenant_isolation_messages ON messages;
CREATE POLICY tenant_isolation_messages ON messages
  FOR ALL
  USING (
    current_setting('app.current_tenant_id', true) = 'SYSTEM_ADMIN'
    OR conversation_id IN (
      SELECT conversation_id FROM conversations
      WHERE tenant_id = current_setting('app.current_tenant_id', true)
    )
  );

-- 6. Audit Events Tenant Isolation Policy
DROP POLICY IF EXISTS tenant_isolation_audit ON audit_events;
CREATE POLICY tenant_isolation_audit ON audit_events
  FOR ALL
  USING (
    current_setting('app.current_tenant_id', true) = 'SYSTEM_ADMIN'
    OR tenant_id = current_setting('app.current_tenant_id', true)
  );
