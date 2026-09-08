import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Smartphone,
  CheckCircle,
  Edit,
  Store,
  Sparkles,
  X,
} from 'lucide-react';

export const AccountProfile: React.FC = () => {
  const { user, updateUser, workspaces, activeWorkspace, setActiveWorkspace } = useApp();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone);

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({ name, email, phone });
    setIsEditOpen(false);
  };

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '880px' }}>
      {/* Top Profile Card */}
      <div
        className="card-shadow"
        style={{
          padding: '28px',
          borderRadius: '20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          background: 'linear-gradient(180deg, #eff6ff 0%, #ffffff 40%)',
          position: 'relative',
        }}
      >
        {/* Avatar */}
        <div
          style={{
            width: '88px',
            height: '88px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #2563eb, #0ea5e9)',
            padding: '3px',
            boxShadow: '0 8px 20px rgba(37, 99, 235, 0.3)',
            marginBottom: '14px',
            overflow: 'hidden',
          }}
        >
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"
            alt="Darshan Jadhav"
            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
            onError={(e) => {
              (e.currentTarget.parentNode as HTMLElement).innerHTML =
                '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:32px;">DJ</div>';
            }}
          />
        </div>

        <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginBottom: '2px' }}>
          {user.name}
        </h2>
        <span style={{ fontSize: '13px', color: '#64748b', marginBottom: '12px' }}>
          {user.email}
        </span>

        {/* Badges */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '18px' }}>
          <span className="badge-owner">OWNER</span>
          <span className="badge-active">ACTIVE</span>
        </div>

        {/* Edit Info Button */}
        <button
          onClick={() => setIsEditOpen(true)}
          className="btn-outline"
          style={{ padding: '8px 20px', fontSize: '13px' }}
        >
          <Edit size={15} />
          <span>Edit Account Info</span>
        </button>
      </div>

      {/* Row of Contact Info Cards (Registered Mobile, Account Verification) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* Registered Mobile */}
        <div
          className="card-shadow"
          style={{ padding: '20px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}
        >
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
              flexShrink: 0,
            }}
          >
            <Smartphone size={22} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>Registered Mobile</div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
              {user.phone}
            </div>
          </div>
        </div>

        {/* Account Verification */}
        <div
          className="card-shadow"
          style={{ padding: '20px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}
        >
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: '#ecfdf5',
              color: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <CheckCircle size={22} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>Account Verification</div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#16a34a', marginTop: '2px' }}>
              ACTIVE
            </div>
          </div>
        </div>
      </div>

      {/* Workspaces & Shops Section */}
      <div className="card-shadow" style={{ padding: '24px', borderRadius: '18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>Workspaces &amp; Shops</h3>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              background: '#eff6ff',
              color: '#1d4ed8',
              padding: '3px 10px',
              borderRadius: '9999px',
            }}
          >
            {workspaces.length} Active
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {workspaces.map((ws, idx) => (
            <div
              key={ws.id}
              onClick={() => setActiveWorkspace(ws)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 18px',
                borderRadius: '14px',
                border: `1.5px solid ${ws.id === activeWorkspace.id ? '#3b82f6' : '#e2e8f0'}`,
                background: ws.id === activeWorkspace.id ? '#f8faff' : '#ffffff',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    background:
                      idx === 0
                        ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
                        : 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                  }}
                >
                  {idx === 0 ? <Store size={20} /> : <Sparkles size={20} />}
                </div>

                <div>
                  <h4 style={{ fontSize: '14.5px', fontWeight: 700, color: '#0f172a' }}>{ws.name}</h4>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>
                    Grocery Store • {ws.address}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <span className="badge-owner">OWNER</span>
                <span className="badge-active">ACTIVE</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Account Modal */}
      {isEditOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0f172a' }}>Edit Account Details</h3>
              <button onClick={() => setIsEditOpen(false)} style={{ color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  className="input-field"
                  style={{ paddingLeft: '14px' }}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  className="input-field"
                  style={{ paddingLeft: '14px' }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Registered Mobile
                </label>
                <input
                  type="tel"
                  required
                  className="input-field"
                  style={{ paddingLeft: '14px' }}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                <button type="button" onClick={() => setIsEditOpen(false)} className="btn-secondary" style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
