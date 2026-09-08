import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { BillMasterLogo } from '../../components/common/BillMasterLogo';
import { sendOtp, verifyOtp } from '../../api/auth';
import {
  Mail,
  Send,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RotateCcw,
  Edit2,
  Check,
} from 'lucide-react';

export const SignInOtp: React.FC = () => {
  const { setCurrentScreen, updateUser } = useApp();

  // Email starts with user's email or empty, but otpSent is ALWAYS false initially
  const [email, setEmail] = useState(() => {
    return localStorage.getItem('billmaster_user_email') || 'gagaresoham15@gmail.com';
  });
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (otpSent && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [otpSent, countdown]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      console.log('Calling send-otp API for:', cleanEmail);
      const response = await sendOtp(cleanEmail);
      console.log('send-otp response:', response);

      if (response.success) {
        setOtpSent(true);
        setOtpCode(['', '', '', '', '', '']);
        setSuccessMessage(
          response.message
            ? `${response.message}! Check your Inbox or Spam folder.`
            : 'OTP sent successfully! Please check your Inbox and Spam/Junk folder.'
        );
        setCountdown(30);

        // Auto focus first OTP input
        setTimeout(() => {
          document.getElementById('otp-0')?.focus();
        }, 150);
      } else {
        setErrorMessage(response.message || 'Failed to send OTP. Please check your email.');
      }
    } catch (err: any) {
      console.error('send-otp error:', err);
      setErrorMessage(err.message || 'Server connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const enteredOtp = otpCode.join('').trim();
    if (enteredOtp.length < 6) {
      setErrorMessage('Please enter all 6 digits of the OTP.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      console.log('Calling verify-otp API for:', email.trim(), enteredOtp);
      const response = await verifyOtp(email.trim(), enteredOtp);
      console.log('verify-otp response:', response);

      if (response.success) {
        if (response.data?.access_token) {
          localStorage.setItem('billmaster_access_token', response.data.access_token);
          localStorage.setItem('billmaster_refresh_token', response.data.refresh_token);
        }
        localStorage.setItem('billmaster_user_email', email.trim());

        updateUser({
          email: email.trim(),
          role: 'OWNER',
        });

        setSuccessMessage(response.message || 'OTP verified successfully! Redirecting...');

        setTimeout(() => {
          setCurrentScreen('3-select-business');
        }, 800);
      } else {
        setErrorMessage(response.message || 'Invalid email or OTP.');
      }
    } catch (err: any) {
      console.error('verify-otp error:', err);
      setErrorMessage(err.message || 'Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, val: string) => {
    // Handle paste of 6 digits
    if (val.length === 6 && /^\d+$/.test(val)) {
      setOtpCode(val.split(''));
      document.getElementById(`otp-5`)?.focus();
      return;
    }

    const cleanDigit = val.replace(/\D/g, '').slice(-1);
    const newOtp = [...otpCode];
    newOtp[index] = cleanDigit;
    setOtpCode(newOtp);

    // auto advance focus
    if (cleanDigit && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || isLoading) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await sendOtp(email.trim());
      if (response.success) {
        setSuccessMessage('New OTP sent! Please check your Inbox and Spam/Junk folder.');
        setCountdown(30);
      } else {
        setErrorMessage(response.message || 'Failed to resend OTP.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Could not resend OTP.');
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

        <form
          onSubmit={otpSent ? handleVerifyOtp : handleSendOtp}
          style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}
        >
          {/* Email field */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label
                style={{
                  fontSize: '12.5px',
                  fontWeight: 600,
                  color: '#334155',
                }}
              >
                Email Address
              </label>
              {otpSent && (
                <button
                  type="button"
                  onClick={() => {
                    setOtpSent(false);
                    setOtpCode(['', '', '', '', '', '']);
                    setSuccessMessage(null);
                    setErrorMessage(null);
                  }}
                  style={{
                    fontSize: '11.5px',
                    color: '#2563eb',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontWeight: 600,
                  }}
                >
                  <Edit2 size={12} /> Change Email
                </button>
              )}
            </div>
            <div className="input-group">
              <Mail className="input-icon" size={18} />
              <input
                type="email"
                required
                className="input-field"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={otpSent || isLoading}
              />
            </div>
          </div>

          {/* OTP Code digits (ONLY rendered when otpSent is TRUE) */}
          {otpSent && (
            <div className="animate-fade">
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '10px',
                }}
              >
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155' }}>
                  Enter 6-Digit OTP
                </label>
                <span
                  style={{
                    fontSize: '11.5px',
                    color: '#10b981',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Check size={13} /> Code sent to inbox
                </span>
              </div>

              {/* 6 Digit Input Boxes */}
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                {otpCode.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`otp-${idx}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    style={{
                      width: '46px',
                      height: '52px',
                      textAlign: 'center',
                      fontSize: '20px',
                      fontWeight: 700,
                      color: '#1e40af',
                      border: `1.5px solid ${digit ? '#2563eb' : '#cbd5e1'}`,
                      borderRadius: '10px',
                      background: digit ? '#eff6ff' : '#ffffff',
                      outline: 'none',
                      transition: 'all 0.15s ease',
                    }}
                    disabled={isLoading}
                  />
                ))}
              </div>

              <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '11.5px', color: '#64748b' }}>
                Check your <strong>Inbox</strong> or <strong>Spam / Junk</strong> folder.
              </div>

              {/* Resend OTP Timer */}
              <div style={{ textAlign: 'center', marginTop: '8px' }}>
                {countdown > 0 ? (
                  <span style={{ fontSize: '12.5px', color: '#64748b' }}>
                    Didn't receive code? Resend in <strong style={{ color: '#0f172a' }}>{countdown}s</strong>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={isLoading}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontSize: '12.5px',
                      color: '#1d4ed8',
                      fontWeight: 600,
                    }}
                  >
                    <RotateCcw size={13} />
                    <span>Resend OTP</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Action button */}
          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', marginTop: '6px', padding: '13px' }}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                <span>{otpSent ? 'Verifying OTP...' : 'Sending OTP...'}</span>
              </>
            ) : otpSent ? (
              <>
                <CheckCircle2 size={18} />
                <span>Verify &amp; Continue</span>
              </>
            ) : (
              <>
                <Send size={16} />
                <span>Send OTP</span>
              </>
            )}
          </button>

          {/* Sign In with Password */}
          <button
            type="button"
            className="btn-outline"
            style={{ width: '100%', padding: '12px' }}
            onClick={() => setCurrentScreen('1-signin-password')}
            disabled={isLoading}
          >
            <KeyRound size={16} />
            <span>Sign In with Password</span>
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
