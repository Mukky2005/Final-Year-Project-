import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { RouterProvider, useRouter } from './context/RouterContext';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import DemoPage from './pages/DemoPage';
import AdminDashboard from './pages/AdminDashboard';
import EmployeeChat from './pages/EmployeeChat';
import AuditLogsPage from './pages/AuditLogsPage';

function MainApp() {
  const { currentUser, loading: authLoading } = useAuth();
  const { activeTab, setActiveTab } = useRouter();

  const renderContent = () => {
    switch (activeTab) {
      case 'landing':
        return <LandingPage />;
      case 'demo':
        return <DemoPage />;
      case 'chat':
        return <EmployeeChat key={currentUser?.user_id || 'anonymous'} />;
      case 'admin':
        // If auth is still resolving or user is an admin, render AdminDashboard
        if (currentUser?.is_admin || authLoading) {
          return <AdminDashboard />;
        }
        return <EmployeeChat key={currentUser?.user_id || 'anonymous'} />;
      case 'audit':
        if (currentUser?.is_admin || authLoading) {
          return <AuditLogsPage />;
        }
        return <EmployeeChat key={currentUser?.user_id || 'anonymous'} />;
      default:
        return <LandingPage />;
    }
  };

  return (
    <div className="min-h-screen bg-white text-black flex flex-col selection:bg-black selection:text-white">
      <Navbar activeTab={activeTab} />
      <main className="flex-1 bg-white">
        <div key={activeTab} className="animate-tab-fade">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider>
        <MainApp />
      </RouterProvider>
    </AuthProvider>
  );
}
