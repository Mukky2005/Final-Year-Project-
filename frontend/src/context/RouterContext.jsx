import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';

const RouterContext = createContext(null);

export function getUserSlug(user) {
  if (!user) return '';
  const email = (user.email || '').toLowerCase();
  if (email === 'admin@companyabc.com') return 'abc-admin';
  if (email === 'tech@companyabc.com') return 'abc-tech';
  if (email === 'finance@companyabc.com') return 'abc-finance';
  if (email === 'ba@companyabc.com') return 'abc-ba';
  if (email === 'admin@companyxyz.com') return 'xyz-admin';
  if (email === 'tech@companyxyz.com') return 'xyz-tech';
  if (email === 'secops@companyxyz.com') return 'xyz-secops';
  if (email === 'compliance@companyxyz.com') return 'xyz-compliance';
  return email.split('@')[0] || user.user_id;
}

export function getUserEndpoint(user) {
  if (!user) return '/demo';
  const email = (user.email || '').toLowerCase();
  if (email === 'admin@companyabc.com') return '/demo/company-abc/admin';
  if (email === 'tech@companyabc.com') return '/demo/company-abc/tech';
  if (email === 'finance@companyabc.com') return '/demo/company-abc/finance';
  if (email === 'ba@companyabc.com') return '/demo/company-abc/ba';
  if (email === 'admin@companyxyz.com') return '/demo/company-xyz/admin';
  if (email === 'tech@companyxyz.com') return '/demo/company-xyz/tech';
  if (email === 'secops@companyxyz.com') return '/demo/company-xyz/secops';
  if (email === 'compliance@companyxyz.com') return '/demo/company-xyz/compliance';
  return `/chat/${getUserSlug(user)}`;
}

