import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  getCustomers,
  getBills,
  type ApiCustomer,
  type ApiBill,
} from '../../api/bills';
import {
  Users,
  Search,
  Plus,
  Phone,
  MessageSquare,
  FilePlus,
  CreditCard,
  X,
  TrendingUp,
  RotateCw,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Store,
  Layers,
  ShieldCheck,
} from 'lucide-react';

interface LocalSavedCustomer {
  customer_name: string;
  phone: string;
  business_id: string;
  total_amount: number;
  paid_amount: number;
  pending_amount: number;
  createdAt: string;
}

export const CustomersView: React.FC = () => {
  const { activeWorkspace, setActiveWorkspace, workspaces, setCurrentScreen } = useApp();

  const currentBusinessId = activeWorkspace?.id;

  // State for live customers & bills
  const [apiCustomers, setApiCustomers] = useState<ApiCustomer[]>([]);
  const [billsList, setBillsList] = useState<ApiBill[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [viewScope, setViewScope] = useState<'current_store' | 'all_stores'>('current_store');

  // Add Customer Modal state
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustCredit, setNewCustCredit] = useState('0');
  const [newCustBusinessId, setNewCustBusinessId] = useState('');
  const [addModalError, setAddModalError] = useState<string | null>(null);

  // Locally stored added customers (persisted in browser storage)
  const [localCustomers, setLocalCustomers] = useState<LocalSavedCustomer[]>(() => {
    try {
      const saved = localStorage.getItem('billmaster_local_customers');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  });

  // Load live customers & bills from API
  const loadCustomerData = useCallback(
    async (isManualRefresh = false) => {
      if (isManualRefresh) setIsRefreshing(true);
      else setIsLoading(true);

      setErrorMessage(null);

      try {
        // Fetch customers from GET /api/bills/customers
        const custRes = await getCustomers();

        if (custRes.success && Array.isArray(custRes.data)) {
          setApiCustomers(custRes.data);
        } else {
          setErrorMessage(custRes.message || 'Could not fetch customers from server');
        }

        // Fetch bills for active business to correlate customer orders & last purchase dates
        if (currentBusinessId) {
          const billsRes = await getBills(currentBusinessId);
          if (billsRes.success && Array.isArray(billsRes.data)) {
            setBillsList(billsRes.data);
          } else {
            setBillsList([]);
          }
        } else {
          setBillsList([]);
        }
      } catch (err: any) {
        console.error('Error fetching customers:', err);
        setErrorMessage(err?.message || 'Network error occurred while fetching customers');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [currentBusinessId]
  );

  useEffect(() => {
    loadCustomerData();
  }, [loadCustomerData]);

  // Combine API customers with any locally added customers
  const allCustomers = useMemo(() => {
    const combined: ApiCustomer[] = [...apiCustomers];

    // Merge any locally added customers if not already in list
    localCustomers.forEach((loc) => {
      const exists = combined.some(
        (c) =>
          c.phone === loc.phone &&
          c.business_id === loc.business_id
      );
      if (!exists) {
        combined.unshift({
          customer_name: loc.customer_name,
          phone: loc.phone,
          business_id: loc.business_id,
          total_amount: loc.total_amount,
          paid_amount: loc.paid_amount,
          pending_amount: loc.pending_amount,
          pending_bills: [],
        });
      }
    });

    return combined;
  }, [apiCustomers, localCustomers]);

  // Map customer phone or name to orders count and last purchase date from bills
  const customerBillStats = useMemo(() => {
    const stats: Record<string, { count: number; lastDate: string }> = {};

    billsList.forEach((bill) => {
      const key = bill.phone || bill.customer_name?.toLowerCase();
      if (!key) return;

      const billDate =
        bill.products && bill.products[0]?.createdAt
          ? new Date(bill.products[0].createdAt).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })
          : 'Recent';

      if (!stats[key]) {
        stats[key] = { count: 0, lastDate: billDate };
      }
      stats[key].count += 1;
    });

    return stats;
  }, [billsList]);

  // STRICT FILTER: Filter customers according to active store and search query
  const displayedCustomers = useMemo(() => {
    return allCustomers.filter((cust) => {
      // 1. Store Isolation: When viewScope is 'current_store', only show customers for this store!
      if (viewScope === 'current_store' && currentBusinessId) {
        if (cust.business_id !== currentBusinessId) {
          return false;
        }
      }

      // 2. Search query filter (by customer name or phone)
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const nameMatch = cust.customer_name?.toLowerCase().includes(q);
      const phoneMatch = cust.phone?.includes(q);
      return nameMatch || phoneMatch;
    });
  }, [allCustomers, viewScope, currentBusinessId, searchQuery]);

  // Counts for current store vs all stores
  const currentStoreCustomersCount = useMemo(() => {
    return allCustomers.filter((c) => c.business_id === currentBusinessId).length;
  }, [allCustomers, currentBusinessId]);

  // Calculate live KPI statistics
  const totalCustomersCount = displayedCustomers.length;
  const totalSpendAll = displayedCustomers.reduce((sum, c) => sum + (Number(c.total_amount) || 0), 0);
  const totalUdhaariAll = displayedCustomers.reduce((sum, c) => sum + (Number(c.pending_amount) || 0), 0);

  // Open Add Customer Modal
  const handleOpenAddModal = () => {
    setNewCustName('');
    setNewCustPhone('');
    setNewCustCredit('0');
    setNewCustBusinessId(currentBusinessId || (workspaces[0] ? workspaces[0].id : ''));
    setAddModalError(null);
    setIsAddCustomerOpen(true);
  };

  // Handle Add Customer
  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newCustName.trim();
    const phone = newCustPhone.trim();
    if (!name || !phone) {
      setAddModalError('Please enter both name and mobile number');
      return;
    }

    const targetBusinessId = newCustBusinessId || currentBusinessId || '66946b56-8be2-41c6-a2a7-fc7388b08c70';
    const credit = parseFloat(newCustCredit) || 0;

    const newLoc: LocalSavedCustomer = {
      customer_name: name,
      phone,
      business_id: targetBusinessId,
      total_amount: credit,
      paid_amount: 0,
      pending_amount: credit,
      createdAt: new Date().toISOString(),
    };

    const updated = [newLoc, ...localCustomers];
    setLocalCustomers(updated);
    try {
      localStorage.setItem('billmaster_local_customers', JSON.stringify(updated));
    } catch {}

    setSuccessMessage(`Customer "${name}" registered successfully!`);
    setIsAddCustomerOpen(false);
    setNewCustName('');
    setNewCustPhone('');
    setNewCustCredit('0');
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      {/* Toast Notifications */}
      {successMessage && (
        <div
          style={{
            padding: '12px 18px',
            background: '#ecfdf5',
            border: '1px solid #10b981',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            color: '#065f46',
            fontSize: '13.5px',
            fontWeight: 600,
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CheckCircle2 size={18} style={{ color: '#10b981' }} />
            <span>{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            style={{ background: 'transparent', border: 'none', color: '#065f46', cursor: 'pointer', padding: '4px' }}
          >
            <X size={16} />
          </button>
        </div>
      )}

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

      {/* Header Banner */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #059669, #10b981)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)',
            }}
          >
            <Users size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '19px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Customers Directory
              </h1>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#059669',
                  background: '#ecfdf5',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  border: '1px solid #a7f3d0',
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
              Customer contact registry, purchase history, and udhaari credit tracking for{' '}
              <strong style={{ color: '#0f172a' }}>{activeWorkspace?.name}</strong>
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Refresh button */}
          <button
            onClick={() => loadCustomerData(true)}
            style={{
              width: '40px',
              height: '40px',
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
            title="Refresh customers from backend"
          >
            <RotateCw
              size={18}
              style={{
                animation: isRefreshing ? 'spin 1s linear infinite' : 'none',
                color: isRefreshing ? '#2563eb' : '#64748b',
              }}
            />
          </button>

          {/* Add Customer Button */}
          <button
            onClick={handleOpenAddModal}
            className="btn-primary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              padding: '10px 18px',
              borderRadius: '10px',
              fontWeight: 600,
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
            }}
          >
            <Plus size={17} />
            <span>Add New Customer</span>
          </button>
        </div>
      </div>

      {/* Store Isolation Bar (STRICT OWNER & STORE CONTEXT) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 20px',
          background: '#ffffff',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          flexWrap: 'wrap',
          gap: '12px',
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
          <span style={{ fontSize: '13px', color: '#64748b' }}>Active Store Customers:</span>
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
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>Switch:</span>
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

        {/* View Scope Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={() => setViewScope('current_store')}
            style={{
              padding: '5px 12px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 600,
              background: viewScope === 'current_store' ? '#1d4ed8' : '#f8fafc',
              color: viewScope === 'current_store' ? '#ffffff' : '#64748b',
              border: `1px solid ${viewScope === 'current_store' ? '#1d4ed8' : '#e2e8f0'}`,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
            }}
          >
            <Store size={13} />
            <span>Current Store ({currentStoreCustomersCount})</span>
          </button>

          <button
            onClick={() => setViewScope('all_stores')}
            style={{
              padding: '5px 12px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 600,
              background: viewScope === 'all_stores' ? '#1d4ed8' : '#f8fafc',
              color: viewScope === 'all_stores' ? '#ffffff' : '#64748b',
              border: `1px solid ${viewScope === 'all_stores' ? '#1d4ed8' : '#e2e8f0'}`,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
            }}
          >
            <Layers size={13} />
            <span>All My Stores ({allCustomers.length})</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
        }}
      >
        <div
          className="card-shadow"
          style={{
            padding: '18px 20px',
            borderRadius: '16px',
            background: '#ffffff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            border: '1px solid #f1f5f9',
          }}
        >
          <div>
            <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#64748b' }}>Total Customers</span>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
              {isLoading ? '...' : totalCustomersCount}
            </div>
            <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 600 }}>
              {viewScope === 'current_store' ? `${activeWorkspace?.name}` : 'Across all stores'}
            </span>
          </div>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: '#ecfdf5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Users size={22} />
          </div>
        </div>

        <div
          className="card-shadow"
          style={{
            padding: '18px 20px',
            borderRadius: '16px',
            background: '#ffffff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            border: '1px solid #f1f5f9',
          }}
        >
          <div>
            <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#64748b' }}>Total Customer Spend</span>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#2563eb', marginTop: '4px' }}>
              ₹ {totalSpendAll.toLocaleString('en-IN')}
            </div>
            <span style={{ fontSize: '11px', color: '#2563eb', fontWeight: 600 }}>Lifetime purchases</span>
          </div>
          <div
            style={{
              width: '46px',
              height: '46px',
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

        <div
          className="card-shadow"
          style={{
            padding: '18px 20px',
            borderRadius: '16px',
            background: '#ffffff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            border: '1px solid #f1f5f9',
          }}
        >
          <div>
            <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#64748b' }}>Outstanding Udhaari (Credit)</span>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#ef4444', marginTop: '4px' }}>
              ₹ {totalUdhaariAll.toLocaleString('en-IN')}
            </div>
            <span style={{ fontSize: '11px', color: '#ef4444', fontWeight: 600 }}>Pending credit dues</span>
          </div>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: '#fef2f2',
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CreditCard size={22} />
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div
        className="card-shadow"
        style={{
          padding: '14px 20px',
          borderRadius: '14px',
          background: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div className="input-group" style={{ maxWidth: '460px', flex: 1 }}>
          <Search className="input-icon" size={18} />
          <input
            type="text"
            className="input-field"
            placeholder="Search by customer name or mobile number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ fontSize: '12.5px', color: '#64748b', fontWeight: 600 }}>
          Showing {displayedCustomers.length} {displayedCustomers.length === 1 ? 'Customer' : 'Customers'}
        </div>
      </div>

      {/* Customers Table */}
      <div className="card-shadow" style={{ borderRadius: '16px', background: '#ffffff', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                <th style={{ padding: '14px 20px', fontWeight: 600 }}>Customer Name</th>
                <th style={{ padding: '14px 20px', fontWeight: 600 }}>Mobile Number</th>
                <th style={{ padding: '14px 20px', fontWeight: 600 }}>Total Bills</th>
                <th style={{ padding: '14px 20px', fontWeight: 600 }}>Total Spent</th>
                <th style={{ padding: '14px 20px', fontWeight: 600 }}>Last Purchase</th>
                <th style={{ padding: '14px 20px', fontWeight: 600 }}>Udhaari (Credit)</th>
                <th style={{ padding: '14px 20px', fontWeight: 600, textAlign: 'center' }}>Quick Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '48px', color: '#64748b' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                      <Loader2 size={26} style={{ animation: 'spin 1s linear infinite', color: '#059669' }} />
                      <span style={{ fontSize: '13.5px', fontWeight: 600 }}>
                        Loading customers for {activeWorkspace?.name || 'store'}...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : displayedCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '48px 20px', textAlign: 'center', color: '#64748b' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '54px',
                          height: '54px',
                          borderRadius: '16px',
                          background: '#f1f5f9',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#94a3b8',
                        }}
                      >
                        <Users size={28} />
                      </div>
                      <div style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b' }}>
                        {searchQuery
                          ? `No customers match "${searchQuery}"`
                          : `No customers found for "${activeWorkspace?.name || 'this store'}"`}
                      </div>
                      <p style={{ fontSize: '12.5px', color: '#64748b', maxWidth: '400px', margin: 0 }}>
                        {searchQuery
                          ? 'Try searching with another name or mobile number.'
                          : 'Customers are automatically registered when bills are generated. You can also add a new customer.'}
                      </p>
                      <button
                        onClick={handleOpenAddModal}
                        className="btn-primary"
                        style={{ marginTop: '6px', padding: '8px 18px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        <Plus size={16} />
                        <span>+ Add Customer</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                displayedCustomers.map((cust, idx) => {
                  const custKey = cust.phone || cust.customer_name?.toLowerCase();
                  const stats = customerBillStats[custKey];
                  const orderCount = stats?.count || (cust.total_amount > 0 ? 1 : 0);
                  const lastPurchaseDate = stats?.lastDate || 'Recent';
                  const pendingCredit = Number(cust.pending_amount) || 0;
                  const totalSpentNum = Number(cust.total_amount) || 0;
                  const initials = (cust.customer_name || 'CU').substring(0, 2).toUpperCase();

                  return (
                    <tr
                      key={`${cust.business_id}-${cust.phone}-${idx}`}
                      style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s ease' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = '#ffffff')}
                    >
                      {/* Customer Name */}
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '50%',
                              background: '#eff6ff',
                              color: '#2563eb',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '13px',
                              flexShrink: 0,
                            }}
                          >
                            {initials}
                          </div>
                          <div>
                            <span style={{ fontWeight: 600, color: '#0f172a', textTransform: 'capitalize', display: 'block' }}>
                              {cust.customer_name}
                            </span>
                            {viewScope === 'all_stores' && (
                              <span style={{ fontSize: '10.5px', color: '#94a3b8' }}>
                                {workspaces.find((w) => w.id === cust.business_id)?.name || 'Store'}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Mobile Number */}
                      <td style={{ padding: '14px 20px', color: '#475569' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Phone size={14} style={{ color: '#94a3b8' }} />
                          <span style={{ fontWeight: 500 }}>{cust.phone}</span>
                        </div>
                      </td>

                      {/* Total Bills */}
                      <td style={{ padding: '14px 20px', color: '#0f172a', fontWeight: 600 }}>
                        {orderCount} {orderCount === 1 ? 'order' : 'orders'}
                      </td>

                      {/* Total Spent */}
                      <td style={{ padding: '14px 20px', fontWeight: 700, color: '#2563eb' }}>
                        ₹ {totalSpentNum.toLocaleString('en-IN')}
                      </td>

                      {/* Last Purchase */}
                      <td style={{ padding: '14px 20px', color: '#64748b', fontSize: '12.5px' }}>
                        {lastPurchaseDate}
                      </td>

                      {/* Udhaari (Credit) */}
                      <td style={{ padding: '14px 20px' }}>
                        {pendingCredit > 0 ? (
                          <span
                            style={{
                              background: '#fee2e2',
                              color: '#b91c1c',
                              padding: '4px 10px',
                              borderRadius: '6px',
                              fontWeight: 700,
                              fontSize: '11.5px',
                              display: 'inline-block',
                            }}
                          >
                            ₹ {pendingCredit.toLocaleString('en-IN')} Due
                          </span>
                        ) : (
                          <span
                            style={{
                              background: '#dcfce7',
                              color: '#15803d',
                              padding: '4px 10px',
                              borderRadius: '6px',
                              fontWeight: 600,
                              fontSize: '11.5px',
                              display: 'inline-block',
                            }}
                          >
                            Clear
                          </span>
                        )}
                      </td>

                      {/* Quick Actions */}
                      <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                          <button
                            onClick={() => setCurrentScreen('create-bill')}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              background: '#eff6ff',
                              color: '#1d4ed8',
                              fontSize: '12px',
                              fontWeight: 600,
                              border: 'none',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                            }}
                            title={`Create bill for ${cust.customer_name}`}
                          >
                            <FilePlus size={13} />
                            <span>Bill</span>
                          </button>

                          <a
                            href={`tel:${cust.phone}`}
                            style={{
                              padding: '6px 8px',
                              borderRadius: '6px',
                              background: '#f1f5f9',
                              color: '#475569',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              textDecoration: 'none',
                            }}
                            title={`Call ${cust.phone}`}
                          >
                            <Phone size={14} />
                          </a>

                          <a
                            href={`https://wa.me/91${cust.phone}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              padding: '6px 8px',
                              borderRadius: '6px',
                              background: '#ecfdf5',
                              color: '#10b981',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              textDecoration: 'none',
                            }}
                            title={`WhatsApp ${cust.phone}`}
                          >
                            <MessageSquare size={14} />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Customer Modal */}
      {isAddCustomerOpen && (
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
                <Users size={20} style={{ color: '#059669' }} />
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: 0 }}>Add Customer</h3>
              </div>
              <button
                onClick={() => setIsAddCustomerOpen(false)}
                style={{ color: '#94a3b8', background: 'transparent', border: 'none', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {addModalError && (
              <div
                style={{
                  padding: '10px 14px',
                  background: '#fef2f2',
                  border: '1px solid #ef4444',
                  borderRadius: '10px',
                  color: '#991b1b',
                  fontSize: '12.5px',
                  marginBottom: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{addModalError}</span>
              </div>
            )}

            <form onSubmit={handleAddCustomer} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Customer Name *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. Ramesh Kumar"
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: '14px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="10-digit mobile number"
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: '14px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Assign to Store *
                </label>
                <select
                  value={newCustBusinessId}
                  onChange={(e) => setNewCustBusinessId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1.5px solid #e2e8f0',
                    fontSize: '13px',
                    color: '#0f172a',
                    background: '#f8fafc',
                    fontWeight: 500,
                  }}
                >
                  {workspaces.map((ws) => (
                    <option key={ws.id} value={ws.id}>
                      {ws.name} ({ws.category || 'Store'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Opening Udhaari / Credit Balance (₹)
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={newCustCredit}
                  onChange={(e) => setNewCustCredit(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: '14px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setIsAddCustomerOpen(false)}
                  className="btn-secondary"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
