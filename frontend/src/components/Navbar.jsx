import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from '../context/RouterContext';
import { 
  Building2, 
  SlidersHorizontal, 
  History, 
  LogOut, 
  Sparkles, 
  BookOpen, 
  FlaskConical,
  Menu,
  X
} from 'lucide-react';

export default function Navbar({ activeTab }) {
  const { currentUser, isAuthenticated } = useAuth();
  const { navigate } = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isPublicPage = activeTab === 'landing' || activeTab === 'demo';

  const handleNav = (path) => {
    setMobileMenuOpen(false);
    navigate(path);
  };

  return (
    <header className="bg-white border-b-2 border-black sticky top-0 z-40 transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 gap-2">
          
          {/* Logo & Platform Name */}
          <div 
            className="flex items-center space-x-2 sm:space-x-3 cursor-pointer group shrink-0" 
            onClick={() => handleNav('/')}
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white border-2 border-black flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105 shadow-sm text-block-pop shrink-0">
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
              <p className="text-[10px] sm:text-[11px] text-neutral-600 font-mono tracking-tight font-medium hidden sm:block">
                AI that knows what you are allowed to know.
              </p>
            </div>
          </div>

          {/* Desktop & Wide Navigation Tabs */}
          <nav className="hidden lg:flex items-center space-x-1.5 font-mono text-xs">
            <button
              onClick={() => handleNav('/')}
              className={`relative flex items-center space-x-1.5 px-3 py-2 rounded-none transition-all text-block-pop ${
                activeTab === 'landing'
                  ? 'bg-black text-white border-2 border-black font-bold shadow-sm'
                  : 'bg-white text-black border-2 border-transparent hover:border-black font-semibold'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>ABOUT TRUSTRA</span>
            </button>

            <button
              onClick={() => handleNav('/demo')}
              className={`relative flex items-center space-x-2 px-3 py-2 rounded-none transition-all text-block-pop ${
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
                  onClick={() => handleNav('/admin')}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-none transition-all text-block-pop ${
                    activeTab === 'admin'
                      ? 'bg-black text-white border-2 border-black font-bold shadow-sm'
                      : 'bg-white text-black border-2 border-transparent hover:border-black font-semibold'
                  }`}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>ADMIN WORKSPACE</span>
                </button>

                <button
                  onClick={() => handleNav('/audit')}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-none transition-all text-block-pop ${
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

          {/* Right Header: Role Info, CTA or Mobile Menu Button */}
          <div className="flex items-center space-x-2 shrink-0">
            {/* On public pages: clean CTA buttons */}
            {isPublicPage ? (
              <div className="flex items-center gap-2">
                {activeTab === 'landing' ? (
                  <button
                    onClick={() => handleNav('/demo')}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 bg-black text-white text-xs font-mono font-bold uppercase tracking-wider border-2 border-black hover:bg-neutral-800 transition-colors shadow-sm text-block-pop"
                  >
                    Get Demo
                  </button>
                ) : (
                  <button
                    onClick={() => handleNav('/')}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white text-black text-xs font-mono font-bold uppercase tracking-wider border-2 border-black hover:bg-black hover:text-white transition-colors text-block-pop"
                  >
                    Product Overview
                  </button>
                )}
              </div>
            ) : isAuthenticated ? (
              <div className="flex items-center gap-1.5 sm:gap-2">
                {/* Active Persona Tag */}
                <div className="flex items-center space-x-1.5 sm:space-x-2.5 px-2 sm:px-3 py-1 sm:py-1.5 border-2 border-black bg-neutral-50 text-left">
                  <div className="flex flex-col items-end">
                    <div className="flex items-center space-x-1">
                      <Building2 className="w-3 h-3 text-black shrink-0" />
                      <span className="text-[11px] sm:text-xs font-black text-black tracking-wide truncate max-w-[70px] sm:max-w-[120px] md:max-w-none">
                        {currentUser?.tenant_name || 'Tenant'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1 mt-0.5">
                      <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-wider px-1 sm:px-1.5 py-0.2 bg-white text-black border border-black font-bold truncate max-w-[70px] sm:max-w-[120px] md:max-w-none">
                        {currentUser?.role_name}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Switch Role Button */}
                <button
                  onClick={() => {
                    const isABC = currentUser?.tenant_name?.includes('ABC');
                    const isXYZ = currentUser?.tenant_name?.includes('XYZ');
                    const target = isABC ? '/demo/company-abc' : isXYZ ? '/demo/company-xyz' : '/demo';
                    handleNav(target);
                  }}
                  className="px-2 sm:px-3 py-1.5 sm:py-2 border-2 border-black bg-white hover:bg-neutral-100 text-black text-xs font-mono font-bold uppercase tracking-wider text-block-pop transition-all flex items-center gap-1 sm:gap-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] shrink-0"
                  title="Go back to company directory to switch role"
                >
                  <LogOut className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden sm:inline">Switch Role</span>
                  <span className="sm:hidden text-[10px]">Switch</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleNav('/demo')}
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-black text-white text-xs font-mono font-black uppercase tracking-wider hover:bg-neutral-800 transition-colors border-2 border-black text-block-pop shadow-sm"
              >
                Sign In
              </button>
            )}

            {/* Mobile / Split-Screen Navigation Menu Toggle (visible on < lg) */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 border-2 border-black bg-white hover:bg-neutral-100 text-black transition-colors shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile / Split-Screen Navigation Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t-2 border-black bg-white p-3 space-y-1.5 shadow-[0px_4px_0px_0px_rgba(0,0,0,1)] font-mono text-xs">
          <button
            onClick={() => handleNav('/')}
            className={`w-full flex items-center space-x-2 px-3 py-2 rounded-none transition-all text-left ${
              activeTab === 'landing'
                ? 'bg-black text-white font-bold'
                : 'bg-neutral-50 text-black hover:bg-neutral-100 font-semibold'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>ABOUT TRUSTRA</span>
          </button>

          <button
            onClick={() => handleNav('/demo')}
            className={`w-full flex items-center space-x-2 px-3 py-2 rounded-none transition-all text-left ${
              activeTab === 'demo'
                ? 'bg-black text-white font-bold'
                : 'bg-neutral-50 text-black hover:bg-neutral-100 font-semibold'
            }`}
          >
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            <FlaskConical className="w-3.5 h-3.5" />
            <span>DEMO LAB</span>
          </button>

          {isAuthenticated && currentUser?.is_admin && (
            <>
              <button
                onClick={() => handleNav('/admin')}
                className={`w-full flex items-center space-x-2 px-3 py-2 rounded-none transition-all text-left ${
                  activeTab === 'admin'
                    ? 'bg-black text-white font-bold'
                    : 'bg-neutral-50 text-black hover:bg-neutral-100 font-semibold'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>ADMIN WORKSPACE</span>
              </button>

              <button
                onClick={() => handleNav('/audit')}
                className={`w-full flex items-center space-x-2 px-3 py-2 rounded-none transition-all text-left ${
                  activeTab === 'audit'
                    ? 'bg-black text-white font-bold'
                    : 'bg-neutral-50 text-black hover:bg-neutral-100 font-semibold'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span>AUDIT LOGS</span>
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
}
