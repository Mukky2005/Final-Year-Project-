import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter, getUserSlug, getUserEndpoint } from '../context/RouterContext';
import { 
  ShieldCheck, 
  Lock, 
  Building2, 
  Users, 
  ArrowRight, 
  ArrowLeft,
  Compass, 
  Layers, 
  AlertTriangle,
  CheckCircle2, 
  Sparkles,
  Terminal,
  FileText,
  Key,
  ShieldAlert,
  Bot,
  Info,
  Code2,
  Coins,
  BarChart3,
  SlidersHorizontal,
  Cpu
} from 'lucide-react';

export default function DemoPage({ setActiveTab }) {
  const { demoUsers, switchUser, currentUser } = useAuth();
  const { navigate, tenantFilter } = useRouter();
  const [selectedTenantFilter, setSelectedTenantFilter] = useState(tenantFilter || 'ALL');

  useEffect(() => {
    if (tenantFilter) {
      setSelectedTenantFilter(tenantFilter);
    }
  }, [tenantFilter]);

  const [inspectedPolicy, setInspectedPolicy] = useState({
    doc: 'Proprietary Quantum Architecture (Titan)',
    role: 'ABC Tech (Engineering)',
    tenant: 'Company ABC attempting to query Company XYZ',
    allowed: false,
    reason: 'Tenant Isolation Violation: Cross-tenant physical database boundary. Zero chunks retrieved, pre-LLM gate aborts immediately.'
  });

  const handleLaunchPersona = async (userId, targetEndpoint = null) => {
    const user = demoUsers.find((u) => u.user_id === userId);
    await switchUser(userId);
    if (targetEndpoint) {
      navigate(targetEndpoint);
    } else if (user) {
      navigate(getUserEndpoint(user));
    } else {
      navigate('/demo');
    }
  };

  const handleFilterChange = (filter) => {
    setSelectedTenantFilter(filter);
    if (filter === 'ABC') {
      navigate('/demo/company-abc');
    } else if (filter === 'XYZ') {
      navigate('/demo/company-xyz');
    } else {
      navigate('/demo');
    }
  };

  // Group demo users by tenant
  const abcUsers = demoUsers.filter(u => u.tenant_name?.includes('ABC'));
  const xyzUsers = demoUsers.filter(u => u.tenant_name?.includes('XYZ'));

  const getRoleDetails = (user) => {
    const role = user.role_name || '';
    const tenant = user.tenant_name || '';

    if (tenant.includes('XYZ')) {
      if (role.includes('Quantum') || role.includes('Tech')) {
        return {
          allowed: 'Project Titan quantum gateway (port 9999), master bypass token, QKD refresh rate.',
          blocked: 'Company XYZ SecOps incident containment, Compliance ITAR policies, all Company ABC docs.',
          suggestedQuery: 'What is the Project Titan port and master security bypass token?',
          forbiddenQuery: 'What are the subnet isolation rules for Level-4 security incidents?'
        };
      } else if (role.includes('Security') || role.includes('SecOps')) {
        return {
          allowed: 'Level-4 ransomware containment, volatile memory dump storage vault, CISO reporting SLA.',
          blocked: 'Project Titan quantum bypass keys, Compliance export controls, all Company ABC docs.',
          suggestedQuery: 'What are the subnet isolation rules for Level-4 security incidents?',
          forbiddenQuery: 'What is the Project Titan port and master security bypass token?'
        };
      } else if (role.includes('Compliance') || role.includes('Legal')) {
        return {
          allowed: 'US Export Controls (EAR99/ITAR Category 5), state license requirements, whistleblower hotline.',
          blocked: 'Project Titan gateway keys, SecOps containment charter, all Company ABC docs.',
          suggestedQuery: 'What is the export control classification for quantum algorithms?',
          forbiddenQuery: 'What is the Project Titan master security bypass token?'
        };
      } else {
        return {
          allowed: 'Company XYZ Administrative management, Sector 7 cleanroom policies.',
          blocked: 'All Company ABC tenant documents.',
          suggestedQuery: 'What are the access requirements for Sector 7 cleanrooms?',
          forbiddenQuery: 'What are the travel reimbursement per-diem rates?'
        };
      }
    }

    // Company ABC
    if (role.includes('Tech')) {
      return {
        allowed: 'Engineering laptop full-disk encryption, 60-day SSH rotation, GitHub signing, K8s dual approvals.',
        blocked: 'Finance expense reimbursements, daily per-diem rates, Company XYZ documents.',
        suggestedQuery: 'What is the laptop disk encryption and SSH rotation policy?',
        forbiddenQuery: 'What is the daily meal per-diem allowance during business travel?'
      };
    } else if (role.includes('Finance')) {
      return {
        allowed: 'Travel expenses, $75 daily meal per-diem, 5th-day filing deadline, $0.67/mile mileage.',
        blocked: 'Engineering SSH rotation, laptop encryption protocols, Company XYZ documents.',
        suggestedQuery: 'What is the daily meal per-diem allowance during business travel?',
        forbiddenQuery: 'What is the laptop disk encryption and SSH rotation policy?'
      };
    } else if (role.includes('Analyst')) {
      return {
        allowed: 'Tableau/Looker 3-year data retention, salted SHA-256 PII masking, core KPI approval authority.',
        blocked: 'Finance expense rates, engineering SSH keys, Company XYZ documents.',
        suggestedQuery: 'How must customer PII data be masked before ingestion?',
        forbiddenQuery: 'What is the daily meal per-diem allowance during business travel?'
      };
    } else {
      return {
        allowed: 'Company ABC Administrative workspace, upload and assign documents, manage roles.',
        blocked: 'Company XYZ documents.',
        suggestedQuery: 'What are the core office collaboration hours and assembly points?',
        forbiddenQuery: 'What is the Project Titan port and bypass token?'
      };
    }
  };

  const getRoleIcon = (roleName = '') => {
    const r = (roleName || '').toLowerCase();
    if (r.includes('quantum')) return <Cpu className="w-4 h-4 text-neutral-400 group-hover:text-white transition-colors" />;
    if (r.includes('secops') || r.includes('security')) return <ShieldAlert className="w-4 h-4 text-neutral-400 group-hover:text-white transition-colors" />;
    if (r.includes('compliance') || r.includes('legal')) return <FileText className="w-4 h-4 text-neutral-400 group-hover:text-white transition-colors" />;
    if (r.includes('admin')) return <SlidersHorizontal className="w-4 h-4 text-neutral-400 group-hover:text-white transition-colors" />;
    if (r.includes('tech') || r.includes('engineer')) return <Code2 className="w-4 h-4 text-neutral-400 group-hover:text-white transition-colors" />;
    if (r.includes('finance')) return <Coins className="w-4 h-4 text-neutral-400 group-hover:text-white transition-colors" />;
    if (r.includes('analyst')) return <BarChart3 className="w-4 h-4 text-neutral-400 group-hover:text-white transition-colors" />;
    return <Users className="w-4 h-4 text-neutral-400 group-hover:text-white transition-colors" />;
  };

  const renderPersonaCard = (user) => {
    const details = getRoleDetails(user);
    const endpoint = getUserEndpoint(user);
    const isCompanyABC = user.tenant_name?.includes('ABC');

    return (
      <div
        key={user.user_id}
        className="border border-neutral-800 bg-neutral-950 p-6 flex flex-col justify-between space-y-5 interactive-card group hover:border-neutral-400 hover:bg-neutral-900/40 transition-all rounded-none"
      >
        <div className="space-y-4">
          {/* Top Row: Role Badge + Department Icon */}
          <div className="flex items-center justify-between gap-2 border-b border-neutral-900 pb-3">
            <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 border border-neutral-800 bg-black text-neutral-300 font-bold group-hover:border-neutral-600 group-hover:text-white transition-colors truncate max-w-[190px]">
              {user.role_name}
            </span>
            <div className="p-1 border border-neutral-900 bg-black shrink-0">
              {getRoleIcon(user.role_name)}
            </div>
          </div>

          {/* User Name & Email */}
          <div>
            <h4 className="text-base font-bold text-white tracking-tight group-hover:text-white transition-colors">
              {user.full_name}
            </h4>
            <p className="text-xs font-mono text-neutral-400 mt-0.5 truncate">
              {user.email}
            </p>
            <div className="text-[10px] font-mono text-neutral-500 pt-1.5 flex items-center gap-1">
              <span>Endpoint:</span>
              <code className="text-neutral-300 font-bold">{endpoint}</code>
            </div>
          </div>

          {/* Scoped Knowledge Boundaries */}
          <div className="space-y-3 pt-1">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-bold flex items-center gap-1.5">
                <span className="text-white text-xs">✓</span> Permitted Knowledge:
              </span>
              <p className="text-xs text-neutral-300 leading-relaxed pl-3 border-l-2 border-white/40 font-sans">
                {details.allowed}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 font-bold flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-neutral-500" /> Strictly Blocked:
              </span>
              <p className="text-xs text-neutral-500 leading-relaxed pl-3 border-l-2 border-neutral-800 font-sans">
                {details.blocked}
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2 space-y-2">
          <button
            onClick={() => handleLaunchPersona(user.user_id, endpoint)}
            className="w-full btn-waxy-white py-2.5 px-3 text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 group-hover:bg-white transition-all shadow-sm"
          >
            <span>{user.is_admin ? 'Launch Admin Chat' : 'Launch Role Chat'}</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </button>

          {user.is_admin && (
            <button
              onClick={() => handleLaunchPersona(user.user_id, isCompanyABC ? '/admin/company-abc' : '/admin/company-xyz')}
              className="w-full py-2 px-3 text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 border border-neutral-800 bg-black text-neutral-300 hover:text-white hover:border-neutral-500 transition-colors"
            >
              <SlidersHorizontal className="w-3 h-3" />
              <span>Admin Workspace</span>
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16 text-neutral-100">
      
      {/* Header */}
      <div className="space-y-4">
        <div className="border border-neutral-800 bg-neutral-950 p-6 sm:p-8 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 border border-neutral-700 bg-black font-mono text-[10px] uppercase tracking-widest text-neutral-300">
              <ShieldCheck className="w-3.5 h-3.5 text-white" />
              <span>LIVE SECURITY TEST ENVIRONMENT</span>
            </div>
            <div className="font-mono text-xs text-neutral-400 border border-neutral-800 px-3 py-1 bg-black">
              FAIL-CLOSED STATUS: <span className="text-white font-bold">ENFORCED</span>
            </div>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black uppercase text-white tracking-tight">
            Interactive Multi-Role Security Demo
          </h1>
          <p className="text-sm text-neutral-400 font-mono max-w-3xl leading-relaxed">
            Test whether the actual data is truly secure. Switch between 8 employee personas across 2 separate companies.
            Ask allowed queries to verify instant retrieval, then intentionally attempt forbidden cross-department or cross-company queries to observe the pre-LLM retrieval gate physically prune unauthorized context.
          </p>
        </div>
      </div>

      {/* 2-Company Selection Grid (Displayed at /demo) */}
      {selectedTenantFilter === 'ALL' && (
        <div className="space-y-6">
          <div className="border-b border-neutral-800 pb-4 space-y-1">
            <div className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-neutral-400">
              <Building2 className="w-4 h-4 text-white" />
              <span>Select Company</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black uppercase text-white tracking-tight">
              Enterprise Companies
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
            
            {/* Company ABC Card */}
            <div className="border border-neutral-800 bg-neutral-950 p-6 sm:p-8 flex flex-col justify-between space-y-6 interactive-card group hover:border-neutral-400 hover:bg-neutral-900/40 transition-all">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                  <span className="font-mono text-xs px-2.5 py-0.5 border border-white/20 bg-white/10 text-white font-bold">
                    TENANT 01
                  </span>
                  <Building2 className="w-5 h-5 text-neutral-400 group-hover:text-white transition-colors" />
                </div>

                <div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tight">
                    Company ABC
                  </h3>
                  <p className="text-xs font-mono text-neutral-400 mt-1">
                    Commercial Enterprise · Marketing, Engineering, and Finance divisions
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate('/demo/company-abc')}
                className="btn-waxy-white py-3 px-4 font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center group-hover:bg-white transition-all shadow-md"
              >
                <span>Enter Company ABC</span>
              </button>
            </div>

            {/* Company XYZ Card */}
            <div className="border border-neutral-800 bg-neutral-950 p-6 sm:p-8 flex flex-col justify-between space-y-6 interactive-card group hover:border-neutral-400 hover:bg-neutral-900/40 transition-all">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                  <span className="font-mono text-xs px-2.5 py-0.5 border border-white/20 bg-white/10 text-white font-bold">
                    TENANT 02
                  </span>
                  <Building2 className="w-5 h-5 text-neutral-400 group-hover:text-white transition-colors" />
                </div>

                <div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tight">
                    Company XYZ
                  </h3>
                  <p className="text-xs font-mono text-neutral-400 mt-1">
                    High-Security Research · Quantum Computing & Defense Systems
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate('/demo/company-xyz')}
                className="btn-waxy-white py-3 px-4 font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center group-hover:bg-white transition-all shadow-md"
              >
                <span>Enter Company XYZ</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Company ABC View (At /demo/company-abc) */}
      {selectedTenantFilter === 'ABC' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
            <button
              onClick={() => navigate('/demo')}
              className="inline-flex items-center gap-2 font-mono text-xs text-neutral-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>← Back to All Companies (/demo)</span>
            </button>

            <button
              onClick={() => navigate('/demo/company-xyz')}
              className="font-mono text-xs text-neutral-400 hover:text-white inline-flex items-center gap-1.5 transition-colors border border-neutral-800 px-3 py-1.5 bg-neutral-950 hover:bg-neutral-900"
            >
              <span>Switch to Company XYZ (/demo/company-xyz)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="border border-neutral-800 bg-neutral-950 p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] px-2 py-0.5 border border-white/20 bg-white/10 text-white font-bold">
                    TENANT 01
                  </span>
                  <span className="font-mono text-xl font-bold uppercase tracking-wider text-white">
                    Company ABC
                  </span>
                </div>
                <p className="text-xs text-neutral-400 font-mono">
                  Commercial Enterprise · Marketing, Engineering, and Finance divisions
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] text-neutral-400">
                <span className="px-2.5 py-1 border border-neutral-800 bg-black text-neutral-300">
                  Endpoint: <strong className="text-white">/demo/company-abc</strong>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {abcUsers.map(renderPersonaCard)}
            </div>
          </div>
        </div>
      )}

      {/* Company XYZ View (At /demo/company-xyz) */}
      {selectedTenantFilter === 'XYZ' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
            <button
              onClick={() => navigate('/demo')}
              className="inline-flex items-center gap-2 font-mono text-xs text-neutral-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>← Back to All Companies (/demo)</span>
            </button>

            <button
              onClick={() => navigate('/demo/company-abc')}
              className="font-mono text-xs text-neutral-400 hover:text-white inline-flex items-center gap-1.5 transition-colors border border-neutral-800 px-3 py-1.5 bg-neutral-950 hover:bg-neutral-900"
            >
              <span>Switch to Company ABC (/demo/company-abc)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="border border-neutral-800 bg-neutral-950 p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] px-2 py-0.5 border border-white/20 bg-white/10 text-white font-bold">
                    TENANT 02
                  </span>
                  <span className="font-mono text-xl font-bold uppercase tracking-wider text-white">
                    Company XYZ
                  </span>
                </div>
                <p className="text-xs text-neutral-400 font-mono">
                  High-Security Research · Quantum Computing & Defense Systems
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] text-neutral-400">
                <span className="px-2.5 py-1 border border-neutral-800 bg-black text-neutral-300">
                  Endpoint: <strong className="text-white">/demo/company-xyz</strong>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {xyzUsers.map(renderPersonaCard)}
            </div>
          </div>
        </div>
      )}

      {/* Full Pre-LLM Access Boundary Matrix */}
      <div className="border border-neutral-800 bg-neutral-950 p-6 sm:p-8 space-y-6">
        <div className="space-y-1">
          <div className="font-mono text-xs uppercase tracking-widest text-neutral-400 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-white" />
            <span>Pre-LLM Access Boundary Matrix</span>
          </div>
          <h2 className="text-2xl font-black uppercase text-white">
            Enterprise Knowledge Visibility Verification
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 font-mono">
            Hover or click any cell below to inspect the live physical SQL filtering rule enforced by the database:
          </p>
        </div>

        {/* Live Policy Inspector Card */}
        {inspectedPolicy && (
          <div className="border border-neutral-700 bg-black p-4 space-y-2 animate-tab-fade">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-800 pb-2">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-white" />
                <span className="font-mono text-xs uppercase tracking-wider text-neutral-400">
                  Target Policy Rule: <strong className="text-white">{inspectedPolicy.doc}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-neutral-500 uppercase">Evaluated Actor:</span>
                <span className="text-xs font-mono font-bold text-white uppercase">{inspectedPolicy.role}</span>
                {inspectedPolicy.allowed ? (
                  <span className="px-2 py-0.5 bg-white text-black font-mono font-bold text-[10px] uppercase">
                    ✓ ACCESS PERMITTED
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-neutral-900 border border-neutral-700 text-neutral-200 font-mono font-bold text-[10px] uppercase">
                    🔒 STRICTLY DENIED (0 CHUNKS)
                  </span>
                )}
              </div>
            </div>
            <p className="text-xs font-mono text-neutral-300 leading-relaxed pt-1">
              <span className="text-neutral-500 uppercase font-bold mr-1">Enforcement Logic:</span>
              {inspectedPolicy.reason}
            </p>
          </div>
        )}

        <div className="overflow-x-auto font-mono text-xs">
          <table className="w-full text-left border-collapse border border-neutral-800">
            <thead>
              <tr className="border-b border-neutral-800 bg-black text-[10px] text-neutral-400 uppercase tracking-wider">
                <th className="p-3 border-r border-neutral-800">Document Policy</th>
                <th className="p-3 border-r border-neutral-800">Tenant</th>
                <th className="p-3 border-r border-neutral-800 text-center">ABC Tech</th>
                <th className="p-3 border-r border-neutral-800 text-center">ABC Finance</th>
                <th className="p-3 border-r border-neutral-800 text-center">ABC Analyst</th>
                <th className="p-3 border-r border-neutral-800 text-center">XYZ Quantum</th>
                <th className="p-3 border-r border-neutral-800 text-center">XYZ SecOps</th>
                <th className="p-3 text-center">XYZ Compliance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-900 bg-black">
              {[
                {
                  doc: 'Engineering & Laptop Security',
                  tenant: 'Company ABC',
                  roles: {
                    'ABC Tech': { allowed: true, reason: 'Assigned to Engineering department. Contains disk encryption & SSH rotation policies.' },
                    'ABC Finance': { allowed: false, reason: 'Cross-department block: Finance cannot access internal infrastructure keys.' },
                    'ABC Analyst': { allowed: false, reason: 'Cross-department block: BI Analysts cannot access internal engineering keys.' },
                    'XYZ Quantum': { allowed: false, reason: 'Tenant Isolation: Company XYZ employee cannot query Company ABC database.' },
                    'XYZ SecOps': { allowed: false, reason: 'Tenant Isolation: Company XYZ employee cannot query Company ABC database.' },
                    'XYZ Compliance': { allowed: false, reason: 'Tenant Isolation: Company XYZ employee cannot query Company ABC database.' }
                  }
                },
                {
                  doc: 'Travel & Expense Reimbursement',
                  tenant: 'Company ABC',
                  roles: {
                    'ABC Tech': { allowed: false, reason: 'Cross-department block: Technical employees cannot inspect financial accounting audits.' },
                    'ABC Finance': { allowed: true, reason: 'Assigned to Finance department. Details per-diem and mileage compensation rates.' },
                    'ABC Analyst': { allowed: false, reason: 'Cross-department block: General analysts cannot inspect internal finance guidelines.' },
                    'XYZ Quantum': { allowed: false, reason: 'Tenant Isolation: Restricted cross-tenant boundary.' },
                    'XYZ SecOps': { allowed: false, reason: 'Tenant Isolation: Restricted cross-tenant boundary.' },
                    'XYZ Compliance': { allowed: false, reason: 'Tenant Isolation: Restricted cross-tenant boundary.' }
                  }
                },
                {
                  doc: 'BI & Enterprise Data Standards',
                  tenant: 'Company ABC',
                  roles: {
                    'ABC Tech': { allowed: false, reason: 'Cross-department block: Data governance is scoped to business analysts.' },
                    'ABC Finance': { allowed: false, reason: 'Cross-department block: Data warehouse governance is scoped to business analysts.' },
                    'ABC Analyst': { allowed: true, reason: 'Assigned to Business Analyst role. Outlines Tableau, SHA-256 masking, and retention standards.' },
                    'XYZ Quantum': { allowed: false, reason: 'Tenant Isolation: Restricted cross-tenant boundary.' },
                    'XYZ SecOps': { allowed: false, reason: 'Tenant Isolation: Restricted cross-tenant boundary.' },
                    'XYZ Compliance': { allowed: false, reason: 'Tenant Isolation: Restricted cross-tenant boundary.' }
                  }
                },
                {
                  doc: 'Code of Conduct & Assembly Point',
                  tenant: 'Company ABC',
                  roles: {
                    'ABC Tech': { allowed: true, reason: 'Company-wide tenant policy: VISIBILITY = ALL within Company ABC.' },
                    'ABC Finance': { allowed: true, reason: 'Company-wide tenant policy: VISIBILITY = ALL within Company ABC.' },
                    'ABC Analyst': { allowed: true, reason: 'Company-wide tenant policy: VISIBILITY = ALL within Company ABC.' },
                    'XYZ Quantum': { allowed: false, reason: 'Tenant Isolation: Company XYZ cannot access Company ABC internal tenant records.' },
                    'XYZ SecOps': { allowed: false, reason: 'Tenant Isolation: Company XYZ cannot access Company ABC internal tenant records.' },
                    'XYZ Compliance': { allowed: false, reason: 'Tenant Isolation: Company XYZ cannot access Company ABC internal tenant records.' }
                  }
                },
                {
                  doc: 'Proprietary Quantum Architecture (Titan)',
                  tenant: 'Company XYZ',
                  roles: {
                    'ABC Tech': { allowed: false, reason: 'Cross-Tenant block: Company ABC employee attempting to access Company XYZ defense assets.' },
                    'ABC Finance': { allowed: false, reason: 'Cross-Tenant block: Company ABC employee attempting to access Company XYZ defense assets.' },
                    'ABC Analyst': { allowed: false, reason: 'Cross-Tenant block: Company ABC employee attempting to access Company XYZ defense assets.' },
                    'XYZ Quantum': { allowed: true, reason: 'Classified R&D scope: Quantum architects permitted to inspect Project Titan tokens and port 9999.' },
                    'XYZ SecOps': { allowed: false, reason: 'Compartmentalized role block: SecOps charter does not include quantum gateway secrets.' },
                    'XYZ Compliance': { allowed: false, reason: 'Compartmentalized role block: Legal auditors do not hold technical quantum bypass authority.' }
                  }
                },
                {
                  doc: 'Cyber Incident Response Charter',
                  tenant: 'Company XYZ',
                  roles: {
                    'ABC Tech': { allowed: false, reason: 'Cross-Tenant block: Company ABC cannot query Company XYZ incident charters.' },
                    'ABC Finance': { allowed: false, reason: 'Cross-Tenant block: Company ABC cannot query Company XYZ incident charters.' },
                    'ABC Analyst': { allowed: false, reason: 'Cross-Tenant block: Company ABC cannot query Company XYZ incident charters.' },
                    'XYZ Quantum': { allowed: false, reason: 'Compartmentalized role block: Quantum R&D excluded from active SecOps incident isolation.' },
                    'XYZ SecOps': { allowed: true, reason: 'Operational scope: SecOps analysts authorized to review ransomware containment protocols.' },
                    'XYZ Compliance': { allowed: false, reason: 'Compartmentalized role block: Compliance officers do not hold incident response authority.' }
                  }
                },
                {
                  doc: 'Export Control & ITAR AI Policy',
                  tenant: 'Company XYZ',
                  roles: {
                    'ABC Tech': { allowed: false, reason: 'Cross-Tenant block: Commercial ABC employees cannot query defense compliance rules.' },
                    'ABC Finance': { allowed: false, reason: 'Cross-Tenant block: Commercial ABC employees cannot query defense compliance rules.' },
                    'ABC Analyst': { allowed: false, reason: 'Cross-Tenant block: Commercial ABC employees cannot query defense compliance rules.' },
                    'XYZ Quantum': { allowed: false, reason: 'Compartmentalized role block: Engineers cannot inspect legal whistleblower hotline details.' },
                    'XYZ SecOps': { allowed: false, reason: 'Compartmentalized role block: SecOps analysts cannot inspect state export licensing rules.' },
                    'XYZ Compliance': { allowed: true, reason: 'Legal & Regulatory scope: Compliance officers authorized for EAR99 & ITAR Category 5 guidelines.' }
                  }
                },
                {
                  doc: 'Sector 7 Facility Cleanroom Guidelines',
                  tenant: 'Company XYZ',
                  roles: {
                    'ABC Tech': { allowed: false, reason: 'Cross-Tenant block: Tenant isolation enforces zero visibility for Company ABC.' },
                    'ABC Finance': { allowed: false, reason: 'Cross-Tenant block: Tenant isolation enforces zero visibility for Company ABC.' },
                    'ABC Analyst': { allowed: false, reason: 'Cross-Tenant block: Tenant isolation enforces zero visibility for Company ABC.' },
                    'XYZ Quantum': { allowed: true, reason: 'Company-wide tenant scope: VISIBILITY = ALL within Company XYZ.' },
                    'XYZ SecOps': { allowed: true, reason: 'Company-wide tenant scope: VISIBILITY = ALL within Company XYZ.' },
                    'XYZ Compliance': { allowed: true, reason: 'Company-wide tenant scope: VISIBILITY = ALL within Company XYZ.' }
                  }
                }
              ].map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-neutral-900/60 transition-colors">
                  <td className="p-3 font-bold text-white border-r border-neutral-900">{row.doc}</td>
                  <td className="p-3 text-neutral-400 border-r border-neutral-900">{row.tenant}</td>
                  {['ABC Tech', 'ABC Finance', 'ABC Analyst', 'XYZ Quantum', 'XYZ SecOps', 'XYZ Compliance'].map((roleName, cIdx) => {
                    const rule = row.roles[roleName];
                    const isAllowed = rule.allowed;
                    const isSelected = inspectedPolicy?.doc === row.doc && inspectedPolicy?.role === roleName;

                    return (
                      <td
                        key={cIdx}
                        onMouseEnter={() => setInspectedPolicy({
                          doc: row.doc,
                          role: roleName,
                          tenant: row.tenant,
                          allowed: isAllowed,
                          reason: rule.reason
                        })}
                        title={`${roleName} on ${row.doc}: ${rule.reason}`}
                        className={`p-2.5 text-center border-r border-neutral-900 cursor-pointer transition-all ${
                          cIdx === 5 ? 'border-r-0' : ''
                        } ${isSelected ? 'ring-1 ring-white bg-neutral-900' : 'hover:bg-neutral-800/50'}`}
                      >
                        {isAllowed ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white text-black font-bold font-mono text-[10px] shadow-sm">
                            ✓ ALLOWED
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-neutral-900 border border-neutral-800 text-neutral-400 font-mono text-[10px]">
                            ✕ BLOCKED
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-neutral-800 pt-6">
        <button
          onClick={() => navigate('/')}
          className="btn-waxy-white py-3 px-6 text-xs font-mono font-bold uppercase tracking-wider inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Product Overview</span>
        </button>
        <p className="text-[11px] font-mono text-neutral-500 uppercase tracking-wider">
          TRUSTRA · Pre-LLM Zero-Leakage Architecture
        </p>
      </div>

    </div>
  );
}

