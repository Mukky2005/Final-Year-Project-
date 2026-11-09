import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, 
  Lock, 
  Layers, 
  Users, 
  Cpu, 
  ArrowRight, 
  CheckCircle, 
  FileText, 
  Building2, 
  Sparkles,
  Database,
  ShieldAlert,
  Terminal,
  Key,
  EyeOff,
  AlertTriangle,
  Compass,
  Zap,
  Globe,
  Bot,
  FlaskConical,
  BrainCircuit,
  Network,
  ScanLine,
  GitBranch
} from 'lucide-react';

export default function LandingPage({ setActiveTab }) {
  const { demoUsers, switchUser, currentUser } = useAuth();
  const [activeFeature, setActiveFeature] = useState(0);
  const [hoveredPersona, setHoveredPersona] = useState(null);

  // Cycle through feature highlights
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const handleLaunchPersona = async (userId, targetTab = 'chat') => {
    await switchUser(userId);
    // Directly launch into dedicated chat mode so each role has an isolated chat window
    setActiveTab(targetTab);
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
          suggestedQuery: 'What is the Project Titan port and master security bypass token?'
        };
      } else if (role.includes('Security') || role.includes('SecOps')) {
        return {
          allowed: 'Level-4 ransomware containment, volatile memory dump storage vault, CISO reporting SLA.',
          blocked: 'Project Titan quantum bypass keys, Compliance export controls, all Company ABC docs.',
          suggestedQuery: 'What are the subnet isolation rules for Level-4 security incidents?'
        };
      } else if (role.includes('Compliance') || role.includes('Legal')) {
        return {
          allowed: 'US Export Controls (EAR99/ITAR Category 5), state license requirements, whistleblower hotline.',
          blocked: 'Project Titan gateway keys, SecOps containment charter, all Company ABC docs.',
          suggestedQuery: 'What is the export control classification for quantum algorithms?'
        };
      } else {
        return {
          allowed: 'Company XYZ Administrative management, Sector 7 cleanroom policies.',
          blocked: 'All Company ABC tenant documents.',
          suggestedQuery: 'What are the access requirements for Sector 7 cleanrooms?'
        };
      }
    }

    // Company ABC
    if (role.includes('Tech')) {
      return {
        allowed: 'Engineering laptop full-disk encryption, 60-day SSH rotation, GitHub signing, K8s dual approvals.',
        blocked: 'Finance expense reimbursements, daily per-diem rates, Company XYZ documents.',
        suggestedQuery: 'What is the laptop disk encryption and SSH rotation policy?'
      };
    } else if (role.includes('Finance')) {
      return {
        allowed: 'Travel expenses, $75 daily meal per-diem, 5th-day filing deadline, $0.67/mile mileage.',
        blocked: 'Engineering SSH rotation, laptop encryption protocols, Company XYZ documents.',
        suggestedQuery: 'What is the daily meal per-diem allowance during business travel?'
      };
    } else if (role.includes('Analyst')) {
      return {
        allowed: 'Tableau/Looker 3-year data retention, salted SHA-256 PII masking, core KPI approval authority.',
        blocked: 'Finance expense rates, engineering SSH keys, Company XYZ documents.',
        suggestedQuery: 'How must customer PII data be masked before ingestion?'
      };
    } else {
      return {
        allowed: 'Company ABC Administrative workspace, upload and assign documents, manage roles.',
        blocked: 'Company XYZ documents.',
        suggestedQuery: 'What are the core office collaboration hours and assembly points?'
      };
    }
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-20 text-neutral-100">
      
      {/* Hero Section */}
      <div className="space-y-8 max-w-5xl mx-auto text-center pt-4">

        {/* Logo + Name */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 sm:w-24 sm:h-24 bg-white border border-white flex items-center justify-center p-2 rounded-none shadow-xl mb-1">
            <img
              src="/trustra-logo.png"
              alt="TRUSTRA"
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-6xl sm:text-8xl font-black text-white tracking-tighter uppercase leading-none font-sans">
            TRUSTRA
          </h1>
          <div className="inline-block border border-neutral-700 bg-black px-5 py-2">
            <p className="text-sm sm:text-lg font-mono text-white tracking-tight font-bold">
              AI that knows what you are allowed to know.
            </p>
          </div>
          <p className="text-xs sm:text-sm text-neutral-400 font-mono max-w-2xl mx-auto leading-relaxed pt-1">
            Enterprise knowledge retrieval engineered for zero cross-tenant and zero cross-role leakage.
            Unauthorized documents are physically pruned at the database level — before the model ever sees them.
          </p>
        </div>

        {/* Live Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border border-neutral-800">
          {[
            { value: '2', label: 'Isolated Tenants', sub: 'ABC · XYZ' },
            { value: '8', label: 'Demo Personas', sub: '4 roles each' },
            { value: '100%', label: 'Pre-LLM Gate', sub: 'Zero bypass' },
            { value: '0', label: 'Cross-Tenant Leaks', sub: 'Guaranteed' },
          ].map((stat, i) => (
            <div key={i} className={`p-5 bg-black text-center space-y-1 ${i < 3 ? 'border-r border-neutral-800' : ''}`}>
              <div className="text-2xl sm:text-3xl font-black text-white font-mono">{stat.value}</div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-neutral-300">{stat.label}</div>
              <div className="text-[9px] font-mono text-neutral-600">{stat.sub}</div>
            </div>
          ))}
        </div>

        {/* Interactive Feature Ticker */}
        <div className="border border-neutral-800 bg-neutral-950 p-5 text-left">
          <div className="flex items-center gap-3 mb-4">
            <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-500 flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 bg-white animate-pulse"></span>
              Live System Properties
            </div>
            <div className="flex gap-1 ml-auto">
              {[0,1,2,3].map(i => (
                <button
                  key={i}
                  onClick={() => setActiveFeature(i)}
                  className={`w-6 h-1 transition-all border-none outline-none ${activeFeature === i ? 'bg-white' : 'bg-neutral-700 hover:bg-neutral-500'}`}
                />
              ))}
            </div>
          </div>
          <div className="min-h-[56px]">
            {[
              { icon: <Lock className="w-4 h-4 text-white shrink-0 mt-0.5" />, title: 'Pre-LLM Authorization Gate', desc: 'Every query runs WHERE tenant_id = user.tenant_id AND role_id IN (allowed_roles) before a single token reaches the language model.' },
              { icon: <Database className="w-4 h-4 text-white shrink-0 mt-0.5" />, title: 'Isolated pgvector Databases Per Tenant', desc: 'Each tenant has a dedicated PostgreSQL + pgvector instance. Cross-tenant SQL is architecturally impossible, not just filtered.' },
              { icon: <ShieldAlert className="w-4 h-4 text-white shrink-0 mt-0.5" />, title: 'Fail-Closed Security Model', desc: 'If authorization cannot be resolved, the query is rejected immediately. No fallback to shared retrieval. No silent failures.' },
              { icon: <Key className="w-4 h-4 text-white shrink-0 mt-0.5" />, title: 'JWT + Server-Side Tenant Resolution', desc: 'Tenant identity is never derived from client input. Cryptographic JWT is validated and tenant_id resolved from server-side SQL state only.' },
            ].map((f, i) => (
              <div
                key={i}
                className={`flex items-start gap-3 transition-all duration-300 ${activeFeature === i ? 'opacity-100' : 'opacity-0 absolute pointer-events-none'}`}
                style={{ position: activeFeature === i ? 'relative' : 'absolute' }}
              >
                {f.icon}
                <div>
                  <div className="text-xs font-black text-white font-mono uppercase tracking-wide">{f.title}</div>
                  <div className="text-[11px] text-neutral-400 mt-0.5 leading-relaxed">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-wrap justify-center gap-3">
          {currentUser ? (
            <button
              onClick={() => setActiveTab('chat')}
              className="btn-waxy-white inline-flex items-center gap-2 px-8 py-3 rounded-none font-mono font-bold text-xs uppercase tracking-wider"
            >
              <span>Open Dedicated Chat ({currentUser.role_name})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => {
                if (demoUsers.length > 0) {
                  handleLaunchPersona(demoUsers[0].user_id, 'chat');
                }
              }}
              className="btn-waxy-white inline-flex items-center gap-2 px-8 py-3 rounded-none font-mono font-bold text-xs uppercase tracking-wider"
            >
              <span>Start Demo</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Central Architectural Rule (Black & White Editorial Style) */}
      <div className="border border-neutral-800 bg-neutral-950 p-6 sm:p-8 rounded-none space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-neutral-800 pb-5 gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-neutral-400">
              <Lock className="w-3.5 h-3.5 text-white" />
              <span>Fundamental Security Guarantee</span>
            </div>
            <h2 className="text-2xl font-black uppercase text-white tracking-tight">
              Pre-LLM Authorization Filtering
            </h2>
          </div>
          <div className="font-mono text-xs text-neutral-400 border border-neutral-800 px-3 py-1.5 bg-black">
            STATUS: <span className="text-white font-bold">FAIL-CLOSED PROTOCOL ACTIVE</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="border border-neutral-800 bg-black p-5 space-y-2">
            <div className="font-mono text-xs font-bold text-neutral-400">01 / RESOLUTION</div>
            <h3 className="text-sm font-bold text-white uppercase">Server Identity</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Cryptographic JWT validates employee identity and resolves trusted <code className="text-white">tenant_id</code> and <code className="text-white">role_id</code> from SQL state. Client payload spoofing is rejected.
            </p>
          </div>

          <div className="border border-white bg-neutral-900 p-5 space-y-2">
            <div className="font-mono text-xs font-bold text-white">02 / DATABASE GATE</div>
            <h3 className="text-sm font-bold text-white uppercase">pgvector Boundary</h3>
            <p className="text-xs text-neutral-300 leading-relaxed font-mono">
              WHERE tenant_id = user.tenant_id<br />
              AND (visibility = 'ALL' OR role_id IN allowed_roles)
            </p>
            <p className="text-[11px] text-neutral-400 pt-1">
              Unauthorized chunks are pruned at SQL query level.
            </p>
          </div>

          <div className="border border-neutral-800 bg-black p-5 space-y-2">
            <div className="font-mono text-xs font-bold text-neutral-400">03 / CONTEXT</div>
            <h3 className="text-sm font-bold text-white uppercase">Zero Context Leak</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Only authorized chunks enter prompt context. If 0 authorized chunks match, the engine aborts immediately with zero LLM exposure.
            </p>
          </div>

          <div className="border border-neutral-800 bg-black p-5 space-y-2">
            <div className="font-mono text-xs font-bold text-neutral-400">04 / INFERENCE</div>
            <h3 className="text-sm font-bold text-white uppercase">Grounded Ollama</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Local Llama 3.2 generates strictly grounded answers, providing source document names, section markers, and similarity scores.
            </p>
          </div>
        </div>
      </div>

      {/* Demo Persona Matrix: Company ABC & Company XYZ */}
      <div className="space-y-8">
        <div>
          <div className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-widest text-neutral-400 mb-1">
            <Users className="w-4 h-4 text-white" />
            <span>Interactive Demo Personas</span>
          </div>
          <h2 className="text-3xl font-black uppercase text-white tracking-tight">
            Click Any Persona To Open Its Dedicated Chat
          </h2>
          <p className="text-sm text-neutral-400 mt-1 max-w-2xl">
            Each persona operates in an independent session with its own isolated chat history thread and strict document access rights.
          </p>
        </div>

        {/* Tenant 1: Company ABC */}
        <div className="border border-neutral-800 bg-neutral-950 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-white" />
              <span className="font-mono text-sm font-bold uppercase tracking-wider text-white">
                Tenant 1: Company ABC
              </span>
            </div>
            <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 border border-neutral-800 bg-black text-neutral-400">
              Commercial Enterprise Scope
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {abcUsers.map((user) => {
              const details = getRoleDetails(user);
              const isCurrent = currentUser?.user_id === user.user_id;

              return (
                <div
                  key={user.user_id}
                  className={`border p-4 bg-black flex flex-col justify-between space-y-4 transition-all ${
                    isCurrent ? 'border-white' : 'border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 border border-neutral-800 bg-neutral-900 text-white font-bold">
                        {user.role_name}
                      </span>
                      {isCurrent && (
                        <span className="text-[9px] font-mono uppercase tracking-widest text-black bg-white px-1.5 py-0.2 font-bold">
                          ACTIVE
                        </span>
                      )}
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-white">{user.full_name}</h4>
                      <p className="text-[11px] font-mono text-neutral-400">{user.email}</p>
                    </div>

                    <div className="space-y-2 text-xs pt-1 border-t border-neutral-900">
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-300 font-bold block">
                          ✓ Permitted Knowledge:
                        </span>
                        <p className="text-[11px] text-neutral-400 leading-snug mt-0.5">{details.allowed}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 font-bold block">
                          ✕ Blocked Scope:
                        </span>
                        <p className="text-[11px] text-neutral-500 leading-snug mt-0.5">{details.blocked}</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => handleLaunchPersona(user.user_id, 'chat')}
                      className="w-full btn-waxy-white py-2 px-3 text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-1.5"
                    >
                      <span>Open Role Chat</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tenant 2: Company XYZ */}
        <div className="border border-neutral-800 bg-neutral-950 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-white" />
              <span className="font-mono text-sm font-bold uppercase tracking-wider text-white">
                Tenant 2: Company XYZ
              </span>
            </div>
            <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 border border-neutral-800 bg-black text-neutral-400">
              High-Security Quantum & Defense
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {xyzUsers.map((user) => {
              const details = getRoleDetails(user);
              const isCurrent = currentUser?.user_id === user.user_id;

              return (
                <div
                  key={user.user_id}
                  className={`border p-4 bg-black flex flex-col justify-between space-y-4 transition-all ${
                    isCurrent ? 'border-white' : 'border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 border border-neutral-800 bg-neutral-900 text-white font-bold">
                        {user.role_name}
                      </span>
                      {isCurrent && (
                        <span className="text-[9px] font-mono uppercase tracking-widest text-black bg-white px-1.5 py-0.2 font-bold">
                          ACTIVE
                        </span>
                      )}
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-white">{user.full_name}</h4>
                      <p className="text-[11px] font-mono text-neutral-400">{user.email}</p>
                    </div>

                    <div className="space-y-2 text-xs pt-1 border-t border-neutral-900">
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-300 font-bold block">
                          ✓ Permitted Knowledge:
                        </span>
                        <p className="text-[11px] text-neutral-400 leading-snug mt-0.5">{details.allowed}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 font-bold block">
                          ✕ Blocked Scope:
                        </span>
                        <p className="text-[11px] text-neutral-500 leading-snug mt-0.5">{details.blocked}</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => handleLaunchPersona(user.user_id, 'chat')}
                      className="w-full btn-waxy-white py-2 px-3 text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-1.5"
                    >
                      <span>Open Role Chat</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Step-by-Step Live Demonstration Guide */}
      <div className="border border-neutral-800 bg-black p-6 sm:p-8 space-y-6">
        <div className="space-y-1">
          <div className="font-mono text-xs uppercase tracking-widest text-neutral-400 flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-white" />
            <span>Demonstration Walkthrough</span>
          </div>
          <h2 className="text-2xl font-black uppercase text-white">
            How to Demonstrate Zero-Leakage in 3 Quick Steps
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          <div className="border border-neutral-800 bg-neutral-950 p-5 space-y-3">
            <div className="font-mono text-xs font-bold text-white border-b border-neutral-800 pb-2">
              STEP 1: INTRA-TENANT ROLE TEST
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Open chat as <strong className="text-white">ABC Tech</strong> and ask about <span className="font-mono text-white">"What is the meal per-diem allowance?"</span>. The system immediately fails closed with zero finance chunks. Then switch to <strong className="text-white">ABC Finance</strong> and ask the same query to receive the verified $75/day answer.
            </p>
          </div>

          <div className="border border-neutral-800 bg-neutral-950 p-5 space-y-3">
            <div className="font-mono text-xs font-bold text-white border-b border-neutral-800 pb-2">
              STEP 2: CROSS-TENANT ISOLATION
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              While logged in as <strong className="text-white">ABC Tech</strong>, ask about <span className="font-mono text-white">"What is the Project Titan port and bypass token?"</span>. Zero chunks are retrieved. Switch to <strong className="text-white">XYZ Quantum Tech</strong> and ask the same query to receive the confidential token <code className="text-white">TITAN-XYZ-CONFIDENTIAL-8888</code>.
            </p>
          </div>

          <div className="border border-neutral-800 bg-neutral-950 p-5 space-y-3">
            <div className="font-mono text-xs font-bold text-white border-b border-neutral-800 pb-2">
              STEP 3: 3-WAY ISOLATION IN COMPANY XYZ
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              In Company XYZ, compare <strong className="text-white">Quantum Tech</strong> (Titan keys), <strong className="text-white">SecOps</strong> (Level-4 incident subnet containment), and <strong className="text-white">Compliance</strong> (ITAR Category 5 export rules). Each employee's chat is restricted strictly to their own operational scope!
            </p>
          </div>
        </div>
      </div>

      {/* Enterprise Authorization & Scoping Matrix */}
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
            Full audit table illustrating the physical vector retrieval boundaries enforced per role:
          </p>
        </div>

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
              <tr className="hover:bg-neutral-950">
                <td className="p-3 font-bold text-white border-r border-neutral-900">Engineering & Laptop Security</td>
                <td className="p-3 text-neutral-400 border-r border-neutral-900">Company ABC</td>
                <td className="p-3 text-center border-r border-neutral-900 bg-white/10 text-white font-bold">ALLOWED</td>
                <td className="p-3 text-center border-r border-neutral-900 text-neutral-600">BLOCKED</td>
                <td className="p-3 text-center border-r border-neutral-900 text-neutral-600">BLOCKED</td>
                <td className="p-3 text-center border-r border-neutral-900 text-neutral-600">BLOCKED</td>
                <td className="p-3 text-center border-r border-neutral-900 text-neutral-600">BLOCKED</td>
                <td className="p-3 text-center text-neutral-600">BLOCKED</td>
              </tr>
              <tr className="hover:bg-neutral-950">
                <td className="p-3 font-bold text-white border-r border-neutral-900">Travel & Expense Reimbursement</td>
                <td className="p-3 text-neutral-400 border-r border-neutral-900">Company ABC</td>
                <td className="p-3 text-center border-r border-neutral-900 text-neutral-600">BLOCKED</td>
                <td className="p-3 text-center border-r border-neutral-900 bg-white/10 text-white font-bold">ALLOWED</td>
                <td className="p-3 text-center border-r border-neutral-900 text-neutral-600">BLOCKED</td>
                <td className="p-3 text-center border-r border-neutral-900 text-neutral-600">BLOCKED</td>
                <td className="p-3 text-center border-r border-neutral-900 text-neutral-600">BLOCKED</td>
                <td className="p-3 text-center text-neutral-600">BLOCKED</td>
              </tr>
              <tr className="hover:bg-neutral-950">
                <td className="p-3 font-bold text-white border-r border-neutral-900">BI & Enterprise Data Standards</td>
                <td className="p-3 text-neutral-400 border-r border-neutral-900">Company ABC</td>
                <td className="p-3 text-center border-r border-neutral-900 text-neutral-600">BLOCKED</td>
                <td className="p-3 text-center border-r border-neutral-900 text-neutral-600">BLOCKED</td>
                <td className="p-3 text-center border-r border-neutral-900 bg-white/10 text-white font-bold">ALLOWED</td>
                <td className="p-3 text-center border-r border-neutral-900 text-neutral-600">BLOCKED</td>
                <td className="p-3 text-center border-r border-neutral-900 text-neutral-600">BLOCKED</td>
                <td className="p-3 text-center text-neutral-600">BLOCKED</td>
              </tr>
              <tr className="hover:bg-neutral-950">
                <td className="p-3 font-bold text-white border-r border-neutral-900">Code of Conduct & Assembly Point</td>
                <td className="p-3 text-neutral-400 border-r border-neutral-900">Company ABC</td>
                <td className="p-3 text-center border-r border-neutral-900 bg-white/10 text-white font-bold">ALLOWED</td>
                <td className="p-3 text-center border-r border-neutral-900 bg-white/10 text-white font-bold">ALLOWED</td>
                <td className="p-3 text-center border-r border-neutral-900 bg-white/10 text-white font-bold">ALLOWED</td>
                <td className="p-3 text-center border-r border-neutral-900 text-neutral-600">BLOCKED</td>
                <td className="p-3 text-center border-r border-neutral-900 text-neutral-600">BLOCKED</td>
                <td className="p-3 text-center text-neutral-600">BLOCKED</td>
              </tr>
              <tr className="hover:bg-neutral-950">
                <td className="p-3 font-bold text-white border-r border-neutral-900">Proprietary Quantum Architecture (Titan)</td>
                <td className="p-3 text-neutral-400 border-r border-neutral-900">Company XYZ</td>
                <td className="p-3 text-center border-r border-neutral-900 text-neutral-600">BLOCKED</td>
                <td className="p-3 text-center border-r border-neutral-900 text-neutral-600">BLOCKED</td>
                <td className="p-3 text-center border-r border-neutral-900 text-neutral-600">BLOCKED</td>
                <td className="p-3 text-center border-r border-neutral-900 bg-white/10 text-white font-bold">ALLOWED</td>
                <td className="p-3 text-center border-r border-neutral-900 text-neutral-600">BLOCKED</td>
                <td className="p-3 text-center text-neutral-600">BLOCKED</td>
              </tr>
              <tr className="hover:bg-neutral-950">
                <td className="p-3 font-bold text-white border-r border-neutral-900">Cyber Incident Response Charter</td>
                <td className="p-3 text-neutral-400 border-r border-neutral-900">Company XYZ</td>
                <td className="p-3 text-center border-r border-neutral-900 text-neutral-600">BLOCKED</td>
                <td className="p-3 text-center border-r border-neutral-900 text-neutral-600">BLOCKED</td>
                <td className="p-3 text-center border-r border-neutral-900 text-neutral-600">BLOCKED</td>
                <td className="p-3 text-center border-r border-neutral-900 text-neutral-600">BLOCKED</td>
                <td className="p-3 text-center border-r border-neutral-900 bg-white/10 text-white font-bold">ALLOWED</td>
                <td className="p-3 text-center text-neutral-600">BLOCKED</td>
              </tr>
              <tr className="hover:bg-neutral-950">
                <td className="p-3 font-bold text-white border-r border-neutral-900">Export Control & ITAR AI Policy</td>
                <td className="p-3 text-neutral-400 border-r border-neutral-900">Company XYZ</td>
                <td className="p-3 text-center border-r border-neutral-900 text-neutral-600">BLOCKED</td>
                <td className="p-3 text-center border-r border-neutral-900 text-neutral-600">BLOCKED</td>
                <td className="p-3 text-center border-r border-neutral-900 text-neutral-600">BLOCKED</td>
                <td className="p-3 text-center border-r border-neutral-900 text-neutral-600">BLOCKED</td>
                <td className="p-3 text-center border-r border-neutral-900 text-neutral-600">BLOCKED</td>
                <td className="p-3 text-center bg-white/10 text-white font-bold">ALLOWED</td>
              </tr>
              <tr className="hover:bg-neutral-950">
                <td className="p-3 font-bold text-white border-r border-neutral-900">Sector 7 Facility Cleanroom Guidelines</td>
                <td className="p-3 text-neutral-400 border-r border-neutral-900">Company XYZ</td>
                <td className="p-3 text-center border-r border-neutral-900 text-neutral-600">BLOCKED</td>
                <td className="p-3 text-center border-r border-neutral-900 text-neutral-600">BLOCKED</td>
                <td className="p-3 text-center border-r border-neutral-900 text-neutral-600">BLOCKED</td>
                <td className="p-3 text-center border-r border-neutral-900 bg-white/10 text-white font-bold">ALLOWED</td>
                <td className="p-3 text-center border-r border-neutral-900 bg-white/10 text-white font-bold">ALLOWED</td>
                <td className="p-3 text-center bg-white/10 text-white font-bold">ALLOWED</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          THE FUTURE OF TRUSTRA — Vision Section
          Sourced from: "A Layered Security Framework for Tenant-Isolated
          Retrieval-Augmented Generation in Multitenant AI Systems"
          ═══════════════════════════════════════════════════════════════ */}
      <div className="space-y-10">

        {/* Section Header */}
        <div className="border-t border-neutral-800 pt-10 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 border border-neutral-700 bg-black font-mono text-[10px] uppercase tracking-widest text-neutral-400">
            <BrainCircuit className="w-3.5 h-3.5 text-white" />
            <span>Research Vision · Sathyabama Institute of Science and Technology</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-black uppercase text-white tracking-tighter leading-none">
            What TRUSTRA<br />
            <span className="text-neutral-500">Will Become</span>
          </h2>
          <p className="text-sm text-neutral-400 font-mono max-w-2xl mx-auto leading-relaxed">
            The prototype you are using today is the first working layer of a research-grade,
            enterprise-class platform engineered for a world where AI must know not only
            <em> what</em> to retrieve — but <em>who</em> is allowed to know it.
          </p>
        </div>

        {/* Research Paper Citation Banner */}
        <div className="border border-neutral-700 bg-neutral-950 p-5 flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="shrink-0 w-10 h-10 bg-white flex items-center justify-center p-1.5">
            <img src="/trustra-logo.png" alt="TRUSTRA" className="w-full h-full object-contain" />
          </div>
          <div className="flex-1 space-y-0.5">
            <p className="text-xs font-mono text-white font-bold uppercase tracking-wider">
              Published Research Foundation
            </p>
            <p className="text-xs text-neutral-400 font-mono">
              "A Layered Security Framework for Tenant-Isolated Retrieval-Augmented Generation in Multitenant AI Systems"
            </p>
            <p className="text-[10px] text-neutral-600 font-mono">
              Mukesh Selvan M · Srivathsan J · S. Gowri &nbsp;—&nbsp; Dept. of Computer Science & Engineering, Sathyabama Institute of Science and Technology, Chennai
            </p>
          </div>
          <div className="shrink-0 font-mono text-[10px] border border-neutral-800 px-3 py-1.5 bg-black text-neutral-400 uppercase tracking-wider">
            Index Terms: RAG · Multi-Tenant · Tenant Isolation · LLM · Zero-Trust
          </div>
        </div>

        {/* Four Pillars of Future Evolution */}
        <div className="space-y-3">
          <div className="font-mono text-xs uppercase tracking-widest text-neutral-400 flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-white" />
            <span>Four Pillars of the TRUSTRA Platform Roadmap</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Pillar 1 */}
            <div className="border border-neutral-800 bg-black p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div className="font-mono text-[10px] text-neutral-500 uppercase tracking-widest">Horizon 01</div>
                <Cpu className="w-4 h-4 text-white shrink-0" />
              </div>
              <div>
                <h3 className="text-base font-black uppercase text-white tracking-tight">
                  Multi-Engine Inference & GPU Optimization
                </h3>
                <div className="mt-1 inline-block font-mono text-[9px] uppercase tracking-widest text-black bg-white px-2 py-0.5">
                  vLLM · TensorRT-LLM · NVIDIA Dynamo
                </div>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed">
                TRUSTRA will evolve beyond a single Ollama instance into a backend-agnostic 
                <strong className="text-white"> inference gateway</strong> capable of routing tenant workloads 
                to vLLM for general conversations, and to dedicated NVIDIA TensorRT-LLM instances for 
                high-security or latency-critical tenants. NVIDIA Dynamo will serve as the distributed 
                orchestration layer — enabling disaggregated serving, speculative decoding, 
                dynamic batching, and key-value cache-aware routing.
              </p>
              <div className="border-t border-neutral-900 pt-3 grid grid-cols-2 gap-2 text-[10px] font-mono text-neutral-500 uppercase tracking-wider">
                <span>→ Prefill / Decode Disaggregation</span>
                <span>→ Per-tenant inference isolation</span>
                <span>→ KV-cache boundary enforcement</span>
                <span>→ Model quantization + batching</span>
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="border border-neutral-800 bg-black p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div className="font-mono text-[10px] text-neutral-500 uppercase tracking-widest">Horizon 02</div>
                <Network className="w-4 h-4 text-white shrink-0" />
              </div>
              <div>
                <h3 className="text-base font-black uppercase text-white tracking-tight">
                  Domain-Specific Canonical Forms & NeMo Guardrails
                </h3>
                <div className="mt-1 inline-block font-mono text-[9px] uppercase tracking-widest text-black bg-white px-2 py-0.5">
                  NeMo · Colang · Intent Mapping
                </div>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Today's policy flows — injection detection, jailbreak mitigation, tenant isolation verify — 
                will be extended via <strong className="text-white">NVIDIA NeMo Guardrails</strong> using 
                Colang into a canonical-intent architecture. Each natural language query will be normalized 
                into a canonical form (e.g. <code className="text-white">compute_legal_clause</code>, 
                <code className="text-white"> request_financial_approval</code>) before the security 
                pipeline maps it to the correct knowledge-retrieval flow, response template, and 
                authorization rule — independent of phrasing variation.
              </p>
              <div className="border-t border-neutral-900 pt-3 grid grid-cols-2 gap-2 text-[10px] font-mono text-neutral-500 uppercase tracking-wider">
                <span>→ Domain intent classification</span>
                <span>→ Tenant-specific guardrail configs</span>
                <span>→ Input / retrieval / output rails</span>
                <span>→ Versioned policy with audit</span>
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="border border-neutral-800 bg-black p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div className="font-mono text-[10px] text-neutral-500 uppercase tracking-widest">Horizon 03</div>
                <Bot className="w-4 h-4 text-white shrink-0" />
              </div>
              <div>
                <h3 className="text-base font-black uppercase text-white tracking-tight">
                  Persona-Aware & Role-Adaptive AI Interaction
                </h3>
                <div className="mt-1 inline-block font-mono text-[9px] uppercase tracking-widest text-black bg-white px-2 py-0.5">
                  Persona Engine · ABAC · Adaptive UX
                </div>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed">
                TRUSTRA will introduce a <strong className="text-white">persona management layer</strong> that 
                tailors every AI interaction to the role, department, and expertise level of each user. 
                A compliance auditor receives ITAR-structured policy excerpts with citation trails. 
                An engineering lead sees implementation procedures and technical diagrams. 
                A finance analyst gets structured summaries with numeric precision. 
                Each persona carries configurable communication style, terminology, response format, 
                and approval thresholds — all scoped within the same authorization boundary that governs retrieval.
              </p>
              <div className="border-t border-neutral-900 pt-3 grid grid-cols-2 gap-2 text-[10px] font-mono text-neutral-500 uppercase tracking-wider">
                <span>→ Per-role AI response formatting</span>
                <span>→ Domain expert persona presets</span>
                <span>→ Human-in-loop approval flows</span>
                <span>→ Configurable tone & technicality</span>
              </div>
            </div>

            {/* Pillar 4 */}
            <div className="border border-neutral-800 bg-black p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div className="font-mono text-[10px] text-neutral-500 uppercase tracking-widest">Horizon 04</div>
                <FlaskConical className="w-4 h-4 text-white shrink-0" />
              </div>
              <div>
                <h3 className="text-base font-black uppercase text-white tracking-tight">
                  Agentic Knowledge Mining & Autonomous Workflows
                </h3>
                <div className="mt-1 inline-block font-mono text-[9px] uppercase tracking-widest text-black bg-white px-2 py-0.5">
                  Agentic RAG · Workflow Orchestration
                </div>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Beyond reactive Q&A, TRUSTRA will offer <strong className="text-white">autonomous agentic 
                flows</strong> — policy summarization agents that surface regulatory changes, 
                compliance agents that cross-reference ITAR/EAR documents against procurement requests, 
                and knowledge-mining agents that discover document gaps before they become audit failures. 
                All agentic operations remain fully bounded within the tenant's authorization domain. 
                No agent can read, fetch, or surface knowledge beyond the requesting user's proven permissions.
              </p>
              <div className="border-t border-neutral-900 pt-3 grid grid-cols-2 gap-2 text-[10px] font-mono text-neutral-500 uppercase tracking-wider">
                <span>→ Authorized agentic retrieval</span>
                <span>→ Policy change alerting agents</span>
                <span>→ Cross-doc compliance scanning</span>
                <span>→ Human confirmation checkpoints</span>
              </div>
            </div>

          </div>
        </div>

        {/* Architecture Evolution Timeline */}
        <div className="border border-neutral-800 bg-neutral-950 p-6 sm:p-8 space-y-6">
          <div className="space-y-1">
            <div className="font-mono text-xs uppercase tracking-widest text-neutral-400 flex items-center gap-1.5">
              <GitBranch className="w-4 h-4 text-white" />
              <span>Platform Evolution — From Prototype to Enterprise AI OS</span>
            </div>
            <h3 className="text-2xl font-black uppercase text-white tracking-tight">
              The Architecture in Full
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-0 border border-neutral-800">
            {[
              {
                phase: 'TODAY',
                label: 'Prototype Layer',
                desc: 'React frontend · FastAPI backend · pgvector tenant isolation · Ollama LLM · Role-based retrieval gate · Audit logs',
                active: true
              },
              {
                phase: 'PHASE II',
                label: 'Inference Scale',
                desc: 'vLLM serving gateway · TensorRT-LLM acceleration · NVIDIA Dynamo orchestration · Disaggregated prefill/decode · KV-cache tenant boundary',
                active: false
              },
              {
                phase: 'PHASE III',
                label: 'Policy Intelligence',
                desc: 'NeMo Guardrails integration · Canonical intent mapping · Domain-specific guardrail configs · Persona-adaptive response engine · Human-in-loop approval',
                active: false
              },
              {
                phase: 'PHASE IV',
                label: 'Enterprise AI Platform',
                desc: 'Multi-org Kubernetes namespaces · Agentic knowledge mining · Autonomous compliance workflows · Multi-mobile inference support · Federated tenant directories',
                active: false
              }
            ].map((item, i) => (
              <div
                key={i}
                className={`p-5 space-y-3 ${i < 3 ? 'border-r border-neutral-800' : ''} ${item.active ? 'bg-white' : 'bg-black'}`}
              >
                <div className={`font-mono text-[9px] uppercase tracking-widest ${item.active ? 'text-black' : 'text-neutral-600'}`}>
                  {item.phase}
                </div>
                <h4 className={`text-sm font-black uppercase tracking-tight ${item.active ? 'text-black' : 'text-white'}`}>
                  {item.label}
                </h4>
                <p className={`text-[11px] leading-relaxed ${item.active ? 'text-neutral-800' : 'text-neutral-500'}`}>
                  {item.desc}
                </p>
                {item.active && (
                  <div className="inline-block font-mono text-[9px] uppercase tracking-widest bg-black text-white px-2 py-0.5">
                    ● LIVE NOW
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Core Principle — The Unchanging Contract */}
        <div className="border border-white bg-black p-8 sm:p-12 text-center space-y-4">
          <div className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">
            The Founding Principle — From Research Paper, Section VI: Future Scope
          </div>
          <blockquote className="text-xl sm:text-2xl font-black text-white leading-tight max-w-3xl mx-auto uppercase tracking-tight">
            "Powerful automation, personalizations, and computing optimization should be achieved
            within the tenant-and-authorizations domain of the core framework."
          </blockquote>
          <div className="text-xs font-mono text-neutral-500">
            — Mukesh Selvan M, Srivathsan J, S. Gowri · Sathyabama Institute of Science & Technology
          </div>
          <div className="pt-4 inline-flex items-center gap-3 border border-neutral-800 px-6 py-3 bg-neutral-950">
            <ShieldCheck className="w-5 h-5 text-white" />
            <span className="font-mono text-xs text-white uppercase tracking-widest font-bold">
              Every future feature ships inside the same zero-trust boundary you see today.
            </span>
          </div>
        </div>

        {/* Footer stamp */}
        <div className="border-t border-neutral-900 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] font-mono text-neutral-600 uppercase tracking-wider">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-white p-0.5">
              <img src="/trustra-logo.png" alt="T" className="w-full h-full object-contain" />
            </div>
            <span>TRUSTRA · AI that knows what you are allowed to know.</span>
          </div>
          <div className="flex items-center gap-4">
            <span>React · FastAPI · pgvector · PostgreSQL</span>
            <span>·</span>
            <span>Prototype v0.1 — Research Build</span>
          </div>
        </div>

      </div>

    </div>
  );
}
