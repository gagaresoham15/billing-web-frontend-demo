import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  getDashboardReports,
  type DashboardData,
} from '../../api/dashboard';
import {
  Calendar,
  ChevronRight,
  TrendingUp,
  CheckCircle,
  Clock,
  Banknote,
  Smartphone,
  Package,
  Layers,
  RotateCw,
  Loader2,
  AlertCircle,
  X,
  ShieldCheck,
  AlertTriangle,
  Boxes,
  CircleDollarSign,
  PieChart,
} from 'lucide-react';

export const ReportsAnalytics: React.FC = () => {
  const { activeWorkspace, setActiveWorkspace, workspaces } = useApp();

  const currentBusinessId = activeWorkspace?.id || '66946b56-8be2-41c6-a2a7-fc7388b08c70';

  // Date Range Filter state
  const [startDate, setStartDate] = useState('2026-09-01');
  const [endDate, setEndDate] = useState('2026-09-07');
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);

  // Live API data state
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch live dashboard reports
  const fetchReports = useCallback(
    async (isManualRefresh = false) => {
      if (!currentBusinessId) return;

      if (isManualRefresh) setIsRefreshing(true);
      else setIsLoading(true);

      setErrorMessage(null);

      try {
        const res = await getDashboardReports(currentBusinessId, startDate, endDate);
        if (res.success && res.data) {
          setDashboardData(res.data);
        } else {
          setErrorMessage(res.message || 'Could not fetch dashboard reports');
        }
      } catch (err: any) {
        console.error('Error fetching dashboard reports:', err);
        setErrorMessage(err?.message || 'Network error occurred while fetching reports');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [currentBusinessId, startDate, endDate]
  );

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Extract revenue data with safe fallbacks
  const rev = dashboardData?.revenue || {
    total_revenue: 0,
    paid_revenue: 0,
    pending_revenue: 0,
    cash_revenue: 0,
    online_revenue: 0,
  };

  // Extract inventory data with safe fallbacks
  const inv = dashboardData?.inventory || {
    total_products: 0,
    total_categories: 0,
    low_stock_products: 0,
    out_of_stock_products: 0,
    total_stock_value: 0,
    total_selling_value: 0,
    potential_profit: 0,
  };

  // Calculate payment mode percentages
  const { cashPercent, onlinePercent } = useMemo(() => {
    const total = rev.total_revenue || 0;
    if (total <= 0) return { cashPercent: 50, onlinePercent: 50 };
    const cPct = Math.round(((rev.cash_revenue || 0) / total) * 100);
    return { cashPercent: cPct, onlinePercent: 100 - cPct };
  }, [rev]);

  // Format date helper
  const formatDateDisplay = (dStr: string) => {
    try {
      const parts = dStr.split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
      return dStr;
    } catch {
      return dStr;
    }
  };

  // Quick Preset Helper
  const applyPreset = (preset: 'this_month' | 'last_7_days' | 'august') => {
    if (preset === 'this_month') {
      setStartDate('2026-09-01');
      setEndDate('2026-09-07');
    } else if (preset === 'last_7_days') {
      setStartDate('2026-09-01');
      setEndDate('2026-09-08');
    } else if (preset === 'august') {
      setStartDate('2026-08-01');
      setEndDate('2026-08-31');
    }
    setIsDateModalOpen(false);
  };

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Error Notification */}
      {errorMessage && (
        <div
          style={{
            padding: '12px 18px',
            background: '#fef2f2',
            border: '1px solid #ef4444',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            color: '#991b1b',
            fontSize: '13.5px',
            fontWeight: 600,
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.15)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertCircle size={18} style={{ color: '#ef4444' }} />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            style={{ background: 'transparent', border: 'none', color: '#991b1b', cursor: 'pointer', padding: '4px' }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Top Controls & Store Header */}
      <div
        className="card-shadow"
        style={{
          padding: '18px 24px',
          borderRadius: '16px',
          background: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
            }}
          >
            <PieChart size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Store Analytics &amp; Reports
              </h1>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#2563eb',
                  background: '#eff6ff',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  border: '1px solid #dbeafe',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <ShieldCheck size={12} />
                <span>LIVE API</span>
              </span>
            </div>
            <p style={{ fontSize: '12.5px', color: '#64748b', margin: '3px 0 0' }}>
              Real-time revenue, cashflows, and inventory valuations for{' '}
              <strong style={{ color: '#0f172a' }}>{activeWorkspace?.name}</strong>
            </p>
          </div>
        </div>

        {/* Date Filter & Refresh Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Refresh button */}
          <button
            onClick={() => fetchReports(true)}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748b',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            title="Refresh reports from API"
          >
            <RotateCw
              size={17}
              style={{
                animation: isRefreshing ? 'spin 1s linear infinite' : 'none',
                color: isRefreshing ? '#2563eb' : '#64748b',
              }}
            />
          </button>

          {/* Date Range Picker Pill */}
          <div
            onClick={() => setIsDateModalOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 16px',
              borderRadius: '9999px',
              background: '#ffffff',
              border: '1.5px solid #cbd5e1',
              boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
              fontSize: '13px',
              fontWeight: 600,
              color: '#1e293b',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            title="Change report date range"
          >
            <Calendar size={16} style={{ color: '#2563eb' }} />
            <span>
              {formatDateDisplay(startDate)} &nbsp;➔&nbsp; {formatDateDisplay(endDate)}
            </span>
            <ChevronRight size={15} style={{ color: '#94a3b8' }} />
          </div>
        </div>
      </div>

      {/* Store Isolation Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 20px',
          background: '#ffffff',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          flexWrap: 'wrap',
          gap: '10px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <span
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: '#10b981',
              boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.2)',
            }}
          />
          <span style={{ fontSize: '13px', color: '#64748b' }}>Store Analytics:</span>
          <span style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
            {activeWorkspace?.name || 'My Store'}
          </span>
          <span
            style={{
              fontSize: '11px',
              background: '#dbeafe',
              color: '#1d4ed8',
              padding: '2px 8px',
              borderRadius: '4px',
              textTransform: 'uppercase',
              fontWeight: 700,
            }}
          >
            {activeWorkspace?.category || 'STORE'}
          </span>

          {/* Quick store switcher pills */}
          {workspaces.length > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '8px' }}>
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>Switch Store:</span>
              {workspaces.map((ws) => {
                const isSelected = ws.id === currentBusinessId;
                return (
                  <button
                    key={ws.id}
                    onClick={() => setActiveWorkspace(ws)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '11.5px',
                      fontWeight: isSelected ? 700 : 500,
                      background: isSelected ? '#eff6ff' : '#f8fafc',
                      color: isSelected ? '#1d4ed8' : '#475569',
                      border: `1px solid ${isSelected ? '#93c5fd' : '#e2e8f0'}`,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {ws.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
          {isLoading ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Loader2 size={13} style={{ animation: 'spin 1s linear infinite', color: '#2563eb' }} />
              Updating...
            </span>
          ) : (
            `Reporting Range: ${startDate} to ${endDate}`
          )}
        </div>
      </div>

      {/* Section 1: Revenue & Sales Metrics */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              background: '#eff6ff',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <TrendingUp size={16} />
          </div>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
            Revenue &amp; Sales Metrics
          </h3>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
          }}
        >
          {/* Total Revenue */}
          <div
            className="card-shadow card-hover"
            style={{ padding: '20px', borderRadius: '16px', background: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <div>
              <span style={{ fontSize: '13px', fontWeight: 500, color: '#64748b' }}>Total Revenue</span>
              <div style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
                {isLoading ? '...' : `₹ ${rev.total_revenue.toLocaleString('en-IN')}`}
              </div>
            </div>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: '#eff6ff',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <TrendingUp size={22} />
            </div>
          </div>

          {/* Paid Revenue */}
          <div
            className="card-shadow card-hover"
            style={{ padding: '20px', borderRadius: '16px', background: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <div>
              <span style={{ fontSize: '13px', fontWeight: 500, color: '#64748b' }}>Paid Revenue</span>
              <div style={{ fontSize: '26px', fontWeight: 800, color: '#16a34a', marginTop: '4px' }}>
                {isLoading ? '...' : `₹ ${rev.paid_revenue.toLocaleString('en-IN')}`}
              </div>
            </div>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: '#ecfdf5',
                color: '#16a34a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CheckCircle size={22} />
            </div>
          </div>

          {/* Pending Revenue */}
          <div
            className="card-shadow card-hover"
            style={{ padding: '20px', borderRadius: '16px', background: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <div>
              <span style={{ fontSize: '13px', fontWeight: 500, color: '#64748b' }}>Pending Revenue</span>
              <div style={{ fontSize: '26px', fontWeight: 800, color: '#d97706', marginTop: '4px' }}>
                {isLoading ? '...' : `₹ ${rev.pending_revenue.toLocaleString('en-IN')}`}
              </div>
            </div>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: '#fffbeb',
                color: '#d97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Clock size={22} />
            </div>
          </div>

          {/* Cash Revenue */}
          <div
            className="card-shadow card-hover"
            style={{ padding: '20px', borderRadius: '16px', background: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <div>
              <span style={{ fontSize: '13px', fontWeight: 500, color: '#64748b' }}>Cash Revenue</span>
              <div style={{ fontSize: '26px', fontWeight: 800, color: '#ea580c', marginTop: '4px' }}>
                {isLoading ? '...' : `₹ ${rev.cash_revenue.toLocaleString('en-IN')}`}
              </div>
            </div>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: '#fff7ed',
                color: '#ea580c',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Banknote size={22} />
            </div>
          </div>

          {/* Online Revenue */}
          <div
            className="card-shadow card-hover"
            style={{ padding: '20px', borderRadius: '16px', background: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <div>
              <span style={{ fontSize: '13px', fontWeight: 500, color: '#64748b' }}>Online Revenue</span>
              <div style={{ fontSize: '26px', fontWeight: 800, color: '#0284c7', marginTop: '4px' }}>
                {isLoading ? '...' : `₹ ${rev.online_revenue.toLocaleString('en-IN')}`}
              </div>
            </div>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: '#f0f9ff',
                color: '#0284c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Smartphone size={22} />
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Inventory & Stock Metrics (from API) */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              background: '#f1f5f9',
              color: '#475569',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Package size={16} />
          </div>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
            Inventory &amp; Stock Metrics
          </h3>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
          }}
        >
          {/* Total Products */}
          <div
            className="card-shadow card-hover"
            style={{ padding: '20px', borderRadius: '16px', background: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <div>
              <span style={{ fontSize: '13px', fontWeight: 500, color: '#64748b' }}>Total Products</span>
              <div style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
                {isLoading ? '...' : inv.total_products}
              </div>
              <span style={{ fontSize: '11.5px', color: '#64748b' }}>Catalog items</span>
            </div>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: '#eff6ff',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Package size={22} />
            </div>
          </div>

          {/* Total Categories */}
          <div
            className="card-shadow card-hover"
            style={{ padding: '20px', borderRadius: '16px', background: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <div>
              <span style={{ fontSize: '13px', fontWeight: 500, color: '#64748b' }}>Total Categories</span>
              <div style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
                {isLoading ? '...' : inv.total_categories}
              </div>
              <span style={{ fontSize: '11.5px', color: '#64748b' }}>Item classifications</span>
            </div>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: '#fdf2f8',
                color: '#ec4899',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Layers size={22} />
            </div>
          </div>

          {/* Low Stock Products */}
          <div
            className="card-shadow card-hover"
            style={{ padding: '20px', borderRadius: '16px', background: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <div>
              <span style={{ fontSize: '13px', fontWeight: 500, color: '#64748b' }}>Low Stock Items</span>
              <div style={{ fontSize: '26px', fontWeight: 800, color: '#d97706', marginTop: '4px' }}>
                {isLoading ? '...' : inv.low_stock_products}
              </div>
              <span style={{ fontSize: '11.5px', color: '#d97706', fontWeight: 600 }}>Needs re-order</span>
            </div>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: '#fffbeb',
                color: '#d97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AlertTriangle size={22} />
            </div>
          </div>

          {/* Total Stock Cost Value */}
          <div
            className="card-shadow card-hover"
            style={{ padding: '20px', borderRadius: '16px', background: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <div>
              <span style={{ fontSize: '13px', fontWeight: 500, color: '#64748b' }}>Total Stock Cost</span>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
                {isLoading ? '...' : `₹ ${inv.total_stock_value.toLocaleString('en-IN')}`}
              </div>
              <span style={{ fontSize: '11.5px', color: '#64748b' }}>Purchase value</span>
            </div>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: '#f8fafc',
                color: '#475569',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Boxes size={22} />
            </div>
          </div>

          {/* Potential Retail Profit */}
          <div
            className="card-shadow card-hover"
            style={{ padding: '20px', borderRadius: '16px', background: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <div>
              <span style={{ fontSize: '13px', fontWeight: 500, color: '#64748b' }}>Potential Profit</span>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#059669', marginTop: '4px' }}>
                {isLoading ? '...' : `₹ ${inv.potential_profit.toLocaleString('en-IN')}`}
              </div>
              <span style={{ fontSize: '11.5px', color: '#059669', fontWeight: 600 }}>Projected margin</span>
            </div>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: '#ecfdf5',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CircleDollarSign size={22} />
            </div>
          </div>
        </div>
      </div>

      {/* Payment Mode Ratio Visual Progress */}
      <div className="card-shadow" style={{ padding: '22px 24px', borderRadius: '18px', background: '#ffffff' }}>
        <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginBottom: '16px', margin: '0 0 16px' }}>
          Payment Mode Distribution
        </h4>
        <div style={{ height: '14px', borderRadius: '9999px', background: '#f1f5f9', display: 'flex', overflow: 'hidden' }}>
          <div
            style={{
              width: `${cashPercent}%`,
              background: 'linear-gradient(90deg, #ea580c, #f97316)',
              transition: 'width 0.4s ease',
            }}
            title={`Cash: ${cashPercent}%`}
          />
          <div
            style={{
              width: `${onlinePercent}%`,
              background: 'linear-gradient(90deg, #0284c7, #38bdf8)',
              transition: 'width 0.4s ease',
            }}
            title={`Online: ${onlinePercent}%`}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '14px', fontSize: '13px' }}>
          <span style={{ color: '#c2410c', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Banknote size={16} />
            <span>Cash Revenue: ₹{rev.cash_revenue.toLocaleString('en-IN')} ({cashPercent}%)</span>
          </span>
          <span style={{ color: '#0369a1', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Smartphone size={16} />
            <span>Online Revenue: ₹{rev.online_revenue.toLocaleString('en-IN')} ({onlinePercent}%)</span>
          </span>
        </div>
      </div>

      {/* Date Range Modal */}
      {isDateModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1200,
            padding: '20px',
          }}
        >
          <div
            className="card-shadow animate-scale-up"
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              width: '420px',
              maxWidth: '100%',
              overflow: 'hidden',
              padding: '24px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={20} style={{ color: '#2563eb' }} />
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  Report Date Range
                </h3>
              </div>
              <button
                onClick={() => setIsDateModalOpen(false)}
                style={{ color: '#94a3b8', background: 'transparent', border: 'none', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Quick Presets */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '18px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => applyPreset('this_month')}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 600,
                  background: '#eff6ff',
                  color: '#2563eb',
                  border: '1px solid #bfdbfe',
                  cursor: 'pointer',
                }}
              >
                01 Sep ➔ 07 Sep
              </button>
              <button
                type="button"
                onClick={() => applyPreset('last_7_days')}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 600,
                  background: '#f8fafc',
                  color: '#475569',
                  border: '1px solid #e2e8f0',
                  cursor: 'pointer',
                }}
              >
                Last 7 Days
              </button>
              <button
                type="button"
                onClick={() => applyPreset('august')}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 600,
                  background: '#f8fafc',
                  color: '#475569',
                  border: '1px solid #e2e8f0',
                  cursor: 'pointer',
                }}
              >
                August 2026
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setIsDateModalOpen(false);
                fetchReports(true);
              }}
              style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
            >
              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Start Date
                </label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: '14px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>
                  End Date
                </label>
                <input
                  type="date"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: '14px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setIsDateModalOpen(false)}
                  className="btn-secondary"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                  Apply Dates
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
