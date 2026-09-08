import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getUserIdFromToken,
  type ApiCategory,
} from '../../api/categories';
import {
  getProductsByBusiness,
  type ApiProduct,
} from '../../api/products';
import {
  Tags,
  Plus,
  Search,
  Package,
  ArrowRight,
  TrendingUp,
  Layers,
  Trash2,
  Edit2,
  RotateCw,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
  Store,
  ShieldCheck,
} from 'lucide-react';

interface CategoryStyle {
  color: string;
  bgColor: string;
  description: string;
}

const CATEGORY_STYLES: Record<string, CategoryStyle> = {
  'baby care': {
    color: '#8b5cf6',
    bgColor: '#f5f3ff',
    description: 'Diapers, baby powder, gentle soaps, lotions and baby care essentials',
  },
  'beverages': {
    color: '#06b6d4',
    bgColor: '#ecfeff',
    description: 'Cold drinks, juices, soda, mineral water, tea, coffee and beverages',
  },
  'confectionery': {
    color: '#ec4899',
    bgColor: '#fdf2f8',
    description: 'Chocolates, candies, sweets, biscuits and bakery treats',
  },
  'dairy products': {
    color: '#0284c7',
    bgColor: '#f0f9ff',
    description: 'Milk, cheese, butter, paneer, curd, yogurt and fresh dairy supplies',
  },
  'dry fruits': {
    color: '#d97706',
    bgColor: '#fffbeb',
    description: 'Almonds, cashews, raisins, walnuts, pistachios and premium nuts',
  },
  'electronics': {
    color: '#2563eb',
    bgColor: '#eff6ff',
    description: 'Cables, bulbs, adapters, chargers, batteries and electronic accessories',
  },
  'fresh products': {
    color: '#10b981',
    bgColor: '#ecfdf5',
    description: 'Fresh fruits, leafy vegetables, seasonal farm produce and herbs',
  },
  'grocery': {
    color: '#059669',
    bgColor: '#f0fdf4',
    description: 'Atta, rice, pulses, sugar, salt, grains and everyday kitchen staples',
  },
  'home care': {
    color: '#6366f1',
    bgColor: '#eef2ff',
    description: 'Detergents, floor cleaners, dishwash bars, disinfectants and sponges',
  },
  'household items': {
    color: '#7c3aed',
    bgColor: '#f5f3ff',
    description: 'Storage containers, bottles, kitchenware, plastic items and daily utilities',
  },
  'instant food': {
    color: '#ea580c',
    bgColor: '#fff7ed',
    description: 'Instant noodles, pasta, ready mixes, soups, oats and quick meals',
  },
  'oils & ghee': {
    color: '#ca8a04',
    bgColor: '#fefce8',
    description: 'Pure ghee, mustard oil, refined sunflower oil and blended cooking oils',
  },
  'packaged foods': {
    color: '#e11d48',
    bgColor: '#fff1f2',
    description: 'Packed biscuits, breakfast cereals, sauces, spreads and ready snacks',
  },
  'personal care': {
    color: '#0d9488',
    bgColor: '#f0fdfa',
    description: 'Shampoos, soaps, hair oils, toothpastes, deodorants and skincare',
  },
  'snacks & biscuits': {
    color: '#f59e0b',
    bgColor: '#fef3c7',
    description: 'Chips, namkeen, wafers, cookies, rusks and evening snack items',
  },
  'snacks': {
    color: '#f59e0b',
    bgColor: '#fef3c7',
    description: 'Biscuits, chips, namkeen, wafers and savory packed snacks',
  },
  'spices': {
    color: '#dc2626',
    bgColor: '#fef2f2',
    description: 'Turmeric, red chili powder, coriander, whole spices and garam masala',
  },
  'beauty': {
    color: '#ec4899',
    bgColor: '#fdf2f8',
    description: 'Face creams, lotions, makeup essentials, grooming and skin care products',
  },
};

