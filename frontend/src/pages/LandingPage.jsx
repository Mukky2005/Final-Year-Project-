import React, { useState, useEffect } from 'react';
import { useRouter } from '../context/RouterContext';
import {
  ShieldCheck,
  Lock,
  Layers,
  Users,
  Cpu,
  ArrowRight,
  Building2,
  Sparkles,
  Database,
  ShieldAlert,
  Terminal,
  Key,
  Compass,
  Zap,
  Bot,
  FlaskConical,
  BrainCircuit,
  Network,
  GitBranch,
  FileCheck2,
  CheckCircle2,
  Fingerprint,
  FileText
} from 'lucide-react';

export default function LandingPage({ setActiveTab }) {
  const { navigate } = useRouter();
  const [activeFeature, setActiveFeature] = useState(0);

  // Cycle through live feature highlights
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % 4);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-24 text-neutral-100">

      {/* ═══════════════════════════════════════════════════════════════
          HERO SECTION — PRODUCT IDENTITY & GET YOURSELF A DEMO CTA
          ═══════════════════════════════════════════════════════════════ */}
      <div className="space-y-8 max-w-5xl mx-auto text-center pt-4">

        {/* Logo + Name */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 sm:w-24 sm:h-24 bg-white border border-white flex items-center justify-center rounded-none shadow-xl mb-1 overflow-hidden">
            <img
              src="/trustra-logo.png"
              alt="TRUSTRA"
              className="w-full h-full object-cover"
            />
          </div>
          <h1 cl
            assName="text-6xl sm:text-8xl font-black text-white tracking-tighter uppercase leading-none font-sans">
            TRUSTRA
          </h1>
          <div className="inline-block border border-neutral-700 bg-black px-5 py-2">
            <p className="text-sm sm:text-lg font-mono text-white tracking-tight font-bold">
              AI that knows what you are allowed to know.
            </p>
          </div>
          <p className="text-xs sm:text-sm text-neutral-400 font-mono max-w-2xl mx-auto leading-relaxed pt-1">
            Zero-Trust Enterprise Knowledge Retrieval engineered for strict tenant separation and intra-organization role isolation.
            Unauthorized documents are physically pruned at the database level — before the model ever sees them.
          </p>
        </div>

        {/* Hero Call to Action Buttons */}
        <div className="flex flex-wrap justify-center items-center gap-4 pt-2">
          <button
            onClick={() => navigate('/demo')}
            className="btn-waxy-white inline-flex items-center gap-3 px-8 py-3.5 rounded-none font-mono font-bold text-xs uppercase tracking-wider shadow-lg group"
          >
            <Users className="w-4 h-4 text-black" />
            <span>Get Yourself a Demo</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>

          <button
            onClick={() => scrollToSection('architecture')}
            className="border border-neutral-700 bg-neutral-950 hover:bg-neutral-900 text-neutral-300 hover:text-white px-6 py-3.5 rounded-none font-mono font-bold text-xs uppercase tracking-wider transition-colors inline-flex items-center gap-2"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Explore Architecture</span>
          </button>
        </div>

        {/* Live Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border border-neutral-800">
          {[
            { value: '2', label: 'Isolated Tenants', sub: 'Company ABC · Company XYZ' },
            { value: '8', label: 'Test Personas', sub: '4 roles per organization' },
            { value: '100%', label: 'Pre-LLM Gate', sub: 'Zero prompt exposure' },
            { value: '0', label: 'Cross-Tenant Leaks', sub: 'Physically impossible' },
          ].map((stat, i) => (
            <div key={i} className={`p-5 bg-black text-center space-y-1 interactive-chip cursor-default ${i < 3 ? 'border-r border-neutral-800' : ''}`}>
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
              Live System Guarantees
            </div>
            <div className="flex gap-1 ml-auto">
              {[0, 1, 2, 3].map(i => (
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
              { icon: <Database className="w-4 h-4 text-white shrink-0 mt-0.5" />, title: 'Dedicated pgvector Tenancy', desc: 'Each tenant has a dedicated PostgreSQL + pgvector instance. Cross-tenant SQL is architecturally impossible, not just filtered.' },
              { icon: <ShieldAlert className="w-4 h-4 text-white shrink-0 mt-0.5" />, title: 'Fail-Closed Security Model', desc: 'If authorization cannot be resolved, the query is rejected immediately. No fallback to shared retrieval. No silent failures.' },
              { icon: <Key className="w-4 h-4 text-white shrink-0 mt-0.5" />, title: 'Cryptographic JWT + Server Resolution', desc: 'Tenant identity is never derived from client input. Cryptographic JWT is validated and tenant_id resolved from server-side SQL state only.' },
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

      </div>

      {/* ═══════════════════════════════════════════════════════════════
          PRODUCT LISTING & CORE CAPABILITIES
          ═══════════════════════════════════════════════════════════════ */}
      <div className="space-y-8">
        <div className="border-b border-neutral-800 pb-4">
          <div className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-widest text-neutral-400 mb-1">
            <Layers className="w-4 h-4 text-white" />
            <span>Product Overview</span>
          </div>
          <h2 className="text-3xl font-black uppercase text-white tracking-tight">
            How TRUSTRA Protects Enterprise Knowledge
          </h2>
          <p className="text-sm text-neutral-400 mt-1 max-w-2xl font-mono">
            Traditional enterprise search and standard RAG models indiscriminately embed all corporate documents into a shared vector index, leaving permission enforcement to probabilistic system prompts. TRUSTRA replaces this flaw with physical database-layer security boundaries.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              icon: <Building2 className="w-5 h-5 text-white" />,
              code: 'CAPABILITY-01',
              title: 'Multi-Tenant Isolation',
              desc: 'Tenants operate in isolated database containers. A query from Company ABC physically cannot query the pgvector storage of Company XYZ.'
            },
            {
              icon: <Fingerprint className="w-5 h-5 text-white" />,
              code: 'CAPABILITY-02',
              title: 'Role-Based Access Control',
              desc: 'Intra-company visibility rules separate Tech, Finance, SecOps, and Legal. Engineering cannot see per-diem rates; Finance cannot view SSH keys.'
            },
            {
              icon: <ShieldAlert className="w-5 h-5 text-white" />,
              code: 'CAPABILITY-03',
              title: 'Pre-LLM SQL Vector Pruning',
              desc: 'Semantic similarity search is filtered at SQL execution time. Unauthorized text chunks never enter the prompt context window.'
            },
            {
              icon: <Lock className="w-5 h-5 text-white" />,
              code: 'CAPABILITY-04',
              title: 'Fail-Closed Enforcement',
              desc: 'If a user token is malformed, revoked, or maps to zero authorized documents, the system immediately returns an explicit denial without invoking the LLM.'
            },
            {
              icon: <FileCheck2 className="w-5 h-5 text-white" />,
              code: 'CAPABILITY-05',
              title: 'Grounded Verifiable Citations',
              desc: 'Every generated response provides exact source document names, section IDs, and similarity metrics so answers are 100% auditable.'
            },
            {
              icon: <Terminal className="w-5 h-5 text-white" />,
              code: 'CAPABILITY-06',
              title: 'Tamper-Evident Audit Trails',
              desc: 'Every retrieval attempt, successful query, and rejected access attempt is permanently recorded with user identity, tenant ID, and timestamp.'
            }
          ].map((item, idx) => (
            <div key={idx} className="border border-neutral-800 bg-neutral-950 p-6 space-y-3 interactive-card group">
              <div className="flex items-center justify-between">
                <div className="p-2 border border-neutral-800 bg-black group-hover:border-white transition-colors">
                  {item.icon}
                </div>
                <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-500 group-hover:text-neutral-300 transition-colors">
                  {item.code}
                </span>
              </div>
              <h3 className="text-base font-bold text-white uppercase tracking-wide group-hover:text-white">
                {item.title}
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          HOW IT WORKS — ARCHITECTURAL FLOW PIPELINE
          ═══════════════════════════════════════════════════════════════ */}
      <div id="architecture" className="border border-neutral-800 bg-neutral-950 p-6 sm:p-10 space-y-8 scroll-mt-24">
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-neutral-800 pb-5 gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-neutral-400">
              <Lock className="w-3.5 h-3.5 text-white" />
              <span>Architectural Flow</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black uppercase text-white tracking-tight">
              Pre-LLM Authorization Filtering Pipeline
            </h2>
          </div>
          <div className="font-mono text-xs text-neutral-400 border border-neutral-800 px-3 py-1.5 bg-black">
            STATUS: <span className="text-white font-bold">FAIL-CLOSED PROTOCOL ACTIVE</span>
          </div>
        </div>

        {/* Pipeline Flow Stepper Bar (01 ➔ 02 ➔ 03 ➔ 04) */}
        <div className="hidden md:flex items-center justify-between border border-neutral-800 bg-black p-3.5 font-mono text-[11px] uppercase tracking-wider text-neutral-400">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-none bg-white text-black font-bold flex items-center justify-center text-[10px]">01</span>
            <span className="text-white font-bold">Server Identity</span>
          </div>
          <div className="flex items-center gap-1.5 text-neutral-600 animate-pulse-flow">
            <span className="w-8 h-px bg-neutral-700"></span>
            <ArrowRight className="w-3.5 h-3.5 text-white" />
            <span className="w-8 h-px bg-neutral-700"></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-none bg-white text-black font-bold flex items-center justify-center text-[10px]">02</span>
            <span className="text-white font-bold">Database Gate</span>
          </div>
          <div className="flex items-center gap-1.5 text-neutral-600 animate-pulse-flow">
            <span className="w-8 h-px bg-neutral-700"></span>
            <ArrowRight className="w-3.5 h-3.5 text-white" />
            <span className="w-8 h-px bg-neutral-700"></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-none bg-white text-black font-bold flex items-center justify-center text-[10px]">03</span>
            <span className="text-white font-bold">Zero-Leak Context</span>
          </div>
          <div className="flex items-center gap-1.5 text-neutral-600 animate-pulse-flow">
            <span className="w-8 h-px bg-neutral-700"></span>
            <ArrowRight className="w-3.5 h-3.5 text-white" />
            <span className="w-8 h-px bg-neutral-700"></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-none bg-white text-black font-bold flex items-center justify-center text-[10px]">04</span>
            <span className="text-white font-bold">Grounded Inference</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="border border-neutral-800 bg-black p-5 space-y-2.5 interactive-card group">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-neutral-400">01 / RESOLUTION</span>
              <span className="text-[10px] font-mono text-neutral-500 group-hover:text-white flex items-center gap-1 transition-colors">
                NEXT <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
              </span>
            </div>
            <h3 className="text-sm font-bold text-white uppercase">Server Identity</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Cryptographic JWT validates employee identity and resolves trusted <code className="text-white">tenant_id</code> and <code className="text-white">role_id</code> from SQL state. Client payload spoofing is rejected.
            </p>
          </div>

          <div className="border border-white bg-neutral-900 p-5 space-y-2.5 interactive-card group">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-white">02 / DATABASE GATE</span>
              <span className="text-[10px] font-mono text-neutral-300 group-hover:text-white flex items-center gap-1 transition-colors">
                NEXT <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
              </span>
            </div>
            <h3 className="text-sm font-bold text-white uppercase">pgvector Boundary</h3>
            <p className="text-xs text-neutral-300 leading-relaxed font-mono">
              WHERE tenant_id = user.tenant_id<br />
              AND (visibility = 'ALL' OR role_id IN allowed_roles)
            </p>
            <p className="text-[11px] text-neutral-400 pt-1">
              Unauthorized chunks are pruned at SQL query level.
            </p>
          </div>

          <div className="border border-neutral-800 bg-black p-5 space-y-2.5 interactive-card group">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-neutral-400">03 / CONTEXT</span>
              <span className="text-[10px] font-mono text-neutral-500 group-hover:text-white flex items-center gap-1 transition-colors">
                NEXT <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
              </span>
            </div>
            <h3 className="text-sm font-bold text-white uppercase">Zero Context Leak</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Only authorized chunks enter prompt context. If 0 authorized chunks match, the engine aborts immediately with zero LLM exposure.
            </p>
          </div>

          <div className="border border-neutral-800 bg-black p-5 space-y-2.5 interactive-card group">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-neutral-400">04 / INFERENCE</span>
              <span className="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                OUTPUT ✓
              </span>
            </div>
            <h3 className="text-sm font-bold text-white uppercase">Grounded Ollama</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Local Llama 3.2 generates strictly grounded answers, providing source document names, section markers, and similarity scores.
            </p>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          INTERACTIVE DEMO CALLOUT CARD
          ═══════════════════════════════════════════════════════════════ */}
      <div className="border-2 border-white bg-neutral-950 p-8 sm:p-12 space-y-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 border border-neutral-700 bg-black font-mono text-[10px] uppercase tracking-widest text-neutral-300">
          <Users className="w-3.5 h-3.5 text-white" />
          <span>EXPERIENCE LIVE ISOLATION</span>
        </div>

        <div className="max-w-2xl mx-auto space-y-3">
          <h2 className="text-3xl sm:text-4xl font-black uppercase text-white tracking-tight">
            Ready to Test the Security Model?
          </h2>
          <p className="text-sm text-neutral-400 font-mono leading-relaxed">
            We have prepared a dedicated interactive demo environment with 8 real employee personas across Company ABC and Company XYZ. Switch between roles, ask sensitive questions, and observe how unauthorized access is strictly prevented.
          </p>
        </div>

        <div className="pt-2">
          <button
            onClick={() => navigate('/demo')}
            className="btn-waxy-white inline-flex items-center gap-3 px-10 py-4 font-mono font-bold text-sm uppercase tracking-wider shadow-2xl group"
          >
            <span>Launch Interactive Demo Lab</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          THE FUTURE OF TRUSTRA — RESEARCH VISION SECTION
          Sourced from: "A Layered Security Framework for Tenant-Isolated
          Retrieval-Augmented Generation in Multitenant AI Systems"
          ═══════════════════════════════════════════════════════════════ */}
      <div className="space-y-10">

        {/* Section Header */}
        <div className="border-t border-neutral-800 pt-10 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 border border-neutral-700 bg-black font-mono text-[10px] uppercase tracking-widest text-neutral-400">
            <BrainCircuit className="w-3.5 h-3.5 text-white" />
            <span>Enterprise Security Architecture · Published Research Foundation</span>
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
          <div className="shrink-0 w-10 h-10 bg-white flex items-center justify-center overflow-hidden">
            <img src="/trustra-logo.png" alt="TRUSTRA" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 space-y-0.5">
            <p className="text-xs font-mono text-white font-bold uppercase tracking-wider">
              Published Research Foundation
            </p>
            <p className="text-xs text-neutral-400 font-mono">
              "A Layered Security Framework for Tenant-Isolated Retrieval-Augmented Generation in Multitenant AI Systems"
            </p>
            <p className="text-[10px] text-neutral-500 font-mono">
              Department of Computer Science & Engineering · Zero-Trust Multi-Tenant Architecture Group
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
            <div className="border border-neutral-800 bg-black p-6 space-y-4 interactive-card group">
              <div className="flex items-start justify-between">
                <div className="font-mono text-[10px] text-neutral-500 uppercase tracking-widest group-hover:text-neutral-400">Horizon 01</div>
                <Cpu className="w-4 h-4 text-white shrink-0 group-hover:scale-110 transition-transform" />
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
            <div className="border border-neutral-800 bg-black p-6 space-y-4 interactive-card group">
              <div className="flex items-start justify-between">
                <div className="font-mono text-[10px] text-neutral-500 uppercase tracking-widest group-hover:text-neutral-400">Horizon 02</div>
                <Network className="w-4 h-4 text-white shrink-0 group-hover:scale-110 transition-transform" />
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
            <div className="border border-neutral-800 bg-black p-6 space-y-4 interactive-card group">
              <div className="flex items-start justify-between">
                <div className="font-mono text-[10px] text-neutral-500 uppercase tracking-widest group-hover:text-neutral-400">Horizon 03</div>
                <Bot className="w-4 h-4 text-white shrink-0 group-hover:scale-110 transition-transform" />
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
            <div className="border border-neutral-800 bg-black p-6 space-y-4 interactive-card group">
              <div className="flex items-start justify-between">
                <div className="font-mono text-[10px] text-neutral-500 uppercase tracking-widest group-hover:text-neutral-400">Horizon 04</div>
                <FlaskConical className="w-4 h-4 text-white shrink-0 group-hover:scale-110 transition-transform" />
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
                className={`p-5 space-y-3 interactive-chip cursor-default ${i < 3 ? 'border-r border-neutral-800' : ''} ${item.active ? 'bg-white' : 'bg-black'}`}
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
        <div className="border border-white bg-black p-8 sm:p-12 text-center space-y-4 interactive-card">
          <div className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">
            Founding Security Architecture Principle
          </div>
          <blockquote className="text-xl sm:text-2xl font-black text-white leading-tight max-w-3xl mx-auto uppercase tracking-tight">
            "Powerful automation, personalizations, and computing optimization should be achieved
            within the tenant-and-authorizations domain of the core framework."
          </blockquote>
          <div className="pt-4 inline-flex items-center gap-3 border border-neutral-800 px-6 py-3 bg-neutral-950">
            <ShieldCheck className="w-5 h-5 text-white" />
            <span className="font-mono text-xs text-white uppercase tracking-widest font-bold">
              Every future feature ships inside the same zero-trust boundary you see today.
            </span>
          </div>
        </div>

        {/* Bottom CTA to Demo */}
        <div className="border border-neutral-800 bg-neutral-950 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-base font-bold text-white uppercase">Experience TRUSTRA in Action</h4>
            <p className="text-xs text-neutral-400 font-mono">Test live personas and inspect database-level pre-LLM query isolation.</p>
          </div>
          <button
            onClick={() => navigate('/demo')}
            className="btn-waxy-white px-6 py-2.5 text-xs font-mono font-bold uppercase tracking-wider inline-flex items-center gap-2 shrink-0"
          >
            <span>Open Demo Page</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Footer stamp */}
        <div className="border-t border-neutral-900 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] font-mono text-neutral-600 uppercase tracking-wider">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-white overflow-hidden flex items-center justify-center">
              <img src="/trustra-logo.png" alt="T" className="w-full h-full object-cover" />
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
