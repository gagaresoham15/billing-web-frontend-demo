import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { BillMasterLogo } from '../../components/common/BillMasterLogo';
import { getBusinesses, createBusiness, getUserIdFromToken, type ApiBusiness } from '../../api/business';
import type { Workspace } from '../../types';
import {
  ChevronRight,
  Plus,
  Store,
  Sparkles,
  X,
  Loader2,
  AlertCircle,
} from 'lucide-react';

export const SelectBusiness: React.FC = () => {
  const { workspaces, setWorkspaces, setActiveWorkspace, setCurrentScreen, user, updateUser } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('Grocery Store');
  const [address, setAddress] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Fetch businesses from GET /api/businesses (Only logged-in user's businesses)
  const loadBusinesses = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getBusinesses();
      if (response.success && Array.isArray(response.data)) {
        const loggedInUserId = getUserIdFromToken();
        const loggedInEmail = user.email || localStorage.getItem('billmaster_user_email');

        // STRICT FILTER: Only show businesses belonging to the logged-in user
        const userBusinesses = response.data.filter((b: ApiBusiness) => {
          if (loggedInUserId && (b.owner_id === loggedInUserId || b.owner?.id === loggedInUserId)) {
            return true;
          }
          if (loggedInEmail && b.owner?.email && b.owner.email.toLowerCase() === loggedInEmail.toLowerCase()) {
            return true;
          }
          return false;
        });

        if (userBusinesses.length > 0) {
          const mappedWorkspaces: Workspace[] = userBusinesses.map((b: ApiBusiness, idx: number) => ({
            id: b.id,
            name: b.business_name,
            category: b.business_type || 'Grocery Store',
            address: b.address || '',
            tag: (b.business_type || 'Grocery Store').toUpperCase(),
            logo: b.business_logo,
            iconBg: idx % 2 === 0 ? '#ec4899' : '#3b82f6',
            isActive: idx === 0,
          }));

          setWorkspaces(mappedWorkspaces);
          setActiveWorkspace(mappedWorkspaces[0]);

          // Sync owner details
          const firstWithOwner = userBusinesses.find((b) => b.owner);
          if (firstWithOwner?.owner) {
            updateUser({
              name: firstWithOwner.owner.name,
              email: firstWithOwner.owner.email,
              phone: firstWithOwner.owner.phone,
              role: 'OWNER',
            });
          }
        } else {
          // If no businesses yet for this specific user
          setWorkspaces([]);
        }
      }
    } catch (err: any) {
      console.error('Failed to load businesses:', err);
      setError('Could not fetch workspaces from server.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBusinesses();
  }, []);

  const handleSelect = (ws: Workspace) => {
    setActiveWorkspace(ws);
    setCurrentScreen('4-dashboard');
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim()) return;

    setIsCreating(true);
    setModalError(null);

    try {
      const response = await createBusiness({
        business_name: businessName.trim(),
        business_type: businessType,
        address: address.trim() || 'Main Market Road',
      });

      if (response.success && response.data) {
        const newWs: Workspace = {
          id: response.data.id,
          name: response.data.business_name,
          category: response.data.business_type || businessType,
          address: response.data.address || address,
          tag: (response.data.business_type || businessType).toUpperCase(),
          logo: response.data.business_logo,
          iconBg: '#10b981',
          isActive: true,
        };

        // Add to workspaces list
        setWorkspaces([newWs, ...workspaces]);
        setActiveWorkspace(newWs);

        setIsAddOpen(false);
        setBusinessName('');
        setAddress('');

        // Direct transition into dashboard with new workspace
        setCurrentScreen('4-dashboard');
      } else {
        setModalError(response.message || 'Failed to create business workspace.');
      }
    } catch (err: any) {
      setModalError(err.message || 'Error communicating with server.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card animate-fade" style={{ maxWidth: '480px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <BillMasterLogo size="lg" align="center" />
          <h2
            style={{
              fontSize: '24px',
              fontWeight: 800,
              color: '#0f172a',
              marginTop: '16px',
              marginBottom: '6px',
              letterSpacing: '-0.02em',
            }}
          >
            Welcome Back!
          </h2>
          <p style={{ fontSize: '13px', color: '#64748b' }}>
            Select a business workspace to manage your daily billing &amp; stock.
          </p>
        </div>

        {/* Warning / Notice alert if any */}
        {error && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 12px',
              borderRadius: '10px',
              background: '#fffbeb',
              border: '1px solid #fef3c7',
              color: '#b45309',
              fontSize: '12px',
              marginBottom: '16px',
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Loading Spinner */}
        {isLoading ? (
          <div
            style={{
              padding: '40px 0',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              color: '#64748b',
            }}
          >
            <Loader2 size={28} className="animate-spin" style={{ color: '#2563eb', animation: 'spin 1s linear infinite' }} />
            <span style={{ fontSize: '13px', fontWeight: 500 }}>Fetching your workspaces...</span>
          </div>
        ) : workspaces.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '36px 16px',
              background: '#f8fafc',
              borderRadius: '16px',
              border: '1.5px dashed #cbd5e1',
              marginBottom: '20px',
            }}
          >
            <Store size={40} style={{ color: '#94a3b8', margin: '0 auto 10px' }} />
            <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
              No Workspaces Found
            </h4>
            <p style={{ fontSize: '12.5px', color: '#64748b' }}>
              You don't have any registered workspaces yet. Click <strong>"+ Add New Business"</strong> below to create your store!
            </p>
          </div>
        ) : (
          /* Workspace List */
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              marginBottom: '24px',
              maxHeight: '360px',
              overflowY: 'auto',
              paddingRight: '4px',
            }}
          >
            {workspaces.map((ws, idx) => (
              <div
                key={ws.id}
                onClick={() => handleSelect(ws)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 16px',
                  borderRadius: '14px',
                  border: '1.5px solid #e2e8f0',
                  background: '#ffffff',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#3b82f6';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 6px 14px rgba(37,99,235,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.03)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  {/* Circular Avatar / Store Logo */}
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '50%',
                      background:
                        idx % 2 === 0
                          ? 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)'
                          : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      fontWeight: 700,
                      fontSize: '18px',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.12)',
                      flexShrink: 0,
                      overflow: 'hidden',
                    }}
                  >
                    {ws.logo && ws.logo.startsWith('http') ? (
                      <img
                        src={ws.logo}
                        alt={ws.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : idx % 2 === 0 ? (
                      <Sparkles size={22} />
                    ) : (
                      <Store size={22} />
                    )}
                  </div>

                  {/* Info */}
                  <div>
                    <h4
                      style={{
                        fontSize: '15px',
                        fontWeight: 700,
                        color: '#0f172a',
                        marginBottom: '3px',
                      }}
                    >
                      {ws.name}
                    </h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          color: '#2563eb',
                          background: '#eff6ff',
                          padding: '1px 7px',
                          borderRadius: '4px',
                          fontWeight: 600,
                        }}
                      >
                        {ws.category}
                      </span>
                      {ws.address && (
                        <span style={{ fontSize: '11.5px', color: '#64748b' }}>
                          • {ws.address}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <ChevronRight size={20} style={{ color: '#94a3b8' }} />
              </div>
            ))}
          </div>
        )}

        {/* Add New Business Button (Exact match with Image 1) */}
        <button
          onClick={() => setIsAddOpen(true)}
          className="btn-outline"
          style={{
            width: '100%',
            borderColor: '#93c5fd',
            background: '#f8faff',
            padding: '12px',
            fontSize: '14px',
          }}
        >
          <Plus size={18} />
          <span>+ Add New Business</span>
        </button>
      </div>

      {/* Register New Business Workspace Modal (Exact match with Image 2) */}
      {isAddOpen && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade" style={{ padding: '24px', maxWidth: '460px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '18px',
              }}
            >
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
                Register New Business Workspace
              </h3>
              <button
                onClick={() => setIsAddOpen(false)}
                style={{ color: '#64748b', padding: '4px' }}
                disabled={isCreating}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Error Alert */}
            {modalError && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#b91c1c',
                  fontSize: '12.5px',
                  marginBottom: '14px',
                }}
              >
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Field 1: Business / Store Name */}
              <div>
                <label
                  style={{
                    fontSize: '12.5px',
                    fontWeight: 600,
                    color: '#334155',
                    display: 'block',
                    marginBottom: '6px',
                  }}
                >
                  Business / Store Name *
                </label>
                <input
                  type="text"
                  required
                  className="input-field"
                  style={{ paddingLeft: '14px' }}
                  placeholder="e.g. Royal General Stores"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  disabled={isCreating}
                />
              </div>

              {/* Field 2: Business Category */}
              <div>
                <label
                  style={{
                    fontSize: '12.5px',
                    fontWeight: 600,
                    color: '#334155',
                    display: 'block',
                    marginBottom: '6px',
                  }}
                >
                  Business Category
                </label>
                <select
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: '14px', background: '#fff' }}
                  disabled={isCreating}
                >
                  <option value="Grocery Store">Grocery Store</option>
                  <option value="Hotel">Hotel</option>
                  <option value="Textile & Garments">Textile &amp; Garments</option>
                  <option value="Electronics & Mobile">Electronics &amp; Mobile</option>
                  <option value="Pharmacy">Pharmacy</option>
                  <option value="Restaurant & Cafe">Restaurant &amp; Cafe</option>
                </select>
              </div>

              {/* Field 3: Store Location / Address */}
              <div>
                <label
                  style={{
                    fontSize: '12.5px',
                    fontWeight: 600,
                    color: '#334155',
                    display: 'block',
                    marginBottom: '6px',
                  }}
                >
                  Store Location / Address
                </label>
                <input
                  type="text"
                  className="input-field"
                  style={{ paddingLeft: '14px' }}
                  placeholder="e.g. Shop 4, Main Bazar"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  disabled={isCreating}
                />
              </div>

              {/* Buttons: Cancel & Create & Enter */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="btn-secondary"
                  style={{ flex: 1, padding: '12px' }}
                  disabled={isCreating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ flex: 1, padding: '12px' }}
                  disabled={isCreating}
                >
                  {isCreating ? (
                    <>
                      <Loader2 size={16} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <span>Create &amp; Enter</span>
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
