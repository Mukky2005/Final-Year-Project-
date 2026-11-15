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
      <div className="py-20 text-center space-y-3 font-mono text-black bg-white min-h-[50vh] flex flex-col items-center justify-center">
        <RefreshCw className="w-8 h-8 text-black animate-spin mx-auto" />
        <p className="text-xs font-bold uppercase tracking-wider">Loading tenant administration console...</p>
      </div>
    );
  }

  const isCompanyABC = tenant?.tenant_name?.includes('ABC') || currentUser?.tenant_name?.includes('ABC');
  const isCompanyXYZ = tenant?.tenant_name?.includes('XYZ') || currentUser?.tenant_name?.includes('XYZ');
  const parentCompanyEndpoint = isCompanyABC ? '/demo/company-abc' : isCompanyXYZ ? '/demo/company-xyz' : '/demo';
  const parentCompanyLabel = isCompanyABC ? 'Company ABC' : isCompanyXYZ ? 'Company XYZ' : 'Demo Lab';

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 text-black bg-white font-sans">
      
      {/* Top Breadcrumb Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-black pb-3">
        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            onClick={() => navigate(parentCompanyEndpoint)}
            className="inline-flex items-center gap-1.5 text-black font-bold hover:underline transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>← Back to {parentCompanyLabel} Directory ({parentCompanyEndpoint})</span>
          </button>
          <span className="text-black font-bold">/</span>
          <span className="text-black font-black uppercase">{tenant?.tenant_name || 'Tenant'} Administration Console</span>
        </div>

        <div className="font-mono text-[10px] text-neutral-600 flex items-center gap-2">
          <span className="font-bold">ENDPOINT:</span>
          <code className="text-black font-black bg-neutral-100 border border-black px-2 py-0.5">
            {window.location.pathname}
          </code>
        </div>
      </div>

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
            onClick={() => setShowUploadModal(true)}
            className="btn-waxy-black inline-flex items-center gap-2 px-4 py-2.5 rounded-none font-mono font-bold text-xs uppercase tracking-wider"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Document</span>
          </button>
        </div>

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
      <div className="bg-white rounded-none p-6 sm:p-8 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-block-pop space-y-5 font-mono">
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
          <div className="bg-white border-2 border-black p-6 sm:p-8 max-w-lg w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-6 rounded-none text-black">
            <div className="border-b-2 border-black pb-3">
              <h3 className="text-base font-black text-black uppercase">Upload Source Document</h3>
              <p className="text-xs text-neutral-600 mt-1 font-sans font-medium">
                Supports PDF, DOCX, TXT. Role tags are enforced at the pgvector index level.
              </p>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-black uppercase mb-1">Document Title</label>
                <input
                  type="text"
                  placeholder="e.g. IT Security & Encryption Standard"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  required
                  className="w-full text-xs px-3.5 py-2.5 bg-white border-2 border-black text-black rounded-none outline-none focus:bg-neutral-50 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-black uppercase mb-1">Select File (.txt, .pdf, .docx)</label>
                <input
                  type="file"
                  accept=".txt,.pdf,.docx,.md"
                  onChange={(e) => setUploadFile(e.target.files[0])}
                  required
                  className="w-full text-xs text-black file:mr-3 file:py-2 file:px-4 file:rounded-none file:border-2 file:border-black file:text-xs file:font-mono file:bg-neutral-100 file:text-black file:font-bold"
                />
              </div>

              <div className="space-y-2 pt-2 border-t-2 border-black">
                <label className="block text-xs font-bold text-black uppercase">Access Permissions</label>
                
                <label className="flex items-center gap-2 p-2.5 bg-neutral-50 border-2 border-black cursor-pointer text-block-pop">
                  <input
                    type="checkbox"
                    checked={isAllEmployees}
                    onChange={(e) => {
                      setIsAllEmployees(e.target.checked);
                      if (e.target.checked) setSelectedRoleIds([]);
                    }}
                    className="w-4 h-4 rounded-none accent-black"
                  />
                  <span className="text-xs font-bold text-black">
                    All Tenant Employees (Company-Wide Policy)
                  </span>
                </label>

                {!isAllEmployees && (
                  <div className="space-y-1.5 pt-1">
                    <p className="text-[11px] text-neutral-600 font-bold">Select permitted roles:</p>
                    <div className="space-y-1 max-h-36 overflow-y-auto">
                      {roles.map((r) => (
                        <label
                          key={r.role_id}
                          className="flex items-center gap-2 p-2 bg-neutral-50 border border-black cursor-pointer text-xs text-block-pop"
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
                            className="w-3.5 h-3.5 rounded-none accent-black"
                          />
                          <span className="text-black font-medium">{r.role_name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

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
