import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Lock, ShieldCheck, CreditCard, ChevronRight } from 'lucide-react';

export const RazorpayModal: React.FC = () => {
  const { selectedPlan, setCurrentScreen, activateSubscription } = useApp();
  const [selectedMethod, setSelectedMethod] = useState<'gpay' | 'card' | 'upi'>('gpay');
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePay = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      activateSubscription(selectedPlan.name, 30);
      setCurrentScreen('14-subscription-status');
    }, 1200);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        className="card-shadow animate-fade"
        style={{
          width: '100%',
          maxWidth: '420px',
          borderRadius: '24px',
          background: '#ffffff',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
        }}
      >
        {/* Modal Header (Exact from Screen 12) */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#ffffff',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
              Pay ₹{selectedPlan.price}
            </span>
            <span style={{ fontSize: '11px', color: '#64748b' }}>({selectedPlan.name})</span>
          </div>

          <button
            onClick={() => setCurrentScreen('11-payment-method')}
            style={{
              padding: '6px',
              borderRadius: '8px',
              color: '#64748b',
              background: '#f1f5f9',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '24px' }}>
          {/* Google Pay Box */}
          <div
            onClick={() => setSelectedMethod('gpay')}
            style={{
              padding: '16px 18px',
              borderRadius: '14px',
              border: `2px solid ${selectedMethod === 'gpay' ? '#2563eb' : '#e2e8f0'}`,
              background: selectedMethod === 'gpay' ? '#eff6ff' : '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              marginBottom: '14px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {/* Google G logo circle */}
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '18px',
                  color: '#4285F4',
                }}
              >
                G
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>Google Pay</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Fast UPI Checkout</div>
              </div>
            </div>

            <a
              href="#more"
              onClick={(e) => {
                e.preventDefault();
                setSelectedMethod('card');
              }}
              style={{
                fontSize: '12px',
                color: '#2563eb',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              More Options
            </a>
          </div>

          {/* Cards & Netbanking Option */}
          <div
            onClick={() => setSelectedMethod('card')}
            style={{
              padding: '14px 18px',
              borderRadius: '14px',
              border: `2px solid ${selectedMethod === 'card' ? '#2563eb' : '#e2e8f0'}`,
              background: selectedMethod === 'card' ? '#eff6ff' : '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              marginBottom: '24px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: '#f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#475569',
                }}
              >
                <CreditCard size={18} />
              </div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                Cards, Netbanking &amp; Wallets
              </div>
            </div>
            <ChevronRight size={16} style={{ color: '#94a3b8' }} />
          </div>

          {/* Large Dark "Pay" Button (Exact from Screen 12) */}
          <button
            onClick={handlePay}
            disabled={isProcessing}
            style={{
              width: '100%',
              background: '#0f172a',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '15px',
              padding: '14px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              boxShadow: '0 4px 14px rgba(15, 23, 42, 0.3)',
            }}
          >
            <Lock size={16} />
            <span>{isProcessing ? 'Processing...' : 'Pay'}</span>
          </button>
        </div>

        {/* Footer: Secured by Razorpay */}
        <div
          style={{
            padding: '14px 20px',
            background: '#f8fafc',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            fontSize: '12px',
            color: '#64748b',
          }}
        >
          <ShieldCheck size={16} style={{ color: '#0284c7' }} />
          <span>
            Secured by <strong style={{ color: '#0284c7' }}>Razorpay</strong>
          </span>
        </div>
      </div>
    </div>
  );
};