export function findUserBySlug(identifier, demoUsers = []) {
  if (!identifier || !demoUsers.length) return null;
  const clean = identifier.toLowerCase().replace(/^\//, '').trim();

  // Exact email match
  const byEmail = demoUsers.find((u) => u.email?.toLowerCase() === clean);
  if (byEmail) return byEmail;

  // Exact user_id match
  const byId = demoUsers.find((u) => u.user_id === identifier);
  if (byId) return byId;

  // Slug aliases
  const slugMap = {
    'abc-admin': 'admin@companyabc.com',
    'admin-abc': 'admin@companyabc.com',
    'abc-tech': 'tech@companyabc.com',
    'tech-abc': 'tech@companyabc.com',
    'abc-finance': 'finance@companyabc.com',
    'finance-abc': 'finance@companyabc.com',
    'abc-ba': 'ba@companyabc.com',
    'ba-abc': 'ba@companyabc.com',
    'xyz-admin': 'admin@companyxyz.com',
    'admin-xyz': 'admin@companyxyz.com',
    'xyz-tech': 'tech@companyxyz.com',
    'tech-xyz': 'tech@companyxyz.com',
    'quantum-tech': 'tech@companyxyz.com',
    'xyz-quantum': 'tech@companyxyz.com',
    'xyz-secops': 'secops@companyxyz.com',
    'secops-xyz': 'secops@companyxyz.com',
    'xyz-compliance': 'compliance@companyxyz.com',
    'compliance-xyz': 'compliance@companyxyz.com',
  };

  if (slugMap[clean]) {
    const targetEmail = slugMap[clean];
    const user = demoUsers.find((u) => u.email?.toLowerCase() === targetEmail);
    if (user) return user;
  }

  // Partial matches
  return demoUsers.find(
    (u) =>
      u.email?.toLowerCase().includes(clean) ||
      u.role_name?.toLowerCase().includes(clean)
  );
}

export function parseRoute(pathname = '/') {
  const cleanPath = (pathname || '/').toLowerCase().replace(/\/+$/, '') || '/';

  // 1. Landing / About
  if (cleanPath === '/' || cleanPath === '/about' || cleanPath === '/product') {
    return {
      tab: 'landing',
      path: cleanPath === '/' ? '/' : cleanPath,
      tenantFilter: 'ALL',
      userSlug: null,
    };
  }

  // 2. Demo Lab routes
  if (cleanPath.startsWith('/demo')) {
    const parts = cleanPath.split('/').filter(Boolean);
    // parts[0] === 'demo'

    // Root Demo Lab: /demo -> choose between the two companies
    if (parts.length === 1) {
      return {
        tab: 'demo',
        path: '/demo',
        tenantFilter: 'ALL',
        userSlug: null,
      };
    }

    // Company view: /demo/company-abc or /demo/abc
    if (parts.length === 2) {
      const isABC = parts[1].includes('abc');
      const isXYZ = parts[1].includes('xyz');
      if (isABC) {
        return {
          tab: 'demo',
          path: '/demo/company-abc',
          tenantFilter: 'ABC',
          userSlug: null,
        };
      }
      if (isXYZ) {
        return {
          tab: 'demo',
          path: '/demo/company-xyz',
          tenantFilter: 'XYZ',
          userSlug: null,
        };
      }
      return {
        tab: 'demo',
        path: '/demo',
        tenantFilter: 'ALL',
        userSlug: null,
      };
    }

    // Nested role extension: /demo/company-abc/tech, /demo/company-xyz/secops, /demo/chat/:slug
    if (parts.length >= 3) {
      if (parts[1] === 'chat') {
        return {
          tab: 'chat',
          path: cleanPath,
          tenantFilter: 'ALL',
          userSlug: parts[2],
        };
      }

      const isABC = parts[1].includes('abc');
      const isXYZ = parts[1].includes('xyz');
      let rolePart = parts[2];

      let userSlug = null;
      if (isABC) {
        if (rolePart.includes('admin')) userSlug = 'abc-admin';
        else if (rolePart.includes('tech')) userSlug = 'abc-tech';
        else if (rolePart.includes('finance')) userSlug = 'abc-finance';
        else if (rolePart.includes('ba') || rolePart.includes('analyst')) userSlug = 'abc-ba';
        else userSlug = `abc-${rolePart}`;
      } else if (isXYZ) {
        if (rolePart.includes('admin')) userSlug = 'xyz-admin';
        else if (rolePart.includes('tech') || rolePart.includes('quantum')) userSlug = 'xyz-tech';
        else if (rolePart.includes('secops') || rolePart.includes('security')) userSlug = 'xyz-secops';
        else if (rolePart.includes('compliance') || rolePart.includes('legal')) userSlug = 'xyz-compliance';
        else userSlug = `xyz-${rolePart}`;
      }

      // Check if user specifically requested dashboard for admin
      if (parts[3] === 'dashboard' || (rolePart === 'admin' && parts[3] === 'admin')) {
        return {
          tab: 'admin',
          path: cleanPath,
          tenantFilter: isABC ? 'ABC' : 'XYZ',
          userSlug,
        };
      }

      return {
        tab: 'chat',
        path: cleanPath,
        tenantFilter: isABC ? 'ABC' : 'XYZ',
        userSlug: userSlug || rolePart,
      };
    }
  }

  // 3. Direct chat routes: /chat, /chat/:slug
  if (cleanPath.startsWith('/chat')) {
    const parts = cleanPath.split('/').filter(Boolean);
    const slug = parts[1] || null;
    return {
      tab: 'chat',
      path: cleanPath,
      tenantFilter: 'ALL',
      userSlug: slug,
    };
  }

  // 4. Admin Dashboard routes: /admin, /admin/company-abc, /admin/company-xyz
  if (cleanPath.startsWith('/admin')) {
    const parts = cleanPath.split('/').filter(Boolean);
    let tenantFilter = 'ALL';
    if (parts[1]?.includes('abc')) tenantFilter = 'ABC';
    if (parts[1]?.includes('xyz')) tenantFilter = 'XYZ';
    return {
      tab: 'admin',
      path: cleanPath,
      tenantFilter,
      userSlug: null,
    };
  }

  // 5. Audit Logs route: /audit
  if (cleanPath.startsWith('/audit')) {
    return {
      tab: 'audit',
      path: '/audit',
      tenantFilter: 'ALL',
      userSlug: null,
    };
  }

  // Fallback to landing
  return {
    tab: 'landing',
    path: '/',
    tenantFilter: 'ALL',
    userSlug: null,
  };
}

export function RouterProvider({ children }) {
  const { demoUsers, currentUser, switchUser, loading: authLoading } = useAuth();
  const [route, setRoute] = useState(() => parseRoute(window.location.pathname));
  const switchingRef = useRef(false);

  // Sync route on popstate (Back/Forward)
  useEffect(() => {
    const onPopState = () => {
      setRoute(parseRoute(window.location.pathname));
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', handlePopState);
    function handlePopState() {
      setRoute(parseRoute(window.location.pathname));
    }
  }, []);

  // If a role/user slug is present in URL (e.g. /demo/company-abc/tech or /chat/abc-tech), ensure that persona is active
  useEffect(() => {
    if (authLoading || !demoUsers.length) return;

    if (route.tab === 'chat' && route.userSlug) {
      const targetUser = findUserBySlug(route.userSlug, demoUsers);
      if (targetUser && currentUser?.user_id !== targetUser.user_id && !switchingRef.current) {
        switchingRef.current = true;
        switchUser(targetUser.user_id).finally(() => {
          switchingRef.current = false;
        });
      }
    } else if ((route.tab === 'admin' || route.tab === 'audit') && (!currentUser || !currentUser.is_admin)) {
      // Auto switch to admin if user visited /admin or /audit without an admin token
      const preferredTenant = route.tenantFilter === 'XYZ' ? 'XYZ' : 'ABC';
      const adminUser = demoUsers.find(
        (u) => u.is_admin && u.tenant_name?.includes(preferredTenant)
      ) || demoUsers.find((u) => u.is_admin);

      if (adminUser && currentUser?.user_id !== adminUser.user_id && !switchingRef.current) {
        switchingRef.current = true;
        switchUser(adminUser.user_id).finally(() => {
          switchingRef.current = false;
        });
      }
    }
  }, [route, demoUsers, currentUser, authLoading, switchUser]);

  // Navigate helper
  const navigate = useCallback((to, options = {}) => {
    const targetPath = to.startsWith('/') ? to : '/' + to;
    if (window.location.pathname !== targetPath) {
      if (options.replace) {
        window.history.replaceState(null, '', targetPath);
      } else {
        window.history.pushState(null, '', targetPath);
      }
    }
    const newRoute = parseRoute(targetPath);
    setRoute(newRoute);

    if (!options.keepScroll) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  // Backward-compatible setActiveTab adapter
  const setActiveTab = useCallback((tab) => {
    switch (tab) {
      case 'landing':
        navigate('/');
        break;
      case 'demo':
        navigate('/demo');
        break;
      case 'chat':
        if (currentUser) {
          navigate(getUserEndpoint(currentUser));
        } else {
          navigate('/chat');
        }
        break;
      case 'admin':
        navigate('/admin');
        break;
      case 'audit':
        navigate('/audit');
        break;
      default:
        navigate('/');
        break;
    }
  }, [navigate, currentUser]);

  return (
    <RouterContext.Provider
      value={{
        route,
        activeTab: route.tab,
        tenantFilter: route.tenantFilter,
        userSlug: route.userSlug,
        currentPath: route.path,
        navigate,
        setActiveTab,
      }}
    >
      {children}
    </RouterContext.Provider>
  );
}

export const useRouter = () => useContext(RouterContext);
