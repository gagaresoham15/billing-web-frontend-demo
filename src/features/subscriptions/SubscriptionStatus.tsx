import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import {
  getCurrentSubscription,
  getSubscriptionHistory,
  type ApiCurrentSubscriptionData,
  type ApiSubscriptionHistoryItem,
} from '../../api/subscriptions';
import {
  Clock,
  Calendar,
  RefreshCw,
  Receipt,
  Sparkles,
  X,
  FileCheck,
  Store,
  ShieldCheck,
} from 'lucide-react';

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function formatDateTime(dateStr?: string | null): string {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return dateStr;
  }
}

export const SubscriptionStatus: React.FC = () => {
  const { subscription, setSubscriptionData, setCurrentScreen, activeWorkspace } = useApp();
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [liveSub, setLiveSub] = useState<ApiCurrentSubscriptionData | null>(null);

  const [historyList, setHistoryList] = useState<ApiSubscriptionHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const loadCurrentSub = useCallback(async () => {
    if (!activeWorkspace?.id) return;
    setLoading(true);
    try {
      const res = await getCurrentSubscription(activeWorkspace.id);
      if (res.success && res.data) {
        setLiveSub(res.data);
        setSubscriptionData({
          planName: res.data.plan.name,
          status: res.data.status === 'ACTIVE' ? 'Active' : 'Expired',
          startDate: formatDate(res.data.start_at),
          expireDate: formatDate(res.data.expires_at),
          remainingDays: res.data.remaining_days,
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [activeWorkspace?.id, setSubscriptionData]);

  const loadHistory = useCallback(async () => {
    if (!activeWorkspace?.id) return;
    setLoadingHistory(true);
    try {
      const res = await getSubscriptionHistory(activeWorkspace.id);
      if (res.success && res.data?.data) {
        setHistoryList(res.data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingHistory(false);
    }
  }, [activeWorkspace?.id]);

  useEffect(() => {
    loadCurrentSub();
  }, [loadCurrentSub]);

  const handleOpenHistory = () => {
    setShowHistoryModal(true);
    loadHistory();
  };

  const planName = liveSub ? liveSub.plan.name : subscription.planName;
  const status = liveSub ? liveSub.status : subscription.status;
  const startDate = liveSub ? formatDate(liveSub.start_at) : subscription.startDate;
  const expireDate = liveSub ? formatDate(liveSub.expires_at) : subscription.expireDate;
  const remainingDays = liveSub ? liveSub.remaining_days : subscription.remainingDays;

  return (
    <div className="animate-fade" style={{ maxWidth: '620px', margin: '0 auto', padding: '10px 0 40px 0' }}>
      
      {/* Store Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#ffffff',
          padding: '12px 18px',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          marginBottom: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Store size={18} style={{ color: '#2563eb' }} />
          <div>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
              {activeWorkspace?.name || 'Active Store'}
            </span>
            <span style={{ fontSize: '11px', color: '#64748b', marginLeft: '6px' }}>
              ({activeWorkspace?.category})
            </span>
          </div>
        </div>

        <button
          onClick={loadCurrentSub}
          disabled={loading}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'none',
            border: 'none',
            color: '#2563eb',
            fontSize: '12.5px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          <span>{loading ? 'Checking...' : 'Refresh Status'}</span>
        </button>
      </div>

      <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', marginBottom: '20px' }}>
        Subscription Status
      </h2>

      {/* Main "Your Current Plan" Card (Exact from Screen 14) */}
      <div
        className="card-shadow"
        style={{
          borderRadius: '24px',
          padding: '32px 28px',
          background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
          border: '1.5px solid #e2e8f0',
          boxShadow: '0 10px 30px -10px rgba(0,0,0,0.08)',
        }}
      >
        <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Your Current Plan
        </span>

        {/* Plan Title & Active Badge */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: '#eff6ff',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sparkles size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>
                {planName}
              </h3>
              <span style={{ fontSize: '12.5px', color: '#64748b' }}>Status: </span>
              <strong style={{ fontSize: '12.5px', color: '#16a34a' }}>{status}</strong>
            </div>
          </div>

          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: '#dcfce7',
              color: '#15803d',
              fontWeight: 700,
              fontSize: '12px',
              padding: '5px 14px',
              borderRadius: '9999px',
              border: '1px solid #bbf7d0',
            }}
          >
            ● Active
          </span>
        </div>

        {/* Dates Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
            padding: '16px 20px',
            borderRadius: '16px',
            background: '#f1f5f9',
            marginBottom: '20px',
          }}
        >
          <div>
            <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={14} /> Started Date
            </div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>
              {startDate}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={14} /> Expires Date
            </div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>
              {expireDate}
            </div>
          </div>
        </div>

        {/* Countdown Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '12px',
            borderRadius: '12px',
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            color: '#1d4ed8',
            fontWeight: 700,
            fontSize: '14px',
            marginBottom: '24px',
          }}
        >
          <Clock size={18} />
          <span>{remainingDays} Days Remaining</span>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Renew Subscription */}
          <button
            onClick={() => setCurrentScreen('10-choose-plan')}
            className="btn-primary"
            style={{ width: '100%', padding: '13px' }}
          >
            <RefreshCw size={16} />
            <span>Renew Subscription / Change Plan</span>
          </button>

          {/* Payment History & Receipts */}
          <button
            onClick={handleOpenHistory}
            className="btn-outline"
            style={{ width: '100%', padding: '12px' }}
          >
            <Receipt size={16} />
            <span>Payment History &amp; Receipts</span>
          </button>
        </div>
      </div>

      {/* Payment History Modal */}
      {showHistoryModal && (
        <div className="modal-overlay">
          <div
            className="modal-content animate-fade"
            style={{ padding: '24px', maxWidth: '520px', width: '95%', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0f172a', margin: 0 }}>Payment History</h3>
                <span style={{ fontSize: '11.5px', color: '#64748b' }}>Store: {activeWorkspace?.name}</span>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                style={{ color: '#64748b', background: '#f1f5f9', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '4px' }}>
              {loadingHistory ? (
                <div style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
                  <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 8px auto', color: '#2563eb' }} />
                  <div>Loading payment history...</div>
                </div>
              ) : historyList.length === 0 ? (
                <div style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
                  <ShieldCheck size={32} style={{ margin: '0 auto 8px auto', color: '#94a3b8' }} />
                  <p>No transactions found for this store.</p>
                </div>
              ) : (
                historyList.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      padding: '14px',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      background: '#f8fafc',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <FileCheck size={20} style={{ color: '#16a34a' }} />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '13.5px', color: '#0f172a' }}>
                          {item.plan?.name || 'Subscription Plan'} ({item.action})
                        </div>
                        <div style={{ fontSize: '11.5px', color: '#64748b' }}>
                          Ref: {item.payment_id?.slice(0, 16)}... • {formatDateTime(item.createdAt)}
                        </div>
                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                          {formatDate(item.new_start_at)} to {formatDate(item.new_expires_at)}
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span className="badge-cash" style={{ fontSize: '10px' }}>
                        Paid
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => setShowHistoryModal(false)}
              className="btn-secondary"
              style={{ width: '100%', marginTop: '16px' }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