const DYNAMIC_PALETTE = [
  { color: '#2563eb', bgColor: '#eff6ff' },
  { color: '#8b5cf6', bgColor: '#f5f3ff' },
  { color: '#ec4899', bgColor: '#fdf2f8' },
  { color: '#10b981', bgColor: '#ecfdf5' },
  { color: '#f59e0b', bgColor: '#fef3c7' },
  { color: '#06b6d4', bgColor: '#ecfeff' },
  { color: '#ea580c', bgColor: '#fff7ed' },
  { color: '#059669', bgColor: '#f0fdf4' },
  { color: '#e11d48', bgColor: '#fff1f2' },
];

function getCategoryStyle(name: string): CategoryStyle {
  const normalized = (name || '').toLowerCase().trim();
  if (CATEGORY_STYLES[normalized]) {
    return CATEGORY_STYLES[normalized];
  }
  for (const [key, val] of Object.entries(CATEGORY_STYLES)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return val;
    }
  }
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    hash = (hash << 5) - hash + normalized.charCodeAt(i);
    hash |= 0;
  }
  const picked = DYNAMIC_PALETTE[Math.abs(hash) % DYNAMIC_PALETTE.length];
  return {
    color: picked.color,
    bgColor: picked.bgColor,
    description: 'Organize items and manage inventory stocks under this category',
  };
}

