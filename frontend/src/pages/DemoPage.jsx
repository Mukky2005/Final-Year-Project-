import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter, getUserEndpoint } from '../context/RouterContext';
import { 
  ShieldCheck, 
  Lock, 
  Building2, 
  Users, 
  ArrowRight, 
  ArrowLeft,
  Layers, 
  FileText,
  ShieldAlert,
  Info,
  Code2,
  Coins,
  BarChart3,
  SlidersHorizontal,
  Cpu
} from 'lucide-react';

export default function DemoPage() {
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
    if (r.includes('quantum')) return <Cpu className="w-4 h-4 text-black" />;
    if (r.includes('secops') || r.includes('security')) return <ShieldAlert className="w-4 h-4 text-black" />;
    if (r.includes('compliance') || r.includes('legal')) return <FileText className="w-4 h-4 text-black" />;
    if (r.includes('admin')) return <SlidersHorizontal className="w-4 h-4 text-black" />;
    if (r.includes('tech') || r.includes('engineer')) return <Code2 className="w-4 h-4 text-black" />;
    if (r.includes('finance')) return <Coins className="w-4 h-4 text-black" />;
    if (r.includes('analyst')) return <BarChart3 className="w-4 h-4 text-black" />;
    return <Users className="w-4 h-4 text-black" />;
  };

  const renderPersonaCard = (user) => {
    const details = getRoleDetails(user);
    const endpoint = getUserEndpoint(user);
    const isCompanyABC = user.tenant_name?.includes('ABC');

    return (
      <div
        key={user.user_id}
        className="border-2 border-black bg-white p-6 flex flex-col justify-between space-y-5 interactive-card text-block-pop rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all"
      >
        <div className="space-y-4">
          {/* Top Row: Role Badge + Department Icon */}
          <div className="flex items-center justify-between gap-2 border-b-2 border-black pb-3">
            <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 border border-black bg-neutral-100 text-black font-bold truncate max-w-[190px]">
              {user.role_name}
            </span>
            <div className="p-1.5 border border-black bg-neutral-100 shrink-0">
              {getRoleIcon(user.role_name)}
            </div>
          </div>

          {/* User Name & Email */}
          <div>
            <h4 className="text-base font-black text-black tracking-tight uppercase">
              {user.full_name}
            </h4>
            <p className="text-xs font-mono text-neutral-600 mt-0.5 truncate font-medium">
              {user.email}
            </p>
          </div>

          {/* Scoped Knowledge Boundaries */}
          <div className="space-y-3 pt-1">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-black font-black flex items-center gap-1.5">
                <span className="text-black text-xs font-black">✓</span> Permitted Knowledge:
              </span>
              <p className="text-xs text-neutral-800 leading-relaxed pl-3 border-l-2 border-black font-medium">
                {details.allowed}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-600 font-bold flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-neutral-600" /> Strictly Blocked:
              </span>
              <p className="text-xs text-neutral-500 leading-relaxed pl-3 border-l-2 border-neutral-300 font-normal">
                {details.blocked}
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2 space-y-2">
          <button
            onClick={() => handleLaunchPersona(user.user_id, endpoint)}
            className="w-full btn-waxy-black py-2.5 px-3 text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2"
          >
            <span>Sign in as {user.role_name}</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </button>

          {user.is_admin && (
            <button
              onClick={() => handleLaunchPersona(user.user_id, isCompanyABC ? '/admin/company-abc' : '/admin/company-xyz')}
              className="w-full py-2 px-3 text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 border-2 border-black bg-white text-black hover:bg-neutral-100 transition-all text-block-pop"
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
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16 text-black bg-white">
      
      {/* Header (Only on /demo main page) */}
      {selectedTenantFilter === 'ALL' && (
        <div className="space-y-4">
          <div className="border-2 border-black bg-white p-6 sm:p-8 space-y-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-block-pop">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 border-2 border-black bg-neutral-100 font-mono text-[10px] uppercase tracking-widest text-black font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-black" />
                <span>LIVE SECURITY TEST ENVIRONMENT</span>
              </div>
              <div className="font-mono text-xs text-black border-2 border-black px-3 py-1 bg-white font-bold">
                FAIL-CLOSED STATUS: <span className="bg-black text-white px-1.5 py-0.5">ENFORCED</span>
              </div>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black uppercase text-black tracking-tight">
              Interactive Multi-Role Security Demo
            </h1>
            <p className="text-sm text-neutral-700 font-mono max-w-3xl leading-relaxed font-medium">
              Test whether the actual data is truly secure. Switch between 8 employee personas across 2 separate companies.
              Ask allowed queries to verify instant retrieval, then intentionally attempt forbidden cross-department or cross-company queries to observe the pre-LLM retrieval gate physically prune unauthorized context.
            </p>
          </div>
        </div>
      )}

      {/* 2-Company Selection Grid (Displayed at /demo) */}
      {selectedTenantFilter === 'ALL' && (
        <div className="space-y-6">
          <div className="border-b-2 border-black pb-4 space-y-1">
            <div className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-neutral-600 font-bold">
              <Building2 className="w-4 h-4 text-black" />
              <span>Select Company</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black uppercase text-black tracking-tight">
              Enterprise Companies
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
            
            {/* Company ABC Card */}
            <div className="border-2 border-black bg-white p-6 sm:p-8 flex flex-col justify-between space-y-6 interactive-card text-block-pop shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b-2 border-black pb-3">
                  <span className="font-mono text-xs px-2.5 py-0.5 border border-black bg-black text-white font-bold">
                    TENANT 01
                  </span>
                  <Building2 className="w-5 h-5 text-black" />
                </div>

                <div>
                  <h3 className="text-2xl font-black text-black uppercase tracking-tight">
                    Company ABC
                  </h3>
                  <p className="text-xs font-mono text-neutral-600 mt-1 font-medium">
                    Commercial Enterprise · Marketing, Engineering, and Finance divisions
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate('/demo/company-abc')}
                className="btn-waxy-black py-3 px-4 font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2"
              >
                <span>Enter Company ABC</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Company XYZ Card */}
            <div className="border-2 border-black bg-white p-6 sm:p-8 flex flex-col justify-between space-y-6 interactive-card text-block-pop shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b-2 border-black pb-3">
                  <span className="font-mono text-xs px-2.5 py-0.5 border border-black bg-black text-white font-bold">
                    TENANT 02
                  </span>
                  <Building2 className="w-5 h-5 text-black" />
                </div>

                <div>
                  <h3 className="text-2xl font-black text-black uppercase tracking-tight">
                    Company XYZ
                  </h3>
                  <p className="text-xs font-mono text-neutral-600 mt-1 font-medium">
                    High-Security Research · Quantum Computing & Defense Systems
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate('/demo/company-xyz')}
                className="btn-waxy-black py-3 px-4 font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2"
              >
                <span>Enter Company XYZ</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Company ABC View (At /demo/company-abc) */}
      {selectedTenantFilter === 'ABC' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-black pb-4">
            <button
              onClick={() => navigate('/demo')}
              className="inline-flex items-center gap-2 font-mono text-xs font-bold text-black hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>← Back to All Companies</span>
            </button>

            <button
              onClick={() => navigate('/demo/company-xyz')}
              className="font-mono text-xs font-bold text-black hover:bg-neutral-100 inline-flex items-center gap-1.5 transition-colors border-2 border-black px-3 py-1.5 bg-white text-block-pop shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            >
              <span>Switch to Company XYZ</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="border-2 border-black bg-white p-6 sm:p-8 space-y-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-block-pop">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-black pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] px-2 py-0.5 border border-black bg-black text-white font-bold">
                    TENANT 01
                  </span>
                  <span className="font-mono text-xl font-black uppercase tracking-wider text-black">
                    Company ABC
                  </span>
                </div>
                <p className="text-xs text-neutral-600 font-mono font-medium">
                  Commercial Enterprise · Marketing, Engineering, and Finance divisions
                </p>
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-black pb-4">
            <button
              onClick={() => navigate('/demo')}
              className="inline-flex items-center gap-2 font-mono text-xs font-bold text-black hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>← Back to All Companies</span>
            </button>

            <button
              onClick={() => navigate('/demo/company-abc')}
              className="font-mono text-xs font-bold text-black hover:bg-neutral-100 inline-flex items-center gap-1.5 transition-colors border-2 border-black px-3 py-1.5 bg-white text-block-pop shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            >
              <span>Switch to Company ABC</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="border-2 border-black bg-white p-6 sm:p-8 space-y-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-block-pop">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-black pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] px-2 py-0.5 border border-black bg-black text-white font-bold">
                    TENANT 02
                  </span>
                  <span className="font-mono text-xl font-black uppercase tracking-wider text-black">
                    Company XYZ
                  </span>
                </div>
                <p className="text-xs text-neutral-600 font-mono font-medium">
                  High-Security Research · Quantum Computing & Defense Systems
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {xyzUsers.map(renderPersonaCard)}
            </div>
          </div>
        </div>
      )}

      {/* Full Pre-LLM Access Boundary Matrix */}
      <div className="border-2 border-black bg-white p-6 sm:p-8 space-y-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-block-pop">
        <div className="space-y-1">
          <div className="font-mono text-xs uppercase tracking-widest text-neutral-600 flex items-center gap-1.5 font-bold">
            <Layers className="w-4 h-4 text-black" />
            <span>Pre-LLM Access Boundary Matrix</span>
          </div>
          <h2 className="text-2xl font-black uppercase text-black">
            Enterprise Knowledge Visibility Verification
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 font-mono font-medium">
            Hover or click any cell below to inspect the live physical SQL filtering rule enforced by the database:
          </p>
        </div>

        {/* Live Policy Inspector Card */}
        {inspectedPolicy && (
          <div className="border-2 border-black bg-neutral-50 p-4 space-y-2 animate-tab-fade text-block-pop shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-black pb-2">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-black" />
                <span className="font-mono text-xs uppercase tracking-wider text-neutral-700">
                  Target Policy Rule: <strong className="text-black">{inspectedPolicy.doc}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-neutral-600 uppercase font-bold">Evaluated Actor:</span>
                <span className="text-xs font-mono font-black text-black uppercase">{inspectedPolicy.role}</span>
                {inspectedPolicy.allowed ? (
                  <span className="px-2 py-0.5 bg-black text-white font-mono font-bold text-[10px] uppercase">
                    ✓ ACCESS PERMITTED
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-white border-2 border-black text-black font-mono font-bold text-[10px] uppercase">
                    🔒 STRICTLY DENIED (0 CHUNKS)
                  </span>
                )}
              </div>
            </div>
            <p className="text-xs font-mono text-black leading-relaxed pt-1 font-medium">
              <span className="text-neutral-600 uppercase font-bold mr-1">Enforcement Logic:</span>
              {inspectedPolicy.reason}
            </p>
          </div>
        )}

        <div className="overflow-x-auto font-mono text-xs">
          <table className="w-full text-left border-collapse border-2 border-black">
            <thead>
              <tr className="border-b-2 border-black bg-neutral-100 text-[10px] text-black uppercase tracking-wider font-bold">
                <th className="p-3 border-r-2 border-black">Document Policy</th>
                <th className="p-3 border-r-2 border-black">Tenant</th>
                <th className="p-3 border-r-2 border-black text-center">ABC Tech</th>
                <th className="p-3 border-r-2 border-black text-center">ABC Finance</th>
                <th className="p-3 border-r-2 border-black text-center">ABC Analyst</th>
                <th className="p-3 border-r-2 border-black text-center">XYZ Quantum</th>
                <th className="p-3 border-r-2 border-black text-center">XYZ SecOps</th>
                <th className="p-3 text-center">XYZ Compliance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black bg-white">
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
                <tr key={rIdx} className="hover:bg-neutral-50 transition-colors">
                  <td className="p-3 font-bold text-black border-r-2 border-black">{row.doc}</td>
                  <td className="p-3 text-neutral-600 font-medium border-r-2 border-black">{row.tenant}</td>
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
                        className={`p-2.5 text-center border-r-2 border-black cursor-pointer transition-all ${
                          cIdx === 5 ? 'border-r-0' : ''
                        } ${isSelected ? 'bg-neutral-200' : 'hover:bg-neutral-100'}`}
                      >
                        {isAllowed ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-black text-white font-bold font-mono text-[10px] shadow-sm text-block-pop">
                            ✓ ALLOWED
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-black text-black font-mono text-[10px] font-bold text-block-pop">
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
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t-2 border-black pt-6">
        <button
          onClick={() => navigate('/')}
          className="btn-waxy-white py-3 px-6 text-xs font-mono font-bold uppercase tracking-wider inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Product Overview</span>
        </button>
        <p className="text-[11px] font-mono text-neutral-600 font-bold uppercase tracking-wider">
          TRUSTRA · Pre-LLM Zero-Leakage Architecture
        </p>
      </div>

    </div>
  );
}

