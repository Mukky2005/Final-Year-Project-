import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter, getUserSlug } from '../context/RouterContext';
import { 
  ShieldCheck, 
  Building2, 
  UserCheck, 
  ChevronDown, 
  MessageSquare, 
  SlidersHorizontal, 
  History, 
  LogOut,
  Sparkles,
  Lock,
  BookOpen,
  FlaskConical
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab }) {
  const { currentUser, demoUsers, switchUser, logout, isAuthenticated } = useAuth();
  const { navigate } = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const isPublicPage = activeTab === 'landing' || activeTab === 'demo';

  const handleSelectPersona = async (userId) => {
    const user = demoUsers.find(u => u.user_id === userId);
    await switchUser(userId);
    // Every demo persona switch opens their dedicated chat endpoint directly
    if (user) {
      navigate(`/chat/${getUserSlug(user)}`);
    } else {
      navigate('/chat');
    }
    setDropdownOpen(false);
  };

  return (
    <header className="bg-black border-b border-neutral-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Platform Name */}
          <div 
            className="flex items-center space-x-3 cursor-pointer group" 
            onClick={() => navigate('/')}
          >
            <div className="w-10 h-10 rounded-none bg-white border border-white flex items-center justify-center overflow-hidden transition-transform group-hover:scale-95 shadow-sm">
              <img 
                src="/trustra-logo.png" 
                alt="TRUSTRA Logo" 
                className="w-full h-full object-cover" 
              />
            </div>
            <div>
              <div className="text-sm font-black text-white tracking-widest uppercase">
                <span>TRUSTRA</span>
              </div>
              <p className="text-[11px] text-neutral-400 font-mono tracking-tight">AI that knows what you are allowed to know.</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 font-mono text-xs">
            <button
              onClick={() => navigate('/')}
              className={`relative flex items-center space-x-1.5 px-3.5 py-2 rounded-none transition-all border ${
                activeTab === 'landing'
                  ? 'bg-white text-black border-white font-bold shadow-sm'
                  : 'bg-transparent text-neutral-400 border-transparent hover:text-white hover:border-neutral-800'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>ABOUT TRUSTRA</span>
            </button>

            <button
              onClick={() => navigate('/demo')}
              className={`relative flex items-center space-x-2 px-3.5 py-2 rounded-none transition-all border ${
                activeTab === 'demo'
                  ? 'bg-white text-black border-white font-bold shadow-sm'
                  : 'bg-transparent text-neutral-400 border-transparent hover:text-white hover:border-neutral-800'
              }`}
            >
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
              <FlaskConical className="w-3.5 h-3.5" />
              <span>DEMO LAB</span>
            </button>

            {isAuthenticated && (
              <>
                <button
                  onClick={() => navigate(currentUser ? `/chat/${getUserSlug(currentUser)}` : '/chat')}
                  className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-none transition-all border ${
                    activeTab === 'chat'
                      ? 'bg-white text-black border-white font-bold shadow-sm'
                      : 'bg-transparent text-neutral-400 border-transparent hover:text-white hover:border-neutral-800'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>ROLE CHAT</span>
                </button>

                {currentUser?.is_admin && (
                  <>
                    <button
                      onClick={() => navigate('/admin')}
                      className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-none transition-all border ${
                        activeTab === 'admin'
                          ? 'bg-white text-black border-white font-bold shadow-sm'
                          : 'bg-transparent text-neutral-400 border-transparent hover:text-white hover:border-neutral-800'
                      }`}
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                      <span>ADMIN WORKSPACE</span>
                    </button>

                    <button
                      onClick={() => navigate('/audit')}
                      className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-none transition-all border ${
                        activeTab === 'audit'
                          ? 'bg-white text-black border-white font-bold shadow-sm'
                          : 'bg-transparent text-neutral-400 border-transparent hover:text-white hover:border-neutral-800'
                      }`}
                    >
                      <History className="w-3.5 h-3.5" />
                      <span>AUDIT LOGS</span>
                    </button>
                  </>
                )}
              </>
            )}
          </nav>

          {/* Right Header */}
          <div className="flex items-center space-x-3">
            {/* On public pages: clean CTA buttons — no company/role dropdown shown */}
            {isPublicPage ? (
              <div className="flex items-center gap-2">
                {activeTab === 'landing' ? (
                  <button
                    onClick={() => navigate('/demo')}
                    className="px-4 py-2 bg-white text-black text-xs font-mono font-black uppercase tracking-wider border border-white hover:bg-neutral-100 transition-colors"
                  >
                    Get Demo
                  </button>
                ) : (
                  <button
                    onClick={() => navigate('/')}
                    className="px-4 py-2 bg-transparent text-neutral-300 text-xs font-mono uppercase tracking-wider border border-neutral-700 hover:text-white hover:border-neutral-500 transition-colors"
                  >
                    Product Overview
                  </button>
                )}
                {isAuthenticated && (
                  <button
                    onClick={() => navigate(currentUser ? `/chat/${getUserSlug(currentUser)}` : '/chat')}
                    className="px-4 py-2 bg-transparent text-neutral-400 text-xs font-mono uppercase tracking-wider border border-neutral-700 hover:text-white hover:border-neutral-500 transition-colors"
                  >
                    Open Chat
                  </button>
                )}
              </div>
            ) : isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-2.5 px-3 py-1.5 rounded-none border border-neutral-700 bg-neutral-950 hover:bg-neutral-900 transition-all text-left"
                >
                  <div className="flex flex-col items-end">
                    <div className="flex items-center space-x-1.5">
                      <Building2 className="w-3 h-3 text-neutral-400" />
                      <span className="text-xs font-bold text-white tracking-wide">
                        {currentUser?.tenant_name || 'Tenant'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1 mt-0.5">
                      <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.2 rounded-none bg-neutral-900 text-neutral-300 border border-neutral-700">
                        {currentUser?.role_name}
                      </span>
                    </div>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-neutral-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Persona Switcher Dropdown */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-96 bg-neutral-950 rounded-none border border-neutral-700 shadow-2xl py-2 z-50 animate-in fade-in duration-100">
                    <div className="px-4 py-2.5 border-b border-neutral-800 bg-neutral-900/60">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 font-bold">
                          Select Demo Role (Opens Chat)
                        </span>
                        <span className="text-[9px] font-mono text-neutral-500 uppercase">
                          Isolated Threads
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-400 mt-1">
                        Each role opens an independent chat with dedicated conversation history:
                      </p>
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-neutral-900">
                      {demoUsers.map((user) => {
                        const isCurrent = currentUser?.user_id === user.user_id;
                        const isXYZ = user.tenant_name?.includes('XYZ');
                        return (
                          <button
                            key={user.user_id}
                            onClick={() => handleSelectPersona(user.user_id)}
                            className={`w-full px-4 py-3 text-left flex items-start justify-between transition-colors ${
                              isCurrent ? 'bg-neutral-800/80 text-white' : 'hover:bg-neutral-900 text-neutral-300'
                            }`}
                          >
                            <div className="space-y-0.5">
                              <div className="text-xs font-bold flex items-center gap-1.5">
                                <span>{user.full_name}</span>
                                {isCurrent && (
                                  <span className="w-1.5 h-1.5 bg-white"></span>
                                )}
                              </div>
                              <div className="text-[11px] text-neutral-400 font-mono">{user.email}</div>
                              <div className="text-[10px] text-neutral-400 font-mono flex items-center gap-1 pt-0.5">
                                <span className={isXYZ ? 'text-neutral-300 font-semibold' : 'text-neutral-400'}>
                                  {user.tenant_name}
                                </span>
                              </div>
                            </div>
                            <span className="text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-none border border-neutral-700 bg-black text-neutral-300 shrink-0">
                              {user.role_name}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="border-t border-neutral-800 px-3 pt-2.5 pb-1 flex justify-between bg-neutral-900/40">
                      <button
                        onClick={() => {
                          navigate('/');
                          setDropdownOpen(false);
                        }}
                        className="text-xs text-neutral-300 hover:text-white font-mono flex items-center gap-1"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Platform Overview</span>
                      </button>
                      <button
                        onClick={() => {
                          logout();
                          navigate('/');
                          setDropdownOpen(false);
                        }}
                        className="text-xs text-neutral-400 hover:text-white font-mono flex items-center gap-1"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => {
                  navigate('/demo');
                }}
                className="px-4 py-2 bg-white text-black text-xs font-mono font-black uppercase tracking-wider hover:bg-neutral-200 transition-colors"
              >
                Sign In / Demo
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
