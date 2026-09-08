import React from 'react';
import { useApp } from '../../context/AppContext';
import { Zap, QrCode, ArrowRight, ShieldCheck } from 'lucide-react';

export const PaymentMethod: React.FC = () => {
  const { selectedPlan, paymentMethod, setPaymentMethod, setCurrentScreen } = useApp();

  const handleContinue = () => {
    if (paymentMethod === 'online') {
      setCurrentScreen('12-razorpay-popup');
    } else {
      setCurrentScreen('13-manual-qr');
    }
  };

  return (
    <div className="animate-fade" style={{ maxWidth: '540px', margin: '0 auto', padding: '10px 0' }}>
      <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', marginBottom: '20px' }}>
        Payment Method
      </h2>

      {/* Order Summary Card */}
      <div
        className="card-shadow"
        style={{
          padding: '20px 24px',
          borderRadius: '16px',
          marginBottom: '20px',
          background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)',
          border: '1.5px solid #dbeafe',
        }}
      >
        <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Order Summary
        </span>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
          <div>
            <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0f172a' }}>{selectedPlan.name}</h3>
            <span style={{ fontSize: '12.5px', color: '#64748b' }}>{selectedPlan.tagline}</span>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#1d4ed8' }}>
            ₹ {selectedPlan.price}
          </div>
        </div>
      </div>

      {/* Select Payment Method Container */}
      <div className="card-shadow" style={{ padding: '24px', borderRadius: '18px', marginBottom: '24px' }}>
        <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginBottom: '16px' }}>
          Select Payment Method
        </h4>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Option 1: Online Payment */}
          <label
            onClick={() => setPaymentMethod('online')}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '14px',
              padding: '16px',
              borderRadius: '14px',
              border: `2px solid ${paymentMethod === 'online' ? '#2563eb' : '#e2e8f0'}`,
              background: paymentMethod === 'online' ? '#eff6ff' : '#ffffff',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <input
              type="radio"
              name="paymentMode"
              checked={paymentMethod === 'online'}
              onChange={() => setPaymentMethod('online')}
              style={{ width: '18px', height: '18px', marginTop: '2px', accentColor: '#2563eb' }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                <Zap size={16} style={{ color: '#2563eb' }} />
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                  Online Payment (Razorpay / Instant)
                </span>
              </div>
              <p style={{ fontSize: '12px', color: '#64748b' }}>
                Instant activation via GPay, PhonePe, Cards, Netbanking
              </p>
            </div>
          </label>

          {/* Option 2: Manual Payment */}
          <label
            onClick={() => setPaymentMethod('manual')}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '14px',
              padding: '16px',
              borderRadius: '14px',
              border: `2px solid ${paymentMethod === 'manual' ? '#2563eb' : '#e2e8f0'}`,
              background: paymentMethod === 'manual' ? '#eff6ff' : '#ffffff',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <input
              type="radio"
              name="paymentMode"
              checked={paymentMethod === 'manual'}
              onChange={() => setPaymentMethod('manual')}
              style={{ width: '18px', height: '18px', marginTop: '2px', accentColor: '#2563eb' }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                <QrCode size={16} style={{ color: '#d97706' }} />
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                  Manual Payment (UPI QR &amp; Bank)
                </span>
              </div>
              <p style={{ fontSize: '12px', color: '#64748b' }}>
                Scan Merchant QR Code / Bank Transfer &amp; upload UTR
              </p>
            </div>
          </label>
        </div>

        {/* Amount Payable */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '20px',
            marginTop: '20px',
            borderTop: '1px solid #e2e8f0',
          }}
        >
          <span style={{ fontSize: '14px', fontWeight: 600, color: '#334155' }}>Amount Payable</span>
          <span style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>
            ₹ {selectedPlan.price}
          </span>
        </div>

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          className="btn-primary"
          style={{ width: '100%', marginTop: '20px', padding: '13px' }}
        >
          <span>Continue to Pay</span>
          <ArrowRight size={18} />
        </button>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            marginTop: '16px',
            fontSize: '11.5px',
            color: '#64748b',
          }}
        >
          <ShieldCheck size={15} style={{ color: '#10b981' }} />
          <span>256-bit encrypted secure checkout</span>
        </div>
      </div>
    </div>
  );
};
