import React, { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { useIsMobile } from '@/hooks/use-mobile';
import { LoginScreen } from '@/components/auth/LoginScreen';
import { SignUpScreen } from '@/components/auth/SignUpScreen';
import { DesktopHeader } from '@/components/layout/DesktopHeader';
import { MobileNavBar } from '@/components/layout/MobileNavBar';
// import { Dashboard } from '@/components/dashboard/Dashboard';
import { POSPage } from '@/components/pos/POSPage';
import { InventoryPage } from '@/components/inventory/InventoryPage';
import { ReportsPage } from '@/components/reports/ReportsPage';
import { SettingsPage } from '@/components/settings/SettingsPage';

const Index = () => {
  const { isAuthenticated, setOnlineStatus, isDarkMode, users, fetchProducts, fetchUsers } = useStore();
  const [showSignUp, setShowSignUp] = useState(false);
  const [activeTab, setActiveTab] = useState('pos');

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setOnlineStatus(true);
    const handleOffline = () => setOnlineStatus(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setOnlineStatus]);

  // Apply dark mode on mount
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  React.useEffect(() => {
    fetchProducts();
    fetchUsers();
    if (users.length === 0) {
      setShowSignUp(true);
    }
  }, []);

  if (!isAuthenticated) {
    if (showSignUp) {
      return <SignUpScreen onSignUp={() => setShowSignUp(false)} />;
    }
    return <LoginScreen />;
  }

  const renderPage = () => {
    switch (activeTab) {
      case 'pos': return <POSPage />;
      case 'inventory': return <InventoryPage />;
      case 'reports': return <ReportsPage />;
      case 'settings': return <SettingsPage />;
      default: return <POSPage />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
        <DesktopHeader activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="animate-fade-in">
        {renderPage()}
      </main>
      
    </div>
  );
};

export default Index;
