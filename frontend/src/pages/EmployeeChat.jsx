import React, { useState, useEffect, useRef } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { useRouter } from '../context/RouterContext';
import {
  Send,
  MessageSquare,
  Bot,
  User,
  ShieldAlert,
  Sparkles,
  BookOpen,
  Trash2,
  Info,
  Layers,
  Building2,
  Lock,
  ArrowLeft
} from 'lucide-react';

export default function EmployeeChat() {
  const { currentUser } = useAuth();
  const { navigate } = useRouter();
  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedCitation, setSelectedCitation] = useState(null);
  const messagesEndRef = useRef(null);

  // Load user-specific conversations whenever currentUser changes
  useEffect(() => {
    setActiveConvId(null);
    setMessages([]);
    loadConversations();
  }, [currentUser?.user_id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConversations = async () => {
    try {
      const convs = await api.getConversations();
      setConversations(convs || []);
      if (convs && convs.length > 0) {
        // Automatically load this role's most recent conversation
        selectConversation(convs[0].conversation_id);
      } else {
        setActiveConvId(null);
        setMessages([]);
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    }
  };

  const selectConversation = async (convId) => {
    setActiveConvId(convId);
    try {
      const detail = await api.getConversationDetail(convId);
      setMessages(detail.messages || []);
    } catch (err) {
      console.error('Failed to load conversation details:', err);
    }
  };

  const handleNewChat = () => {
    setActiveConvId(null);
    setMessages([]);
    setInputQuestion('');
  };

  const handleDeleteConversation = async (e, convId) => {
    e.stopPropagation();
    try {
      await api.deleteConversation(convId);
      if (activeConvId === convId) {
        handleNewChat();
      }
      await loadConversations();
    } catch (err) {
      alert(`Failed to delete conversation: ${err.message}`);
    }
  };

  const executeQuery = async (queryText) => {
    const query = (queryText || '').trim();
    if (!query || loading) return;

    // Optimistically add user message
    const userMsg = {
      message_id: 'temp-' + Date.now(),
      role: 'user',
      content: query,
      retrieved_sources: [],
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputQuestion('');
    setLoading(true);

    try {
      const resp = await api.queryKnowledge(query, activeConvId);

      const assistantMsg = {
        message_id: 'resp-' + Date.now(),
        role: 'assistant',
        content: resp.answer,
        retrieved_sources: resp.retrieved_sources || [],
        authorized_chunks_count: resp.authorized_chunks_count,
        total_tenant_chunks_count: resp.total_tenant_chunks_count,
        is_grounded: resp.is_grounded,
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      if (!activeConvId) {
        setActiveConvId(resp.conversation_id);
        await loadConversations();
      }
    } catch (err) {
      const errorMsg = {
        message_id: 'err-' + Date.now(),
        role: 'assistant',
        content: `Execution error: ${err.message}`,
        retrieved_sources: [],
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    executeQuery(inputQuestion);
  };

  // Tailored prompt suggestions for every company and demo role
  const getPromptSuggestions = () => {
    const role = currentUser?.role_name || '';
    const tenant = currentUser?.tenant_name || '';

    // Company XYZ
    if (tenant.includes('XYZ')) {
      if (role.includes('Quantum') || role.includes('Tech')) {
        return [
          { label: 'Project Titan Gateway & Token', query: 'What is the Project Titan port and master security bypass token?' },
          { label: 'QKD Channel Refresh Rate', query: 'How often do Quantum key distribution (QKD) channels refresh?' },
          { label: 'Sector 7 Facility Policy', query: 'What are the access requirements for Sector 7 cleanrooms?' },
          { label: 'Forbidden Test: SecOps Charter', query: 'What are the Level-4 incident subnet isolation rules and memory dump storage?' },
          { label: 'Forbidden Test: Export Controls', query: 'What is the export control classification for quantum algorithms?' },
        ];
      } else if (role.includes('Security') || role.includes('SecOps')) {
        return [
          { label: 'Level-4 Subnet Isolation', query: 'What are the subnet isolation rules for Level-4 security incidents?' },
          { label: 'Memory Dump Vault & CISO SLA', query: 'Where are volatile memory dumps transferred and who must receive containment reports within 2 hours?' },
          { label: 'Emergency Operations Hotline', query: 'What is the Company XYZ emergency security operations hotline?' },
          { label: 'Forbidden Test: Titan Secret', query: 'What is the Project Titan port and master security bypass token?' },
          { label: 'Forbidden Test: Export Controls', query: 'What is the export control classification for quantum algorithms?' },
        ];
      } else if (role.includes('Compliance') || role.includes('Legal')) {
        return [
          { label: 'EAR99/ITAR Munitions Category', query: 'What is the export control classification for quantum algorithms and cryptographic munitions?' },
          { label: 'Foreign Access Licensing', query: 'What state department license is required for foreign national access to Project Titan codebase?' },
          { label: 'Whistleblower Protection Channel', query: 'How must whistleblower complaints regarding export violations be logged?' },
          { label: 'Forbidden Test: Titan Bypass Key', query: 'What is the master security bypass token for Company XYZ Titan nodes?' },
          { label: 'Forbidden Test: SecOps Charter', query: 'What are the Level-4 incident subnet isolation rules?' },
        ];
      } else {
        return [
          { label: 'Sector 7 Cleanrooms', query: 'What are the access requirements for Sector 7 cleanrooms?' },
          { label: 'Emergency Hotline', query: 'What is the Company XYZ emergency security operations hotline?' },
        ];
      }
    }

    // Company ABC
    if (role.includes('Tech')) {
      return [
        { label: 'Laptop Security & SSH Policy', query: 'What is the laptop disk encryption and SSH rotation policy?' },
        { label: 'GitHub Commits & K8s Approvals', query: 'What are the rules for GitHub commits and production Kubernetes deployments?' },
        { label: 'Company Collaboration Hours', query: 'What are the core office collaboration hours and emergency evacuation assembly point?' },
        { label: 'Forbidden Test: Finance Reimbursements', query: 'What is the daily meal per-diem allowance and expense reimbursement rate?' },
        { label: 'Forbidden Test: Company XYZ Secrets', query: 'What is the Project Titan port and master security bypass token?' },
      ];
    } else if (role.includes('Finance')) {
      return [
        { label: 'Expense Filing Deadline', query: 'When must expense reports be filed and what is the deadline?' },
        { label: 'Meal Allowance & Mileage', query: 'What is the daily meal per-diem allowance and mileage reimbursement rate?' },
        { label: 'Itemized Receipt Threshold', query: 'For what amount is an itemized receipt mandatory for business expenses?' },
        { label: 'Forbidden Test: Tech SSH Keys', query: 'What is the laptop disk encryption and SSH rotation policy?' },
        { label: 'Forbidden Test: Company XYZ Secrets', query: 'What is the Project Titan port and master security bypass token?' },
      ];
    } else if (role.includes('Analyst')) {
      return [
        { label: 'Tableau & Looker Data Retention', query: 'What are the Tableau and Looker enterprise data retention standards?' },
        { label: 'PII Salted SHA-256 Masking', query: 'How must customer PII data be masked before ingestion into analytics datamarts?' },
        { label: 'Core KPI Sign-Off Authority', query: 'Who must approve changes to core business KPIs?' },
        { label: 'Forbidden Test: Tech SSH Keys', query: 'What is the laptop disk encryption and SSH rotation policy?' },
        { label: 'Forbidden Test: Finance Per-Diem', query: 'What is the daily meal per-diem allowance during business travel?' },
      ];
    } else {
      return [
        { label: 'Company Code of Conduct', query: 'What is the company code of conduct and core hours?' },
        { label: 'Emergency Evacuation', query: 'Where is the emergency evacuation assembly point?' },
      ];
    }
  };

  const isCompanyABC = currentUser?.tenant_name?.includes('ABC');
  const isCompanyXYZ = currentUser?.tenant_name?.includes('XYZ');
  const parentCompanyEndpoint = isCompanyABC ? '/demo/company-abc' : isCompanyXYZ ? '/demo/company-xyz' : '/demo';
  const parentCompanyLabel = isCompanyABC ? 'Company ABC' : isCompanyXYZ ? 'Company XYZ' : 'Demo Lab';

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-neutral-100 space-y-4">
      {/* Top Breadcrumb Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 pb-3">
        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            onClick={() => navigate(parentCompanyEndpoint)}
            className="inline-flex items-center gap-1.5 text-neutral-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>← Back to {parentCompanyLabel} Directory</span>
          </button>
          <span className="text-neutral-700">/</span>
          <span className="text-white font-bold">{currentUser?.full_name || 'Role Chat'}</span>
          <span className="text-[10px] text-neutral-500 uppercase px-2 py-0.5 border border-neutral-800 bg-neutral-950 font-mono">
            {currentUser?.role_name}
          </span>
        </div>

        <div className="font-mono text-[10px] text-neutral-500 flex items-center gap-2">
          <span>ENDPOINT:</span>
          <code className="text-neutral-300 font-bold bg-neutral-950 border border-neutral-800 px-2 py-0.5">
            {window.location.pathname}
          </code>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-190px)] min-h-[600px]">
        
        {/* Left Sidebar: Active Role, Actions, and Isolated History */}
        <div className="lg:col-span-1 bg-neutral-950 border border-neutral-800 p-5 rounded-none flex flex-col justify-between">
          <div className="space-y-4">
            
            {/* Active Persona Banner */}
            <div className="p-4 border border-neutral-700 bg-black space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 font-bold">
                  ACTIVE PERSONA
                </span>
                <span className="flex items-center gap-1 text-[9px] font-mono uppercase tracking-widest text-black bg-white px-1.5 py-0.5 font-bold">
                  <Lock className="w-2.5 h-2.5" />
                  <span>ISOLATED</span>
                </span>
              </div>
              
              <div>
                <div className="text-sm font-bold text-white tracking-tight">{currentUser?.full_name}</div>
                <div className="text-xs font-mono text-neutral-300 font-medium">{currentUser?.role_name}</div>
              </div>

              <div className="text-[11px] font-mono text-neutral-400 flex items-center gap-1.5 pt-1 border-t border-neutral-900">
                <Building2 className="w-3.5 h-3.5 text-neutral-400" />
                <span className="font-semibold text-neutral-300">{currentUser?.tenant_name}</span>
              </div>
            </div>

            {/* New Conversation Button */}
            <button
              onClick={handleNewChat}
              className="w-full btn-waxy-white py-2.5 px-4 rounded-none font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>NEW CHAT SESSION</span>
            </button>

            {/* Conversation History (User-Scoped Only) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-widest">
                  ROLE CHAT THREADS ({conversations.length})
                </span>
              </div>
              
              <div className="space-y-1 max-h-[300px] overflow-y-auto pr-1">
                {conversations.length === 0 ? (
                  <div className="p-4 text-center text-xs font-mono text-neutral-500 bg-black border border-neutral-800">
                    No previous chats in this role thread.
                  </div>
                ) : (
                  conversations.map((conv) => {
                    const isActive = activeConvId === conv.conversation_id;
                    return (
                      <div
                        key={conv.conversation_id}
                        onClick={() => selectConversation(conv.conversation_id)}
                        className={`p-3 rounded-none text-xs cursor-pointer flex items-center justify-between group transition-all border ${
                          isActive
                            ? 'bg-neutral-800 text-white font-bold border-white'
                            : 'bg-black text-neutral-400 border-neutral-800 hover:border-neutral-700 hover:text-neutral-200'
                        }`}
                      >
                        <span className="truncate pr-2 font-mono text-[11px]">{conv.title}</span>
                        <button
                          onClick={(e) => handleDeleteConversation(e, conv.conversation_id)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-neutral-400 hover:text-white transition-opacity"
                          title="Delete thread"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-neutral-800 text-[10px] font-mono text-neutral-500 text-center leading-relaxed">
            Database thread bound to <span className="text-neutral-300 font-bold">{currentUser?.email}</span>.
          </div>
        </div>

        {/* Center: Dedicated Chat Area */}
        <div className="lg:col-span-3 bg-neutral-950 border border-neutral-800 rounded-none flex flex-col justify-between overflow-hidden">
          
          {/* Top Session Status Bar */}
          <div className="px-6 py-3 border-b border-neutral-800 bg-black flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 bg-white animate-pulse"></span>
              <span className="font-bold text-white uppercase tracking-wider">
                {currentUser?.full_name} • {currentUser?.role_name}
              </span>
              <span className="text-neutral-600">/</span>
              <span className="text-neutral-400">{currentUser?.tenant_name}</span>
            </div>

            <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-neutral-300 border border-neutral-700 px-2 py-0.5 bg-neutral-900">
              <Lock className="w-3 h-3 text-white" />
              <span>ISOLATED THREAD</span>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-black">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto space-y-5 py-6">
                <div className="w-14 h-14 bg-white border border-white flex items-center justify-center rounded-none shadow-md overflow-hidden">
                  <img src="/trustra-logo.png" alt="TRUSTRA" className="w-full h-full object-cover" />
                </div>
                
                <div className="space-y-1">
                  <h3 className="text-base font-black uppercase text-white tracking-wider">
                    TRUSTRA • {currentUser?.full_name}
                  </h3>
                  <p className="text-[11px] font-mono text-neutral-300 font-bold uppercase tracking-wider">
                    AI that knows what you are allowed to know.
                  </p>
                  <p className="text-xs text-neutral-400 font-mono leading-relaxed pt-1">
                    Permitted knowledge: <strong className="text-white">{currentUser?.role_name}</strong> at <strong className="text-white">{currentUser?.tenant_name}</strong>. Unauthorized documents never reach model context.
                  </p>
                </div>

                {/* Suggestions tailored to this persona */}
                <div className="w-full space-y-2 pt-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 block text-left">
                    RECOMMENDED DEMO PROMPTS ({currentUser?.role_name}):
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                    {getPromptSuggestions().map((s, idx) => {
                      const isForbidden = s.label.toLowerCase().includes('forbidden');
                      return (
                        <div
                          key={idx}
                          className="btn-waxy-black p-3.5 text-left border border-neutral-800 hover:border-neutral-600 flex flex-col justify-between group interactive-card cursor-pointer"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-white text-xs font-mono">{s.label}</span>
                              <span className={`text-[9px] font-mono uppercase px-1.5 py-0.2 font-bold ${
                                isForbidden ? 'bg-neutral-900 text-neutral-300 border border-neutral-700' : 'bg-white text-black'
                              }`}>
                                {isForbidden ? 'BOUNDARY TEST' : 'PERMITTED'}
                              </span>
                            </div>
                            <div className="text-[11px] text-neutral-400 line-clamp-2 mt-1 font-sans leading-snug">{s.query}</div>
                          </div>
                          <div className="pt-2 mt-2 border-t border-neutral-900 flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setInputQuestion(s.query)}
                              className="text-[10px] font-mono text-neutral-400 hover:text-white px-1"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => executeQuery(s.query)}
                              className="px-2.5 py-0.5 rounded-none bg-white text-black text-[10px] font-mono font-bold hover:bg-neutral-200 uppercase tracking-wider"
                            >
                              Run ↵
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              messages.map((msg, index) => {
                const isUser = msg.role === 'user';
                const hasSources = msg.retrieved_sources && msg.retrieved_sources.length > 0;
                const isInsufficient =
                  msg.content?.toLowerCase().includes('insufficient information') ||
                  msg.content?.toLowerCase().includes('permitted knowledge scope');

                return (
                  <div key={msg.message_id || index} className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
                    {!isUser && (
                      <div className="w-8 h-8 rounded-none bg-white flex items-center justify-center shrink-0 mt-1 border border-white overflow-hidden">
                        <img src="/trustra-logo.png" alt="TRUSTRA" className="w-full h-full object-cover" />
                      </div>
                    )}

                    <div className={`max-w-2xl space-y-2 ${isUser ? 'items-end' : 'items-start'}`}>
                      <div
                        className={`p-4 rounded-none text-xs sm:text-sm leading-relaxed border ${
                          isUser
                            ? 'bg-white text-black border-white font-medium'
                            : isInsufficient
                            ? 'bg-neutral-950 text-neutral-200 border-neutral-600'
                            : 'bg-neutral-900 text-neutral-100 border-neutral-800'
                        }`}
                      >
                        {isInsufficient && (
                          <div className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-white font-bold mb-2 pb-1.5 border-b border-neutral-700">
                            <ShieldAlert className="w-4 h-4 text-white" />
                            <span>ACCESS CONTROL BOUNDARY: INSUFFICIENT ROLE SCOPE</span>
                          </div>
                        )}
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      </div>

                      {/* Source Citations Pill List */}
                      {hasSources && (
                        <div className="space-y-1.5 pt-1">
                          <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5 text-white" />
                            <span>VERIFIED GROUNDED SOURCES ({msg.retrieved_sources.length})</span>
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {msg.retrieved_sources.map((src, i) => (
                              <button
                                key={i}
                                onClick={() => setSelectedCitation(src)}
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-none border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 text-xs font-mono transition-colors"
                              >
                                <span className="font-bold text-white">{src.document_title}</span>
                                <span className="text-[10px] text-neutral-400">({src.source_reference})</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {isUser && (
                      <div className="w-8 h-8 rounded-none bg-neutral-800 text-white flex items-center justify-center shrink-0 mt-1 border border-neutral-700">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                );
              })
            )}

            {loading && (
              <div className="flex gap-3 items-center text-xs text-neutral-400 font-mono">
                <div className="w-8 h-8 bg-neutral-900 text-white flex items-center justify-center border border-neutral-700 animate-pulse">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-white animate-ping"></span>
                  <span>Applying pre-LLM role filter & synthesizing response with Ollama...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Question Input Bar */}
          <form onSubmit={handleSubmit} className="p-4 border-t border-neutral-800 bg-neutral-950">
            <div className="flex items-center gap-2 bg-black border border-neutral-700 rounded-none px-4 py-2.5 focus-within:border-white transition-colors">
              <input
                type="text"
                placeholder={`Query knowledge base as ${currentUser?.role_name} (${currentUser?.tenant_name})...`}
                value={inputQuestion}
                onChange={(e) => setInputQuestion(e.target.value)}
                disabled={loading}
                className="flex-1 text-xs sm:text-sm bg-transparent outline-none text-white placeholder-neutral-500 font-mono"
              />
              <button
                type="submit"
                disabled={!inputQuestion.trim() || loading}
                className="btn-waxy-white px-4 py-2 font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 disabled:opacity-30"
              >
                <span>SEND</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Citation Detail Modal */}
      {selectedCitation && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-950 border border-neutral-700 p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-4 rounded-none">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div>
                <h4 className="text-sm font-bold text-white uppercase">{selectedCitation.document_title}</h4>
                <p className="text-xs text-neutral-400 font-mono mt-0.5">{selectedCitation.source_reference}</p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 border border-neutral-700 bg-black text-neutral-300 font-bold uppercase">
                Score: {selectedCitation.similarity_score}
              </span>
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-widest">
                Authorized Retrieved Chunk (Post-Filter Context):
              </span>
              <p className="text-xs text-neutral-200 bg-black p-4 border border-neutral-800 font-mono leading-relaxed whitespace-pre-wrap">
                {selectedCitation.snippet}
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedCitation(null)}
                className="btn-waxy-white px-5 py-2 font-mono font-bold text-xs uppercase tracking-wider"
              >
                Close Citation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
