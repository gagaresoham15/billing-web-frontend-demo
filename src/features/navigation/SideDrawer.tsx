import React from 'react';
import { useApp } from '../../context/AppContext';
import { BillMasterLogo } from '../../components/common/BillMasterLogo';
import type { ScreenId } from '../../types';
import {
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
  X,
} from 'lucide-react';

interface SideDrawerProps {
  isOverlay?: boolean;
}

export const SideDrawer: React.FC<SideDrawerProps> = ({ isOverlay = false }) => {
  const { currentScreen, setCurrentScreen, isDrawerOpen, setIsDrawerOpen, user } = useApp();


  const navItems: { label: string; icon: any; screen: ScreenId; action?: () => void }[] = [
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


  const handleNavClick = (item: typeof navItems[0]) => {
    if (item.action) {
      item.action();
    } else if (item.screen) {
      setCurrentScreen(item.screen);
    }
    if (isOverlay) {
      setIsDrawerOpen(false);
    }
  };

  const content = (
    <div
      style={{
        width: '280px',
        maxWidth: '100%',
        height: '100%',
        background: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid #e2e8f0',
        boxShadow: isOverlay ? '0 20px 25px -5px rgba(0, 0, 0, 0.2)' : 'none',
      }}
    >
      {/* Drawer User Header (Exact from Screen 5) */}
      <div
        style={{
          padding: '24px 20px',
          background: 'linear-gradient(180deg, #eff6ff 0%, #ffffff 100%)',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* Avatar */}
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #2563eb, #0ea5e9)',
              padding: '2px',
              boxShadow: '0 4px 10px rgba(37, 99, 235, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
              alt="Darshan Jadhav"
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
              onError={(e) => {
                // Fallback avatar initial
                (e.currentTarget.parentNode as HTMLElement).innerHTML =
                  '<span style="color:#fff;font-weight:700;font-size:18px;">DJ</span>';
              }}
            />
          </div>

          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', marginBottom: '2px' }}>
              {user.name}
            </h3>
            <span
              style={{
                fontSize: '10px',
                fontWeight: 800,
                letterSpacing: '0.08em',
                color: '#1d4ed8',
                background: '#dbeafe',
                padding: '2px 8px',
                borderRadius: '4px',
                textTransform: 'uppercase',
              }}
            >
              {user.role}
            </span>
          </div>
        </div>

        {isOverlay && (
          <button
            onClick={() => setIsDrawerOpen(false)}
            style={{ color: '#64748b', padding: '6px' }}
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Nav links */}
      <div style={{ flex: 1, padding: '16px 12px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {navItems.map((item, idx) => {
          const Icon = item.icon;
          const isActive = item.screen && currentScreen === item.screen;
          return (
            <button
              key={idx}
              onClick={() => handleNavClick(item)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 14px',
                borderRadius: '10px',
                fontSize: '13.5px',
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
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Footer Branding & Logout */}
      <div
        style={{
          padding: '16px 20px',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#f8fafc',
        }}
      >
        <button
          onClick={() => setCurrentScreen('1-signin-password')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#ef4444',
            fontSize: '13px',
            fontWeight: 600,
          }}
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>

        <BillMasterLogo size="sm" showSubtitle={false} />
      </div>
    </div>
  );

  // If in overlay mode (mobile or clicking drawer)
  if (isOverlay) {
    if (!isDrawerOpen) return null;
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1100,
          display: 'flex',
        }}
      >
        {/* Backdrop */}
        <div
          onClick={() => setIsDrawerOpen(false)}
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.4)',
            backdropFilter: 'blur(3px)',
          }}
        />
        {/* Sliding drawer */}
        <div style={{ position: 'relative', zIndex: 10, height: '100%' }} className="animate-slide-left">
          {content}
        </div>
      </div>
    );
  }

  // Standalone screen view (Screen 5 in showcase)
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 16px',
      }}
    >
      <div
        style={{
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
          border: '1px solid #cbd5e1',
          height: '620px',
          display: 'flex',
        }}
      >
        {content}
      </div>
    </div>
  );
};
