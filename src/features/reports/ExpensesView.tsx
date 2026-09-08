import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  getExpenseSummary,
  getExpensesByCategory,
  getExpenses,
  createExpense,
  deleteExpense,
  type ApiExpense,
  type ExpenseSummaryData,
  type ExpenseCategorySummaryItem,
  type CreateExpensePayload,
} from '../../api/expenses';
import {
  Wallet,
  Plus,
  Search,
  Banknote,
  Smartphone,
  Trash2,
  TrendingDown,
  Building,
  Zap,
  Truck,
  Users,
  Wrench,
  Package,
  X,
  RotateCw,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export const ExpensesView: React.FC = () => {
  const { activeWorkspace, setActiveWorkspace, workspaces } = useApp();

  const currentBusinessId = activeWorkspace?.id || '66946b56-8be2-41c6-a2a7-fc7388b08c70';

  // State for live API data
  const [expensesList, setExpensesList] = useState<ApiExpense[]>([]);
  const [summaryData, setSummaryData] = useState<ExpenseSummaryData>({
    total_expenses: 0,
    monthly_expenses: 0,
    today_expenses: 0,
    pending_expenses: 0,
    partial_expenses: 0,
    expense_count: 0,
  });
  const [categoryBreakdown, setCategoryBreakdown] = useState<ExpenseCategorySummaryItem[]>([]);

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Loading & notification state
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Add Expense Modal state
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Form Fields
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('Utility');
  const [customCategory, setCustomCategory] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formPaidAmount, setFormPaidAmount] = useState('');
  const [formExpenseDate, setFormExpenseDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [formPaymentMethod, setFormPaymentMethod] = useState<'Cash' | 'UPI' | 'Card' | 'Bank Transfer'>('UPI');
  const [formPaymentStatus, setFormPaymentStatus] = useState<'Paid' | 'Pending' | 'Partial'>('Paid');
  const [formPaidTo, setFormPaidTo] = useState('');
  const [formReferenceNumber, setFormReferenceNumber] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formNotes, setFormNotes] = useState('');

  // Delete Expense state
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Load live data from all 3 endpoints for this business
  const fetchExpenseData = useCallback(
    async (isManualRefresh = false) => {
      if (!currentBusinessId) return;

      if (isManualRefresh) setIsRefreshing(true);
      else setIsLoading(true);

      setErrorMessage(null);

      try {
        // 1. GET /api/expenses/business/:id/summary
        const summaryPromise = getExpenseSummary(currentBusinessId);

        // 2. GET /api/expenses/business/:id/summary/by-category
        const catPromise = getExpensesByCategory(currentBusinessId);

        // 3. GET /api/expenses/business/:id?page=...
        const listPromise = getExpenses(currentBusinessId, {
          page,
          limit,
          sort_by: 'expense_date',
          sort_order: 'DESC',
        });

        const [sumRes, catRes, listRes] = await Promise.all([
          summaryPromise,
          catPromise,
          listPromise,
        ]);

        if (sumRes.success && sumRes.data) {
          setSummaryData(sumRes.data);
        }

        if (catRes.success && Array.isArray(catRes.data)) {
          setCategoryBreakdown(catRes.data);
        }

        if (listRes.success && Array.isArray(listRes.data)) {
          setExpensesList(listRes.data);
          if (listRes.pagination) {
            setTotalPages(listRes.pagination.totalPages || 1);
            setTotalRecords(listRes.pagination.totalRecords || listRes.data.length);
          } else {
            setTotalRecords(listRes.data.length);
            setTotalPages(1);
          }
        } else {
          setExpensesList([]);
          if (isManualRefresh) {
            setErrorMessage(listRes.message || 'Could not fetch expenses');
          }
        }
      } catch (err: any) {
        console.error('Error fetching expenses:', err);
        setErrorMessage(err?.message || 'Network error occurred while fetching expenses');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [currentBusinessId, page, limit]
  );

  useEffect(() => {
    fetchExpenseData();
  }, [fetchExpenseData]);

  // Compute category pills list dynamically from API + defaults
  const categoryPills = useMemo(() => {
    const set = new Set<string>(['All']);
    categoryBreakdown.forEach((item) => {
      if (item.category) set.add(item.category);
    });
    // Add common fallback categories
    ['Utility', 'Rent', 'maintainsence', 'Salary', 'Transport', 'Inventory', 'Other'].forEach((c) =>
      set.add(c)
    );
    return Array.from(set);
  }, [categoryBreakdown]);

  // Client search and category filtering
  const filteredExpenses = useMemo(() => {
    return expensesList.filter((exp) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        exp.title?.toLowerCase().includes(q) ||
        exp.category?.toLowerCase().includes(q) ||
        exp.paid_to?.toLowerCase().includes(q) ||
        exp.notes?.toLowerCase().includes(q) ||
        exp.description?.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (selectedCategory !== 'All') {
        const catLower = (exp.category || '').toLowerCase();
        const selLower = selectedCategory.toLowerCase();
        return catLower === selLower || catLower.includes(selLower);
      }

      return true;
    });
  }, [expensesList, searchQuery, selectedCategory]);

  // Calculate Cash and Online totals
  const cashExpenseTotal = useMemo(() => {
    return expensesList
      .filter((e) => (e.payment_method || '').toLowerCase() === 'cash')
      .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  }, [expensesList]);

  const onlineExpenseTotal = useMemo(() => {
    return expensesList
      .filter((e) => (e.payment_method || '').toLowerCase() !== 'cash')
      .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  }, [expensesList]);

  // Open modal
  const handleOpenAddModal = () => {
    setFormTitle('');
    setFormCategory('Utility');
    setCustomCategory('');
    setFormAmount('');
    setFormPaidAmount('');
    setFormExpenseDate(new Date().toISOString().split('T')[0]);
    setFormPaymentMethod('UPI');
    setFormPaymentStatus('Paid');
    setFormPaidTo('');
    setFormReferenceNumber('');
    setFormDescription('');
    setFormNotes('');
    setModalError(null);
    setIsAddExpenseOpen(true);
  };

  // Handle Add Expense Submit
  const handleAddExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const title = formTitle.trim();
    const amountNum = parseFloat(formAmount);

    if (!title) {
      setModalError('Please enter an expense title');
      return;
    }
    if (isNaN(amountNum) || amountNum <= 0) {
      setModalError('Please enter a valid expense amount');
      return;
    }

    const effectiveCategory =
      formCategory === 'Custom' ? customCategory.trim() || 'Other' : formCategory;
    const paidAmountNum = formPaidAmount ? parseFloat(formPaidAmount) || amountNum : amountNum;

    const payload: CreateExpensePayload = {
      title,
      category: effectiveCategory,
      amount: amountNum,
      paid_amount: paidAmountNum,
      expense_date: formExpenseDate,
      payment_method: formPaymentMethod,
      payment_status: formPaymentStatus,
      paid_to: formPaidTo.trim() || undefined,
      reference_number: formReferenceNumber.trim() || undefined,
      description: formDescription.trim() || undefined,
      notes: formNotes.trim() || undefined,
    };

    setIsSubmitting(true);
    setModalError(null);

    try {
      const res = await createExpense(currentBusinessId, payload);
      if (res.success && res.data) {
        setSuccessMessage(`Expense "${res.data.title}" added successfully!`);
        setIsAddExpenseOpen(false);
        // Refresh summary and list
        fetchExpenseData(true);
        setTimeout(() => setSuccessMessage(null), 4000);
      } else {
        setModalError(res.message || 'Failed to create expense on backend');
      }
    } catch (err: any) {
      console.error('Create expense error:', err);
      setModalError(err?.message || 'Network error while creating expense');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete Expense
  const handleDeleteExpense = async (id: string, title: string) => {
    if (!confirm(`Delete expense record "${title}"?`)) return;

    setDeletingId(id);
    try {
      const res = await deleteExpense(id, currentBusinessId);
      if (res.success) {
        setExpensesList((prev) => prev.filter((e) => e.id !== id));
        setSuccessMessage(`Expense "${title}" deleted successfully!`);
        // Refresh summary
        getExpenseSummary(currentBusinessId).then((r) => {
          if (r.success && r.data) setSummaryData(r.data);
        });
        setTimeout(() => setSuccessMessage(null), 4000);
      } else {
        setErrorMessage(res.message || 'Failed to delete expense');
        setTimeout(() => setErrorMessage(null), 5000);
      }
    } catch (err: any) {
      console.error('Delete expense error:', err);
      setErrorMessage(err?.message || 'Network error while deleting expense');
      setTimeout(() => setErrorMessage(null), 5000);
    } finally {
      setDeletingId(null);
    }
  };

  // Category Icon helper
  const getCategoryIcon = (cat: string) => {
    const c = (cat || '').toLowerCase();
    if (c.includes('rent') || c.includes('building')) return <Building size={15} />;
    if (c.includes('elect') || c.includes('util') || c.includes('power')) return <Zap size={15} />;
    if (c.includes('sal') || c.includes('staff') || c.includes('worker')) return <Users size={15} />;
    if (c.includes('trans') || c.includes('tempo') || c.includes('freight')) return <Truck size={15} />;
    if (c.includes('inv') || c.includes('stock') || c.includes('pack')) return <Package size={15} />;
    return <Wrench size={15} />;
  };

  // Date format helper
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Recent';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
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
              background: 'linear-gradient(135deg, #e11d48, #f43f5e)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(225, 29, 72, 0.3)',
            }}
          >
            <Wallet size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '19px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Expenses &amp; Petty Cash
              </h1>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#e11d48',
                  background: '#fff1f2',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  border: '1px solid #fecdd3',
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
              Track daily shop expenses, rent, utilities, transport, and staff payouts for{' '}
              <strong style={{ color: '#0f172a' }}>{activeWorkspace?.name}</strong>
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Refresh button */}
          <button
            onClick={() => fetchExpenseData(true)}
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
            title="Refresh expenses from server"
          >
            <RotateCw
              size={18}
              style={{
                animation: isRefreshing ? 'spin 1s linear infinite' : 'none',
                color: isRefreshing ? '#e11d48' : '#64748b',
              }}
            />
          </button>

          {/* Add Expense Button */}
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
              background: '#e11d48',
              boxShadow: '0 4px 12px rgba(225, 29, 72, 0.25)',
            }}
          >
            <Plus size={17} />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Store Isolation Bar */}
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
          <span style={{ fontSize: '13px', color: '#64748b' }}>Current Store:</span>
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
                    onClick={() => {
                      setActiveWorkspace(ws);
                      setPage(1);
                    }}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '11.5px',
                      fontWeight: isSelected ? 700 : 500,
                      background: isSelected ? '#fff1f2' : '#f8fafc',
                      color: isSelected ? '#e11d48' : '#475569',
                      border: `1px solid ${isSelected ? '#fecdd3' : '#e2e8f0'}`,
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

        <div style={{ fontSize: '12.5px', color: '#64748b', fontWeight: 600 }}>
          {totalRecords} {totalRecords === 1 ? 'Expense Record' : 'Expense Records'} on server
        </div>
      </div>

      {/* KPI Cards (Powered by GET /api/expenses/business/:id/summary) */}
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
            <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#64748b' }}>
              Total Expenses (This Month)
            </span>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#e11d48', marginTop: '4px' }}>
              ₹ {(summaryData.monthly_expenses || summaryData.total_expenses || 0).toLocaleString('en-IN')}
            </div>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>
              {summaryData.expense_count || totalRecords} transactions recorded
            </span>
          </div>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: '#fff1f2',
              color: '#e11d48',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <TrendingDown size={22} />
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
            <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#64748b' }}>Paid via Cash</span>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#ea580c', marginTop: '4px' }}>
              ₹ {cashExpenseTotal.toLocaleString('en-IN')}
            </div>
            <span style={{ fontSize: '11px', color: '#ea580c', fontWeight: 600 }}>Cash &amp; petty register</span>
          </div>
          <div
            style={{
              width: '46px',
              height: '46px',
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
            <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#64748b' }}>Paid via Online / UPI</span>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#2563eb', marginTop: '4px' }}>
              ₹ {onlineExpenseTotal.toLocaleString('en-IN')}
            </div>
            <span style={{ fontSize: '11px', color: '#2563eb', fontWeight: 600 }}>Digital &amp; UPI payouts</span>
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
            <Smartphone size={22} />
          </div>
        </div>
      </div>

      {/* Search & Dynamic Category Breakdown Filter */}
      <div
        className="card-shadow"
        style={{
          padding: '16px 20px',
          borderRadius: '14px',
          background: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}
      >
        <div className="input-group" style={{ maxWidth: '460px' }}>
          <Search className="input-icon" size={18} />
          <input
            type="text"
            className="input-field"
            placeholder="Search expense description, vendor, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Dynamic Category Filter Pills */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          {categoryPills.map((cat) => {
            const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();
            const catStat = categoryBreakdown.find(
              (c) => c.category?.toLowerCase() === cat.toLowerCase()
            );

            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '9999px',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  border: isSelected ? '1.5px solid #e11d48' : '1.5px solid #e2e8f0',
                  cursor: 'pointer',
                  background: isSelected ? '#e11d48' : '#ffffff',
                  color: isSelected ? '#ffffff' : '#475569',
                  boxShadow: isSelected ? '0 2px 8px rgba(225, 29, 72, 0.25)' : 'none',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  textTransform: 'capitalize',
                }}
              >
                <span>{cat}</span>
                {catStat && catStat.count > 0 && (
                  <span
                    style={{
                      background: isSelected ? '#ffffff' : '#f1f5f9',
                      color: isSelected ? '#e11d48' : '#64748b',
                      fontSize: '10.5px',
                      fontWeight: 700,
                      padding: '1px 6px',
                      borderRadius: '9999px',
                    }}
                  >
                    ₹{catStat.amount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Expenses Table */}
      <div className="card-shadow" style={{ borderRadius: '16px', background: '#ffffff', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                <th style={{ padding: '14px 20px', fontWeight: 600 }}>Expense Title</th>
                <th style={{ padding: '14px 20px', fontWeight: 600 }}>Category</th>
                <th style={{ padding: '14px 20px', fontWeight: 600 }}>Date</th>
                <th style={{ padding: '14px 20px', fontWeight: 600 }}>Payment Method</th>
                <th style={{ padding: '14px 20px', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '14px 20px', fontWeight: 600 }}>Amount (₹)</th>
                <th style={{ padding: '14px 20px', fontWeight: 600, textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '48px', color: '#64748b' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                      <Loader2 size={26} style={{ animation: 'spin 1s linear infinite', color: '#e11d48' }} />
                      <span style={{ fontSize: '13.5px', fontWeight: 600 }}>
                        Loading expenses for {activeWorkspace?.name || 'store'}...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : filteredExpenses.length === 0 ? (
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
                        <Wallet size={28} />
                      </div>
                      <div style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b' }}>
                        {searchQuery
                          ? `No expenses match "${searchQuery}"`
                          : `No expense records for "${activeWorkspace?.name || 'this store'}"`}
                      </div>
                      <p style={{ fontSize: '12.5px', color: '#64748b', maxWidth: '400px', margin: 0 }}>
                        {searchQuery
                          ? 'Try searching with another keyword or clearing the filter.'
                          : 'Record daily utility bills, shop rent, staff wages, and petty cash expenses.'}
                      </p>
                      <button
                        onClick={handleOpenAddModal}
                        className="btn-primary"
                        style={{
                          marginTop: '6px',
                          padding: '8px 18px',
                          fontSize: '13px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: '#e11d48',
                        }}
                      >
                        <Plus size={16} />
                        <span>+ Add Expense</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => {
                  const isCash = (exp.payment_method || '').toLowerCase() === 'cash';
                  const isBeingDeleted = deletingId === exp.id;
                  const amtNum = Number(exp.amount) || 0;

                  return (
                    <tr
                      key={exp.id}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        transition: 'background 0.15s ease',
                        opacity: isBeingDeleted ? 0.4 : 1,
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = '#ffffff')}
                    >
                      {/* Title & Notes */}
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{exp.title}</div>
                        {(exp.paid_to || exp.notes || exp.description) && (
                          <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '3px' }}>
                            {exp.paid_to && <strong style={{ color: '#475569' }}>Paid to: {exp.paid_to} </strong>}
                            {exp.notes || exp.description}
                          </div>
                        )}
                        {exp.receipt_url && (
                          <a
                            href={exp.receipt_url}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              fontSize: '11px',
                              color: '#2563eb',
                              textDecoration: 'underline',
                              display: 'inline-block',
                              marginTop: '2px',
                            }}
                          >
                            View Receipt Image
                          </a>
                        )}
                      </td>

                      {/* Category */}
                      <td style={{ padding: '14px 20px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            background: '#f1f5f9',
                            color: '#334155',
                            fontSize: '12px',
                            fontWeight: 600,
                            textTransform: 'capitalize',
                          }}
                        >
                          {getCategoryIcon(exp.category)}
                          <span>{exp.category}</span>
                        </span>
                      </td>

                      {/* Date */}
                      <td style={{ padding: '14px 20px', color: '#64748b', fontSize: '12.5px' }}>
                        {formatDate(exp.expense_date || exp.createdAt)}
                      </td>

                      {/* Payment Method */}
                      <td style={{ padding: '14px 20px' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '3px 9px',
                            borderRadius: '6px',
                            fontSize: '11.5px',
                            fontWeight: 600,
                            background: isCash ? '#fff7ed' : '#eff6ff',
                            color: isCash ? '#c2410c' : '#1d4ed8',
                          }}
                        >
                          {exp.payment_method || 'Online'}
                        </span>
                      </td>

                      {/* Payment Status */}
                      <td style={{ padding: '14px 20px' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '11.5px',
                            fontWeight: 600,
                            background: exp.payment_status === 'Paid' ? '#ecfdf5' : '#fef2f2',
                            color: exp.payment_status === 'Paid' ? '#059669' : '#dc2626',
                          }}
                        >
                          {exp.payment_status || 'Paid'}
                        </span>
                      </td>

                      {/* Amount */}
                      <td style={{ padding: '14px 20px', fontWeight: 700, color: '#e11d48', fontSize: '14px' }}>
                        - ₹ {amtNum.toLocaleString('en-IN')}
                      </td>

                      {/* Delete Action */}
                      <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                        <button
                          onClick={() => handleDeleteExpense(exp.id, exp.title)}
                          disabled={isBeingDeleted}
                          style={{
                            color: '#94a3b8',
                            background: 'transparent',
                            border: 'none',
                            cursor: isBeingDeleted ? 'not-allowed' : 'pointer',
                            padding: '6px',
                            borderRadius: '6px',
                            transition: 'color 0.15s ease',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                          onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
                          title="Delete expense"
                        >
                          {isBeingDeleted ? (
                            <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div
            style={{
              padding: '12px 20px',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#ffffff',
            }}
          >
            <span style={{ fontSize: '12.5px', color: '#64748b' }}>
              Page {page} of {totalPages} ({totalRecords} Total Records)
            </span>

            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                  color: page === 1 ? '#cbd5e1' : '#334155',
                  cursor: page === 1 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '12px',
                }}
              >
                <ChevronLeft size={14} />
                <span>Prev</span>
              </button>

              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                  color: page >= totalPages ? '#cbd5e1' : '#334155',
                  cursor: page >= totalPages ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '12px',
                }}
              >
                <span>Next</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Expense Modal */}
      {isAddExpenseOpen && (
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
              width: '460px',
              maxWidth: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '24px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Wallet size={20} style={{ color: '#e11d48' }} />
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: 0 }}>Add New Expense</h3>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>Saves to {activeWorkspace?.name}</span>
                </div>
              </div>
              <button
                onClick={() => setIsAddExpenseOpen(false)}
                style={{ color: '#94a3b8', background: 'transparent', border: 'none', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {modalError && (
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
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleAddExpenseSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Expense Title *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. Electricity Bill / Shop Rent / Staff Wages"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: '14px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>
                    Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="input-field"
                    style={{ paddingLeft: '14px', background: '#fff' }}
                  >
                    <option value="Utility">Utility (Electricity / Water)</option>
                    <option value="Rent">Shop Rent</option>
                    <option value="maintainsence">Maintenance &amp; Repairs</option>
                    <option value="Salary">Staff Salary / Advance</option>
                    <option value="Transport">Freight &amp; Transport</option>
                    <option value="Inventory">Stock Purchase / Packaging</option>
                    <option value="Other">Other / Miscellaneous</option>
                    <option value="Custom">+ Custom Category</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>
                    Amount (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    step="any"
                    placeholder="e.g. 1500"
                    value={formAmount}
                    onChange={(e) => {
                      setFormAmount(e.target.value);
                      if (!formPaidAmount) setFormPaidAmount(e.target.value);
                    }}
                    className="input-field"
                    style={{ paddingLeft: '14px' }}
                  />
                </div>
              </div>

              {formCategory === 'Custom' && (
                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>
                    Custom Category Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter category name"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    className="input-field"
                    style={{ paddingLeft: '14px' }}
                  />
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>
                    Payment Method
                  </label>
                  <select
                    value={formPaymentMethod}
                    onChange={(e) => setFormPaymentMethod(e.target.value as any)}
                    className="input-field"
                    style={{ paddingLeft: '14px', background: '#fff' }}
                  >
                    <option value="UPI">UPI / QR</option>
                    <option value="Cash">Cash</option>
                    <option value="Card">Credit / Debit Card</option>
                    <option value="Bank Transfer">Bank Transfer / NEFT</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>
                    Payment Status
                  </label>
                  <select
                    value={formPaymentStatus}
                    onChange={(e) => setFormPaymentStatus(e.target.value as any)}
                    className="input-field"
                    style={{ paddingLeft: '14px', background: '#fff' }}
                  >
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                    <option value="Partial">Partial</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>
                    Expense Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formExpenseDate}
                    onChange={(e) => setFormExpenseDate(e.target.value)}
                    className="input-field"
                    style={{ paddingLeft: '14px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>
                    Paid To (Recipient)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. MSEDCL / Landlord"
                    value={formPaidTo}
                    onChange={(e) => setFormPaidTo(e.target.value)}
                    className="input-field"
                    style={{ paddingLeft: '14px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Reference No. / UTR / Remarks
                </label>
                <input
                  type="text"
                  placeholder="e.g. UPI Ref / EB-2026-001"
                  value={formReferenceNumber}
                  onChange={(e) => setFormReferenceNumber(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: '14px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Notes / Description (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Additional note regarding this payment"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: '14px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setIsAddExpenseOpen(false)}
                  className="btn-secondary"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary"
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    background: '#e11d48',
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Expense</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
