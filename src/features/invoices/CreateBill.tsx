import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { getProductsByBusiness, type ApiProduct } from '../../api/products';
import {
  createBill,
  type CreateBillPayload,
  type CreateBillProductItem,
} from '../../api/bills';
import {
  FilePlus,
  Plus,
  Trash2,
  Printer,
  Receipt,
  User,
  Phone,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  ShoppingBag,
  CreditCard,
  Banknote,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import type { BillItem } from '../../types';

interface ExtendedBillItem extends BillItem {
  productId?: string;
  availableStock?: number;
}

export const CreateBill: React.FC = () => {
  const { addBill, setCurrentScreen, activeWorkspace, user } = useApp();

  const currentBusinessId =
    activeWorkspace?.id && !activeWorkspace.id.startsWith('ws-')
      ? activeWorkspace.id
      : '66946b56-8be2-41c6-a2a7-fc7388b08c70';

  const [liveProducts, setLiveProducts] = useState<ApiProduct[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Load live products strictly belonging to the active business / owner
  const loadStoreProducts = useCallback(async () => {
    setIsLoadingProducts(true);
    try {
      const res = await getProductsByBusiness(currentBusinessId);
      if (res.success && Array.isArray(res.data)) {
        const ownerProducts = res.data.filter((p) => p.business_id === currentBusinessId);
        setLiveProducts(ownerProducts);
      } else {
        setLiveProducts([]);
      }
    } catch (err) {
      console.error('Failed to load store products:', err);
      setLiveProducts([]);
    } finally {
      setIsLoadingProducts(false);
    }
  }, [currentBusinessId]);

  useEffect(() => {
    loadStoreProducts();
  }, [loadStoreProducts]);

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Online'>('Cash');

  // Product selection & items in bill
  const [items, setItems] = useState<ExtendedBillItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [customItemName, setCustomItemName] = useState('');
  const [customItemQty, setCustomItemQty] = useState(1);
  const [customItemRate, setCustomItemRate] = useState(50);

  // Success state / Thermal preview
  const [generatedBill, setGeneratedBill] = useState<{
    billNo: string;
    customer: string;
    phone: string;
    amount: number;
    payment: 'Cash' | 'Online';
    items: ExtendedBillItem[];
    date: string;
  } | null>(null);

  const addItemToBill = () => {
    setSubmitError(null);
    let name = '';
    let rate = 0;
    let prodId: string | undefined = undefined;
    let stock: number | undefined = undefined;

    if (selectedProductId) {
      const liveProd = liveProducts.find((p) => p.id === selectedProductId);
      if (liveProd) {
        name = liveProd.product_name;
        rate =
          typeof liveProd.selling_price === 'number'
            ? liveProd.selling_price
            : parseFloat(liveProd.selling_price) || 0;
        prodId = liveProd.id;
        stock = liveProd.quantity;
      }
    } else if (customItemName.trim()) {
      name = customItemName.trim();
      rate = customItemRate;
    }

    if (!name) {
      alert('Please choose an existing product from store inventory or enter an item name');
      return;
    }

    const qty = Math.max(1, customItemQty);

    if (stock !== undefined && stock <= 0) {
      const proceed = window.confirm(
        `Warning: "${name}" currently shows 0 stock in your store inventory. The server requires available stock to generate a bill. Do you still want to add it?`
      );
      if (!proceed) return;
    }

    const total = qty * rate;

    setItems((prev) => {
      const existingIndex = prev.findIndex((it) => (prodId ? it.productId === prodId : it.name === name));
      if (existingIndex > -1) {
        const updated = [...prev];
        const newQty = updated[existingIndex].qty + qty;
        updated[existingIndex] = {
          ...updated[existingIndex],
          qty: newQty,
          total: newQty * updated[existingIndex].rate,
        };
        return updated;
      }
      return [
        ...prev,
        {
          id: Date.now().toString() + Math.random().toString(36).substring(2, 5),
          name,
          qty,
          rate,
          total,
          productId: prodId,
          availableStock: stock,
        },
      ];
    });

    // Reset selector
    setSelectedProductId('');
    setCustomItemName('');
    setCustomItemQty(1);
    setCustomItemRate(50);
  };

  const updateItemQty = (id: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = Math.max(1, item.qty + delta);
            return { ...item, qty: newQty, total: newQty * item.rate };
          }
          return item;
        })
        .filter((item) => item.qty > 0)
    );
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const grandTotal = items.reduce((sum, item) => sum + item.total, 0);

  const handleSaveBill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      alert('Please add at least one item to generate bill');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    const customer = customerName.trim() || 'Walk-in Customer';
    const phone = customerPhone.trim() || '9876543210';
    const paymentTypeStr = paymentMethod.toLowerCase();

    const payload: CreateBillPayload = {
      customer_name: customer,
      phone: phone,
      business_id: currentBusinessId,
      payment_type: paymentTypeStr,
      products: items.map((it) => {
        const p: CreateBillProductItem = {
          product_name: it.name,
          quantity: it.qty,
          price: it.rate,
          amount: it.total,
          is_paid: true,
        };
        if (it.productId) {
          p.product_id = it.productId;
        }
        return p;
      }),
    };

    try {
      const res = await createBill(payload);

      if (res.success) {
        const createdData = Array.isArray(res.data) && res.data.length > 0 ? res.data[0] : null;
        const billNo = createdData?.sr_no || `MES-${Math.floor(1000 + Math.random() * 9000)}`;

        const now = new Date();
        const formattedDate = now.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        });

        const newBill = {
          billNumber: billNo,
          customer,
          mobile: phone,
          dateTime: formattedDate,
          amount: grandTotal,
          paymentMethod,
          items,
        };

        addBill(newBill);

        setGeneratedBill({
          billNo,
          customer,
          phone,
          amount: grandTotal,
          payment: paymentMethod,
          items: [...items],
          date: formattedDate,
        });

        // Refresh live products to show updated stock
        loadStoreProducts();

        // Reset customer form
        setCustomerName('');
        setCustomerPhone('');
        setItems([]);
      } else {
        setSubmitError(res.message || 'Failed to create bill. Please check product stock and details.');
      }
    } catch (err: any) {
      setSubmitError(err?.message || 'Server error occurred while creating bill.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setCustomerName('');
    setCustomerPhone('');
    setPaymentMethod('Cash');
    setItems([]);
    setSelectedProductId('');
    setCustomItemName('');
    setCustomItemQty(1);
    setCustomItemRate(50);
    setSubmitError(null);
    setGeneratedBill(null);
  };

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
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
              boxShadow: '0 4px 10px rgba(37, 99, 235, 0.25)',
            }}
          >
            <FilePlus size={22} />
          </div>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Create New Bill
            </h1>
            <p style={{ fontSize: '12.5px', color: '#64748b', margin: '2px 0 0' }}>
              Fast POS billing counter &bull; {activeWorkspace?.name || 'My Store'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleResetForm}
            className="btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', padding: '8px 14px' }}
          >
            <RefreshCw size={14} />
            <span>Reset Counter</span>
          </button>
          <button
            onClick={() => setCurrentScreen('6-sales-invoices')}
            className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', padding: '8px 16px' }}
          >
            <Receipt size={14} />
            <span>View All Bills</span>
          </button>
        </div>
      </div>

      {/* Error Alert Banner */}
      {submitError && (
        <div
          className="animate-fade"
          style={{
            padding: '14px 18px',
            borderRadius: '12px',
            background: '#fef2f2',
            border: '1.5px solid #fecaca',
            color: '#991b1b',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            boxShadow: '0 2px 6px rgba(239, 68, 68, 0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertCircle size={20} style={{ color: '#dc2626', flexShrink: 0 }} />
            <span>
              <strong>Bill Generation Error:</strong> {submitError}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setSubmitError(null)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#991b1b',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '16px',
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Grid: Form Left, Items & Summary Right */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '20px',
        }}
      >
        {/* Left Column: Customer Details & Item Adder */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Customer Info Card */}
          <div className="card-shadow" style={{ padding: '20px', borderRadius: '16px', background: '#ffffff' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={16} style={{ color: '#2563eb' }} />
              Customer Details
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>
                  Mobile Number
                </label>
                <div style={{ position: 'relative' }}>
                  <Phone
                    size={16}
                    style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
                  />
                  <input
                    type="tel"
                    placeholder="e.g. 9876543210"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="input-field"
                    style={{ paddingLeft: '38px', height: '40px', fontSize: '13.5px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>
                  Customer Name
                </label>
                <div style={{ position: 'relative' }}>
                  <User
                    size={16}
                    style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
                  />
                  <input
                    type="text"
                    placeholder="e.g. Pawan / Swaraj"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="input-field"
                    style={{ paddingLeft: '38px', height: '40px', fontSize: '13.5px' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Add Item to Bill Card */}
          <div className="card-shadow" style={{ padding: '20px', borderRadius: '16px', background: '#ffffff' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShoppingBag size={16} style={{ color: '#2563eb' }} />
              Add Items / Products
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Select from Store Inventory (Strictly Owner Products) */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>
                    Select from Store Inventory
                  </label>
                  {liveProducts.length > 0 && (
                    <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: 600 }}>
                      ● {liveProducts.length} Products
                    </span>
                  )}
                </div>
                <select
                  value={selectedProductId}
                  onChange={(e) => {
                    const pId = e.target.value;
                    setSelectedProductId(pId);
                    const liveP = liveProducts.find((p) => p.id === pId);
                    if (liveP) {
                      setCustomItemName(liveP.product_name);
                      setCustomItemRate(
                        typeof liveP.selling_price === 'number'
                          ? liveP.selling_price
                          : parseFloat(liveP.selling_price) || 0
                      );
                    } else {
                      setCustomItemName('');
                      setCustomItemRate(50);
                    }
                  }}
                  className="input-field"
                  style={{ height: '40px', fontSize: '13px', background: '#fff' }}
                  disabled={isLoadingProducts}
                >
                  <option value="">
                    {isLoadingProducts
                      ? '-- Loading Store Inventory... --'
                      : liveProducts.length === 0
                      ? '-- No Products Found for this Store --'
                      : '-- Choose Existing Product --'}
                  </option>
                  {liveProducts.map((p) => {
                    const qty = p.quantity ?? 0;
                    const isOut = qty <= 0;
                    return (
                      <option key={p.id} value={p.id}>
                        {p.product_name} - ₹{p.selling_price} {isOut ? '(Out of Stock: 0)' : `(${qty} in stock)`}
                      </option>
                    );
                  })}
                </select>

                {/* Stock Warning/Info Badge */}
                {selectedProductId && (() => {
                  const p = liveProducts.find((item) => item.id === selectedProductId);
                  if (!p) return null;
                  const isOut = (p.quantity ?? 0) <= 0;
                  return (
                    <div
                      style={{
                        marginTop: '6px',
                        padding: '6px 10px',
                        borderRadius: '8px',
                        fontSize: '11.5px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: isOut ? '#fef2f2' : '#f0fdf4',
                        color: isOut ? '#b91c1c' : '#15803d',
                        border: `1px solid ${isOut ? '#fecaca' : '#bbf7d0'}`,
                      }}
                    >
                      <span>
                        {isOut
                          ? `⚠️ "${p.product_name}" is currently Out of Stock (0). Available stock is required by server.`
                          : `✓ Available in Store: ${p.quantity} units | Selling Price: ₹${p.selling_price}`}
                      </span>
                    </div>
                  );
                })()}
              </div>

              <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '11px', fontWeight: 600 }}>OR ENTER CUSTOM ITEM</div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>
                  Item Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Daily Essentials / Snacks"
                  value={customItemName}
                  onChange={(e) => {
                    setCustomItemName(e.target.value);
                    setSelectedProductId('');
                  }}
                  className="input-field"
                  style={{ height: '40px', fontSize: '13.5px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>
                    Quantity
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={customItemQty}
                    onChange={(e) => setCustomItemQty(parseInt(e.target.value) || 1)}
                    className="input-field"
                    style={{ height: '40px', fontSize: '13.5px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>
                    Rate (₹)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={customItemRate}
                    onChange={(e) => setCustomItemRate(parseFloat(e.target.value) || 0)}
                    className="input-field"
                    style={{ height: '40px', fontSize: '13.5px' }}
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={addItemToBill}
                className="btn-primary"
                style={{
                  height: '42px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginTop: '6px',
                  fontWeight: 600,
                  fontSize: '13px',
                }}
              >
                <Plus size={16} />
                <span>Add Item to Bill (₹{customItemQty * customItemRate})</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Bill Cart & Final Invoice Action */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Bill Items List */}
          <div className="card-shadow" style={{ padding: '20px', borderRadius: '16px', background: '#ffffff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Bill Items ({items.length})
              </h2>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#2563eb' }}>
                ₹ {grandTotal.toLocaleString('en-IN')}
              </span>
            </div>

            {items.length === 0 ? (
              <div style={{ padding: '36px 16px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                <ShoppingBag size={28} style={{ margin: '0 auto 8px', opacity: 0.4, display: 'block' }} />
                No items added yet. Select a product from store inventory on the left.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {items.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      background: '#f8fafc',
                      border: '1px solid #f1f5f9',
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#1e293b' }}>
                        {item.name}
                        {item.productId && (
                          <span style={{ marginLeft: '6px', fontSize: '10.5px', background: '#e0f2fe', color: '#0369a1', padding: '1px 6px', borderRadius: '4px' }}>
                            Inventory
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '11.5px', color: '#64748b' }}>
                        ₹{item.rate} &times; {item.qty} = ₹{item.total}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#fff' }}>
                        <button
                          type="button"
                          onClick={() => updateItemQty(item.id, -1)}
                          style={{ padding: '4px 8px', fontSize: '12px', fontWeight: 700, color: '#475569' }}
                        >
                          -
                        </button>
                        <span style={{ padding: '0 8px', fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>{item.qty}</span>
                        <button
                          type="button"
                          onClick={() => updateItemQty(item.id, 1)}
                          style={{ padding: '4px 8px', fontSize: '12px', fontWeight: 700, color: '#475569' }}
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        style={{ color: '#ef4444', padding: '6px', borderRadius: '6px' }}
                        title="Remove item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Payment Mode & Checkout Button */}
          <div className="card-shadow" style={{ padding: '20px', borderRadius: '16px', background: '#ffffff' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginBottom: '14px' }}>
              Payment Mode
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
              <button
                type="button"
                onClick={() => setPaymentMethod('Cash')}
                style={{
                  padding: '12px',
                  borderRadius: '12px',
                  border: `2px solid ${paymentMethod === 'Cash' ? '#2563eb' : '#e2e8f0'}`,
                  background: paymentMethod === 'Cash' ? '#eff6ff' : '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  fontWeight: 600,
                  fontSize: '13px',
                  color: paymentMethod === 'Cash' ? '#1d4ed8' : '#64748b',
                }}
              >
                <Banknote size={18} />
                <span>Cash Payment</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('Online')}
                style={{
                  padding: '12px',
                  borderRadius: '12px',
                  border: `2px solid ${paymentMethod === 'Online' ? '#2563eb' : '#e2e8f0'}`,
                  background: paymentMethod === 'Online' ? '#eff6ff' : '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  fontWeight: 600,
                  fontSize: '13px',
                  color: paymentMethod === 'Online' ? '#1d4ed8' : '#64748b',
                }}
              >
                <CreditCard size={18} />
                <span>Online / UPI</span>
              </button>
            </div>

            {/* Total breakdown */}
            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '14px', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#64748b' }}>
                <span>Sub Total:</span>
                <span>₹ {grandTotal.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#64748b' }}>
                <span>Tax / GST:</span>
                <span>₹ 0 (Inclusive)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                <span>Grand Total:</span>
                <span style={{ color: '#2563eb' }}>₹ {grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSaveBill}
              disabled={isSubmitting || items.length === 0}
              className="btn-primary"
              style={{
                width: '100%',
                height: '46px',
                fontSize: '14px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                opacity: isSubmitting || items.length === 0 ? 0.6 : 1,
                cursor: isSubmitting || items.length === 0 ? 'not-allowed' : 'pointer',
              }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="spin" />
                  <span>Saving Bill to Database...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  <span>Save &amp; Generate Bill (₹{grandTotal})</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>


      {/* Generated Thermal Receipt Modal */}
      {generatedBill && (
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
              width: '400px',
              maxWidth: '100%',
              overflow: 'hidden',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '16px 20px',
                background: '#10b981',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '14px' }}>
                <CheckCircle2 size={18} />
                <span>Bill Generated Successfully!</span>
              </div>
              <button
                onClick={() => setGeneratedBill(null)}
                style={{ color: '#fff', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '16px' }}
              >
                ✕
              </button>
            </div>

            {/* Thermal Print Slip */}
            <div style={{ padding: '24px 20px', background: '#f8fafc' }}>
              <div
                style={{
                  background: '#ffffff',
                  border: '1px dashed #cbd5e1',
                  borderRadius: '12px',
                  padding: '20px',
                  fontFamily: 'monospace',
                }}
              >
                <div style={{ textAlign: 'center', borderBottom: '1px dashed #cbd5e1', paddingBottom: '12px' }}>
                  <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{activeWorkspace.name.toUpperCase()}</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>{activeWorkspace.address}</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Ph: {user.phone}</div>
                  <div style={{ marginTop: '8px', fontSize: '12px', fontWeight: 'bold' }}>BILL NO: {generatedBill.billNo}</div>
                  <div style={{ fontSize: '10px', color: '#64748b' }}>{generatedBill.date}</div>
                </div>

                <div style={{ padding: '10px 0', borderBottom: '1px dashed #cbd5e1', fontSize: '12px' }}>
                  <div>Customer: <strong>{generatedBill.customer}</strong></div>
                  <div>Phone: {generatedBill.phone}</div>
                  <div>Payment: <strong>{generatedBill.payment}</strong></div>
                </div>

                <div style={{ padding: '10px 0', borderBottom: '1px dashed #cbd5e1', fontSize: '12px' }}>
                  {generatedBill.items.map((it, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span>{it.name} x{it.qty}</span>
                      <span>₹{it.total}</span>
                    </div>
                  ))}
                </div>

                <div style={{ paddingTop: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 'bold' }}>
                  <span>GRAND TOTAL:</span>
                  <span>₹{generatedBill.amount}</span>
                </div>

                <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '11px', color: '#94a3b8' }}>
                  *** Thank You! Visit Again ***
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ padding: '16px 20px', display: 'flex', gap: '10px', background: '#fff' }}>
              <button
                onClick={() => window.print()}
                className="btn-primary"
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <Printer size={16} />
                <span>Print Receipt</span>
              </button>
              <button
                onClick={() => {
                  setGeneratedBill(null);
                  setCurrentScreen('6-sales-invoices');
                }}
                className="btn-secondary"
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <span>Go to Bills List</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
