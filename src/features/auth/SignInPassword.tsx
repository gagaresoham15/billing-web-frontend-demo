import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BillMasterLogo } from '../../components/common/BillMasterLogo';
import { loginUser } from '../../api/auth';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Smartphone, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

export const SignInPassword: React.FC = () => {
  const { setCurrentScreen, updateUser } = useApp();
  const [email, setEmail] = useState('dj514626@gmail.com');
  const [password, setPassword] = useState('Admin@123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await loginUser({ email, password });

      if (response.success && response.data?.access_token) {
        // Save tokens to localStorage
        localStorage.setItem('billmaster_access_token', response.data.access_token);
        localStorage.setItem('billmaster_refresh_token', response.data.refresh_token);

        // Update logged in user state
        updateUser({
          email: email,
          role: 'ADMIN',
        });

        setSuccessMessage(response.message || 'Login successful! Redirecting...');

        // Smooth transition to business selection
        setTimeout(() => {
          setCurrentScreen('3-select-business');
        }, 800);
      } else {
        setErrorMessage(response.message || 'Invalid email or password');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Server connection failed. Please check your internet connection.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card animate-fade">
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <BillMasterLogo size="lg" align="center" />
          <p
            style={{
              fontSize: '13px',
              color: '#64748b',
              marginTop: '16px',
              fontWeight: 500,
            }}
          >
            Sign in to manage your business operations
          </p>
        </div>

        {/* Error Alert Box */}
        {errorMessage && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 14px',
              borderRadius: '10px',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#b91c1c',
              fontSize: '13px',
              fontWeight: 500,
              marginBottom: '16px',
              animation: 'fadeIn 0.2s ease',
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Success Alert Box */}
        {successMessage && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 14px',
              borderRadius: '10px',
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              color: '#15803d',
              fontSize: '13px',
              fontWeight: 600,
              marginBottom: '16px',
              animation: 'fadeIn 0.2s ease',
            }}
          >
            <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Email field */}
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
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Password field */}
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
                placeholder="Password"
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

          {/* Remember me & Forgot password */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '13px',
              marginTop: '2px',
            }}
          >
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#475569' }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{
                  width: '16px',
                  height: '16px',
                  accentColor: '#1d4ed8',
                  borderRadius: '4px',
                }}
              />
              <span>Remember me</span>
            </label>
            <a
              href="#forgot"
              onClick={(e) => {
                e.preventDefault();
                alert('Password reset link sent to your registered email.');
              }}
              style={{
                color: '#1d4ed8',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Forgot Password?
            </a>
          </div>

          {/* Primary Sign In Button */}
          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', marginTop: '8px' }}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <ArrowRight size={18} />
                <span>Sign In</span>
              </>
            )}
          </button>

          {/* Sign in with OTP Button */}
          <button
            type="button"
            className="btn-outline"
            style={{ width: '100%' }}
            onClick={() => setCurrentScreen('2-signin-otp')}
            disabled={isLoading}
          >
            <Smartphone size={17} />
            <span>Sign In with OTP</span>
          </button>
        </form>

        <div
          style={{
            textAlign: 'center',
            marginTop: '24px',
            fontSize: '13px',
            color: '#64748b',
          }}
        >
          Don't have an account?{' '}
          <a
            href="#signup"
            onClick={(e) => {
              e.preventDefault();
              setCurrentScreen('signup');
            }}
            style={{ color: '#1d4ed8', fontWeight: 600, textDecoration: 'none' }}
          >
            Sign Up
          </a>
        </div>
      </div>
    </div>
  );
};
