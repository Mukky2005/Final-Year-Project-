import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter, getUserSlug } from '../context/RouterContext';
import { 
  Building2, 
  ChevronDown, 
  MessageSquare, 
  SlidersHorizontal, 
  History, 
  LogOut, 
  Sparkles, 
  BookOpen, 
  FlaskConical 
} from 'lucide-react';

export default function Navbar({ activeTab }) {
  const { currentUser, demoUsers, switchUser, logout, isAuthenticated } = useAuth();
  const { navigate } = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const isPublicPage = activeTab === 'landing' || activeTab === 'demo';

  const handleSelectPersona = async (userId) => {
    const user = demoUsers.find(u => u.user_id === userId);
    await switchUser(userId);
    if (user) {
      navigate(`/chat/${getUserSlug(user)}`);
    } else {
      navigate('/chat');
    }
    setDropdownOpen(false);
  };

  return (
    <header className="bg-white border-b-2 border-black sticky top-0 z-40 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Platform Name */}
          <div 
            className="flex items-center space-x-3 cursor-pointer group" 
            onClick={() => navigate('/')}
          >
            <div className="w-10 h-10 bg-white border-2 border-black flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105 shadow-sm text-block-pop">
              <img 
                src="/trustra-logo.png" 
                alt="TRUSTRA Logo" 
                className="w-full h-full object-cover" 
              />
            </div>
            <div>
              <div className="text-sm font-black text-black tracking-widest uppercase">
                <span>TRUSTRA</span>
              </div>
              <p className="text-[11px] text-neutral-600 font-mono tracking-tight font-medium">AI that knows what you are allowed to know.</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1.5 font-mono text-xs">
            <button
              onClick={() => navigate('/')}
              className={`relative flex items-center space-x-1.5 px-3.5 py-2 rounded-none transition-all text-block-pop ${
                activeTab === 'landing'
                  ? 'bg-black text-white border-2 border-black font-bold shadow-sm'
                  : 'bg-white text-black border-2 border-transparent hover:border-black font-semibold'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>ABOUT TRUSTRA</span>
            </button>

            <button
              onClick={() => navigate('/demo')}
              className={`relative flex items-center space-x-2 px-3.5 py-2 rounded-none transition-all text-block-pop ${
                activeTab === 'demo'
                  ? 'bg-black text-white border-2 border-black font-bold shadow-sm'
                  : 'bg-white text-black border-2 border-transparent hover:border-black font-semibold'
              }`}
            >
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              <FlaskConical className="w-3.5 h-3.5" />
              <span>DEMO LAB</span>
            </button>

            {isAuthenticated && (
              <>
                <button
                  onClick={() => navigate(currentUser ? `/chat/${getUserSlug(currentUser)}` : '/chat')}
                  className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-none transition-all text-block-pop ${
                    activeTab === 'chat'
                      ? 'bg-black text-white border-2 border-black font-bold shadow-sm'
                      : 'bg-white text-black border-2 border-transparent hover:border-black font-semibold'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>ROLE CHAT</span>
                </button>

                {currentUser?.is_admin && (
                  <>
                    <button
                      onClick={() => navigate('/admin')}
                      className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-none transition-all text-block-pop ${
                        activeTab === 'admin'
                          ? 'bg-black text-white border-2 border-black font-bold shadow-sm'
                          : 'bg-white text-black border-2 border-transparent hover:border-black font-semibold'
                      }`}
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                      <span>ADMIN WORKSPACE</span>
                    </button>

                    <button
                      onClick={() => navigate('/audit')}
                      className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-none transition-all text-block-pop ${
                        activeTab === 'audit'
                          ? 'bg-black text-white border-2 border-black font-bold shadow-sm'
                          : 'bg-white text-black border-2 border-transparent hover:border-black font-semibold'
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
            {/* On public pages: clean CTA buttons */}
            {isPublicPage ? (
              <div className="flex items-center gap-2">
                {activeTab === 'landing' ? (
                  <button
                    onClick={() => navigate('/demo')}
                    className="px-4 py-2 bg-black text-white text-xs font-mono font-bold uppercase tracking-wider border-2 border-black hover:bg-neutral-800 transition-colors shadow-sm text-block-pop"
                  >
                    Get Demo
                  </button>
                ) : (
                  <button
                    onClick={() => navigate('/')}
                    className="px-4 py-2 bg-white text-black text-xs font-mono font-bold uppercase tracking-wider border-2 border-black hover:bg-black hover:text-white transition-colors text-block-pop"
                  >
                    Product Overview
                  </button>
                )}
                {isAuthenticated && (
                  <button
                    onClick={() => navigate(currentUser ? `/chat/${getUserSlug(currentUser)}` : '/chat')}
                    className="px-4 py-2 bg-white text-black text-xs font-mono font-bold uppercase tracking-wider border-2 border-black hover:bg-black hover:text-white transition-colors text-block-pop"
                  >
                    Open Chat
                  </button>
                )}
              </div>
            ) : isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-2.5 px-3 py-1.5 rounded-none border-2 border-black bg-white hover:bg-neutral-50 transition-all text-left text-block-pop shadow-sm"
                >
                  <div className="flex flex-col items-end">
                    <div className="flex items-center space-x-1.5">
                      <Building2 className="w-3.5 h-3.5 text-black" />
                      <span className="text-xs font-bold text-black tracking-wide">
                        {currentUser?.tenant_name || 'Tenant'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1 mt-0.5">
                      <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded-none bg-neutral-100 text-black border border-neutral-300 font-medium">
                        {currentUser?.role_name}
                      </span>
                    </div>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-black transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Persona Switcher Dropdown */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-96 bg-white rounded-none border-2 border-black shadow-2xl py-2 z-50 animate-in fade-in duration-100">
                    <div className="px-4 py-2.5 border-b-2 border-neutral-100 bg-neutral-50">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-800 font-bold">
                          Select Demo Role (Opens Chat)
                        </span>
                        <span className="text-[9px] font-mono text-neutral-600 uppercase font-semibold">
                          Isolated Threads
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-600 mt-1 font-sans">
                        Each role opens an independent chat with dedicated conversation history:
                      </p>
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-neutral-100">
                      {demoUsers.map((user) => {
                        const isCurrent = currentUser?.user_id === user.user_id;
                        const isXYZ = user.tenant_name?.includes('XYZ');
                        return (
                          <button
                            key={user.user_id}
                            onClick={() => handleSelectPersona(user.user_id)}
                            className={`w-full px-4 py-3 text-left flex items-start justify-between transition-all ${
                              isCurrent 
                                ? 'bg-black text-white font-bold' 
                                : 'hover:bg-neutral-100 text-black'
                            }`}
                          >
                            <div className="space-y-0.5">
                              <div className="text-xs font-bold flex items-center gap-1.5">
                                <span>{user.full_name}</span>
                                {isCurrent && (
                                  <span className="w-1.5 h-1.5 bg-white"></span>
                                )}
                              </div>
                              <div className={`text-[11px] font-mono ${isCurrent ? 'text-neutral-300' : 'text-neutral-600'}`}>{user.email}</div>
                              <div className="text-[10px] font-mono flex items-center gap-1 pt-0.5">
                                <span className={isCurrent ? 'text-white' : isXYZ ? 'text-neutral-900 font-semibold' : 'text-neutral-700'}>
                                  {user.tenant_name}
                                </span>
                              </div>
                            </div>
                            <span className={`text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-none border shrink-0 font-semibold ${
                              isCurrent 
                                ? 'border-white bg-black text-white' 
                                : 'border-neutral-300 bg-neutral-100 text-black'
                            }`}>
                              {user.role_name}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="border-t-2 border-neutral-100 px-3 pt-2.5 pb-1 flex justify-between bg-neutral-50">
                      <button
                        onClick={() => {
                          navigate('/');
                          setDropdownOpen(false);
                        }}
                        className="text-xs text-neutral-800 hover:text-black font-mono font-semibold flex items-center gap-1"
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
                        className="text-xs text-neutral-700 hover:text-black font-mono font-semibold flex items-center gap-1"
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
                className="px-4 py-2 bg-black text-white text-xs font-mono font-black uppercase tracking-wider hover:bg-neutral-800 transition-colors border-2 border-black text-block-pop shadow-sm"
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
