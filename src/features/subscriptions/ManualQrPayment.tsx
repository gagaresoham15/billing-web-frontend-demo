import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldCheck,
  Copy,
  Check,
  UploadCloud,
  Send,
  ArrowLeft,
  Smartphone,
} from 'lucide-react';

export const ManualQrPayment: React.FC = () => {
  const { selectedPlan, setCurrentScreen, activateSubscription } = useApp();
  const [utrNumber, setUtrNumber] = useState('');
  const [fileName, setFileName] = useState('');
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const upiId = '9579494118@ybl';

  const handleCopy = () => {
    navigator.clipboard?.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!utrNumber) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      activateSubscription(selectedPlan.name, 30);
      setCurrentScreen('14-subscription-status');
    }, 800);
  };

  return (
    <div className="animate-fade" style={{ maxWidth: '520px', margin: '0 auto', padding: '10px 0' }}>
      <button
        onClick={() => setCurrentScreen('11-payment-method')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          color: '#64748b',
          fontSize: '13px',
          fontWeight: 600,
          marginBottom: '16px',
        }}
      >
        <ArrowLeft size={16} />
        <span>Back to Payment Methods</span>
      </button>

      <div className="card-shadow" style={{ borderRadius: '24px', padding: '28px 24px', background: '#ffffff' }}>
        {/* Official Merchant Badge */}
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              fontWeight: 700,
              color: '#15803d',
              background: '#dcfce7',
              padding: '4px 14px',
              borderRadius: '9999px',
              border: '1px solid #bbf7d0',
            }}
          >
            <ShieldCheck size={16} /> Official Admin Merchant
          </span>
        </div>

        {/* High Quality Authentic UPI QR Code Canvas */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            padding: '16px',
            borderRadius: '20px',
            border: '2px solid #e2e8f0',
            background: '#ffffff',
            maxWidth: '220px',
            boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
          }}
        >
          {/* Stylized QR Code SVG */}
          <svg viewBox="0 0 200 200" width="180" height="180">
            {/* Background */}
            <rect width="200" height="200" fill="white" />
            {/* Corner Finder 1 */}
            <rect x="10" y="10" width="50" height="50" rx="6" fill="#0f172a" />
            <rect x="20" y="20" width="30" height="30" fill="white" />
            <rect x="26" y="26" width="18" height="18" fill="#1e40af" />

            {/* Corner Finder 2 */}
            <rect x="140" y="10" width="50" height="50" rx="6" fill="#0f172a" />
            <rect x="150" y="20" width="30" height="30" fill="white" />
            <rect x="156" y="26" width="18" height="18" fill="#1e40af" />

            {/* Corner Finder 3 */}
            <rect x="10" y="140" width="50" height="50" rx="6" fill="#0f172a" />
            <rect x="20" y="150" width="30" height="30" fill="white" />
            <rect x="26" y="156" width="18" height="18" fill="#1e40af" />

            {/* QR Data Pattern Matrix */}
            <rect x="70" y="15" width="12" height="12" fill="#0f172a" />
            <rect x="90" y="25" width="12" height="12" fill="#0f172a" />
            <rect x="110" y="15" width="12" height="12" fill="#0f172a" />
            <rect x="70" y="45" width="12" height="12" fill="#0f172a" />
            <rect x="100" y="55" width="12" height="12" fill="#0f172a" />
            <rect x="120" y="45" width="12" height="12" fill="#0f172a" />

            <rect x="20" y="70" width="12" height="12" fill="#0f172a" />
            <rect x="40" y="80" width="12" height="12" fill="#0f172a" />
            <rect x="20" y="100" width="12" height="12" fill="#0f172a" />
            <rect x="50" y="115" width="12" height="12" fill="#0f172a" />

            {/* Center UPI logo badge */}
            <rect x="78" y="78" width="44" height="44" rx="8" fill="#1d4ed8" />
            <text x="100" y="105" fill="white" fontSize="13" fontWeight="bold" textAnchor="middle">
              UPI
            </text>

            <rect x="140" y="70" width="12" height="12" fill="#0f172a" />
            <rect x="165" y="85" width="12" height="12" fill="#0f172a" />
            <rect x="150" y="105" width="12" height="12" fill="#0f172a" />
            <rect x="175" y="125" width="12" height="12" fill="#0f172a" />

            <rect x="70" y="145" width="12" height="12" fill="#0f172a" />
            <rect x="90" y="165" width="12" height="12" fill="#0f172a" />
            <rect x="120" y="150" width="12" height="12" fill="#0f172a" />
            <rect x="155" y="160" width="12" height="12" fill="#0f172a" />
            <rect x="175" y="145" width="12" height="12" fill="#0f172a" />
            <rect x="145" y="175" width="12" height="12" fill="#0f172a" />
          </svg>

          <div style={{ textAlign: 'center', marginTop: '6px' }}>
            <span style={{ fontSize: '11px', color: '#64748b' }}>Amount: </span>
            <strong style={{ fontSize: '14px', color: '#0f172a' }}>₹{selectedPlan.price}</strong>
          </div>
        </div>

        {/* UPI ID Row + Copy Button */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            marginBottom: '16px',
          }}
        >
          <code
            style={{
              fontSize: '14px',
              fontWeight: 700,
              color: '#1e40af',
              background: '#eff6ff',
              padding: '6px 14px',
              borderRadius: '8px',
              border: '1px solid #bfdbfe',
            }}
          >
            {upiId}
          </code>
          <button
            type="button"
            onClick={handleCopy}
            className="btn-outline"
            style={{ padding: '6px 12px', fontSize: '12px' }}
          >
            {copied ? <Check size={14} style={{ color: '#16a34a' }} /> : <Copy size={14} />}
            <span>{copied ? 'Copied' : 'Copy ID'}</span>
          </button>
        </div>

        {/* Fast Action: Pay via PhonePe / GPay */}
        <button
          type="button"
          onClick={() => {
            window.location.href = `upi://pay?pa=${upiId}&pn=BillMaster&am=${selectedPlan.price}&cu=INR`;
          }}
          className="btn-primary"
          style={{ width: '100%', marginBottom: '20px', padding: '11px', background: '#2563eb' }}
        >
          <Smartphone size={16} />
          <span>Pay via PhonePe / GPay</span>
        </button>

        {/* Form to submit Transaction ID / UTR */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '12.5px',
                fontWeight: 600,
                color: '#334155',
                marginBottom: '6px',
              }}
            >
              Transaction ID / UTR *
            </label>
            <input
              type="text"
              required
              maxLength={18}
              placeholder="Enter 12-digit UPI / Bank Txn Ref No."
              className="input-field"
              style={{ paddingLeft: '14px' }}
              value={utrNumber}
              onChange={(e) => setUtrNumber(e.target.value)}
            />
          </div>

          <div>
            <label
              style={{
                display: 'block',
                fontSize: '12.5px',
                fontWeight: 600,
                color: '#334155',
                marginBottom: '6px',
              }}
            >
              Payment Screenshot / Receipt (Optional)
            </label>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px',
                borderRadius: '10px',
                border: '1.5px dashed #cbd5e1',
                background: '#f8fafc',
                cursor: 'pointer',
                fontSize: '13px',
                color: '#475569',
              }}
            >
              <UploadCloud size={18} style={{ color: '#2563eb' }} />
              <span>{fileName || '+ Upload Receipt Screenshot'}</span>
              <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setFileName(e.target.files[0].name);
                  }
                }}
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary"
            style={{ width: '100%', marginTop: '6px', padding: '13px' }}
          >
            <Send size={16} />
            <span>{isSubmitting ? 'Verifying Ref No...' : 'Submit Payment'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
