import React from 'react';
import { useApp } from '../context/AppContext';
import type { Workspace, ScreenId } from '../types';
import { BillMasterLogo } from '../components/common/BillMasterLogo';
import { SideDrawer } from '../features/navigation/SideDrawer';
import {
  Menu,
  Bell,
  ChevronDown,
  LayoutDashboard,
  FilePlus,
  ReceiptText,
  Package,
  Tags,
  Users,
  Wallet,
  BarChart3,
  CreditCard,
  User,
  LogOut,
} from 'lucide-react';

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    currentScreen,
    setCurrentScreen,
    setIsDrawerOpen,
    activeWorkspace,
    workspaces,
    setActiveWorkspace,
    user,
  } = useApp();


  const [workspaceDropdownOpen, setWorkspaceDropdownOpen] = React.useState(false);
  const [notificationOpen, setNotificationOpen] = React.useState(false);

  const sidebarLinks: { label: string; icon: any; screen: ScreenId; action?: () => void }[] = [
    { label: 'Dashboard', icon: LayoutDashboard, screen: '4-dashboard' },
    { label: 'Create Bill', icon: FilePlus, screen: 'create-bill' },
    { label: 'View Bills', icon: ReceiptText, screen: '6-sales-invoices' },
    { label: 'Products', icon: Package, screen: '7-products' },
    { label: 'Categories', icon: Tags, screen: 'categories' },
    { label: 'Customers', icon: Users, screen: 'customers' },
    { label: 'Expenses', icon: Wallet, screen: 'expenses' },
    { label: 'Reports', icon: BarChart3, screen: '8-reports' },
    { label: 'Subscription', icon: CreditCard, screen: '10-choose-plan' },
    { label: 'Profile', icon: User, screen: '9-profile' },
  ];


  return (
    <div
      style={{
        height: '100vh',
        maxHeight: '100vh',
        width: '100vw',
        maxWidth: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Slide-out Mobile/Drawer Menu overlay */}
      <SideDrawer isOverlay={true} />

      {/* Topbar Navigation - Fixed, never moves on scroll */}
      <header
        style={{
          height: '64px',
          minHeight: '64px',
          background: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          flexShrink: 0,
          zIndex: 40,
          width: '100%',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Hamburger toggle button */}
          <button
            onClick={() => setIsDrawerOpen(true)}
            style={{
              padding: '8px',
              borderRadius: '8px',
              color: '#334155',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#f8fafc',
            }}
            title="Open Side Menu (Drawer)"
          >
            <Menu size={20} />
          </button>

          {/* Logo on smaller screens / when sidebar collapsed */}
          <div
            onClick={() => setCurrentScreen('4-dashboard')}
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          >
            <BillMasterLogo size="sm" showSubtitle={false} />
          </div>

          {/* Active Workspace Selector Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setWorkspaceDropdownOpen(!workspaceDropdownOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 12px',
                borderRadius: '8px',
                background: '#f1f5f9',
                border: '1px solid #e2e8f0',
                fontSize: '13px',
                fontWeight: 600,
                color: '#1e293b',
              }}
            >
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#10b981',
                }}
              />
              <span>{activeWorkspace.name}</span>
              <span
                style={{
                  fontSize: '10px',
                  background: '#dbeafe',
                  color: '#1d4ed8',
                  padding: '1px 6px',
                  borderRadius: '4px',
                  textTransform: 'uppercase',
                }}
              >
                {activeWorkspace.category}
              </span>
              <ChevronDown size={14} style={{ color: '#64748b' }} />
            </button>

            {workspaceDropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '110%',
                  left: 0,
                  width: '240px',
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                  padding: '8px',
                  zIndex: 50,
                }}
              >
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', padding: '6px 8px' }}>
                  SWITCH WORKSPACE
                </div>
                {workspaces.map((ws: Workspace) => (
                  <div
                    key={ws.id}
                    onClick={() => {
                      setActiveWorkspace(ws);
                      setWorkspaceDropdownOpen(false);
                    }}
                    style={{
                      padding: '8px 10px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      background: ws.id === activeWorkspace.id ? '#eff6ff' : 'transparent',
                      color: ws.id === activeWorkspace.id ? '#1d4ed8' : '#334155',
                      fontSize: '13px',
                      fontWeight: ws.id === activeWorkspace.id ? 600 : 500,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span>{ws.name}</span>
                    {ws.id === activeWorkspace.id && <span style={{ color: '#2563eb' }}>✓</span>}
                  </div>
                ))}
                <div
                  onClick={() => {
                    setWorkspaceDropdownOpen(false);
                    setCurrentScreen('3-select-business');
                  }}
                  style={{
                    padding: '8px 10px',
                    marginTop: '4px',
                    borderTop: '1px solid #f1f5f9',
                    color: '#2563eb',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  + Add or Switch Business
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Topbar actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Notification Bell */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setNotificationOpen(!notificationOpen)}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#475569',
                position: 'relative',
              }}
            >
              <Bell size={18} />
              <span
                style={{
                  position: 'absolute',
                  top: '7px',
                  right: '7px',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#ef4444',
                  border: '2px solid #ffffff',
                }}
              />
            </button>

            {notificationOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '110%',
                  right: 0,
                  width: '280px',
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                  padding: '12px',
                  zIndex: 50,
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                  Notifications
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>
                  🎉 Welcome to BillMaster! Your store setup is complete.
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', padding: '6px 0' }}>
                  📦 Low stock warning: Krackjack (95 left).
                </div>
              </div>
            )}
          </div>

          {/* User profile dropdown pill */}
          <div
            onClick={() => setCurrentScreen('9-profile')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '4px 10px 4px 6px',
              borderRadius: '9999px',
              border: '1px solid #e2e8f0',
              background: '#f8fafc',
              cursor: 'pointer',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #2563eb, #0ea5e9)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 700,
                fontSize: '13px',
                overflow: 'hidden',
              }}
            >
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                alt="Darshan Jadhav"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  (e.currentTarget.parentNode as HTMLElement).innerHTML = '<span>DJ</span>';
                }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', lineHeight: 1.2 }}>
              <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#0f172a' }}>{user.name}</span>
              <span style={{ fontSize: '10.5px', color: '#64748b' }}>Owner</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Body with Sidebar + Content */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          height: 'calc(100vh - 64px)',
          overflow: 'hidden',
          width: '100%',
          maxWidth: '100%',
        }}
      >
        {/* Desktop Sidebar - Fixed height docked, never scrolls away */}
        <aside
          className="dashboard-sidebar"
          style={{
            width: '240px',
            height: '100%',
            background: '#ffffff',
            borderRight: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            flexShrink: 0,
            overflowY: 'auto',
          }}
        >
          <div style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
            {sidebarLinks.map((link, idx) => {
              const Icon = link.icon;
              const isActive = link.screen && currentScreen === link.screen;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    if (link.action) link.action();
                    else if (link.screen) setCurrentScreen(link.screen);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    fontSize: '13px',
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? '#1d4ed8' : '#475569',
                    background: isActive ? '#eff6ff' : 'transparent',
                    textAlign: 'left',
                    width: '100%',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = '#f8fafc';
                      e.currentTarget.style.color = '#0f172a';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = '#475569';
                    }
                  }}
                >
                  <Icon size={18} style={{ color: isActive ? '#1d4ed8' : '#64748b' }} />
                  <span>{link.label}</span>
                </button>
              );
            })}
          </div>

          {/* Sidebar Logout */}
          <div style={{ padding: '14px 16px', borderTop: '1px solid #f1f5f9' }}>
            <button
              onClick={() => setCurrentScreen('1-signin-password')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#ef4444',
                fontSize: '13px',
                fontWeight: 600,
                width: '100%',
              }}
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Content Area - Isolated vertical scroll only, no horizontal scroll */}
        <main
          className="dashboard-main-content"
          style={{
            flex: 1,
            height: '100%',
            padding: '24px 28px',
            overflowY: 'auto',
            overflowX: 'hidden',
            background: '#f8fafc',
            minWidth: 0,
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
};
