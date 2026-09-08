import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import {
  getBillStatistics,
  getBills,
  type BillStatisticsData,
  type ApiBill,
} from '../../api/bills';
import {
  Sun,
  Calendar,
  TrendingUp,
  ShoppingBag,
  Smartphone,
  Banknote,
  CreditCard,
  PlusCircle,
  Receipt,
  Wallet,
  BarChart2,
  MoreHorizontal,
  RotateCw,
  ReceiptText,
  Search,
  ArrowUpRight,
  Eye,
  Phone,
  X,
  Printer,
  FileCheck,
} from 'lucide-react';

function formatDateDisplay(dateStr: string): string {
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

function formatDateTime(dateStr?: string | null): string {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-IN', {
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

export const DashboardHome: React.FC = () => {
  const {
    user,
    activeWorkspace,
    bills,
    setCurrentScreen,
    setIsAddProductOpen,
    setIsDrawerOpen,
  } = useApp();

  // Statistics State
  const [stats, setStats] = useState<BillStatisticsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Recent Transactions State (Live API: /api/bills?business_id=...)
  const [recentBills, setRecentBills] = useState<ApiBill[]>([]);
  const [isLoadingBills, setIsLoadingBills] = useState<boolean>(true);
  const [billSearch, setBillSearch] = useState<string>('');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'cash' | 'online'>('all');
  const [selectedBillForModal, setSelectedBillForModal] = useState<ApiBill | null>(null);

  // Default to today's date formatted as YYYY-MM-DD
  const getTodayDateStr = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateStr());

  // Fetch Statistics
  const fetchStats = useCallback(async (showRefreshingSpinner = false) => {
    if (showRefreshingSpinner) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const businessId =
        activeWorkspace?.id && !activeWorkspace.id.startsWith('ws-')
          ? activeWorkspace.id
          : '66946b56-8be2-41c6-a2a7-fc7388b08c70';

      const response = await getBillStatistics(businessId, selectedDate);
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [activeWorkspace?.id, selectedDate]);

  // Fetch Recent Bills from API: /api/bills?business_id=...
  const fetchRecentBills = useCallback(async () => {
    setIsLoadingBills(true);
    try {
      const businessId =
        activeWorkspace?.id && !activeWorkspace.id.startsWith('ws-')
          ? activeWorkspace.id
          : '66946b56-8be2-41c6-a2a7-fc7388b08c70';

      const response = await getBills(businessId);
      if (response.success && response.data) {
        setRecentBills(response.data);
      }
    } catch (error) {
      console.error('Error fetching recent bills:', error);
    } finally {
      setIsLoadingBills(false);
    }
  }, [activeWorkspace?.id]);

  useEffect(() => {
    fetchStats();
    fetchRecentBills();
  }, [fetchStats, fetchRecentBills]);

  // Re-fetch when bills change locally
  useEffect(() => {
    if (bills.length > 0) {
      fetchStats();
      fetchRecentBills();
    }
  }, [bills.length, fetchStats, fetchRecentBills]);

  // Quick Action items
  const quickActions = [
    {
      label: 'Add Product',
      icon: PlusCircle,
      bg: 'linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%)',
      action: () => setIsAddProductOpen(true),
    },
    {
      label: 'Create Bill',
      icon: Receipt,
      bg: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
      action: () => setCurrentScreen('create-bill'),
    },
    {
      label: 'View Bills',
      icon: ReceiptText,
      bg: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
      action: () => setCurrentScreen('6-sales-invoices'),
    },
    {
      label: 'Expenses',
      icon: Wallet,
      bg: 'linear-gradient(135deg, #e11d48 0%, #f43f5e 100%)',
      action: () => setCurrentScreen('expenses'),
    },
    {
      label: 'Reports',
      icon: BarChart2,
      bg: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
      action: () => setCurrentScreen('8-reports'),
    },
    {
      label: 'More',
      icon: MoreHorizontal,
      bg: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
      action: () => setIsDrawerOpen(true),
    },
  ];

  // Calculated or live API values
  const monthlyTotal = stats?.monthly_income?.total_income ?? 0;
  const monthlyCash = stats?.monthly_income?.cash_income ?? 0;
  const monthlyOnline = stats?.monthly_income?.online_income ?? 0;

  const todaySale = stats?.daily_income?.total_income ?? 0;
  const todayOnline = stats?.daily_income?.online_income ?? 0;
  const todayCash = stats?.daily_income?.cash_income ?? 0;
  const creditSales = 0;

  // Filter recent bills
  const filteredRecentBills = recentBills.filter((bill) => {
    // Payment mode filter
    if (paymentFilter !== 'all') {
      const mode = (bill.payment || '').toLowerCase();
      if (paymentFilter === 'cash' && mode !== 'cash') return false;
      if (paymentFilter === 'online' && mode !== 'online') return false;
    }
    // Search query filter
    if (billSearch.trim()) {
      const q = billSearch.toLowerCase();
      const srMatch = bill.sr_no.toLowerCase().includes(q);
      const custMatch = bill.customer_name.toLowerCase().includes(q);
      const phoneMatch = bill.phone.toLowerCase().includes(q);
      const prodMatch = bill.products?.some((p) => p.product_name.toLowerCase().includes(q));
      return srMatch || custMatch || phoneMatch || prodMatch;
    }
    return true;
  });

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1280px', margin: '0 auto', width: '100%', minWidth: 0 }}>
      
      {/* 1. Good Afternoon Greeting Banner */}
      <div
        className="card-shadow"
        style={{
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          background: '#ffffff',
          borderRadius: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: '#fef3c7',
              color: '#d97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Sun size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>Good Afternoon, ☀️</div>
            <div style={{ fontSize: '17px', fontWeight: 700, color: '#0f172a' }}>{user.name}</div>
          </div>
        </div>

        {/* Date Selector / Badge with Live Sync */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: '9999px',
              background: '#f1f5f9',
              border: '1px solid #e2e8f0',
              fontSize: '12.5px',
              fontWeight: 600,
              color: '#334155',
              position: 'relative',
              cursor: 'pointer',
            }}
            title="Click to change date"
          >
            <Calendar size={14} style={{ color: '#2563eb' }} />
            <span>{formatDateDisplay(selectedDate)}</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                if (e.target.value) {
                  setSelectedDate(e.target.value);
                }
              }}
              style={{
                position: 'absolute',
                opacity: 0,
                width: '100%',
                height: '100%',
                top: 0,
                left: 0,
                cursor: 'pointer',
              }}
            />
          </div>

          <button
            onClick={() => {
              fetchStats(true);
              fetchRecentBills();
            }}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748b',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            title="Refresh statistics & recent transactions"
          >
            <RotateCw
              size={14}
              style={{
                animation: isRefreshing || isLoadingBills ? 'spin 1s linear infinite' : 'none',
                color: isRefreshing || isLoadingBills ? '#2563eb' : '#64748b',
              }}
            />
          </button>
        </div>
      </div>

      {/* 2. Hero Metric Card: Total Monthly Income */}
      <div
        className="card-shadow"
        style={{
          padding: '24px 28px',
          borderRadius: '18px',
          background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)',
          border: '1px solid #bbf7d0',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: '#10b981',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <TrendingUp size={18} />
              </div>
              <span style={{ fontSize: '13.5px', fontWeight: 600, color: '#475569' }}>
                Total Monthly Income
              </span>
            </div>

            <div
              style={{
                fontSize: '38px',
                fontWeight: 800,
                color: '#0f172a',
                letterSpacing: '-0.03em',
                transition: 'opacity 0.2s',
                opacity: isLoading ? 0.6 : 1,
              }}
            >
              ₹ {monthlyTotal.toLocaleString('en-IN')}
            </div>

            {/* Breakdown detail tags */}
            {stats && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginTop: '6px',
                  fontSize: '12px',
                  color: '#64748b',
                  flexWrap: 'wrap',
                }}
              >
                <span>
                  Cash: <strong style={{ color: '#0f172a' }}>₹ {monthlyCash.toLocaleString('en-IN')}</strong>
                </span>
                <span>•</span>
                <span>
                  Online: <strong style={{ color: '#0f172a' }}>₹ {monthlyOnline.toLocaleString('en-IN')}</strong>
                </span>
              </div>
            )}
          </div>

          {/* This Month pill */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '8px',
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              fontSize: '12px',
              fontWeight: 600,
              color: '#1e293b',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}
          >
            <Calendar size={14} style={{ color: '#2563eb' }} />
            <span>This Month</span>
          </div>
        </div>
      </div>

      {/* 3. Row of 4 Secondary Metric Cards (Responsive Grid) */}
      <div className="dashboard-grid-4">
        {/* Card 1: Today Sale */}
        <div
          className="card-shadow card-hover dashboard-metric-card"
          style={{
            padding: '18px 20px',
            borderRadius: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#ffffff',
          }}
        >
          <div>
            <span style={{ fontSize: '13px', fontWeight: 500, color: '#64748b' }}>Today Sale</span>
            <div
              className="metric-val"
              style={{
                fontSize: '24px',
                fontWeight: 700,
                color: '#0f172a',
                marginTop: '4px',
                opacity: isLoading ? 0.6 : 1,
              }}
            >
              ₹ {todaySale.toLocaleString('en-IN')}
            </div>
          </div>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: '#ecfdf5',
              color: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <ShoppingBag size={22} />
          </div>
        </div>

        {/* Card 2: Online Pay */}
        <div
          className="card-shadow card-hover dashboard-metric-card"
          style={{
            padding: '18px 20px',
            borderRadius: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#ffffff',
          }}
        >
          <div>
            <span style={{ fontSize: '13px', fontWeight: 500, color: '#64748b' }}>Online Pay</span>
            <div
              className="metric-val"
              style={{
                fontSize: '24px',
                fontWeight: 700,
                color: '#0f172a',
                marginTop: '4px',
                opacity: isLoading ? 0.6 : 1,
              }}
            >
              ₹ {todayOnline.toLocaleString('en-IN')}
            </div>
          </div>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: '#eff6ff',
              color: '#3b82f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Smartphone size={22} />
          </div>
        </div>

        {/* Card 3: Cash Payment */}
        <div
          className="card-shadow card-hover dashboard-metric-card"
          style={{
            padding: '18px 20px',
            borderRadius: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#ffffff',
          }}
        >
          <div>
            <span style={{ fontSize: '13px', fontWeight: 500, color: '#64748b' }}>Cash Payment</span>
            <div
              className="metric-val"
              style={{
                fontSize: '24px',
                fontWeight: 700,
                color: '#0f172a',
                marginTop: '4px',
                opacity: isLoading ? 0.6 : 1,
              }}
            >
              ₹ {todayCash.toLocaleString('en-IN')}
            </div>
          </div>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: '#fff7ed',
              color: '#f97316',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Banknote size={22} />
          </div>
        </div>

        {/* Card 4: Credit Sales */}
        <div
          className="card-shadow card-hover dashboard-metric-card"
          style={{
            padding: '18px 20px',
            borderRadius: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#ffffff',
          }}
        >
          <div>
            <span style={{ fontSize: '13px', fontWeight: 500, color: '#64748b' }}>Credit Sales</span>
            <div
              className="metric-val"
              style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}
            >
              ₹ {creditSales.toLocaleString('en-IN')}
            </div>
          </div>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: '#f0fdfa',
              color: '#14b8a6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <CreditCard size={22} />
          </div>
        </div>
      </div>

      {/* 4. Quick Actions (Responsive Grid) */}
      <div className="card-shadow" style={{ padding: '22px 24px', borderRadius: '18px', background: '#ffffff' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', marginBottom: '16px' }}>
          Quick Actions
        </h3>
        <div className="dashboard-quick-actions-grid">
          {quickActions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <div
                key={idx}
                className="quick-action-btn"
                onClick={action.action}
              >
                <div className="quick-action-icon" style={{ background: action.bg }}>
                  <Icon size={22} />
                </div>
                <span className="quick-action-label">{action.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. RECENT TRANSACTION HISTORY (Live API: GET /api/bills?business_id=...) */}
      <div
        className="card-shadow"
        style={{
          padding: '24px',
          borderRadius: '18px',
          background: '#ffffff',
          border: '1px solid #e2e8f0',
        }}
      >
        {/* Section Header with Controls */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            marginBottom: '20px',
            paddingBottom: '16px',
            borderBottom: '1px solid #f1f5f9',
          }}
        >
          {/* Left: Title & Live Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
              <ReceiptText size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Recent Transaction History
                </h3>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    background: '#dcfce7',
                    color: '#15803d',
                    padding: '2px 8px',
                    borderRadius: '9999px',
                  }}
                >
                  ● Live API
                </span>
              </div>
              <p style={{ fontSize: '12.5px', color: '#64748b', margin: '2px 0 0 0' }}>
                Latest sales transactions &amp; customer bills for <strong>{activeWorkspace?.name}</strong>
              </p>
            </div>
          </div>

          {/* Right: Search, Filter Tabs & View All */}
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            {/* Search Input */}
            <div
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                minWidth: '180px',
              }}
            >
              <Search
                size={15}
                style={{ position: 'absolute', left: '10px', color: '#94a3b8', pointerEvents: 'none' }}
              />
              <input
                type="text"
                placeholder="Search bill, phone..."
                value={billSearch}
                onChange={(e) => setBillSearch(e.target.value)}
                style={{
                  padding: '7px 10px 7px 32px',
                  fontSize: '12.5px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: '#f8fafc',
                  width: '100%',
                }}
              />
            </div>

            {/* Filter Mode Tabs */}
            <div
              style={{
                display: 'flex',
                background: '#f1f5f9',
                padding: '3px',
                borderRadius: '8px',
                gap: '2px',
              }}
            >
              {(['all', 'cash', 'online'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setPaymentFilter(mode)}
                  style={{
                    padding: '5px 10px',
                    borderRadius: '6px',
                    fontSize: '11.5px',
                    fontWeight: 600,
                    textTransform: 'capitalize',
                    background: paymentFilter === mode ? '#ffffff' : 'transparent',
                    color: paymentFilter === mode ? '#0f172a' : '#64748b',
                    boxShadow: paymentFilter === mode ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  }}
                >
                  {mode}
                </button>
              ))}
            </div>

            {/* Refresh Button */}
            <button
              onClick={fetchRecentBills}
              disabled={isLoadingBills}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: '#f1f5f9',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#475569',
                cursor: 'pointer',
              }}
              title="Refresh Recent Transactions"
            >
              <RotateCw size={14} className={isLoadingBills ? 'animate-spin' : ''} />
            </button>

            {/* View All Bills Link */}
            <button
              onClick={() => setCurrentScreen('6-sales-invoices')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '7px 12px',
                borderRadius: '8px',
                background: '#eff6ff',
                color: '#1d4ed8',
                border: '1px solid #bfdbfe',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <span>View All</span>
              <ArrowUpRight size={14} />
            </button>
          </div>
        </div>

        {/* Transaction Table / List */}
        {isLoadingBills ? (
          <div style={{ padding: '36px', textAlign: 'center', color: '#64748b' }}>
            <RotateCw size={24} className="animate-spin" style={{ margin: '0 auto 8px auto', color: '#2563eb' }} />
            <div style={{ fontSize: '13.5px', fontWeight: 600 }}>Loading recent transactions from server...</div>
            <div style={{ fontSize: '11.5px', color: '#94a3b8', marginTop: '2px' }}>
              Endpoint: /api/bills?business_id={activeWorkspace?.id}
            </div>
          </div>
        ) : filteredRecentBills.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: '#64748b' }}>
            <ReceiptText size={36} style={{ margin: '0 auto 10px auto', color: '#cbd5e1' }} />
            <div style={{ fontSize: '14.5px', fontWeight: 700, color: '#0f172a' }}>
              No Recent Transactions Found
            </div>
            <p style={{ fontSize: '12.5px', color: '#64748b', marginTop: '4px' }}>
              {billSearch
                ? `No transactions match "${billSearch}". Try clearing the search filter.`
                : 'No bills have been recorded yet for this active store.'}
            </p>
            <button
              onClick={() => setCurrentScreen('create-bill')}
              className="btn-primary"
              style={{ marginTop: '14px', padding: '8px 18px', fontSize: '13px' }}
            >
              <PlusCircle size={15} />
              <span>Create New Bill</span>
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="app-table">
              <thead>
                <tr>
                  <th style={{ width: '110px' }}>Bill No.</th>
                  <th>Customer</th>
                  <th>Products &amp; Items</th>
                  <th style={{ width: '120px' }}>Payment</th>
                  <th style={{ width: '170px' }}>Date &amp; Time</th>
                  <th style={{ textAlign: 'right', width: '120px' }}>Amount</th>
                  <th style={{ textAlign: 'center', width: '80px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecentBills.slice(0, 10).map((bill, index) => {
                  const isCash = (bill.payment || '').toLowerCase() === 'cash';
                  const isOnline = (bill.payment || '').toLowerCase() === 'online';

                  // Calculate total bill amount
                  const totalAmount = bill.products?.reduce(
                    (acc, p) => acc + (parseFloat(String(p.amount)) || 0),
                    0
                  ) || 0;

                  // Total items count
                  const itemsCount = bill.products?.reduce((acc, p) => acc + (p.quantity || 1), 0) || 0;

                  // Product names preview
                  const productsSummary = bill.products?.map((p) => p.product_name).filter(Boolean).join(', ') || 'Item';
                  const dateStr = bill.products?.[0]?.createdAt || new Date().toISOString();

                  return (
                    <tr
                      key={bill.sr_no || index}
                      style={{ cursor: 'pointer', transition: 'background 0.15s' }}
                      onClick={() => setSelectedBillForModal(bill)}
                      title="Click to view detailed receipt"
                    >
                      {/* Bill Serial */}
                      <td>
                        <span
                          style={{
                            fontFamily: 'monospace',
                            fontWeight: 800,
                            fontSize: '12.5px',
                            color: '#1d4ed8',
                            background: '#eff6ff',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            border: '1px solid #bfdbfe',
                            display: 'inline-block',
                          }}
                        >
                          {bill.sr_no}
                        </span>
                      </td>

                      {/* Customer Name & Phone */}
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '13.5px' }}>
                            {bill.customer_name || 'Walk-in Customer'}
                          </span>
                          {bill.phone && (
                            <span
                              style={{
                                fontSize: '11.5px',
                                color: '#64748b',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                marginTop: '1px',
                              }}
                            >
                              <Phone size={11} style={{ color: '#94a3b8' }} />
                              {bill.phone}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Products Summary */}
                      <td>
                        <div style={{ maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          <span style={{ fontSize: '13px', color: '#334155' }}>{productsSummary}</span>
                        </div>
                        <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                          {itemsCount} {itemsCount === 1 ? 'item' : 'items'}
                        </span>
                      </td>

                      {/* Payment Mode Badge */}
                      <td>
                        <span
                          className={isCash ? 'badge-cash' : isOnline ? 'badge-online' : 'badge-owner'}
                          style={{ fontSize: '11px', textTransform: 'capitalize' }}
                        >
                          ● {bill.payment || 'Paid'}
                        </span>
                      </td>

                      {/* Date & Time */}
                      <td>
                        <span style={{ fontSize: '12.5px', color: '#475569' }}>
                          {formatDateTime(dateStr)}
                        </span>
                      </td>

                      {/* Total Amount */}
                      <td style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                          ₹ {totalAmount.toFixed(2)}
                        </span>
                      </td>

                      {/* View Button */}
                      <td style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setSelectedBillForModal(bill)}
                          style={{
                            padding: '6px',
                            borderRadius: '8px',
                            color: '#2563eb',
                            background: '#eff6ff',
                            border: '1px solid #bfdbfe',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                          title="View Invoice"
                        >
                          <Eye size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 6. RECEIPT PREVIEW MODAL */}
      {selectedBillForModal && (
        <div className="modal-overlay" onClick={() => setSelectedBillForModal(null)}>
          <div
            className="modal-content animate-fade"
            style={{ maxWidth: '460px', padding: '24px', position: 'relative' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileCheck size={20} style={{ color: '#16a34a' }} />
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Invoice Receipt
                </h3>
              </div>
              <button
                onClick={() => setSelectedBillForModal(null)}
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

            {/* Receipt Box (Styled Bill Paper) */}
            <div
              style={{
                background: '#f8fafc',
                borderRadius: '14px',
                border: '1.5px dashed #cbd5e1',
                padding: '18px',
                marginBottom: '16px',
              }}
            >
              {/* Store & Bill Info */}
              <div style={{ textAlign: 'center', paddingBottom: '12px', borderBottom: '1px solid #e2e8f0', marginBottom: '12px' }}>
                <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  {activeWorkspace?.name || 'Retail Store'}
                </h4>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                  {activeWorkspace?.category} • {activeWorkspace?.address || 'India'}
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '6px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#1d4ed8' }}>
                    Bill #{selectedBillForModal.sr_no}
                  </span>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>•</span>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>
                    {formatDateTime(selectedBillForModal.products?.[0]?.createdAt)}
                  </span>
                </div>
              </div>

              {/* Customer Info */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '12px' }}>
                <div>
                  <span style={{ color: '#64748b' }}>Customer: </span>
                  <strong style={{ color: '#0f172a' }}>{selectedBillForModal.customer_name || 'Walk-in'}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Phone: </span>
                  <strong style={{ color: '#0f172a' }}>{selectedBillForModal.phone || 'N/A'}</strong>
                </div>
              </div>

              {/* Products Table */}
              <table style={{ width: '100%', fontSize: '12.5px', borderCollapse: 'collapse', marginBottom: '12px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #cbd5e1', color: '#64748b', textAlign: 'left' }}>
                    <th style={{ padding: '6px 0' }}>Item</th>
                    <th style={{ textAlign: 'center', padding: '6px 0' }}>Qty</th>
                    <th style={{ textAlign: 'right', padding: '6px 0' }}>Price</th>
                    <th style={{ textAlign: 'right', padding: '6px 0' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedBillForModal.products?.map((prod, idx) => (
                    <tr key={prod.id || idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '6px 0', color: '#0f172a', fontWeight: 600 }}>
                        {prod.product_name}
                      </td>
                      <td style={{ textAlign: 'center', padding: '6px 0', color: '#475569' }}>
                        {prod.quantity}
                      </td>
                      <td style={{ textAlign: 'right', padding: '6px 0', color: '#475569' }}>
                        ₹{parseFloat(String(prod.price)).toFixed(2)}
                      </td>
                      <td style={{ textAlign: 'right', padding: '6px 0', fontWeight: 700, color: '#0f172a' }}>
                        ₹{parseFloat(String(prod.amount)).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Total & Payment Method */}
              <div style={{ borderTop: '1px solid #cbd5e1', paddingTop: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>Grand Total</span>
                  <span style={{ fontSize: '20px', fontWeight: 800, color: '#16a34a' }}>
                    ₹
                    {(
                      selectedBillForModal.products?.reduce(
                        (acc, p) => acc + (parseFloat(String(p.amount)) || 0),
                        0
                      ) || 0
                    ).toFixed(2)}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#64748b' }}>
                  <span>Payment Mode</span>
                  <span
                    style={{
                      fontWeight: 700,
                      color: selectedBillForModal.payment === 'cash' ? '#15803d' : '#0369a1',
                      textTransform: 'uppercase',
                    }}
                  >
                    ● {selectedBillForModal.payment}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => window.print()}
                className="btn-primary"
                style={{ flex: 1, padding: '10px', fontSize: '13px' }}
              >
                <Printer size={16} />
                <span>Print Receipt</span>
              </button>
              <button
                onClick={() => setSelectedBillForModal(null)}
                className="btn-secondary"
                style={{ flex: 1, padding: '10px', fontSize: '13px' }}
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
