import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  getProductsByBusiness,
  createProduct,
  getCategories,
  type ApiProduct,
  type ApiCategory,
} from '../../api/products';
import {
  Search,
  Plus,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  X,
  Edit,
  Trash2,
  RotateCw,
  Barcode,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Package,
  Image as ImageIcon,
  Upload,
  Link as LinkIcon,
  Sparkles,
} from 'lucide-react';
import {
  saveLocalProductImage,
  getLocalProductImage,
  POPULAR_IMAGE_PRESETS,
} from '../../utils/productImages';

const DEFAULT_CATEGORIES: ApiCategory[] = [
  { id: '4fe05fb9-6efb-4d05-a1a7-8d57d8c442cc', name: 'Fresh Products' },
  { id: '31df26ea-82f9-4a44-8b7b-0809f48eb854', name: 'Snacks & Biscuits' },
  { id: '5b38d58f-5cce-4cf9-bc46-7b76af00a6a1', name: 'Baby Care' },
  { id: '818126ef-4e20-4312-ae6a-38977c2da18e', name: 'Beverages' },
  { id: '52e400a2-d0dc-4fee-9a39-f39506dfa09a', name: 'Electronics' },
  { id: 'c2059636-9a5b-44d8-9706-a7966982ae84', name: 'Personal Care' },
  { id: '9f0f491e-0d4c-4f72-96af-59639ed3c286', name: 'Grocery' },
  { id: '76ac3496-3884-47d5-83e3-2d8dc01de628', name: 'Food' },
];

