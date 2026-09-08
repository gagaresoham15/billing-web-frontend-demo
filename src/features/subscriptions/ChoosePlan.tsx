import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import type { SubscriptionPlan } from '../../types';
import {
  getCurrentSubscription,
  getSubscriptionPlans,
  getSubscriptionHistory,
  type ApiCurrentSubscriptionData,
  type ApiSubscriptionPlan,
  type ApiSubscriptionHistoryItem,
} from '../../api/subscriptions';
import {
  Check,
  Sparkles,
  RefreshCw,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  History,
  Store,
  ChevronRight,
  X,
  FileCheck,
  ShieldCheck,
  ArrowRight,
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

export const ChoosePlan: React.FC = () => {
  const {
    activeWorkspace,
    workspaces,
    setActiveWorkspace,
    setSelectedPlan,
    setCurrentScreen,
    setSubscriptionData,
  } = useApp();

  // API states
  const [currentSub, setCurrentSub] = useState<ApiCurrentSubscriptionData | null>(null);
  const [loadingSub, setLoadingSub] = useState(true);
  const [subMessage, setSubMessage] = useState<string | null>(null);

  const [apiPlans, setApiPlans] = useState<ApiSubscriptionPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);

  // History modal states
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyList, setHistoryList] = useState<ApiSubscriptionHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Load current subscription
  const fetchCurrentSub = useCallback(async () => {
    if (!activeWorkspace?.id) return;
    setLoadingSub(true);
    try {
      const res = await getCurrentSubscription(activeWorkspace.id);
      if (res.success && res.data) {
        setCurrentSub(res.data);
        setSubMessage(null);
        // Sync with global AppContext subscription
        setSubscriptionData({
          planName: res.data.plan.name,
          status: res.data.status === 'ACTIVE' ? 'Active' : 'Expired',
          startDate: formatDate(res.data.start_at),
          expireDate: formatDate(res.data.expires_at),
          remainingDays: res.data.remaining_days,
        });
      } else {
        setCurrentSub(null);
        setSubMessage(res.message || 'No active subscription found');
      }
    } catch (err) {
      console.error(err);
      setCurrentSub(null);
      setSubMessage('Failed to load current subscription');
    } finally {
      setLoadingSub(false);
    }
  }, [activeWorkspace?.id, setSubscriptionData]);

  // Load available plans
  const fetchPlans = useCallback(async () => {
    setLoadingPlans(true);
    try {
      const res = await getSubscriptionPlans();
      if (res.success && res.data && res.data.length > 0) {
        setApiPlans(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPlans(false);
    }
  }, []);

  // Load history
  const fetchHistory = useCallback(async () => {
    if (!activeWorkspace?.id) return;
    setLoadingHistory(true);
    try {
      const res = await getSubscriptionHistory(activeWorkspace.id);
      if (res.success && res.data?.data) {
        setHistoryList(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHistory(false);
    }
  }, [activeWorkspace?.id]);

  useEffect(() => {
    fetchCurrentSub();
    fetchPlans();
  }, [fetchCurrentSub, fetchPlans]);

  const handleOpenHistory = () => {
    setShowHistoryModal(true);
    fetchHistory();
  };

  const handleSelectPlan = (plan: ApiSubscriptionPlan) => {
    const formattedPlan: SubscriptionPlan = {
      id: plan.id,
      name: plan.name,
      price: parseFloat(plan.price) || 0,
      period: plan.duration_days ? `/${plan.duration_days} days` : '/month',
      tagline: plan.description || plan.name,
    };
    setSelectedPlan(formattedPlan);
    setCurrentScreen('11-payment-method');
  };

  // Fallback plans if API plans are not yet loaded
  const displayPlans = apiPlans.length > 0 ? apiPlans : [
    {
      id: 'fa2ef094-7e76-4bb6-a0c2-56cca5d9d6a7',
      name: '3 days plan',
      code: 'Days_PLAN',
      description: 'three days plan',
      duration_days: 3,
      price: '2.00',
      currency: 'INR',
    },
    {
      id: 'c43ad749-6d26-4fae-bef9-3271aaeecde5',
      name: 'monthly plan',
      code: 'MONTHLY_PLAN',
      description: 'this is one month plan',
      duration_days: 30,
      price: '99.00',
      currency: 'INR',
    },
    {
      id: '261ddde7-902f-453d-8a06-ea99f2e69b2e',
      name: 'Six month Plan',
      code: 'Six month Plan',
      description: 'six month',
      duration_days: 30,
      price: '499.00',
      currency: 'INR',
    },
  ];

  return (
    <div className="animate-fade" style={{ maxWidth: '1020px', margin: '0 auto', padding: '10px 0 40px 0' }}>
      
      {/* Top Header & Store Context Selector */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          marginBottom: '24px',
          background: '#ffffff',
          padding: '16px 20px',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: '#eff6ff',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Store size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                {activeWorkspace?.name || 'Active Store'}
              </h3>
              <span
                style={{
                  fontSize: '11px',
                  background: '#dcfce7',
                  color: '#15803d',
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  fontWeight: 600,
                }}
              >
                {activeWorkspace?.category || 'Retail'}
              </span>
            </div>
            <p style={{ fontSize: '11.5px', color: '#64748b', margin: '2px 0 0 0', fontFamily: 'monospace' }}>
              Store ID: {activeWorkspace?.id}
            </p>
          </div>
        </div>

        {/* Store switch dropdown & Live Refresh */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {workspaces.length > 1 && (
            <select
              value={activeWorkspace?.id}
              onChange={(e) => {
                const target = workspaces.find((w) => w.id === e.target.value);
                if (target) setActiveWorkspace(target);
              }}
              style={{
                padding: '7px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: '#f8fafc',
                fontSize: '12.5px',
                color: '#334155',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {workspaces.map((ws) => (
                <option key={ws.id} value={ws.id}>
                  {ws.name} ({ws.category})
                </option>
              ))}
            </select>
          )}

          <button
            onClick={() => {
              fetchCurrentSub();
              fetchPlans();
            }}
            disabled={loadingSub || loadingPlans}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              borderRadius: '8px',
              background: '#f1f5f9',
              border: '1px solid #e2e8f0',
              color: '#334155',
              fontSize: '12.5px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.15s',
            }}
            title="Refresh Live Subscription Status"
          >
            <RefreshCw size={14} className={loadingSub ? 'animate-spin' : ''} />
            <span>{loadingSub ? 'Syncing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* CURRENT ACTIVE SUBSCRIPTION BANNER (Live API: /api/subscriptions/current/:business_id) */}
      <div style={{ marginBottom: '32px' }}>
        {loadingSub ? (
          <div
            style={{
              padding: '24px',
              borderRadius: '20px',
              background: '#ffffff',
              border: '1.5px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            <RefreshCw size={24} className="animate-spin" style={{ color: '#2563eb' }} />
            <div>
              <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '14px' }}>
                Fetching current subscription status from server...
              </div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>
                Endpoint: /api/subscriptions/current/{activeWorkspace?.id}
              </div>
            </div>
          </div>
        ) : currentSub ? (
          <div
            className="card-shadow"
            style={{
              borderRadius: '22px',
              padding: '26px 28px',
              background: 'linear-gradient(135deg, #f0fdf4 0%, #eff6ff 100%)',
              border: '1.5px solid #bbf7d0',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Top Badge Row */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '10px',
                marginBottom: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    background: '#16a34a',
                    color: '#ffffff',
                    fontSize: '11px',
                    fontWeight: 800,
                    padding: '4px 12px',
                    borderRadius: '9999px',
                    letterSpacing: '0.04em',
                    boxShadow: '0 2px 8px rgba(22, 163, 74, 0.25)',
                  }}
                >
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: '#ffffff',
                      animation: 'pulse 1.5s infinite',
                    }}
                  />
                  CURRENT ACTIVE PLAN
                </span>

                <span
                  style={{
                    fontSize: '11.5px',
                    color: '#15803d',
                    fontWeight: 700,
                    background: '#dcfce7',
                    padding: '3px 10px',
                    borderRadius: '6px',
                    border: '1px solid #86efac',
                  }}
                >
                  ● {currentSub.status}
                </span>
              </div>

              {/* Action links */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  onClick={handleOpenHistory}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    color: '#2563eb',
                    background: '#ffffff',
                    border: '1px solid #bfdbfe',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                >
                  <History size={14} />
                  <span>Payment History</span>
                </button>

                <button
                  onClick={() => setCurrentScreen('14-subscription-status')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    color: '#0f172a',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                >
                  <span>Detailed View</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>

            {/* Plan Info & Metrics Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '16px',
                alignItems: 'center',
              }}
            >
              {/* Left: Plan Summary */}
              <div>
                <h3
                  style={{
                    fontSize: '24px',
                    fontWeight: 800,
                    color: '#0f172a',
                    letterSpacing: '-0.02em',
                    marginBottom: '4px',
                    textTransform: 'uppercase',
                  }}
                >
                  {currentSub.plan.name}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '20px', fontWeight: 800, color: '#16a34a' }}>
                    ₹{parseFloat(currentSub.plan.price).toFixed(0)}
                  </span>
                  <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>
                    / {currentSub.plan.duration_days} days
                  </span>
                </div>
                <p style={{ fontSize: '12.5px', color: '#64748b', margin: 0 }}>
                  {currentSub.plan.description || 'Active business billing subscription'}
                </p>
              </div>

              {/* Middle: Days Remaining */}
              <div
                style={{
                  background: '#ffffff',
                  padding: '14px 18px',
                  borderRadius: '14px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#2563eb', fontSize: '12px', fontWeight: 700 }}>
                  <Clock size={16} />
                  <span>REMAINING TIME</span>
                </div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
                  {currentSub.remaining_days} <span style={{ fontSize: '14px', fontWeight: 600, color: '#64748b' }}>Days Left</span>
                </div>
                <div style={{ fontSize: '11.5px', color: '#16a34a', fontWeight: 600, marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 size={12} /> Renewal Available
                </div>
              </div>

              {/* Right: Dates */}
              <div
                style={{
                  background: '#ffffff',
                  padding: '14px 18px',
                  borderRadius: '14px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '12px', fontWeight: 700 }}>
                  <Calendar size={16} />
                  <span>VALIDITY DATES</span>
                </div>
                <div style={{ fontSize: '13px', color: '#334155', fontWeight: 600, marginTop: '6px' }}>
                  Started: <strong style={{ color: '#0f172a' }}>{formatDate(currentSub.start_at)}</strong>
                </div>
                <div style={{ fontSize: '13px', color: '#334155', fontWeight: 600, marginTop: '3px' }}>
                  Expires: <strong style={{ color: '#dc2626' }}>{formatDate(currentSub.expires_at)}</strong>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* No active subscription alert */
          <div
            style={{
              padding: '20px 24px',
              borderRadius: '16px',
              background: '#fffbeb',
              border: '1.5px solid #fde68a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '14px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <AlertCircle size={22} style={{ color: '#d97706', flexShrink: 0 }} />
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#92400e', margin: 0 }}>
                  No Active Subscription Found
                </h4>
                <p style={{ fontSize: '12.5px', color: '#b45309', margin: '3px 0 0 0' }}>
                  {subMessage || `Store "${activeWorkspace?.name}" currently has no active subscription. Choose a plan below to activate.`}
                </p>
              </div>
            </div>

            <button
              onClick={handleOpenHistory}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '8px',
                background: '#ffffff',
                border: '1px solid #fcd34d',
                color: '#92400e',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <History size={14} />
              <span>Past Invoices</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Heading for Plans Selection */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
          Choose Your Plan
        </h2>
        <p style={{ fontSize: '13.5px', color: '#64748b', marginTop: '6px' }}>
          Affordable and transparent plans tailored for retail shops &amp; grocery stores
        </p>
      </div>

      {/* Plans Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '24px',
          alignItems: 'stretch',
        }}
      >
        {displayPlans.map((plan) => {
          const isCurrentActive =
            currentSub?.plan?.id === plan.id ||
            currentSub?.plan?.name?.toLowerCase() === plan.name?.toLowerCase();
          const isTrial = plan.duration_days === 3 || plan.name.toLowerCase().includes('3 day');
          const priceNum = parseFloat(plan.price) || 0;

          return (
            <div
              key={plan.id}
              className="card-shadow card-hover"
              style={{
                borderRadius: '20px',
                padding: '28px 24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                background: '#ffffff',
                border: isCurrentActive
                  ? '2.5px solid #16a34a'
                  : isTrial
                  ? '2px solid #3b82f6'
                  : '1.5px solid #e2e8f0',
                position: 'relative',
                boxShadow: isCurrentActive
                  ? '0 10px 25px -5px rgba(22, 163, 74, 0.15)'
                  : undefined,
              }}
            >
              {/* Badge */}
              {isCurrentActive ? (
                <div
                  style={{
                    position: 'absolute',
                    top: '-12px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#16a34a',
                    color: '#ffffff',
                    fontSize: '11px',
                    fontWeight: 800,
                    padding: '3px 14px',
                    borderRadius: '9999px',
                    boxShadow: '0 4px 10px rgba(22, 163, 74, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <CheckCircle2 size={12} /> ACTIVE PLAN
                </div>
              ) : isTrial ? (
                <div
                  style={{
                    position: 'absolute',
                    top: '-12px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#2563eb',
                    color: '#ffffff',
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '3px 12px',
                    borderRadius: '9999px',
                    boxShadow: '0 4px 10px rgba(37, 99, 235, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <Sparkles size={12} /> POPULAR TRIAL
                </div>
              ) : null}

              <div>
                <h3
                  style={{
                    fontSize: '13px',
                    fontWeight: 800,
                    letterSpacing: '0.06em',
                    color: isCurrentActive ? '#15803d' : '#1e40af',
                    textTransform: 'uppercase',
                    marginBottom: '16px',
                  }}
                >
                  {plan.name}
                </h3>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '36px', fontWeight: 800, color: '#0f172a' }}>
                    ₹{priceNum}
                  </span>
                  <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>
                    {plan.duration_days ? `/ ${plan.duration_days} days` : '/ month'}
                  </span>
                </div>

                <p style={{ fontSize: '12.5px', color: '#64748b', marginBottom: '24px' }}>
                  {plan.description || 'Full features billing suite access'}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: '#334155' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Check size={16} style={{ color: '#16a34a' }} />
                    <span>Unlimited Invoicing</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Check size={16} style={{ color: '#16a34a' }} />
                    <span>Barcode &amp; Stock Tracking</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Check size={16} style={{ color: '#16a34a' }} />
                    <span>SMS &amp; WhatsApp Bills</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Check size={16} style={{ color: '#16a34a' }} />
                    <span>Full Analytics &amp; Reports</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleSelectPlan(plan)}
                className={isCurrentActive ? 'btn-primary' : isTrial ? 'btn-primary' : 'btn-outline'}
                style={{
                  width: '100%',
                  marginTop: '28px',
                  padding: '11px',
                  fontSize: '13.5px',
                  background: isCurrentActive ? '#16a34a' : undefined,
                  borderColor: isCurrentActive ? '#16a34a' : undefined,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                {isCurrentActive ? (
                  <>
                    <RefreshCw size={15} />
                    <span>Renew / Extend Plan</span>
                  </>
                ) : (
                  <>
                    <span>Select Plan</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Subscription & Payment History Modal */}
      {showHistoryModal && (
        <div className="modal-overlay">
          <div
            className="modal-content animate-fade"
            style={{ padding: '24px', maxWidth: '580px', width: '95%', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: '#eff6ff',
                    color: '#2563eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <History size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Subscription &amp; Payment History
                  </h3>
                  <span style={{ fontSize: '11.5px', color: '#64748b' }}>
                    Store: {activeWorkspace?.name}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setShowHistoryModal(false)}
                style={{
                  color: '#64748b',
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '6px',
                  cursor: 'pointer',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body with History */}
            <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {loadingHistory ? (
                <div style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
                  <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 8px auto', color: '#2563eb' }} />
                  <div>Loading transaction history...</div>
                </div>
              ) : historyList.length === 0 ? (
                <div style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
                  <ShieldCheck size={32} style={{ margin: '0 auto 8px auto', color: '#94a3b8' }} />
                  <p style={{ fontWeight: 600 }}>No prior transactions found for this store.</p>
                </div>
              ) : (
                historyList.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      padding: '14px 16px',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      background: '#f8fafc',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '8px',
                          background: item.action === 'RENEW' ? '#eff6ff' : '#ecfdf5',
                          color: item.action === 'RENEW' ? '#2563eb' : '#059669',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <FileCheck size={18} />
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 800, fontSize: '13.5px', color: '#0f172a' }}>
                            {item.plan?.name || 'Subscription Plan'}
                          </span>
                          <span
                            style={{
                              fontSize: '10px',
                              fontWeight: 700,
                              padding: '1px 6px',
                              borderRadius: '4px',
                              background: item.action === 'RENEW' ? '#dbeafe' : '#d1fae5',
                              color: item.action === 'RENEW' ? '#1d4ed8' : '#047857',
                            }}
                          >
                            {item.action}
                          </span>
                        </div>
                        <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                          Period: {formatDate(item.new_start_at)} → {formatDate(item.new_expires_at)}
                        </div>
                        <div style={{ fontSize: '10.5px', color: '#94a3b8', marginTop: '2px' }}>
                          Txn: {item.payment_id?.slice(0, 16)}... • {formatDateTime(item.createdAt)}
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '9999px',
                          background: '#dcfce7',
                          color: '#15803d',
                        }}
                      >
                        ● Active / Paid
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="btn-secondary"
                style={{ padding: '8px 20px', fontSize: '13px' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