export const CategoriesView: React.FC = () => {
  const { activeWorkspace, setActiveWorkspace, workspaces, user, setCurrentScreen } = useApp();

  // Current logged in owner ID decoded from token
  const loggedInOwnerId = useMemo(() => getUserIdFromToken(), []);

  // Active store ID
  const currentBusinessId = activeWorkspace?.id;

  // State for live API data
  const [allOwnerCategories, setAllOwnerCategories] = useState<ApiCategory[]>([]);
  const [productsList, setProductsList] = useState<ApiProduct[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Search query & Store scope filter ('current_store' by default for strict isolation)
  const [searchQuery, setSearchQuery] = useState('');
  const [viewScope, setViewScope] = useState<'current_store' | 'all_stores'>('current_store');

  // Add Category Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatBusinessId, setNewCatBusinessId] = useState('');
  const [newCatColor, setNewCatColor] = useState('#2563eb');
  const [isCreating, setIsCreating] = useState(false);
  const [addModalError, setAddModalError] = useState<string | null>(null);

  // Edit Category Modal state
  const [editingCategory, setEditingCategory] = useState<ApiCategory | null>(null);
  const [editCatName, setEditCatName] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [editModalError, setEditModalError] = useState<string | null>(null);

  // Delete Category Confirmation state
  const [deletingCatId, setDeletingCatId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load live categories and products for THIS owner and active business
  const loadCategoriesAndProducts = useCallback(
    async (isManualRefresh = false) => {
      if (isManualRefresh) setIsRefreshing(true);
      else setIsLoading(true);

      setErrorMessage(null);

      try {
        // Fetch categories from backend API
        const catRes = await getCategories();

        if (catRes.success && Array.isArray(catRes.data)) {
          // STRICT OWNER FILTER: Only keep categories belonging to the authenticated owner
          const filteredByOwner = catRes.data.filter((c: ApiCategory) => {
            if (loggedInOwnerId && c.owner_id) {
              return c.owner_id === loggedInOwnerId;
            }
            return true;
          });
          setAllOwnerCategories(filteredByOwner);
        } else {
          setErrorMessage(catRes.message || 'Could not fetch categories from server');
        }

        // Fetch products strictly for the active business to compute live item counts & valuations
        if (currentBusinessId) {
          const prodRes = await getProductsByBusiness(currentBusinessId);
          if (prodRes.success && Array.isArray(prodRes.data)) {
            // STRICT BUSINESS FILTER: Only products for this active business
            const ownerStoreProducts = prodRes.data.filter(
              (p: ApiProduct) => p.business_id === currentBusinessId
            );
            setProductsList(ownerStoreProducts);
          } else {
            setProductsList([]);
          }
        } else {
          setProductsList([]);
        }
      } catch (err: any) {
        console.error('Error fetching categories:', err);
        setErrorMessage(err?.message || 'Network error occurred while fetching categories');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [currentBusinessId, loggedInOwnerId]
  );

  useEffect(() => {
    loadCategoriesAndProducts();
  }, [loadCategoriesAndProducts]);

  // Open Add modal with active business preselected
  const handleOpenAddModal = () => {
    setNewCatName('');
    setNewCatBusinessId(currentBusinessId || (workspaces[0] ? workspaces[0].id : ''));
    setNewCatColor('#2563eb');
    setAddModalError(null);
    setIsAddModalOpen(true);
  };

  // Open Edit modal
  const handleOpenEditModal = (cat: ApiCategory) => {
    setEditingCategory(cat);
    setEditCatName(cat.name);
    setEditModalError(null);
  };

  // Compute live product counts and valuation per category from products list
  const categoryStats = useMemo(() => {
    const stats: Record<string, { count: number; totalValue: number }> = {};

    productsList.forEach((prod) => {
      const catId = prod.category_id;
      if (!catId) return;

      const qty = prod.quantity || 0;
      const price =
        typeof prod.selling_price === 'number'
          ? prod.selling_price
          : parseFloat(prod.selling_price as string) || 0;
      const value = qty * price;

      if (!stats[catId]) {
        stats[catId] = { count: 0, totalValue: 0 };
      }
      stats[catId].count += 1;
      stats[catId].totalValue += value;
    });

    return stats;
  }, [productsList]);

  // STRICT FILTER: Filter categories according to active store and search query
  const displayedCategories = useMemo(() => {
    return allOwnerCategories.filter((cat) => {
      // 1. STRICT OWNER ISOLATION: Double-check owner_id matches logged-in owner
      if (loggedInOwnerId && cat.owner_id && cat.owner_id !== loggedInOwnerId) {
        return false;
      }

      // 2. STRICT STORE ISOLATION: When viewScope is 'current_store', only show categories for this active store!
      if (viewScope === 'current_store' && currentBusinessId) {
        if (cat.business_id !== currentBusinessId) {
          return false;
        }
      }

      // 3. Search query filter
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      const nameMatches = cat.name.toLowerCase().includes(query);
      const businessMatches = cat.business?.business_name?.toLowerCase().includes(query);
      return nameMatches || businessMatches;
    });
  }, [allOwnerCategories, loggedInOwnerId, viewScope, currentBusinessId, searchQuery]);

  // Active store's categories count
  const currentStoreCategoriesCount = useMemo(() => {
    return allOwnerCategories.filter(
      (c) =>
        (!loggedInOwnerId || !c.owner_id || c.owner_id === loggedInOwnerId) &&
        c.business_id === currentBusinessId
    ).length;
  }, [allOwnerCategories, loggedInOwnerId, currentBusinessId]);

  // Overall KPI statistics based on current active view
  const totalCategoriesCount = displayedCategories.length;
  const totalCategorizedItems = productsList.length;
  const totalInventoryValuation = productsList.reduce((sum, p) => {
    const qty = p.quantity || 0;
    const price =
      typeof p.selling_price === 'number'
        ? p.selling_price
        : parseFloat(p.selling_price as string) || 0;
    return sum + qty * price;
  }, 0);

  // Handle Add Category via POST /api/categories
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newCatName.trim();
    if (!name) {
      setAddModalError('Please enter a category name');
      return;
    }

    const targetBusinessId = newCatBusinessId || currentBusinessId;
    if (!targetBusinessId) {
      setAddModalError('Please select a business store');
      return;
    }

    setIsCreating(true);
    setAddModalError(null);

    try {
      const res = await createCategory({
        name,
        business_id: targetBusinessId,
      });

      if (res.success && res.data) {
        // Add to owner's categories
        setAllOwnerCategories((prev) => [res.data!, ...prev]);
        setSuccessMessage(`Category "${res.data.name}" created for ${activeWorkspace?.name || 'store'}!`);
        setIsAddModalOpen(false);
        setNewCatName('');
        setTimeout(() => setSuccessMessage(null), 4000);
      } else {
        setAddModalError(res.message || 'Failed to create category');
      }
    } catch (err: any) {
      console.error('Failed to create category:', err);
      setAddModalError(err?.message || 'Network error while creating category');
    } finally {
      setIsCreating(false);
    }
  };

  // Handle Edit Category via PUT /api/categories/:id
  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    const name = editCatName.trim();
    if (!name) {
      setEditModalError('Category name cannot be empty');
      return;
    }

    setIsUpdating(true);
    setEditModalError(null);

    try {
      const res = await updateCategory(editingCategory.id, { name });

      if (res.success && res.data) {
        setAllOwnerCategories((prev) =>
          prev.map((c) => (c.id === editingCategory.id ? { ...c, name: res.data!.name } : c))
        );
        setSuccessMessage(`Category renamed to "${res.data.name}" successfully!`);
        setEditingCategory(null);
        setTimeout(() => setSuccessMessage(null), 4000);
      } else {
        setEditModalError(res.message || 'Failed to update category');
      }
    } catch (err: any) {
      console.error('Failed to update category:', err);
      setEditModalError(err?.message || 'Network error while updating category');
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle Delete Category via DELETE /api/categories/:id
  const handleDeleteCategory = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete category "${name}"?`)) {
      return;
    }

    setDeletingCatId(id);
    setIsDeleting(true);

    try {
      const res = await deleteCategory(id);
      if (res.success) {
        setAllOwnerCategories((prev) => prev.filter((c) => c.id !== id));
        setSuccessMessage(`Category "${name}" deleted successfully!`);
        setTimeout(() => setSuccessMessage(null), 4000);
      } else {
        setErrorMessage(res.message || `Failed to delete category "${name}"`);
        setTimeout(() => setErrorMessage(null), 5000);
      }
    } catch (err: any) {
      console.error('Failed to delete category:', err);
      setErrorMessage(err?.message || 'Network error while deleting category');
      setTimeout(() => setErrorMessage(null), 5000);
    } finally {
      setDeletingCatId(null);
      setIsDeleting(false);
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
              background: 'linear-gradient(135deg, #ec4899, #f43f5e)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(236, 72, 153, 0.3)',
            }}
          >
            <Tags size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '19px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Categories &amp; Groups
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
                <span>Owner Protected</span>
              </span>
            </div>
            <p style={{ fontSize: '12.5px', color: '#64748b', margin: '3px 0 0' }}>
              Categories for <strong style={{ color: '#0f172a' }}>{user.name}</strong> ({activeWorkspace?.name})
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Refresh button */}
          <button
            onClick={() => loadCategoriesAndProducts(true)}
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
            title="Refresh categories from backend"
          >
            <RotateCw
              size={18}
              style={{
                animation: isRefreshing ? 'spin 1s linear infinite' : 'none',
                color: isRefreshing ? '#2563eb' : '#64748b',
              }}
            />
          </button>

          {/* Add Category Button */}
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
            <span>Add Category</span>
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
          <span style={{ fontSize: '13px', color: '#64748b' }}>Active Store:</span>
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
            <span>Current Store ({currentStoreCategoriesCount})</span>
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
            <span>All My Stores ({allOwnerCategories.length})</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
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
              {viewScope === 'current_store' ? 'Store Categories' : 'Total Categories'}
            </span>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
              {isLoading ? '...' : totalCategoriesCount}
            </div>
            <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 600 }}>
              {viewScope === 'current_store' ? `${activeWorkspace?.name}` : 'Across all your stores'}
            </span>
          </div>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: '#fdf2f8',
              color: '#ec4899',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Tags size={22} />
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
            <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#64748b' }}>Categorized Products</span>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
              {isLoading ? '...' : `${totalCategorizedItems} Items`}
            </div>
            <span style={{ fontSize: '11px', color: '#2563eb', fontWeight: 600 }}>
              In {activeWorkspace?.name || 'catalog'}
            </span>
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
            <Package size={22} />
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
            <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#64748b' }}>Store Inventory Valuation</span>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#059669', marginTop: '4px' }}>
              ₹ {totalInventoryValuation.toLocaleString('en-IN')}
            </div>
            <span style={{ fontSize: '11px', color: '#059669', fontWeight: 600 }}>
              Live stock value
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
            <TrendingUp size={22} />
          </div>
        </div>
      </div>

      {/* Search Input Bar */}
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
            placeholder="Search category name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ fontSize: '12.5px', color: '#64748b', fontWeight: 600 }}>
          Showing {displayedCategories.length} {displayedCategories.length === 1 ? 'Category' : 'Categories'}
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div
          className="card-shadow"
          style={{
            padding: '60px 20px',
            borderRadius: '16px',
            background: '#ffffff',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '14px',
          }}
        >
          <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: '#2563eb' }} />
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b' }}>
            Loading categories for {activeWorkspace?.name || 'store'}...
          </div>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
            Fetching owner classifications from server
          </p>
        </div>
      ) : displayedCategories.length === 0 ? (
        /* Empty State with Store Isolation Note */
        <div
          className="card-shadow"
          style={{
            padding: '60px 20px',
            borderRadius: '16px',
            background: '#ffffff',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: '#f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94a3b8',
            }}
          >
            <Tags size={28} />
          </div>
          <div style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
            {searchQuery
              ? `No categories match "${searchQuery}"`
              : `No categories found for "${activeWorkspace?.name || 'this store'}"`}
          </div>
          <p style={{ fontSize: '13px', color: '#64748b', maxWidth: '420px', margin: 0 }}>
            {searchQuery
              ? 'Try searching with a different keyword or clear your query.'
              : `Categories from other stores are not mixed here. Add your first category for ${activeWorkspace?.name || 'this store'}!`}
          </p>
          <button
            onClick={handleOpenAddModal}
            className="btn-primary"
            style={{ marginTop: '8px', padding: '9px 18px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={16} />
            <span>+ Add Category to {activeWorkspace?.name || 'Store'}</span>
          </button>
        </div>
      ) : (
        /* Categories Cards Grid */
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
            gap: '18px',
          }}
        >
          {displayedCategories.map((cat) => {
            const style = getCategoryStyle(cat.name);
            const stats = categoryStats[cat.id] || { count: 0, totalValue: 0 };
            const businessName = cat.business?.business_name || activeWorkspace?.name || 'My Store';
            const isBeingDeleted = deletingCatId === cat.id;

            return (
              <div
                key={cat.id}
                className="card-shadow card-hover animate-fade"
                style={{
                  padding: '20px',
                  borderRadius: '16px',
                  background: '#ffffff',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '16px',
                  position: 'relative',
                  borderTop: `4px solid ${style.color}`,
                  opacity: isBeingDeleted ? 0.5 : 1,
                  transition: 'all 0.2s ease',
                }}
              >
                <div>
                  {/* Card Header: Icon + Name + Actions */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '12px',
                          background: style.bgColor,
                          color: style.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Layers size={20} />
                      </div>
                      <div>
                        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                          {cat.name}
                        </h3>
                        <span style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 500 }}>
                          {stats.count} {stats.count === 1 ? 'product' : 'products'} listed
                        </span>
                      </div>
                    </div>

                    {/* Edit & Delete Action Buttons */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                      <button
                        onClick={() => handleOpenEditModal(cat)}
                        style={{
                          color: '#64748b',
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '6px',
                          borderRadius: '6px',
                        }}
                        title="Edit category name"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(cat.id, cat.name)}
                        disabled={isDeleting}
                        style={{
                          color: '#ef4444',
                          background: 'transparent',
                          border: 'none',
                          cursor: isDeleting ? 'not-allowed' : 'pointer',
                          padding: '6px',
                          borderRadius: '6px',
                        }}
                        title="Delete category"
                      >
                        {isBeingDeleted ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Trash2 size={15} />}
                      </button>
                    </div>
                  </div>

                  {/* Business Store Badge */}
                  <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        color: '#475569',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Store size={11} />
                      <span>{businessName}</span>
                    </span>
                  </div>

                  {/* Description */}
                  <p style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.5, margin: '10px 0 0' }}>
                    {style.description}
                  </p>
                </div>

                {/* Footer: Valuation + View Products */}
                <div
                  style={{
                    borderTop: '1px solid #f1f5f9',
                    paddingTop: '14px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <span style={{ fontSize: '10.5px', color: '#94a3b8', display: 'block', fontWeight: 600 }}>
                      EST. VALUATION
                    </span>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                      ₹ {stats.totalValue.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <button
                    onClick={() => setCurrentScreen('7-products')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#2563eb',
                      background: '#eff6ff',
                      padding: '7px 12px',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                    title="View products in inventory"
                  >
                    <span>View Products</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Category Modal */}
      {isAddModalOpen && (
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
              width: '440px',
              maxWidth: '100%',
              overflow: 'hidden',
              padding: '24px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '10px',
                    background: '#fdf2f8',
                    color: '#ec4899',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Tags size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                    Add New Category
                  </h3>
                  <span style={{ fontSize: '11.5px', color: '#64748b' }}>
                    Saves to {activeWorkspace?.name || 'store'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                style={{ color: '#94a3b8', background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px' }}
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

            <form onSubmit={handleCreateCategory} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. Dairy Products / Bakery / Spices"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: '14px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Assign to Business Store *
                </label>
                <select
                  value={newCatBusinessId}
                  onChange={(e) => setNewCatBusinessId(e.target.value)}
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
                  {!workspaces.some((w) => w.id === currentBusinessId) && currentBusinessId && (
                    <option value={currentBusinessId}>
                      {activeWorkspace?.name || 'Selected Store'}
                    </option>
                  )}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Category Accent Theme
                </label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  {['#2563eb', '#ec4899', '#f59e0b', '#10b981', '#8b5cf6', '#06b6d4', '#e11d48'].map((clr) => (
                    <div
                      key={clr}
                      onClick={() => setNewCatColor(clr)}
                      style={{
                        width: '30px',
                        height: '30px',
                        borderRadius: '50%',
                        background: clr,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: newCatColor === clr ? '2.5px solid #0f172a' : 'none',
                        transition: 'transform 0.15s ease',
                      }}
                    >
                      {newCatColor === clr && <CheckCircle2 size={16} color="#fff" />}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  disabled={isCreating}
                  onClick={() => setIsAddModalOpen(false)}
                  className="btn-secondary"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="btn-primary"
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  {isCreating ? (
                    <>
                      <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <span>Create Category</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {editingCategory && (
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '10px',
                    background: '#eff6ff',
                    color: '#2563eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Edit2 size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                    Edit Category
                  </h3>
                  <span style={{ fontSize: '11.5px', color: '#64748b' }}>Update category on live backend</span>
                </div>
              </div>
              <button
                onClick={() => setEditingCategory(null)}
                style={{ color: '#94a3b8', background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {editModalError && (
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
                <span>{editModalError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateCategory} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={editCatName}
                  onChange={(e) => setEditCatName(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: '14px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => setEditingCategory(null)}
                  className="btn-secondary"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="btn-primary"
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  {isUpdating ? (
                    <>
                      <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
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
