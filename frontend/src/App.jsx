import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import AdminDashboard from './pages/AdminDashboard';
import EmployeeChat from './pages/EmployeeChat';
import AuditLogsPage from './pages/AuditLogsPage';
import SecuritySuitePage from './pages/SecuritySuitePage';

function MainApp() {
  const { currentUser, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('landing');

  // If user signs in, route them appropriately if they are on landing
  const renderContent = () => {
    switch (activeTab) {
      case 'landing':
        return <LandingPage setActiveTab={setActiveTab} />;
      case 'chat':
        return <EmployeeChat key={currentUser?.user_id || 'anonymous'} />;
      case 'admin':
        return currentUser?.is_admin ? <AdminDashboard /> : <EmployeeChat key={currentUser?.user_id || 'anonymous'} />;
      case 'audit':
        return currentUser?.is_admin ? <AuditLogsPage /> : <EmployeeChat key={currentUser?.user_id || 'anonymous'} />;
      case 'suite':
        return <SecuritySuitePage />;
      default:
        return <LandingPage setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-black text-neutral-100 flex flex-col selection:bg-white selection:text-black">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 bg-black">{renderContent()}</main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

