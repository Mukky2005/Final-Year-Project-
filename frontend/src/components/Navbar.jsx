import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from '../context/RouterContext';
import { 
  Building2, 
  SlidersHorizontal, 
  History, 
  LogOut, 
  Sparkles, 
  BookOpen, 
  FlaskConical 
} from 'lucide-react';

export default function Navbar({ activeTab }) {
  const { currentUser, isAuthenticated } = useAuth();
  const { navigate } = useRouter();
  const isPublicPage = activeTab === 'landing' || activeTab === 'demo';

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

            {isAuthenticated && currentUser?.is_admin && (
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
              </div>
            ) : isAuthenticated ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center space-x-2.5 px-3 py-1.5 border-2 border-black bg-neutral-50 text-left">
                  <div className="flex flex-col items-end">
                    <div className="flex items-center space-x-1.5">
                      <Building2 className="w-3.5 h-3.5 text-black" />
                      <span className="text-xs font-black text-black tracking-wide">
                        {currentUser?.tenant_name || 'Tenant'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1 mt-0.5">
                      <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 bg-white text-black border border-black font-bold">
                        {currentUser?.role_name}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    const isABC = currentUser?.tenant_name?.includes('ABC');
                    const isXYZ = currentUser?.tenant_name?.includes('XYZ');
                    const target = isABC ? '/demo/company-abc' : isXYZ ? '/demo/company-xyz' : '/demo';
                    navigate(target);
                  }}
                  className="px-3 py-2 border-2 border-black bg-white hover:bg-neutral-100 text-black text-xs font-mono font-bold uppercase tracking-wider text-block-pop transition-all flex items-center gap-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  title="Go back to company directory to switch role"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Switch Role</span>
                </button>
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
