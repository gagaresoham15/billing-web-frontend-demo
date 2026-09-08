import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { signupUser } from '../../api/auth';
import {
  ArrowLeft,
  User,
  Camera,
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ChevronDown,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export const SignUp: React.FC = () => {
  const { setCurrentScreen, updateUser } = useApp();

  // Initial state matching user screenshot
  const [name, setName] = useState('Darshan Jadhav');
  const [phone, setPhone] = useState('8668965024');
  const [email, setEmail] = useState('dj4690928@gmail.com');
  const [password, setPassword] = useState('darshan123');
  const [role, setRole] = useState('Owner');
  const [showPassword, setShowPassword] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          setPhotoUrl(uploadEvent.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    // Clean phone number (extract digits)
    const cleanedPhone = phone.replace(/\D/g, '').slice(-10);

    try {
      const response = await signupUser({
        name: name.trim(),
        email: email.trim(),
        phone: cleanedPhone || phone.trim(),
        password: password.trim(),
        role: role.toUpperCase(),
      });

      if (response.success && response.data?.access_token) {
        localStorage.setItem('billmaster_access_token', response.data.access_token);
        localStorage.setItem('billmaster_refresh_token', response.data.refresh_token);

        updateUser({
          name: name.trim(),
          email: email.trim(),
          phone: cleanedPhone || phone.trim(),
          role: role.toUpperCase() as any,
          avatarUrl: photoUrl || undefined,
        });

        setSuccessMessage(response.message || 'User registered successfully! Redirecting...');

        setTimeout(() => {
          setCurrentScreen('3-select-business');
        }, 800);
      } else {
        setErrorMessage(response.message || 'Validation error. Please check your details.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Server error. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page-container" style={{ padding: '24px 16px' }}>
      <div
        className="auth-card animate-fade"
        style={{
          maxWidth: '440px',
          padding: '24px 24px 32px',
          position: 'relative',
        }}
      >
        {/* Top Header Bar with Back Arrow (Exact match with user screenshot) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '20px',
            position: 'relative',
          }}
        >
          <button
            type="button"
            onClick={() => setCurrentScreen('1-signin-password')}
            style={{
              padding: '6px',
              borderRadius: '8px',
              color: '#1e293b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Back to Sign In"
          >
            <ArrowLeft size={22} />
          </button>
          <h2
            style={{
              flex: 1,
              textAlign: 'center',
              fontSize: '18px',
              fontWeight: 700,
              color: '#0f172a',
              marginRight: '28px',
            }}
          >
            Create Account
          </h2>
        </div>

        {/* Profile Photo Uploader (Circular avatar with camera badge) */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
          <label
            style={{
              position: 'relative',
              width: '92px',
              height: '92px',
              borderRadius: '50%',
              background: '#e0f2fe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              overflow: 'visible',
            }}
          >
            {photoUrl ? (
              <img
                src={photoUrl}
                alt="Profile"
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
              />
            ) : (
              <User size={48} style={{ color: '#0284c7' }} />
            )}

            {/* Camera badge icon */}
            <div
              style={{
                position: 'absolute',
                bottom: '2px',
                right: '2px',
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: '#1e3a8a',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid #ffffff',
                boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
              }}
            >
              <Camera size={14} />
            </div>

            <input
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handlePhotoUpload}
            />
          </label>
          <span style={{ fontSize: '12px', color: '#64748b', marginTop: '10px' }}>
            Tap to add a profile photo (optional)
          </span>
        </div>

        {/* Error Alert Box */}
        {errorMessage && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              borderRadius: '10px',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#b91c1c',
              fontSize: '12.5px',
              marginBottom: '16px',
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Success Alert Box */}
        {successMessage && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              borderRadius: '10px',
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              color: '#15803d',
              fontSize: '12.5px',
              fontWeight: 600,
              marginBottom: '16px',
            }}
          >
            <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form Fields matching the screenshot */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* 1. Full Name */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '12.5px',
                fontWeight: 600,
                color: '#334155',
                marginBottom: '6px',
              }}
            >
              Full Name
            </label>
            <div className="input-group">
              <User className="input-icon" size={18} />
              <input
                type="text"
                required
                className="input-field"
                placeholder="Darshan Jadhav"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* 2. Mobile Number */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '12.5px',
                fontWeight: 600,
                color: '#334155',
                marginBottom: '6px',
              }}
            >
              Mobile Number
            </label>
            <div className="input-group">
              <Phone className="input-icon" size={18} />
              <input
                type="tel"
                required
                maxLength={12}
                className="input-field"
                placeholder="8668965024"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* 3. Email Address */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '12.5px',
                fontWeight: 600,
                color: '#334155',
                marginBottom: '6px',
              }}
            >
              Email Address
            </label>
            <div className="input-group">
              <Mail className="input-icon" size={18} />
              <input
                type="email"
                required
                className="input-field"
                placeholder="dj4690928@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* 4. Password */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '12.5px',
                fontWeight: 600,
                color: '#334155',
                marginBottom: '6px',
              }}
            >
              Password
            </label>
            <div className="input-group">
              <Lock className="input-icon" size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                className="input-field"
                placeholder="••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingRight: '42px' }}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  color: '#94a3b8',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* 5. I am a (Role selector) */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 700,
                color: '#0f172a',
                marginBottom: '6px',
              }}
            >
              I am a
            </label>
            <div style={{ position: 'relative' }}>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="input-field"
                style={{
                  paddingLeft: '14px',
                  paddingRight: '36px',
                  appearance: 'none',
                  background: '#ffffff',
                  fontWeight: 600,
                }}
                disabled={isLoading}
              >
                <option value="Owner">Owner</option>
                <option value="Manager">Manager</option>
                <option value="Cashier">Cashier</option>
              </select>
              <ChevronDown
                size={18}
                style={{
                  position: 'absolute',
                  right: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#64748b',
                  pointerEvents: 'none',
                }}
              />
            </div>
          </div>

          {/* Create Account Submit Button (Matching screenshot) */}
          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', marginTop: '10px', padding: '13px', fontSize: '14px' }}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <ArrowRight size={18} />
                <span>Create Account</span>
              </>
            )}
          </button>
        </form>

        {/* Footer: Already have an account? Sign In */}
        <div
          style={{
            textAlign: 'center',
            marginTop: '20px',
            fontSize: '13px',
            color: '#64748b',
          }}
        >
          Already have an account?{' '}
          <a
            href="#signin"
            onClick={(e) => {
              e.preventDefault();
              setCurrentScreen('1-signin-password');
            }}
            style={{ color: '#1d4ed8', fontWeight: 600, textDecoration: 'none' }}
          >
            Sign In
          </a>
        </div>
      </div>
    </div>
  );
};
