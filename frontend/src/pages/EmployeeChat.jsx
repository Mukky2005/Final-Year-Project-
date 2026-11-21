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
  ArrowLeft,
  History,
  X,
  Plus,
  PanelLeftClose,
  PanelLeft
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
  
  // Responsive sidebar state:
  // On split-screen / narrow viewports (<1280px), closed by default so chat takes the whole page.
  // On wide screens (>=1280px), docked by default, but toggleable.
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1280;
    }
    return false;
  });

  const messagesEndRef = useRef(null);

  // Close sidebar on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSidebarOpen]);

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

  // Reusable Sidebar Content (Rendered either as docked sidebar or slide-over drawer)
  const renderSidebarContent = (isMobileDrawer = false) => (
    <div className="flex flex-col h-full justify-between space-y-3 sm:space-y-4">
      <div className="space-y-3 sm:space-y-4 flex-1 flex flex-col min-h-0">
        
        {/* Header with Title and Close Button */}
        <div className="flex items-center justify-between pb-2 border-b-2 border-black">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-black shrink-0" />
            <span className="text-xs font-mono font-black uppercase tracking-wider text-black">
              ROLE CHAT THREADS ({conversations.length})
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsSidebarOpen(false)}
            className="p-1 border border-black bg-white hover:bg-neutral-200 text-black transition-colors"
            title="Close sidebar"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Active Persona Banner */}
        <div className="p-3 border-2 border-black bg-white space-y-1.5 text-block-pop shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] shrink-0">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-600 font-bold">
              ACTIVE PERSONA
            </span>
            <span className="flex items-center gap-1 text-[9px] font-mono uppercase tracking-widest text-white bg-black px-1.5 py-0.5 font-bold">
              <Lock className="w-2.5 h-2.5 shrink-0" />
              <span>ISOLATED</span>
            </span>
          </div>
          
          <div>
            <div className="text-xs sm:text-sm font-black text-black tracking-tight uppercase truncate">
              {currentUser?.full_name}
            </div>
            <div className="text-[11px] sm:text-xs font-mono text-neutral-700 font-bold truncate">
              {currentUser?.role_name}
            </div>
          </div>

          <div className="text-[10px] sm:text-[11px] font-mono text-neutral-600 flex items-center gap-1.5 pt-1 border-t border-neutral-300">
            <Building2 className="w-3 h-3 text-black shrink-0" />
            <span className="font-bold text-black truncate">{currentUser?.tenant_name}</span>
          </div>
        </div>

        {/* New Conversation Button */}
        <button
          type="button"
          onClick={() => {
            handleNewChat();
            if (isMobileDrawer || window.innerWidth < 1024) {
              setIsSidebarOpen(false);
            }
          }}
          className="w-full btn-waxy-black py-2 px-3 rounded-none font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>NEW CHAT SESSION</span>
        </button>

        {/* Conversation History List */}
        <div className="space-y-1.5 flex-1 min-h-0 flex flex-col">
          <span className="text-[10px] font-mono font-bold text-black uppercase tracking-widest block px-1 shrink-0">
            PREVIOUS SESSIONS
          </span>
          
          <div className="space-y-1.5 overflow-y-auto pr-1 flex-1">
            {conversations.length === 0 ? (
              <div className="p-4 text-center text-xs font-mono text-neutral-500 bg-white border-2 border-dashed border-neutral-300">
                No previous chats in this role thread.
              </div>
            ) : (
              conversations.map((conv) => {
                const isActive = activeConvId === conv.conversation_id;
                return (
                  <div
                    key={conv.conversation_id}
                    onClick={() => {
                      selectConversation(conv.conversation_id);
                      if (isMobileDrawer || window.innerWidth < 1024) {
                        setIsSidebarOpen(false);
                      }
                    }}
                    className={`p-2.5 rounded-none text-xs cursor-pointer flex items-center justify-between group transition-all border-2 text-block-pop ${
                      isActive
                        ? 'bg-black text-white font-bold border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                        : 'bg-white text-black border-black hover:bg-neutral-100 font-medium'
                    }`}
                  >
                    <span className="truncate pr-2 font-mono text-[11px]">{conv.title}</span>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteConversation(e, conv.conversation_id)}
                      className={`p-1 hover:scale-110 transition-opacity ${
                        isActive
                          ? 'text-white hover:text-neutral-300'
                          : 'text-black hover:text-neutral-700 opacity-0 group-hover:opacity-100'
                      }`}
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

      {/* Footer */}
      <div className="pt-2.5 border-t-2 border-black text-[10px] font-mono text-neutral-600 text-center leading-relaxed shrink-0">
        Thread bound to <span className="text-black font-bold break-all">{currentUser?.email}</span>.
      </div>
    </div>
  );

  return (
    <div className="h-[calc(100vh-68px)] max-w-7xl mx-auto p-2 sm:p-4 lg:p-6 text-black bg-white flex flex-col">
      <div className="relative flex-1 flex gap-4 overflow-hidden">
        
        {/* Desktop Docked Sidebar (Only visible on large screen when toggled open) */}
        {isSidebarOpen && (
          <aside className="hidden lg:flex flex-col w-72 xl:w-80 shrink-0 bg-neutral-50 border-2 border-black p-4 rounded-none shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-block-pop h-full overflow-hidden">
            {renderSidebarContent(false)}
          </aside>
        )}

        {/* Mobile & Split-Screen Slide-Over Drawer (Opens over chat on smaller/split screens) */}
        {isSidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
              onClick={() => setIsSidebarOpen(false)}
            />
            
            {/* Slide-out Drawer Panel */}
            <aside className="relative z-50 w-72 sm:w-80 max-w-[85vw] bg-neutral-50 border-r-2 border-black h-full p-4 flex flex-col justify-between shadow-[8px_0px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
              {renderSidebarContent(true)}
            </aside>
          </div>
        )}

        {/* Center: Full-Width / Whole-Page Chat Area */}
        <main className="flex-1 min-w-0 bg-white border-2 border-black rounded-none flex flex-col justify-between overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-block-pop h-full">
          
          {/* Top Session Status Bar with History Toggle */}
          <div className="px-3 sm:px-4 lg:px-6 py-2.5 border-b-2 border-black bg-neutral-100 flex items-center justify-between text-xs font-mono shrink-0 gap-2">
            
            {/* Left Controls: History Toggle & Quick New Chat */}
            <div className="flex items-center gap-2 min-w-0">
              <button
                type="button"
                onClick={() => setIsSidebarOpen((prev) => !prev)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 border-2 border-black font-mono font-bold text-xs uppercase tracking-wider transition-all text-block-pop shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] shrink-0 ${
                  isSidebarOpen
                    ? 'bg-black text-white hover:bg-neutral-800'
                    : 'bg-white text-black hover:bg-neutral-100'
                }`}
                title={isSidebarOpen ? "Close history sidebar" : "Open history & role threads"}
                aria-label="Toggle history sidebar"
              >
                <History className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">History</span>
                <span className={`px-1.5 py-0.2 text-[10px] font-black ${
                  isSidebarOpen ? 'bg-white text-black' : 'bg-black text-white'
                }`}>
                  {conversations.length}
                </span>
              </button>

              <button
                type="button"
                onClick={handleNewChat}
                className="flex items-center gap-1 px-2.5 py-1.5 border-2 border-black bg-white hover:bg-neutral-100 text-black font-mono font-bold text-xs uppercase tracking-wider transition-all text-block-pop shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] shrink-0"
                title="Start a new chat session"
              >
                <Plus className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">New Chat</span>
              </button>

              {/* Active Role & Tenant indicator */}
              <div className="flex items-center gap-1.5 min-w-0 truncate pl-1">
                <span className="w-2 h-2 bg-black animate-pulse shrink-0"></span>
                <span className="font-black text-black uppercase tracking-wider text-[11px] sm:text-xs truncate">
                  {currentUser?.role_name}
                </span>
                <span className="text-neutral-400 hidden md:inline">/</span>
                <span className="text-neutral-600 font-bold hidden md:inline truncate text-xs">
                  {currentUser?.tenant_name}
                </span>
              </div>
            </div>

            {/* Right Status Badge */}
            <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-mono uppercase tracking-widest text-black border-2 border-black px-2 py-1 bg-white font-bold text-block-pop shrink-0">
              <Lock className="w-3 h-3 text-black shrink-0" />
              <span className="hidden sm:inline">ISOLATED THREAD</span>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-5 lg:p-6 space-y-4 sm:space-y-6 bg-white min-h-0">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center max-w-2xl mx-auto space-y-4 py-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-black border-2 border-black flex items-center justify-center rounded-none shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] overflow-hidden text-block-pop shrink-0">
                  <img src="/trustra-logo.png" alt="TRUSTRA" className="w-full h-full object-cover invert" />
                </div>
                
                <div className="space-y-1">
                  <h3 className="text-sm sm:text-base font-black uppercase text-black tracking-wider">
                    TRUSTRA • {currentUser?.full_name}
                  </h3>
                  <p className="text-[10px] sm:text-[11px] font-mono text-neutral-800 font-bold uppercase tracking-wider">
                    AI that knows what you are allowed to know.
                  </p>
                  <p className="text-xs text-neutral-600 font-mono leading-relaxed pt-0.5">
                    Permitted knowledge: <strong className="text-black">{currentUser?.role_name}</strong> at <strong className="text-black">{currentUser?.tenant_name}</strong>. Unauthorized documents never reach model context.
                  </p>
                </div>

                {/* Suggestions tailored to this persona */}
                <div className="w-full space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-black font-black block text-left">
                      RECOMMENDED DEMO PROMPTS ({currentUser?.role_name}):
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-left">
                    {getPromptSuggestions().map((s, idx) => {
                      const isForbidden = s.label.toLowerCase().includes('forbidden');
                      return (
                        <div
                          key={idx}
                          className="bg-white p-3 text-left border-2 border-black flex flex-col justify-between group interactive-card text-block-pop shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1 gap-1">
                              <span className="font-bold text-black text-xs font-mono truncate">{s.label}</span>
                              <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 font-bold border shrink-0 ${
                                isForbidden ? 'bg-neutral-100 text-black border-black' : 'bg-black text-white border-black'
                              }`}>
                                {isForbidden ? 'BOUNDARY TEST' : 'PERMITTED'}
                              </span>
                            </div>
                            <div className="text-[11px] text-neutral-700 line-clamp-2 mt-0.5 font-sans leading-snug font-medium">
                              {s.query}
                            </div>
                          </div>
                          <div className="pt-2 mt-1.5 border-t border-neutral-200 flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setInputQuestion(s.query)}
                              className="text-[10px] font-mono text-neutral-600 hover:text-black font-bold px-1"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => executeQuery(s.query)}
                              className="btn-waxy-black px-2.5 py-0.5 rounded-none text-[10px] font-mono font-bold uppercase tracking-wider"
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
                  <div key={msg.message_id || index} className={`flex gap-2.5 sm:gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
                    {!isUser && (
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-none bg-black flex items-center justify-center shrink-0 mt-1 border-2 border-black overflow-hidden shadow-sm">
                        <img src="/trustra-logo.png" alt="TRUSTRA" className="w-full h-full object-cover invert" />
                      </div>
                    )}

                    <div className={`max-w-[90%] sm:max-w-2xl space-y-2 ${isUser ? 'items-end' : 'items-start'}`}>
                      <div
                        className={`p-3.5 sm:p-4 rounded-none text-xs sm:text-sm leading-relaxed border-2 border-black text-block-pop shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] ${
                          isUser
                            ? 'bg-neutral-100 text-black font-semibold'
                            : isInsufficient
                            ? 'bg-neutral-50 text-black font-medium'
                            : 'bg-white text-black font-medium'
                        }`}
                      >
                        {isInsufficient && (
                          <div className="flex items-center gap-1.5 font-mono text-[10px] sm:text-[11px] uppercase tracking-wider text-black font-black mb-2 pb-1.5 border-b-2 border-black">
                            <ShieldAlert className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black shrink-0" />
                            <span>ACCESS CONTROL BOUNDARY: INSUFFICIENT ROLE SCOPE</span>
                          </div>
                        )}
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      </div>

                      {/* Source Citations Pill List */}
                      {hasSources && (
                        <div className="space-y-1.5 pt-1">
                          <span className="text-[10px] font-mono font-black text-black uppercase tracking-widest flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5 text-black shrink-0" />
                            <span>VERIFIED GROUNDED SOURCES ({msg.retrieved_sources.length})</span>
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {msg.retrieved_sources.map((src, i) => (
                              <button
                                key={i}
                                onClick={() => setSelectedCitation(src)}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-none border-2 border-black bg-white hover:bg-neutral-100 text-black text-[11px] sm:text-xs font-mono font-bold transition-all text-block-pop shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                              >
                                <span className="font-black text-black">{src.document_title}</span>
                                <span className="text-[10px] text-neutral-600">({src.source_reference})</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {isUser && (
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-none bg-neutral-100 text-black flex items-center justify-center shrink-0 mt-1 border-2 border-black shadow-sm font-bold text-xs sm:text-sm">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                );
              })
            )}

            {loading && (
              <div className="flex gap-2.5 sm:gap-3 items-center text-xs text-neutral-700 font-mono font-bold">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-black text-white flex items-center justify-center border-2 border-black animate-pulse shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-black animate-ping shrink-0"></span>
                  <span className="text-[11px] sm:text-xs">Applying pre-LLM role filter & synthesizing response with Ollama...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Question Input Bar */}
          <form onSubmit={handleSubmit} className="p-2.5 sm:p-4 border-t-2 border-black bg-neutral-50 shrink-0">
            <div className="flex items-center gap-2 bg-white border-2 border-black rounded-none px-3 sm:px-4 py-2 sm:py-2.5 focus-within:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all">
              <input
                type="text"
                placeholder={`Query knowledge base as ${currentUser?.role_name}...`}
                value={inputQuestion}
                onChange={(e) => setInputQuestion(e.target.value)}
                disabled={loading}
                className="flex-1 text-xs sm:text-sm bg-transparent outline-none text-black placeholder:text-neutral-500 font-mono font-medium"
              />
              <button
                type="submit"
                disabled={!inputQuestion.trim() || loading}
                className="btn-waxy-black px-3 sm:px-4 py-1.5 sm:py-2 font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 disabled:opacity-30 shrink-0"
              >
                <span className="hidden sm:inline">SEND</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </main>
      </div>

      {/* Citation Detail Modal */}
      {selectedCitation && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white border-2 border-black p-5 sm:p-8 max-w-xl w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-4 rounded-none text-black max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b-2 border-black pb-3">
              <div>
                <h4 className="text-xs sm:text-sm font-black text-black uppercase">{selectedCitation.document_title}</h4>
                <p className="text-[11px] sm:text-xs text-neutral-600 font-mono mt-0.5 font-bold">{selectedCitation.source_reference}</p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 border border-black bg-neutral-100 text-black font-black uppercase shrink-0">
                Score: {selectedCitation.similarity_score}
              </span>
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-mono font-black text-black uppercase tracking-widest">
                Authorized Retrieved Chunk (Post-Filter Context):
              </span>
              <p className="text-xs text-neutral-800 bg-neutral-50 p-3 sm:p-4 border-2 border-black font-mono leading-relaxed whitespace-pre-wrap font-medium">
                {selectedCitation.snippet}
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedCitation(null)}
                className="btn-waxy-black px-5 py-2 font-mono font-bold text-xs uppercase tracking-wider"
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
