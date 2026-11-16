import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { useRouter } from '../context/RouterContext';
import {
  UploadCloud,
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
  ArrowLeft,
  FileText,
  Lock,
  ShieldAlert
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
  const [uploadMode, setUploadMode] = useState('file'); // 'file' or 'text'
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadText, setUploadText] = useState('');
  const [roleAccessMode, setRoleAccessMode] = useState('specific'); // 'specific' or 'all'
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [selectedRoleIds, setSelectedRoleIds] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [ingestSuccess, setIngestSuccess] = useState(null);

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
      if (rData.length > 0) {
        if (!newEmpRoleId) setNewEmpRoleId(rData[0].role_id);
        if (!selectedRoleId) {
          const nonAdmin = rData.find((r) => !r.is_admin) || rData[0];
          setSelectedRoleId(nonAdmin.role_id);
          setSelectedRoleIds([nonAdmin.role_id]);
        }
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
    if (!uploadTitle.trim()) {
      alert('Please enter a document title.');
      return;
    }
    if (uploadMode === 'file' && !uploadFile) {
      alert('Please select a file (.txt, .pdf, .docx, .md).');
      return;
    }
    if (uploadMode === 'text' && !uploadText.trim()) {
      alert('Please enter or paste document text.');
      return;
    }

    const isAll = roleAccessMode === 'all';
    let targetRoleIds = [];
    if (!isAll) {
      targetRoleIds = selectedRoleIds.length > 0 ? selectedRoleIds : (selectedRoleId ? [selectedRoleId] : []);
      if (targetRoleIds.length === 0) {
        alert('Please choose the specific role authorized to access this document.');
        return;
      }
    }

    setUploading(true);
    setIngestSuccess(null);
    try {
      const formData = new FormData();
      if (uploadMode === 'file' && uploadFile) {
        formData.append('file', uploadFile);
      } else {
        formData.append('content_text', uploadText.trim());
      }
      formData.append('title', uploadTitle.trim());
      formData.append('is_all_employees', isAll ? 'true' : 'false');
      formData.append('allowed_role_ids', JSON.stringify(targetRoleIds));

      const res = await api.uploadDocument(formData);
      setShowUploadModal(false);
      setUploadTitle('');
      setUploadFile(null);
      setUploadText('');
      setIngestSuccess({
        title: res.title,
        chunkCount: res.chunk_count,
        roles: res.allowed_roles?.join(', ') || 'Restricted Role',
        roleId: targetRoleIds[0] || '',
      });
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
      <div className="py-20 text-center space-y-3 font-mono text-black bg-white min-h-[50vh] flex flex-col items-center justify-center">
        <RefreshCw className="w-8 h-8 text-black animate-spin mx-auto" />
        <p className="text-xs font-bold uppercase tracking-wider">Loading tenant administration console...</p>
      </div>
    );
  }

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 text-black bg-white font-sans">
      
      {/* Header & Stats Banner */}
      <div className="bg-white rounded-none p-6 sm:p-8 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-block-pop flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-none border border-black bg-neutral-100 text-black text-xs font-mono uppercase tracking-widest mb-3 font-bold">
            <Building2 className="w-3.5 h-3.5 text-black" />
            <span>WORKSPACE: {tenant?.tenant_name}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase text-black tracking-tight">Tenant Administrator Console</h1>
          <p className="text-xs text-neutral-600 font-mono mt-1 font-medium">
            Tenant ID: <span className="text-black font-bold">{tenant?.tenant_id}</span>
          </p>
        </div>

        <div className="flex flex-wrap gap-3 font-mono">
          <div className="bg-neutral-50 border-2 border-black px-4 py-3 rounded-none text-center min-w-[105px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-block-pop">
            <div className="text-2xl font-black text-black">{tenant?.document_count}</div>
            <div className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest mt-0.5">Documents</div>
          </div>
          <div className="bg-neutral-50 border-2 border-black px-4 py-3 rounded-none text-center min-w-[105px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-block-pop">
            <div className="text-2xl font-black text-black">{tenant?.chunk_count}</div>
            <div className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest mt-0.5">Vectors</div>
          </div>
          <div className="bg-neutral-50 border-2 border-black px-4 py-3 rounded-none text-center min-w-[105px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-block-pop">
            <div className="text-2xl font-black text-black">{tenant?.user_count}</div>
            <div className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest mt-0.5">Staff</div>
          </div>
          <div className="bg-neutral-50 border-2 border-black px-4 py-3 rounded-none text-center min-w-[105px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-block-pop">
            <div className="text-2xl font-black text-black">{roles.length}</div>
            <div className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest mt-0.5">Roles</div>
          </div>
        </div>
      </div>

      {/* Document Management Section */}
      <div className="bg-white rounded-none p-6 sm:p-8 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-block-pop space-y-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b-2 border-black pb-4">
          <div>
            <h2 className="text-base font-black text-black uppercase font-mono tracking-wider flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-black" />
              <span>Document Ingestion & Role Assignment</span>
            </h2>
            <p className="text-xs text-neutral-600 mt-1 font-medium">
              Upload source policies once; set role scope for automated pgvector chunk tagging.
            </p>
          </div>
          <button
            onClick={() => {
              setShowUploadModal(true);
              setIngestSuccess(null);
            }}
            className="btn-waxy-black inline-flex items-center gap-2 px-4 py-2.5 rounded-none font-mono font-bold text-xs uppercase tracking-wider"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload / Ingest Document</span>
          </button>
        </div>

        {/* Ingestion & DB Storage Success Notification */}
        {ingestSuccess && (
          <div className="p-4 bg-neutral-50 border-2 border-black space-y-2 text-block-pop shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center justify-between gap-2 border-b-2 border-black pb-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-black" />
                <span className="font-mono font-black text-xs uppercase tracking-wider">
                  Document Ingested, Chunked & Stored in Database
                </span>
              </div>
              <button
                onClick={() => setIngestSuccess(null)}
                className="text-xs font-mono text-neutral-600 hover:text-black font-bold"
              >
                ✕ Dismiss
              </button>
            </div>
            <p className="text-xs text-black font-sans leading-relaxed">
              <strong>"{ingestSuccess.title}"</strong> was processed, divided into <strong>{ingestSuccess.chunkCount} vector chunk{ingestSuccess.chunkCount !== 1 ? 's' : ''}</strong>, and permanently indexed in pgvector. Access is restricted strictly to <strong>[{ingestSuccess.roles}]</strong>.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setTestSimulateRole(ingestSuccess.roleId);
                  const el = document.getElementById('policy-simulator');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="btn-waxy-black px-3 py-1.5 text-xs font-mono font-bold uppercase tracking-wider inline-flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Test Retrieval for {ingestSuccess.roles} in Simulator</span>
              </button>
            </div>
          </div>
        )}

        {/* Documents Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse border-2 border-black font-mono">
            <thead>
              <tr className="border-b-2 border-black text-[10px] font-black text-black uppercase tracking-widest bg-neutral-100">
                <th className="py-3 px-4 border-r border-black">Title & Filename</th>
                <th className="py-3 px-4 border-r border-black">Format</th>
                <th className="py-3 px-4 border-r border-black">Allowed Roles</th>
                <th className="py-3 px-4 border-r border-black">Chunks</th>
                <th className="py-3 px-4 border-r border-black">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black text-xs bg-white">
              {documents.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-neutral-500 font-mono">
                    No documents uploaded yet.
                  </td>
                </tr>
              ) : (
                documents.map((doc) => (
                  <tr key={doc.document_id} className="hover:bg-neutral-50 transition-colors">
                    <td className="py-3.5 px-4 font-sans border-r border-black">
                      <div className="font-bold text-black text-xs">{doc.title}</div>
                      <div className="text-[11px] text-neutral-600 font-mono mt-0.5">{doc.filename}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono uppercase text-[11px] border-r border-black">
                      <span className="px-2 py-0.5 rounded-none border border-black bg-neutral-100 text-black font-bold">
                        {doc.file_type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 border-r border-black">
                      <div className="flex flex-wrap gap-1">
                        {doc.visibility_scope === 'ALL_TENANT_EMPLOYEES' ? (
                          <span className="px-2 py-0.5 rounded-none bg-black text-white text-[10px] font-bold uppercase">
                            All Tenant Staff
                          </span>
                        ) : (
                          doc.allowed_roles.map((r, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded-none border border-black bg-neutral-100 text-black text-[10px] font-mono font-bold"
                            >
                              {r}
                            </span>
                          ))
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-black text-black border-r border-black">
                      {doc.chunk_count}
                    </td>
                    <td className="py-3.5 px-4 border-r border-black">
                      {doc.status === 'INDEXED' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase px-2 py-0.5 bg-black text-white font-bold">
                          <CheckCircle2 className="w-3 h-3 text-white" />
                          <span>Indexed</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase px-2 py-0.5 border border-black text-black font-bold">
                          <AlertCircle className="w-3 h-3 text-black" />
                          <span>{doc.status}</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDeleteDocument(doc.document_id, doc.title)}
                        className="p-1.5 text-black hover:scale-125 transition-transform"
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
        <div className="lg:col-span-2 bg-white rounded-none p-6 sm:p-8 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-block-pop space-y-6">
          <div className="border-b-2 border-black pb-3">
            <h2 className="text-base font-black text-black uppercase font-mono tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-black" />
              <span>Employee Management</span>
            </h2>
            <p className="text-xs text-neutral-600 mt-1 font-mono font-medium">
              Reassign employee roles on the fly; authorization boundaries update immediately.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse border-2 border-black font-mono">
              <thead>
                <tr className="border-b-2 border-black text-[10px] font-black text-black uppercase tracking-widest bg-neutral-100">
                  <th className="py-2.5 px-3 border-r border-black">Employee</th>
                  <th className="py-2.5 px-3 border-r border-black">Assigned Role</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black text-xs bg-white">
                {employees.map((emp) => (
                  <tr key={emp.user_id} className="hover:bg-neutral-50">
                    <td className="py-3 px-3 font-sans border-r border-black">
                      <div className="font-bold text-black text-xs">{emp.full_name}</div>
                      <div className="text-[11px] text-neutral-600 font-mono mt-0.5">{emp.email}</div>
                    </td>
                    <td className="py-3 px-3 border-r border-black">
                      {emp.is_admin ? (
                        <span className="text-[10px] font-mono uppercase tracking-wider text-white bg-black px-2 py-0.5 font-bold">
                          Administrator
                        </span>
                      ) : (
                        <select
                          value={emp.role_id}
                          onChange={(e) => handleRoleChange(emp.user_id, e.target.value)}
                          className="text-xs font-mono font-bold text-black bg-white border-2 border-black rounded-none px-2.5 py-1 focus:bg-neutral-50 outline-none"
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
                        className={`text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-none border-2 border-black font-bold transition-all text-block-pop ${
                          emp.is_active
                            ? 'bg-black text-white hover:bg-neutral-800'
                            : 'bg-white text-black hover:bg-neutral-100'
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
          <form onSubmit={handleCreateEmployee} className="pt-4 border-t-2 border-black grid grid-cols-1 sm:grid-cols-4 gap-2 font-mono">
            <input
              type="text"
              placeholder="Full name"
              value={newEmpName}
              onChange={(e) => setNewEmpName(e.target.value)}
              required
              className="text-xs px-3 py-2 bg-white border-2 border-black rounded-none text-black placeholder:text-neutral-500 outline-none font-medium"
            />
            <input
              type="email"
              placeholder="Email address"
              value={newEmpEmail}
              onChange={(e) => setNewEmpEmail(e.target.value)}
              required
              className="text-xs px-3 py-2 bg-white border-2 border-black rounded-none text-black placeholder:text-neutral-500 outline-none font-medium"
            />
            <select
              value={newEmpRoleId}
              onChange={(e) => setNewEmpRoleId(e.target.value)}
              className="text-xs px-3 py-2 bg-white border-2 border-black rounded-none text-black outline-none font-medium"
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
              className="btn-waxy-black py-2 px-3 rounded-none font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{creatingEmp ? 'Adding...' : 'Add Staff'}</span>
            </button>
          </form>
        </div>

        {/* Role Management */}
        <div className="bg-white rounded-none p-6 sm:p-8 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-block-pop space-y-5">
          <div className="border-b-2 border-black pb-3">
            <h2 className="text-base font-black text-black uppercase font-mono tracking-wider flex items-center gap-2">
              <Shield className="w-4 h-4 text-black" />
              <span>Tenant Roles</span>
            </h2>
            <p className="text-xs text-neutral-600 mt-1 font-mono font-medium">
              Active permission roles in this tenant.
            </p>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {roles.map((r) => (
              <div key={r.role_id} className="p-3 bg-neutral-50 border-2 border-black text-xs font-mono text-block-pop shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <div className="font-bold text-black flex items-center justify-between">
                  <span>{r.role_name}</span>
                  {r.is_admin && (
                    <span className="text-[9px] px-1.5 py-0.5 bg-black text-white font-bold uppercase">
                      Admin
                    </span>
                  )}
                </div>
                {r.description && <p className="text-neutral-700 text-[11px] font-sans mt-1 leading-snug font-medium">{r.description}</p>}
              </div>
            ))}
          </div>

          {/* Create Custom Role */}
          <form onSubmit={handleCreateRole} className="space-y-3 pt-3 border-t-2 border-black font-mono">
            <h4 className="text-xs font-bold text-black uppercase tracking-wider">Create Custom Role</h4>
            <input
              type="text"
              placeholder="Role name (e.g. Operations Specialist)"
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              required
              className="w-full text-xs px-3 py-2 bg-white border-2 border-black text-black placeholder:text-neutral-500 rounded-none outline-none font-medium"
            />
            <input
              type="text"
              placeholder="Description (optional)"
              value={newRoleDesc}
              onChange={(e) => setNewRoleDesc(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-white border-2 border-black text-black placeholder:text-neutral-500 rounded-none outline-none font-medium"
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
      <div id="policy-simulator" className="bg-white rounded-none p-6 sm:p-8 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-block-pop space-y-5 font-mono">
        <div className="border-b-2 border-black pb-3">
          <h2 className="text-base font-black text-black uppercase tracking-wider flex items-center gap-2">
            <Search className="w-4 h-4 text-black" />
            <span>Policy Retrieval Simulator</span>
          </h2>
          <p className="text-xs text-neutral-600 mt-1 font-sans font-medium">
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
              className="flex-1 text-xs px-4 py-2.5 bg-white border-2 border-black text-black placeholder:text-neutral-500 rounded-none outline-none font-medium"
            />
            <select
              value={testSimulateRole}
              onChange={(e) => setTestSimulateRole(e.target.value)}
              className="text-xs px-3 py-2 bg-white border-2 border-black text-black rounded-none outline-none font-medium"
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
              className="btn-waxy-black px-5 py-2.5 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{testingKnowledge ? 'Evaluating...' : 'Simulate'}</span>
            </button>
          </div>
        </form>

        {testResult && (
          <div className="p-5 bg-neutral-50 border-2 border-black space-y-4 text-block-pop shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-black pb-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-neutral-600">SIMULATED ROLE:</span>
                <span className="font-black text-white uppercase px-2 py-0.5 bg-black">
                  {testResult.user_role}
                </span>
              </div>
              <div className="text-black font-bold">
                Authorized Chunks Passed: <span className="bg-black text-white px-1.5 py-0.5 font-black">{testResult.authorized_chunks_count}</span> / {testResult.total_tenant_chunks_count} Total Tenant Chunks
              </div>
            </div>

            {/* Denial callout if 0 chunks passed */}
            {testResult.authorized_chunks_count === 0 && (
              <div className="p-4 border-2 border-black bg-white space-y-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex items-center gap-2 text-xs font-black text-black uppercase">
                  <ShieldAlert className="w-4 h-4 text-black" />
                  <span>Physical Pre-LLM Retrieval Boundary Enforced</span>
                </div>
                <p className="text-xs text-neutral-700 font-sans leading-relaxed font-medium">
                  {testResult.denial_reason || 'Zero chunks authorized. The pgvector SQL pre-retrieval gate physically removed unauthorized documents before context construction.'}
                </p>
              </div>
            )}

            <div className="space-y-1">
              <span className="text-xs font-black text-black uppercase tracking-wider">Grounded Answer:</span>
              <p className="text-xs sm:text-sm text-black bg-white p-4 border-2 border-black font-sans leading-relaxed font-medium">
                {testResult.answer}
              </p>
            </div>

            {testResult.retrieved_sources?.length > 0 && (
              <div className="space-y-2 pt-1">
                <span className="text-xs font-black text-black uppercase tracking-wider">Authorized Citations:</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {testResult.retrieved_sources.map((src, i) => (
                    <div key={i} className="p-3 bg-white border-2 border-black text-xs space-y-1 text-block-pop shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      <div className="font-black text-black">{src.document_title} ({src.source_reference})</div>
                      <p className="text-[11px] text-neutral-700 line-clamp-2 italic font-sans font-medium">"{src.snippet}"</p>
                      <div className="text-[10px] text-neutral-600 font-mono font-bold">Similarity: {src.similarity_score}</div>
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 font-mono">
          <div className="bg-white border-2 border-black p-6 sm:p-8 max-w-xl w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-5 rounded-none text-black max-h-[90vh] overflow-y-auto">
            <div className="border-b-2 border-black pb-3">
              <h3 className="text-base font-black text-black uppercase">Ingest Document & Assign Role Access</h3>
              <p className="text-xs text-neutral-600 mt-1 font-sans font-medium">
                Documents are chunked, embedded via nomic-embed-text, and tagged in PostgreSQL pgvector. Access is enforced at the database query layer.
              </p>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              {/* Document Title */}
              <div>
                <label className="block text-xs font-bold text-black uppercase mb-1">Document Title</label>
                <input
                  type="text"
                  placeholder="e.g. Engineering Microservices Architecture 2026"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  required
                  className="w-full text-xs px-3.5 py-2.5 bg-white border-2 border-black text-black rounded-none outline-none focus:bg-neutral-50 font-medium"
                />
              </div>

              {/* Mode Toggle: File vs Text */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-black uppercase">Ingestion Source</label>
                <div className="flex border-2 border-black">
                  <button
                    type="button"
                    onClick={() => setUploadMode('file')}
                    className={`flex-1 py-2 text-xs font-bold uppercase transition-colors ${
                      uploadMode === 'file' ? 'bg-black text-white' : 'bg-white text-black hover:bg-neutral-100'
                    }`}
                  >
                    Upload File (.txt, .pdf, .docx, .md)
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadMode('text')}
                    className={`flex-1 py-2 text-xs font-bold uppercase border-l-2 border-black transition-colors ${
                      uploadMode === 'text' ? 'bg-black text-white' : 'bg-white text-black hover:bg-neutral-100'
                    }`}
                  >
                    Paste Text Directly
                  </button>
                </div>
              </div>

              {/* File Input */}
              {uploadMode === 'file' ? (
                <div>
                  <label className="block text-xs font-bold text-black uppercase mb-1">Select File</label>
                  <input
                    type="file"
                    accept=".txt,.pdf,.docx,.md"
                    onChange={(e) => setUploadFile(e.target.files[0])}
                    required={uploadMode === 'file'}
                    className="w-full text-xs text-black file:mr-3 file:py-2 file:px-4 file:rounded-none file:border-2 file:border-black file:text-xs file:font-mono file:bg-neutral-100 file:text-black file:font-bold"
                  />
                  {uploadFile && (
                    <p className="text-[11px] text-neutral-600 mt-1 font-mono">
                      Selected: <span className="font-bold text-black">{uploadFile.name}</span> ({(uploadFile.size / 1024).toFixed(1)} KB)
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-black uppercase mb-1">Document Content</label>
                  <textarea
                    rows={6}
                    placeholder="Paste full policy, guidelines, or technical document text here. It will be chunked and indexed automatically..."
                    value={uploadText}
                    onChange={(e) => setUploadText(e.target.value)}
                    required={uploadMode === 'text'}
                    className="w-full text-xs p-3 bg-white border-2 border-black text-black rounded-none outline-none focus:bg-neutral-50 font-mono resize-y"
                  />
                </div>
              )}

              {/* Role Access Scope */}
              <div className="space-y-3 pt-2 border-t-2 border-black">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-black uppercase">Role Access Control</label>
                  <span className="text-[10px] font-mono text-neutral-500 uppercase">Pre-LLM SQL Gate</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setRoleAccessMode('specific');
                      if (roles.length > 0 && !selectedRoleId) {
                        const nonAdmin = roles.find((r) => !r.is_admin) || roles[0];
                        setSelectedRoleId(nonAdmin.role_id);
                        setSelectedRoleIds([nonAdmin.role_id]);
                      }
                    }}
                    className={`p-3 text-left border-2 border-black transition-all ${
                      roleAccessMode === 'specific'
                        ? 'bg-black text-white font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                        : 'bg-white text-black hover:bg-neutral-50'
                    }`}
                  >
                    <div className="text-xs font-black uppercase flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Specific Role Only</span>
                    </div>
                    <p className={`text-[11px] mt-1 ${roleAccessMode === 'specific' ? 'text-neutral-300' : 'text-neutral-600'}`}>
                      Isolated to one specific department role. All other roles are physically blocked.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setRoleAccessMode('all');
                      setSelectedRoleIds([]);
                    }}
                    className={`p-3 text-left border-2 border-black transition-all ${
                      roleAccessMode === 'all'
                        ? 'bg-black text-white font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                        : 'bg-white text-black hover:bg-neutral-50'
                    }`}
                  >
                    <div className="text-xs font-black uppercase flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      <span>All Company Staff</span>
                    </div>
                    <p className={`text-[11px] mt-1 ${roleAccessMode === 'all' ? 'text-neutral-300' : 'text-neutral-600'}`}>
                      Company-wide standard readable by every employee in this workspace.
                    </p>
                  </button>
                </div>

                {/* Specific Role Dropdown */}
                {roleAccessMode === 'specific' && (
                  <div className="space-y-2 p-3 bg-neutral-50 border-2 border-black">
                    <label className="block text-[11px] font-bold text-black uppercase">
                      Choose Authorized Role:
                    </label>
                    <select
                      value={selectedRoleId}
                      onChange={(e) => {
                        setSelectedRoleId(e.target.value);
                        setSelectedRoleIds([e.target.value]);
                      }}
                      className="w-full text-xs px-3 py-2 bg-white border-2 border-black text-black rounded-none outline-none font-medium"
                    >
                      {roles.map((r) => (
                        <option key={r.role_id} value={r.role_id}>
                          {r.role_name} {r.is_admin ? '(Administrator)' : ''}
                        </option>
                      ))}
                    </select>

                    {/* Explanatory Boundary Box */}
                    <div className="p-2.5 bg-white border border-black text-[11px] space-y-1">
                      <div className="font-bold text-black flex items-center gap-1">
                        <Lock className="w-3 h-3 text-black" />
                        <span>Pre-LLM Retrieval Guarantee:</span>
                      </div>
                      <p className="text-neutral-700 font-sans leading-snug">
                        ONLY employees authenticated as <strong>"{roles.find(r => r.role_id === selectedRoleId)?.role_name || 'Selected Role'}"</strong> will be able to retrieve chunks from this document. Any queries from other roles or foreign tenants will yield 0 chunks and be logged as denied.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 flex justify-end gap-2 border-t-2 border-black">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 text-neutral-600 hover:text-black text-xs font-mono uppercase font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="btn-waxy-black px-5 py-2 font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-1.5"
                >
                  {uploading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Chunking & Storing Vectors...</span>
                    </>
                  ) : (
                    <span>Ingest & Store in Database</span>
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
