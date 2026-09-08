import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { ScreenId } from '../../types';
import { Layers, ChevronDown, ChevronUp } from 'lucide-react';

const SCREENS: { id: ScreenId; num: number; label: string }[] = [
  { id: '1-signin-password', num: 1, label: 'Sign In' },
  { id: '2-signin-otp', num: 2, label: 'Sign In OTP' },
  { id: 'signup', num: 3, label: 'Sign Up' },
  { id: '3-select-business', num: 4, label: 'Workspaces' },
  { id: '4-dashboard', num: 5, label: 'Dashboard' },
  { id: 'create-bill', num: 6, label: 'Create Bill' },
  { id: '6-sales-invoices', num: 7, label: 'View Bills' },
  { id: '7-products', num: 8, label: 'Products & Stock' },
  { id: 'categories', num: 9, label: 'Categories' },
  { id: 'customers', num: 10, label: 'Customers' },
  { id: 'expenses', num: 11, label: 'Expenses' },
  { id: '8-reports', num: 12, label: 'Reports' },
  { id: '5-side-drawer', num: 13, label: 'Side Drawer' },
  { id: '9-profile', num: 14, label: 'Account Profile' },
  { id: '10-choose-plan', num: 15, label: 'Choose Plan' },
  { id: '11-payment-method', num: 16, label: 'Payment Method' },
  { id: '12-razorpay-popup', num: 17, label: 'Razorpay Modal' },
  { id: '13-manual-qr', num: 18, label: 'Manual QR' },
  { id: '14-subscription-status', num: 19, label: 'Subscription' },
];


export const ScreenSwitcher: React.FC = () => {
  const { currentScreen, setCurrentScreen } = useApp();
  const [isExpanded, setIsExpanded] = useState(true);

  const activeScreenObj = SCREENS.find((s) => s.id === currentScreen) || SCREENS[3];

  return (
    <div className="screen-switcher-bar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '24px',
            height: '24px',
            borderRadius: '6px',
            background: '#2563eb',
            color: '#fff',
            fontSize: '12px',
            fontWeight: 'bold',
          }}
        >
          {activeScreenObj.num}
        </span>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontWeight: 700, color: '#f8fafc', fontSize: '12px' }}>
            {activeScreenObj.num}. {activeScreenObj.label}
          </span>
          <span style={{ fontSize: '10px', color: '#94a3b8' }}>All 14 Screens Navigator</span>
        </div>
      </div>

      {isExpanded && (
        <div className="screen-switcher-pills">
          {SCREENS.map((screen) => {
            const isActive = currentScreen === screen.id;
            return (
              <button
                key={screen.id}
                onClick={() => setCurrentScreen(screen.id)}
                className={`screen-switcher-pill ${isActive ? 'active' : ''}`}
                title={`Screen ${screen.num}: ${screen.label}`}
              >
                <span style={{ opacity: 0.7, marginRight: '4px' }}>#{screen.num}</span>
                {screen.label}
              </button>
            );
          })}
        </div>
      )}

      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          color: '#94a3b8',
          padding: '4px 8px',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          fontSize: '11px',
          flexShrink: 0,
        }}
        title={isExpanded ? 'Collapse Switcher' : 'Expand All Screens'}
      >
        <Layers size={14} />
        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>
    </div>
  );
};
