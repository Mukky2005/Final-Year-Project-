import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { useRouter } from '../context/RouterContext';
import {
  UploadCloud,
  FileText,
  Users,
  Shield,
  Trash2,
  Plus,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Building2,
  FileCheck,
  Search,
  Sparkles,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';

export default function AdminDashboard() {
  const { currentUser } = useAuth();
  const { navigate } = useRouter();
  const [tenant, setTenant] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadFile, setUploadFile] = useState(null);
  const [selectedRoleIds, setSelectedRoleIds] = useState([]);
  const [isAllEmployees, setIsAllEmployees] = useState(false);
  const [uploading, setUploading] = useState(false);

  // New role state
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');
  const [creatingRole, setCreatingRole] = useState(false);

  // New employee state
  const [newEmpEmail, setNewEmpEmail] = useState('');
  const [newEmpName, setNewEmpName] = useState('');
  const [newEmpRoleId, setNewEmpRoleId] = useState('');
  const [creatingEmp, setCreatingEmp] = useState(false);

  // Knowledge test state
  const [testQuery, setTestQuery] = useState('');
  const [testSimulateRole, setTestSimulateRole] = useState('');
  const [testResult, setTestResult] = useState(null);
  const [testingKnowledge, setTestingKnowledge] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [tData, dData, eData, rData] = await Promise.all([
        api.getTenant(),
        api.getDocuments(),
        api.getEmployees(),
        api.getRoles(),
      ]);
      setTenant(tData);
      setDocuments(dData);
      setEmployees(eData);
      setRoles(rData);
      if (rData.length > 0 && !newEmpRoleId) {
        setNewEmpRoleId(rData[0].role_id);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadFile || !uploadTitle.trim()) return;

    if (!isAllEmployees && selectedRoleIds.length === 0) {
      alert('Please select at least one employee role or check "All tenant employees".');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('title', uploadTitle.trim());
      formData.append('is_all_employees', isAllEmployees);
      formData.append('allowed_role_ids', JSON.stringify(selectedRoleIds));

      await api.uploadDocument(formData);
      setShowUploadModal(false);
      setUploadTitle('');
      setUploadFile(null);
      setSelectedRoleIds([]);
      setIsAllEmployees(false);
      await loadData();
    } catch (err) {
      alert(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (docId, title) => {
    if (!confirm(`Permanently delete "${title}"? All associated vectors will be purged.`)) {
      return;
    }
    try {
      await api.deleteDocument(docId);
      await loadData();
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const handleRoleChange = async (userId, roleId) => {
    try {
      await api.updateEmployeeRole(userId, roleId);
      await loadData();
    } catch (err) {
      alert(`Role update failed: ${err.message}`);
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      await api.toggleEmployeeStatus(userId);
      await loadData();
    } catch (err) {
      alert(`Status update failed: ${err.message}`);
    }
  };

  const handleCreateRole = async (e) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;
    setCreatingRole(true);
    try {
      await api.createRole({ role_name: newRoleName.trim(), description: newRoleDesc.trim(), is_admin: false });
      setNewRoleName('');
      setNewRoleDesc('');
      await loadData();
    } catch (err) {
      alert(`Role creation failed: ${err.message}`);
    } finally {
      setCreatingRole(false);
    }
  };

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    if (!newEmpEmail.trim() || !newEmpName.trim() || !newEmpRoleId) return;
    setCreatingEmp(true);
    try {
      await api.createEmployee({
        email: newEmpEmail.trim(),
        full_name: newEmpName.trim(),
        role_id: newEmpRoleId,
        password: 'password123',
      });
      setNewEmpEmail('');
      setNewEmpName('');
      await loadData();
    } catch (err) {
      alert(`Employee creation failed: ${err.message}`);
    } finally {
      setCreatingEmp(false);
    }
  };

  const handleTestQuery = async (e) => {
    e.preventDefault();
    if (!testQuery.trim()) return;
    setTestingKnowledge(true);
    setTestResult(null);
    try {
      const resp = await api.queryKnowledge(
        testQuery.trim(),
        null,
        testSimulateRole || null
      );
      setTestResult(resp);
    } catch (err) {
      alert(`Query failed: ${err.message}`);
    } finally {
      setTestingKnowledge(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center space-y-3 font-mono text-neutral-400">
        <RefreshCw className="w-8 h-8 text-white animate-spin mx-auto" />
        <p className="text-xs">Loading tenant administration console...</p>
      </div>
    );
  }

  const isCompanyABC = tenant?.tenant_name?.includes('ABC') || currentUser?.tenant_name?.includes('ABC');
  const isCompanyXYZ = tenant?.tenant_name?.includes('XYZ') || currentUser?.tenant_name?.includes('XYZ');
  const parentCompanyEndpoint = isCompanyABC ? '/demo/company-abc' : isCompanyXYZ ? '/demo/company-xyz' : '/demo';
  const parentCompanyLabel = isCompanyABC ? 'Company ABC' : isCompanyXYZ ? 'Company XYZ' : 'Demo Lab';

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 text-neutral-100 font-sans">
      
      {/* Top Breadcrumb Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 pb-3">
        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            onClick={() => navigate(parentCompanyEndpoint)}
            className="inline-flex items-center gap-1.5 text-neutral-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>← Back to {parentCompanyLabel} Directory ({parentCompanyEndpoint})</span>
          </button>
          <span className="text-neutral-700">/</span>
          <span className="text-white font-bold">{tenant?.tenant_name || 'Tenant'} Administration Console</span>
        </div>

        <div className="font-mono text-[10px] text-neutral-500 flex items-center gap-2">
          <span>ENDPOINT:</span>
          <code className="text-neutral-300 font-bold bg-neutral-950 border border-neutral-800 px-2 py-0.5">
            {window.location.pathname}
          </code>
        </div>
      </div>

      {/* Header & Stats Banner */}
      <div className="bg-neutral-950 rounded-none p-6 sm:p-8 border border-neutral-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-none border border-neutral-700 bg-black text-neutral-300 text-xs font-mono uppercase tracking-widest mb-3">
            <Building2 className="w-3.5 h-3.5 text-white" />
            <span>WORKSPACE: {tenant?.tenant_name}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase text-white tracking-tight">Tenant Administrator Console</h1>
          <p className="text-xs text-neutral-400 font-mono mt-1">
            Tenant ID: <span className="text-white font-bold">{tenant?.tenant_id}</span>
          </p>
        </div>

        <div className="flex flex-wrap gap-3 font-mono">
          <div className="bg-black border border-neutral-800 px-4 py-3 rounded-none text-center min-w-[105px]">
            <div className="text-2xl font-black text-white">{tenant?.document_count}</div>
            <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-0.5">Documents</div>
          </div>
          <div className="bg-black border border-neutral-800 px-4 py-3 rounded-none text-center min-w-[105px]">
            <div className="text-2xl font-black text-white">{tenant?.chunk_count}</div>
            <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-0.5">Vectors</div>
          </div>
          <div className="bg-black border border-neutral-800 px-4 py-3 rounded-none text-center min-w-[105px]">
            <div className="text-2xl font-black text-white">{tenant?.user_count}</div>
            <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-0.5">Staff</div>
          </div>
          <div className="bg-black border border-neutral-800 px-4 py-3 rounded-none text-center min-w-[105px]">
            <div className="text-2xl font-black text-white">{roles.length}</div>
            <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-0.5">Roles</div>
          </div>
        </div>
      </div>

      {/* Document Management Section */}
      <div className="bg-neutral-950 rounded-none p-6 sm:p-8 border border-neutral-800 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-neutral-800 pb-4">
          <div>
            <h2 className="text-base font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-white" />
              <span>Document Ingestion & Role Assignment</span>
            </h2>
            <p className="text-xs text-neutral-400 mt-1">
              Upload source policies once; set role scope for automated pgvector chunk tagging.
            </p>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="btn-waxy-white inline-flex items-center gap-2 px-4 py-2.5 rounded-none font-mono font-bold text-xs uppercase tracking-wider"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Document</span>
          </button>
        </div>

        {/* Documents Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-mono">
            <thead>
              <tr className="border-b border-neutral-800 text-[10px] font-bold text-neutral-400 uppercase tracking-widest bg-black">
                <th className="py-3 px-4">Title & Filename</th>
                <th className="py-3 px-4">Format</th>
                <th className="py-3 px-4">Allowed Roles</th>
                <th className="py-3 px-4">Chunks</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-900 text-xs">
              {documents.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-neutral-500 font-mono">
                    No documents uploaded yet.
                  </td>
                </tr>
              ) : (
                documents.map((doc) => (
                  <tr key={doc.document_id} className="hover:bg-neutral-900/60 transition-colors">
                    <td className="py-3.5 px-4 font-sans">
                      <div className="font-bold text-white text-xs">{doc.title}</div>
                      <div className="text-[11px] text-neutral-400 font-mono mt-0.5">{doc.filename}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono uppercase text-[11px]">
                      <span className="px-2 py-0.5 rounded-none border border-neutral-700 bg-black text-neutral-300 font-bold">
                        {doc.file_type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {doc.visibility_scope === 'ALL_TENANT_EMPLOYEES' ? (
                          <span className="px-2 py-0.5 rounded-none bg-white text-black text-[10px] font-bold uppercase">
                            All Tenant Staff
                          </span>
                        ) : (
                          doc.allowed_roles.map((r, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded-none border border-neutral-700 bg-neutral-900 text-neutral-300 text-[10px] font-mono"
                            >
                              {r}
                            </span>
                          ))
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white">
                      {doc.chunk_count}
                    </td>
                    <td className="py-3.5 px-4">
                      {doc.status === 'INDEXED' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase px-2 py-0.5 bg-neutral-900 text-white border border-neutral-700">
                          <CheckCircle2 className="w-3 h-3 text-white" />
                          <span>Indexed</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase px-2 py-0.5 border border-neutral-700 text-neutral-400">
                          <AlertCircle className="w-3 h-3" />
                          <span>{doc.status}</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDeleteDocument(doc.document_id, doc.title)}
                        className="p-1.5 text-neutral-400 hover:text-white transition-colors"
                        title="Delete Document"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Staff & Role Management Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Employee List & Role Reassignment */}
        <div className="lg:col-span-2 bg-neutral-950 rounded-none p-6 sm:p-8 border border-neutral-800 space-y-6">
          <div className="border-b border-neutral-800 pb-3">
            <h2 className="text-base font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-white" />
              <span>Employee Management</span>
            </h2>
            <p className="text-xs text-neutral-400 mt-1 font-mono">
              Reassign employee roles on the fly; authorization boundaries update immediately.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-mono">
              <thead>
                <tr className="border-b border-neutral-800 text-[10px] font-bold text-neutral-400 uppercase tracking-widest bg-black">
                  <th className="py-2.5 px-3">Employee</th>
                  <th className="py-2.5 px-3">Assigned Role</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-900 text-xs">
                {employees.map((emp) => (
                  <tr key={emp.user_id} className="hover:bg-neutral-900/50">
                    <td className="py-3 px-3 font-sans">
                      <div className="font-bold text-white text-xs">{emp.full_name}</div>
                      <div className="text-[11px] text-neutral-400 font-mono mt-0.5">{emp.email}</div>
                    </td>
                    <td className="py-3 px-3">
                      {emp.is_admin ? (
                        <span className="text-[10px] font-mono uppercase tracking-wider text-black bg-white px-2 py-0.5 font-bold">
                          Administrator
                        </span>
                      ) : (
                        <select
                          value={emp.role_id}
                          onChange={(e) => handleRoleChange(emp.user_id, e.target.value)}
                          className="text-xs font-mono font-medium text-white bg-black border border-neutral-700 rounded-none px-2.5 py-1 focus:border-white outline-none"
                        >
                          {roles.map((r) => (
                            <option key={r.role_id} value={r.role_id}>
                              {r.role_name}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <button
                        onClick={() => handleToggleStatus(emp.user_id)}
                        disabled={emp.user_id === currentUser.user_id}
                        className={`text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-none border transition-colors ${
                          emp.is_active
                            ? 'bg-neutral-900 text-white border-neutral-700 hover:border-neutral-500'
                            : 'bg-black text-neutral-500 border-neutral-800 hover:border-neutral-700'
                        }`}
                      >
                        {emp.is_active ? 'ACTIVE' : 'DISABLED'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Quick Invite Form */}
          <form onSubmit={handleCreateEmployee} className="pt-4 border-t border-neutral-800 grid grid-cols-1 sm:grid-cols-4 gap-2 font-mono">
            <input
              type="text"
              placeholder="Full name"
              value={newEmpName}
              onChange={(e) => setNewEmpName(e.target.value)}
              required
              className="text-xs px-3 py-2 bg-black border border-neutral-700 rounded-none text-white placeholder-neutral-500 outline-none"
            />
            <input
              type="email"
              placeholder="Email address"
              value={newEmpEmail}
              onChange={(e) => setNewEmpEmail(e.target.value)}
              required
              className="text-xs px-3 py-2 bg-black border border-neutral-700 rounded-none text-white placeholder-neutral-500 outline-none"
            />
            <select
              value={newEmpRoleId}
              onChange={(e) => setNewEmpRoleId(e.target.value)}
              className="text-xs px-3 py-2 bg-black border border-neutral-700 rounded-none text-white outline-none"
            >
              {roles.map((r) => (
                <option key={r.role_id} value={r.role_id}>
                  {r.role_name}
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={creatingEmp}
              className="btn-waxy-white py-2 px-3 rounded-none font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{creatingEmp ? 'Adding...' : 'Add Staff'}</span>
            </button>
          </form>
        </div>

        {/* Role Management */}
        <div className="bg-neutral-950 rounded-none p-6 sm:p-8 border border-neutral-800 space-y-5">
          <div className="border-b border-neutral-800 pb-3">
            <h2 className="text-base font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
              <Shield className="w-4 h-4 text-white" />
              <span>Tenant Roles</span>
            </h2>
            <p className="text-xs text-neutral-400 mt-1 font-mono">
              Active permission roles in this tenant.
            </p>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {roles.map((r) => (
              <div key={r.role_id} className="p-3 bg-black border border-neutral-800 text-xs font-mono">
                <div className="font-bold text-white flex items-center justify-between">
                  <span>{r.role_name}</span>
                  {r.is_admin && (
                    <span className="text-[9px] px-1.5 py-0.5 bg-white text-black font-bold uppercase">
                      Admin
                    </span>
                  )}
                </div>
                {r.description && <p className="text-neutral-400 text-[11px] font-sans mt-1 leading-snug">{r.description}</p>}
              </div>
            ))}
          </div>

          {/* Create Custom Role */}
          <form onSubmit={handleCreateRole} className="space-y-3 pt-3 border-t border-neutral-800 font-mono">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Create Custom Role</h4>
            <input
              type="text"
              placeholder="Role name (e.g. Operations Specialist)"
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              required
              className="w-full text-xs px-3 py-2 bg-black border border-neutral-700 text-white placeholder-neutral-500 rounded-none outline-none"
            />
            <input
              type="text"
              placeholder="Description (optional)"
              value={newRoleDesc}
              onChange={(e) => setNewRoleDesc(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-black border border-neutral-700 text-white placeholder-neutral-500 rounded-none outline-none"
            />
            <button
              type="submit"
              disabled={creatingRole}
              className="w-full btn-waxy-black py-2 px-3 rounded-none font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{creatingRole ? 'Creating...' : 'Create Role'}</span>
            </button>
          </form>
        </div>
      </div>

      {/* Simulator Section */}
      <div className="bg-neutral-950 rounded-none p-6 sm:p-8 border border-neutral-800 space-y-5 font-mono">
        <div className="border-b border-neutral-800 pb-3">
          <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Search className="w-4 h-4 text-white" />
            <span>Policy Retrieval Simulator</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-1 font-sans">
            Test policy retrieval as Administrator, or simulate what a specific employee role would see.
          </p>
        </div>

        <form onSubmit={handleTestQuery} className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="Enter test question to simulate..."
              value={testQuery}
              onChange={(e) => setTestQuery(e.target.value)}
              required
              className="flex-1 text-xs px-4 py-2.5 bg-black border border-neutral-700 text-white placeholder-neutral-500 rounded-none outline-none"
            />
            <select
              value={testSimulateRole}
              onChange={(e) => setTestSimulateRole(e.target.value)}
              className="text-xs px-3 py-2 bg-black border border-neutral-700 text-white rounded-none outline-none"
            >
              <option value="">Query as Tenant Administrator (All Tenant Docs)</option>
              {roles.map((r) => (
                <option key={r.role_id} value={r.role_id}>
                  Simulate as: {r.role_name}
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={testingKnowledge}
              className="btn-waxy-white px-5 py-2.5 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{testingKnowledge ? 'Evaluating...' : 'Simulate'}</span>
            </button>
          </div>
        </form>

        {testResult && (
          <div className="p-5 bg-black border border-neutral-800 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-800 pb-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-neutral-400">SIMULATED ROLE:</span>
                <span className="font-bold text-white uppercase px-2 py-0.5 border border-neutral-700 bg-neutral-900">
                  {testResult.user_role}
                </span>
              </div>
              <div className="text-neutral-400">
                Authorized Chunks Passed: <span className="font-bold text-white">{testResult.authorized_chunks_count}</span> / {testResult.total_tenant_chunks_count} Total Tenant Chunks
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Grounded Answer:</span>
              <p className="text-xs sm:text-sm text-neutral-200 bg-neutral-950 p-4 border border-neutral-800 font-sans leading-relaxed">
                {testResult.answer}
              </p>
            </div>

            {testResult.retrieved_sources?.length > 0 && (
              <div className="space-y-2 pt-1">
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Authorized Citations:</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {testResult.retrieved_sources.map((src, i) => (
                    <div key={i} className="p-3 bg-neutral-950 border border-neutral-800 text-xs space-y-1">
                      <div className="font-bold text-white">{src.document_title} ({src.source_reference})</div>
                      <p className="text-[11px] text-neutral-400 line-clamp-2 italic font-sans">"{src.snippet}"</p>
                      <div className="text-[10px] text-neutral-500 font-mono">Similarity: {src.similarity_score}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 font-mono">
          <div className="bg-neutral-950 border border-neutral-700 p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 rounded-none">
            <div className="border-b border-neutral-800 pb-3">
              <h3 className="text-base font-bold text-white uppercase">Upload Source Document</h3>
              <p className="text-xs text-neutral-400 mt-1 font-sans">
                Supports PDF, DOCX, TXT. Role tags are enforced at the pgvector index level.
              </p>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-300 uppercase mb-1">Document Title</label>
                <input
                  type="text"
                  placeholder="e.g. IT Security & Encryption Standard"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  required
                  className="w-full text-xs px-3.5 py-2.5 bg-black border border-neutral-700 text-white rounded-none outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 uppercase mb-1">Select File (.txt, .pdf, .docx)</label>
                <input
                  type="file"
                  accept=".txt,.pdf,.docx,.md"
                  onChange={(e) => setUploadFile(e.target.files[0])}
                  required
                  className="w-full text-xs text-neutral-400 file:mr-3 file:py-2 file:px-4 file:rounded-none file:border file:border-neutral-700 file:text-xs file:font-mono file:bg-black file:text-white"
                />
              </div>

              <div className="space-y-2 pt-2 border-t border-neutral-800">
                <label className="block text-xs font-bold text-neutral-300 uppercase">Access Permissions</label>
                
                <label className="flex items-center gap-2 p-2.5 bg-black border border-neutral-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAllEmployees}
                    onChange={(e) => {
                      setIsAllEmployees(e.target.checked);
                      if (e.target.checked) setSelectedRoleIds([]);
                    }}
                    className="w-4 h-4 rounded-none"
                  />
                  <span className="text-xs font-bold text-white">
                    All Tenant Employees (Company-Wide Policy)
                  </span>
                </label>

                {!isAllEmployees && (
                  <div className="space-y-1.5 pt-1">
                    <p className="text-[11px] text-neutral-400">Select permitted roles:</p>
                    <div className="space-y-1 max-h-36 overflow-y-auto">
                      {roles.map((r) => (
                        <label
                          key={r.role_id}
                          className="flex items-center gap-2 p-2 bg-black border border-neutral-800 cursor-pointer text-xs"
                        >
                          <input
                            type="checkbox"
                            checked={selectedRoleIds.includes(r.role_id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedRoleIds([...selectedRoleIds, r.role_id]);
                              } else {
                                setSelectedRoleIds(selectedRoleIds.filter((id) => id !== r.role_id));
                              }
                            }}
                            className="w-3.5 h-3.5 rounded-none"
                          />
                          <span className="text-neutral-200">{r.role_name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 text-neutral-400 hover:text-white text-xs font-mono uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="btn-waxy-white px-5 py-2 font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-1.5"
                >
                  {uploading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Ingesting into pgvector...</span>
                    </>
                  ) : (
                    <span>Submit & Ingest</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