export const ProductsInventory: React.FC = () => {
  const { activeWorkspace, isAddProductOpen, setIsAddProductOpen } = useApp();

  const currentBusinessId = activeWorkspace?.id;

  // State for live API products and categories (starts empty - NEVER shows another owner's products)
  const [productsList, setProductsList] = useState<ApiProduct[]>([]);
  const [categoriesList, setCategoriesList] = useState<ApiCategory[]>(DEFAULT_CATEGORIES);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filters & Table state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All Products');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [page, setPage] = useState(1);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Add Product Form State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [productName, setProductName] = useState('');
  const [categoryId, setCategoryId] = useState('4fe05fb9-6efb-4d05-a1a7-8d57d8c442cc');
  const [barcodeNumber, setBarcodeNumber] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('4');
  const [sellingPrice, setSellingPrice] = useState('5');
  const [initialStock, setInitialStock] = useState('100');
  const [productImage, setProductImage] = useState('');
  const [imageInputMode, setImageInputMode] = useState<'preset' | 'upload' | 'url'>('preset');
  const [modalError, setModalError] = useState<string | null>(null);

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please choose an image file (PNG, JPG, WEBP)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (!dataUrl) return;

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 400;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.85);
          setProductImage(compressed);
        } else {
          setProductImage(dataUrl);
        }
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  // Load Categories & Products from live APIs strictly for this active business/owner
  const fetchAllData = useCallback(
    async (isManualRefresh = false) => {
      if (!currentBusinessId) {
        setProductsList([]);
        setIsLoading(false);
        return;
      }

      if (isManualRefresh) setIsRefreshing(true);
      else setIsLoading(true);
      setErrorMessage(null);

      try {
        // Fetch Categories
        const catRes = await getCategories();
        if (catRes.success && catRes.data && catRes.data.length > 0) {
          setCategoriesList(catRes.data);
        }

        // Fetch Products strictly for this business
        const prodRes = await getProductsByBusiness(currentBusinessId);
        if (prodRes.success && Array.isArray(prodRes.data)) {
          // STRICT OWNER FILTER: Only show products belonging to THIS active business!
          const ownerProducts = prodRes.data.filter(
            (p: ApiProduct) => p.business_id === currentBusinessId
          );
          setProductsList(ownerProducts);
        } else {
          // If business has no products, set empty list
          setProductsList([]);
          if (!prodRes.success && isManualRefresh) {
            setErrorMessage(prodRes.message || 'Could not fetch live products');
          }
        }
      } catch (err: any) {
        console.error('Error fetching inventory data:', err);
        setProductsList([]);
        if (isManualRefresh) setErrorMessage('Failed to refresh products from server');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [currentBusinessId]
  );

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);


  // Category ID to Name mapping
  const categoryMap = useMemo(() => {
    const map: Record<string, string> = {
      '5b38d58f-5cce-4cf9-bc46-7b76af00a6a1': 'Baby Care',
      '818126ef-4e20-4312-ae6a-38977c2da18e': 'Beverages',
      '52e400a2-d0dc-4fee-9a39-f39506dfa09a': 'Electronics',
      '4fe05fb9-6efb-4d05-a1a7-8d57d8c442cc': 'Fresh Products',
      '9f0f491e-0d4c-4f72-96af-59639ed3c286': 'Grocery',
      '96efeebd-a025-4f53-bdc9-add3d2105167': 'Home Care',
      'c2059636-9a5b-44d8-9706-a7966982ae84': 'Personal Care',
      '31df26ea-82f9-4a44-8b7b-0809f48eb854': 'Snacks',
      '76ac3496-3884-47d5-83e3-2d8dc01de628': 'Food',
    };
    categoriesList.forEach((c) => {
      map[c.id] = c.name;
    });
    return map;
  }, [categoriesList]);

  // Handle Add Product Submit via POST /api/products
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim()) return;

    setIsSubmitting(true);
    setModalError(null);
    setErrorMessage(null);
    setSuccessMessage(null);

    const costNum = parseFloat(purchasePrice) || 0;
    const priceNum = parseFloat(sellingPrice) || 0;
    const stockNum = parseInt(initialStock, 10) || 0;

    const targetBusinessId = currentBusinessId || '66946b56-8be2-41c6-a2a7-fc7388b08c70';

    let backendImageUrl: string | undefined = undefined;
    let localDataUrl: string | null = null;

    if (productImage.trim()) {
      if (productImage.startsWith('http://') || productImage.startsWith('https://')) {
        // Direct URL / Cloudinary preset: safe for PostgreSQL VARCHAR(255)
        backendImageUrl = productImage.trim().substring(0, 255);
      } else if (productImage.startsWith('data:image')) {
        // Base64 from local file upload: Keep locally to prevent "value too long for type character varying(255)"
        localDataUrl = productImage;
      }
    }

    const payload = {
      business_id: targetBusinessId,
      category_id: categoryId,
      product_name: productName.trim(),
      barcode_number: barcodeNumber.trim() || undefined,
      purchase_price: costNum,
      selling_price: priceNum,
      quantity: stockNum,
      product_image: backendImageUrl,
    };

    try {
      const res = await createProduct(payload);

      if (res.success && res.data) {
        // If user uploaded a local image, save to browser storage and link to product
        if (localDataUrl) {
          saveLocalProductImage(res.data.id, localDataUrl);
          if (res.data.barcode_number) {
            saveLocalProductImage(res.data.barcode_number, localDataUrl);
          }
          res.data.product_image = localDataUrl;
        }

        setSuccessMessage(`Product "${res.data.product_name}" created successfully!`);

        // Only add to table if it belongs to this active business
        if (res.data.business_id === targetBusinessId) {
          setProductsList((prev) => [res.data!, ...prev]);
        }

        // Reset form
        setProductName('');
        setBarcodeNumber('');
        setPurchasePrice('4');
        setSellingPrice('5');
        setInitialStock('100');
        setProductImage('');
        setModalError(null);
        setIsAddProductOpen(false);

        // Auto-dismiss success message after 4 seconds
        setTimeout(() => setSuccessMessage(null), 4000);
      } else {
        setModalError(res.message || 'Failed to create product on backend.');
      }
    } catch (err: any) {
      console.error('Create product error:', err);
      setModalError(err?.message || 'Network error occurred while saving product.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Category filter tabs matching reference
  const filterCategories = ['All Products', 'Baby Care', 'Beverages', 'Food', 'More'];

  // Filter products by search query and category
  const filteredProducts = productsList.filter((prod) => {
    const catName = (categoryMap[prod.category_id] || prod.category_id || '').toLowerCase();
    const matchesSearch =
      prod.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (prod.barcode_number && prod.barcode_number.includes(searchQuery)) ||
      catName.includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedCategory !== 'All Products') {
      if (selectedCategory === 'More') {
        return !['Baby Care', 'Beverages', 'Food'].includes(categoryMap[prod.category_id]);
      }
      return catName.includes(selectedCategory.toLowerCase());
    }
    return true;
  });

  const totalRows = filteredProducts.length;
  const paginatedProducts = filteredProducts.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const formatPrice = (val: string | number) => {
    const num = typeof val === 'number' ? val : parseFloat(val) || 0;
    return num.toLocaleString('en-IN');
  };

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
            fontSize: '13px',
            fontWeight: 600,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={18} style={{ color: '#10b981' }} />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} style={{ background: 'transparent', border: 'none', color: '#065f46', cursor: 'pointer' }}>
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
            fontSize: '13px',
            fontWeight: 600,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={18} style={{ color: '#ef4444' }} />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} style={{ background: 'transparent', border: 'none', color: '#991b1b', cursor: 'pointer' }}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* Search & Category Filter Section */}
      <div
        className="card-shadow"
        style={{
          padding: '16px 20px',
          borderRadius: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          background: '#ffffff',
        }}
      >
        {/* Search Bar & Add Button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, maxWidth: '500px' }}>
            <div className="input-group" style={{ flex: 1 }}>
              <Search className="input-icon" size={18} />
              <input
                type="text"
                className="input-field"
                placeholder="Search product name / barcode / category..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            {/* Live API Refresh Button */}
            <button
              onClick={() => fetchAllData(true)}
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
                flexShrink: 0,
              }}
              title="Refresh products from API"
            >
              <RotateCw
                size={16}
                style={{
                  animation: isRefreshing ? 'spin 1s linear infinite' : 'none',
                  color: isRefreshing ? '#2563eb' : '#64748b',
                }}
              />
            </button>
          </div>

          <button
            onClick={() => setIsAddProductOpen(true)}
            className="btn-primary"
            style={{ padding: '9px 18px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={16} />
            <span>+ Add Product</span>
          </button>
        </div>

        {/* Category Filter Pills */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          {filterCategories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setPage(1);
                }}
                style={{
                  padding: '6px 16px',
                  borderRadius: '9999px',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  background: isActive ? '#1d4ed8' : '#ffffff',
                  color: isActive ? '#ffffff' : '#475569',
                  border: `1.5px solid ${isActive ? '#1d4ed8' : '#e2e8f0'}`,
                  boxShadow: isActive ? '0 2px 8px rgba(29, 78, 216, 0.25)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Business Store Filter Indicator */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 18px',
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          flexWrap: 'wrap',
          gap: '10px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              width: '9px',
              height: '9px',
              borderRadius: '50%',
              background: '#10b981',
              boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.2)',
            }}
          />
          <span style={{ fontSize: '13px', color: '#64748b' }}>Current Store Inventory:</span>
          <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a' }}>
            {activeWorkspace?.name || 'My Store'}
          </span>
          <span
            style={{
              fontSize: '10.5px',
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
        </div>

        <div style={{ fontSize: '12.5px', color: '#64748b', fontWeight: 600 }}>
          {filteredProducts.length} {filteredProducts.length === 1 ? 'Product Listed' : 'Products Listed'}
        </div>
      </div>

      {/* Products Table Card */}
      <div className="card-shadow" style={{ borderRadius: '16px', overflow: 'hidden', background: '#ffffff' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="app-table">
            <thead>
              <tr>
                <th style={{ width: '70px' }}>#</th>
                <th>Product</th>
                <th>Category</th>
                <th>Stock</th>
                <th>Cost</th>
                <th>Price</th>
                <th style={{ textAlign: 'center', width: '90px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '48px', color: '#64748b' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                      <Loader2 size={26} style={{ animation: 'spin 1s linear infinite', color: '#2563eb' }} />
                      <span style={{ fontSize: '13.5px', fontWeight: 600 }}>
                        Loading products for {activeWorkspace?.name || 'store'}...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '48px 20px', color: '#64748b' }}>
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
                        <Package size={28} />
                      </div>
                      <div style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b' }}>
                        No products found for {activeWorkspace?.name || 'this store'}
                      </div>
                      <p style={{ fontSize: '12.5px', color: '#64748b', maxWidth: '380px', margin: 0 }}>
                        This business does not have any products yet. Products from other stores are not shown here.
                      </p>
                      <button
                        onClick={() => setIsAddProductOpen(true)}
                        className="btn-primary"
                        style={{ marginTop: '6px', padding: '8px 18px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        <Plus size={16} />
                        <span>+ Add Your First Product</span>
                      </button>
                    </div>
                  </td>
                </tr>

              ) : (
                paginatedProducts.map((prod, idx) => {
                  const itemIndex = (page - 1) * rowsPerPage + idx + 1;
                  const catLabel = categoryMap[prod.category_id] || 'Fresh Products';
                  const isLowStock = (prod.quantity ?? 0) < 50;

                  return (
                    <tr key={prod.id}>
                      <td style={{ fontWeight: 600, color: '#64748b' }}>{itemIndex}</td>

                      {/* Product Name & Image/Barcode */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {(() => {
                            const localImg = getLocalProductImage(prod.id) || (prod.barcode_number ? getLocalProductImage(prod.barcode_number) : null);
                            const displayImg = localImg || prod.product_image;

                            return displayImg ? (
                              <img
                                src={displayImg}
                                alt={prod.product_name}
                                style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #e2e8f0' }}
                              />
                            ) : (
                              <div
                                style={{
                                  width: '36px',
                                  height: '36px',
                                  borderRadius: '8px',
                                  background: '#eff6ff',
                                  color: '#2563eb',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontWeight: 700,
                                  fontSize: '12px',
                                  textTransform: 'uppercase',
                                }}
                              >
                                {prod.product_name.substring(0, 2)}
                              </div>
                            );
                          })()}
                          <div>
                            <div style={{ fontWeight: 600, color: '#0f172a' }}>{prod.product_name}</div>
                            {prod.barcode_number && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10.5px', color: '#64748b' }}>
                                <Barcode size={12} />
                                <span>{prod.barcode_number}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category Badge */}
                      <td>
                        <span
                          style={{
                            fontSize: '11.5px',
                            fontWeight: 600,
                            color: '#2563eb',
                            background: '#eff6ff',
                            padding: '3px 10px',
                            borderRadius: '6px',
                            display: 'inline-block',
                          }}
                        >
                          {catLabel}
                        </span>
                      </td>

                      {/* Stock Quantity */}
                      <td style={{ fontWeight: 600, color: isLowStock ? '#d97706' : '#166534' }}>
                        {prod.quantity ?? 0}
                      </td>

                      {/* Cost */}
                      <td style={{ color: '#64748b' }}>₹ {formatPrice(prod.purchase_price)}</td>

                      {/* Selling Price */}
                      <td style={{ fontWeight: 700, color: '#0f172a' }}>₹ {formatPrice(prod.selling_price)}</td>

                      {/* Actions */}
                      <td style={{ textAlign: 'center', position: 'relative' }}>
                        <button
                          onClick={() => setActiveMenuId(activeMenuId === prod.id ? null : prod.id)}
                          style={{
                            padding: '6px',
                            borderRadius: '6px',
                            color: '#64748b',
                            background: activeMenuId === prod.id ? '#f1f5f9' : 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                          }}
                        >
                          <MoreHorizontal size={18} />
                        </button>

                        {activeMenuId === prod.id && (
                          <div
                            style={{
                              position: 'absolute',
                              right: '20px',
                              top: '80%',
                              background: '#ffffff',
                              border: '1px solid #e2e8f0',
                              borderRadius: '10px',
                              boxShadow: '0 10px 20px -5px rgba(0,0,0,0.15)',
                              padding: '6px',
                              zIndex: 30,
                              minWidth: '120px',
                              textAlign: 'left',
                            }}
                          >
                            <button
                              onClick={() => {
                                alert(`Edit: ${prod.product_name}`);
                                setActiveMenuId(null);
                              }}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '6px 8px',
                                fontSize: '12px',
                                color: '#334155',
                                width: '100%',
                                borderRadius: '6px',
                                border: 'none',
                                background: 'transparent',
                                cursor: 'pointer',
                              }}
                            >
                              <Edit size={14} /> Edit
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Delete product "${prod.product_name}"?`)) {
                                  setProductsList((prev) => prev.filter((p) => p.id !== prod.id));
                                }
                                setActiveMenuId(null);
                              }}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '6px 8px',
                                fontSize: '12px',
                                color: '#ef4444',
                                width: '100%',
                                borderRadius: '6px',
                                border: 'none',
                                background: 'transparent',
                                cursor: 'pointer',
                              }}
                            >
                              <Trash2 size={14} /> Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination & Add Product Footer */}
        <div
          style={{
            padding: '12px 20px',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#ffffff',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', fontSize: '12.5px', color: '#64748b' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>Rows per page:</span>
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setPage(1);
                }}
                style={{
                  padding: '3px 8px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  fontSize: '12px',
                  background: '#f8fafc',
                }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </div>

            <span>
              {totalRows === 0 ? '0' : `${(page - 1) * rowsPerPage + 1}-${Math.min(page * rowsPerPage, totalRows)}`} of{' '}
              {totalRows}
            </span>

            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                style={{
                  padding: '4px 8px',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                  color: page === 1 ? '#cbd5e1' : '#334155',
                  cursor: page === 1 ? 'not-allowed' : 'pointer',
                }}
              >
                <ChevronLeft size={16} />
              </button>
              <button
                disabled={page * rowsPerPage >= totalRows}
                onClick={() => setPage((p) => p + 1)}
                style={{
                  padding: '4px 8px',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                  color: page * rowsPerPage >= totalRows ? '#cbd5e1' : '#334155',
                  cursor: page * rowsPerPage >= totalRows ? 'not-allowed' : 'pointer',
                }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <button
            onClick={() => setIsAddProductOpen(true)}
            className="btn-primary"
            style={{ padding: '8px 16px', fontSize: '13px' }}
          >
            <Plus size={16} />
            <span>+ Add Product</span>
          </button>
        </div>
      </div>

      {/* Add Product Modal (Connected to POST /api/products) */}
      {isAddProductOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ padding: '24px', maxWidth: '480px' }}>
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
                  <Package size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0f172a', margin: 0 }}>Add New Product</h3>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>Directly syncs to live API server</span>
                </div>
              </div>

              <button
                onClick={() => setIsAddProductOpen(false)}
                style={{ color: '#64748b', background: 'transparent', border: 'none', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Modal Error Alert if saving fails */}
              {modalError && (
                <div
                  className="animate-fade"
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#991b1b',
                    fontSize: '12.5px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <AlertCircle size={16} style={{ color: '#dc2626', flexShrink: 0 }} />
                  <span>{modalError}</span>
                </div>
              )}

              {/* Product Image Option (Presets / Upload / URL) */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155' }}>
                    Product Image (Optional)
                  </label>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      type="button"
                      onClick={() => setImageInputMode('preset')}
                      style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: '4px',
                        border: 'none',
                        background: imageInputMode === 'preset' ? '#2563eb' : '#f1f5f9',
                        color: imageInputMode === 'preset' ? '#fff' : '#64748b',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px',
                      }}
                    >
                      <Sparkles size={11} />
                      <span>Presets</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageInputMode('upload')}
                      style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: '4px',
                        border: 'none',
                        background: imageInputMode === 'upload' ? '#2563eb' : '#f1f5f9',
                        color: imageInputMode === 'upload' ? '#fff' : '#64748b',
                        cursor: 'pointer',
                      }}
                    >
                      Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageInputMode('url')}
                      style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: '4px',
                        border: 'none',
                        background: imageInputMode === 'url' ? '#2563eb' : '#f1f5f9',
                        color: imageInputMode === 'url' ? '#fff' : '#64748b',
                        cursor: 'pointer',
                      }}
                    >
                      URL
                    </button>
                  </div>
                </div>

                {/* Mode 1: Cloudinary Presets from Store */}
                {imageInputMode === 'preset' && (
                  <div>
                    <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '6px' }}>
                      {POPULAR_IMAGE_PRESETS.map((preset) => {
                        const isSelected = productImage === preset.url;
                        return (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => setProductImage(preset.url)}
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '6px 8px',
                              borderRadius: '10px',
                              border: `2px solid ${isSelected ? '#2563eb' : '#e2e8f0'}`,
                              background: isSelected ? '#eff6ff' : '#fff',
                              cursor: 'pointer',
                              minWidth: '66px',
                              flexShrink: 0,
                            }}
                          >
                            <img
                              src={preset.url}
                              alt={preset.name}
                              style={{ width: '38px', height: '38px', borderRadius: '6px', objectFit: 'cover' }}
                            />
                            <span style={{ fontSize: '10px', fontWeight: 600, color: isSelected ? '#1d4ed8' : '#334155', textAlign: 'center', whiteSpace: 'nowrap' }}>
                              {preset.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    {productImage && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                        <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: 600 }}>✓ Selected preset</span>
                        <button
                          type="button"
                          onClick={() => setProductImage('')}
                          style={{ fontSize: '11px', color: '#ef4444', background: 'transparent', border: 'none', cursor: 'pointer' }}
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Mode 2: Local File Upload */}
                {imageInputMode === 'upload' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {productImage ? (
                      <div style={{ position: 'relative', width: '54px', height: '54px', borderRadius: '10px', overflow: 'hidden', border: '1.5px solid #3b82f6', flexShrink: 0 }}>
                        <img src={productImage} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button
                          type="button"
                          onClick={() => setProductImage('')}
                          style={{
                            position: 'absolute',
                            top: '2px',
                            right: '2px',
                            background: 'rgba(0,0,0,0.65)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '50%',
                            width: '16px',
                            height: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '10px',
                            cursor: 'pointer',
                          }}
                          title="Remove"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div
                        style={{
                          width: '54px',
                          height: '54px',
                          borderRadius: '10px',
                          background: '#f8fafc',
                          border: '1.5px dashed #cbd5e1',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#94a3b8',
                          flexShrink: 0,
                        }}
                      >
                        <ImageIcon size={22} />
                      </div>
                    )}

                    <div style={{ flex: 1 }}>
                      <input
                        type="file"
                        id="product-image-file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handleImageFileChange}
                      />
                      <label
                        htmlFor="product-image-file"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          background: '#f1f5f9',
                          color: '#334155',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          border: '1px solid #cbd5e1',
                        }}
                      >
                        <Upload size={14} />
                        <span>{productImage ? 'Change Image' : 'Choose File / Photo'}</span>
                      </label>
                      <span style={{ display: 'block', fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                        PNG, JPG, WEBP supported
                      </span>
                    </div>
                  </div>
                )}

                {/* Mode 3: Direct Web Image URL */}
                {imageInputMode === 'url' && (
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {productImage && (
                      <img
                        src={productImage}
                        alt="Preview"
                        style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #e2e8f0', flexShrink: 0 }}
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    )}
                    <div style={{ position: 'relative', flex: 1 }}>
                      <LinkIcon size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                      <input
                        type="url"
                        placeholder="https://example.com/product.jpg"
                        className="input-field"
                        style={{ paddingLeft: '32px', height: '38px', fontSize: '12.5px' }}
                        value={productImage}
                        onChange={(e) => setProductImage(e.target.value)}
                      />
                    </div>
                    {productImage && (
                      <button
                        type="button"
                        onClick={() => setProductImage('')}
                        style={{ padding: '6px 10px', background: '#f1f5f9', border: 'none', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', color: '#64748b' }}
                      >
                        Clear
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Product Name */}
              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. balaji wafers"
                  className="input-field"
                  style={{ paddingLeft: '14px' }}
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                />
              </div>

              {/* Category & Barcode */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>
                    Category *
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="input-field"
                    style={{ paddingLeft: '12px', background: '#fff' }}
                  >
                    {categoriesList.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>
                    Barcode Number
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Barcode
                      size={15}
                      style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
                    />
                    <input
                      type="text"
                      placeholder="e.g. 8906010502232"
                      className="input-field"
                      style={{ paddingLeft: '36px' }}
                      value={barcodeNumber}
                      onChange={(e) => setBarcodeNumber(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Purchase Price & Selling Price */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>
                    Purchase Price (Cost ₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    step="any"
                    className="input-field"
                    style={{ paddingLeft: '14px' }}
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>
                    Selling Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    step="any"
                    className="input-field"
                    style={{ paddingLeft: '14px' }}
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(e.target.value)}
                  />
                </div>
              </div>

              {/* Stock Quantity */}
              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Initial Stock Quantity
                </label>
                <input
                  type="number"
                  min={0}
                  className="input-field"
                  style={{ paddingLeft: '14px' }}
                  value={initialStock}
                  onChange={(e) => setInitialStock(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setIsAddProductOpen(false)}
                  className="btn-secondary"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary"
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                      <span>Saving Product...</span>
                    </>
                  ) : (
                    <span>Save to Store</span>
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
