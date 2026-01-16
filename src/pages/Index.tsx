import React, { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { useIsMobile } from '@/hooks/use-mobile';
import { LoginScreen } from '@/components/auth/LoginScreen';
import { SignUpScreen } from '@/components/auth/SignUpScreen';
import { DesktopHeader } from '@/components/layout/DesktopHeader';
import { MobileNavBar } from '@/components/layout/MobileNavBar';
import { AdminDashboard } from '@/components/dashboard/AdminDashboard';
import { POSPage } from '@/components/pos/POSPage';
import { InventoryPage } from '@/components/inventory/InventoryPage';
import { ReportsPage } from '@/components/reports/ReportsPage';
import { SettingsPage } from '@/components/settings/SettingsPage';
import { DeveloperDashboard } from '@/components/developer/DeveloperDashboard';

const Index = () => {
  const { isAuthenticated, setOnlineStatus, isDarkMode, users, fetchProducts, fetchUsers, currentUser } = useStore();
  const [showSignUp, setShowSignUp] = useState(false);
  const [activeTab, setActiveTab] = useState('pos');
  const [initialRedirectDone, setInitialRedirectDone] = useState(false);

  // Role-based logic
  const isDeveloper = currentUser?.role === 'developer';

  // Role-based tab access
  const isCashier = currentUser?.role === 'cashier';
  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'owner';
  
  const allowedTabs = isCashier
    ? ['pos', 'inventory']
    : ['dashboard', 'pos', 'inventory', 'reports', 'settings'];

  // Admin redirect to dashboard
  useEffect(() => {
    if (isAuthenticated && isAdmin && !initialRedirectDone) {
      setActiveTab('dashboard');
      setInitialRedirectDone(true);
    }
  }, [isAuthenticated, isAdmin, initialRedirectDone]);

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
  }, [isDarkMode]);

  useEffect(() => {
    fetchProducts();
    fetchUsers();
    if (users.length === 0) {
      setShowSignUp(true);
    }
  }, []);

  // If cashier tries to access forbidden tab, force to POS
  useEffect(() => {
    if (isCashier && !allowedTabs.includes(activeTab)) {
      setActiveTab('pos');
    }
  }, [activeTab, isCashier]);

  // If Developer, Show Developer Dashboard directly (No POS)
  if (isAuthenticated && isDeveloper) {
    return <DeveloperDashboard />;
  }

  let content;
  if (!isAuthenticated) {
    if (showSignUp) {
      content = <SignUpScreen onSignUp={() => setShowSignUp(false)} />;
    } else {
      content = <LoginScreen />;
    }
  } else {
    const renderPage = () => {
      if (isCashier && !allowedTabs.includes(activeTab)) return <POSPage />;
      switch (activeTab) {
        case 'dashboard': return <AdminDashboard onNavigate={setActiveTab} />;
        case 'pos': return <POSPage />;
        case 'inventory': return <InventoryPage />;
        case 'reports': return isCashier ? <POSPage /> : <ReportsPage />;
        case 'settings': return isCashier ? <POSPage /> : <SettingsPage />;
        default: return <POSPage />;
      }
    };
    content = (
      <div className="min-h-screen bg-background">
        <DesktopHeader activeTab={activeTab} onTabChange={setActiveTab} allowedTabs={allowedTabs} />
        <main className="animate-fade-in">
          {renderPage()}
        </main>
      </div>
    );
  }
  return content;
};

export default Index;
