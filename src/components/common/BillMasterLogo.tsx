import React from 'react';

interface BillMasterLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  align?: 'left' | 'center';
  className?: string;
}

export const BillMasterLogo: React.FC<BillMasterLogoProps> = ({
  size = 'md',
  showSubtitle = true,
  align = 'center',
  className = '',
}) => {
  const iconSizes = {
    sm: 32,
    md: 48,
    lg: 64,
    xl: 84,
  };

  const dim = iconSizes[size];

  return (
    <div
      className={`flex items-center gap-3 ${
        align === 'center' ? 'justify-center' : 'justify-start'
      } ${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: align === 'center' ? 'center' : 'flex-start',
        gap: size === 'sm' ? '8px' : size === 'xl' ? '16px' : '12px',
      }}
    >
      {/* 3D Modern Logo Icon */}
      <div
        style={{
          width: `${dim}px`,
          height: `${dim}px`,
          minWidth: `${dim}px`,
          borderRadius: size === 'xl' ? '20px' : size === 'lg' ? '16px' : '10px',
          background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #06b6d4 100%)',
          boxShadow: '0 8px 20px -4px rgba(37, 99, 235, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        {/* Shimmer light bar */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '40%',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 100%)',
            borderTopLeftRadius: 'inherit',
            borderTopRightRadius: 'inherit',
          }}
        />

        {/* Dynamic Graphic */}
        <svg
          viewBox="0 0 48 48"
          width={dim * 0.7}
          height={dim * 0.7}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Bill sheet background */}
          <rect x="8" y="10" width="16" height="24" rx="2" fill="white" fillOpacity="0.25" />
          <rect x="12" y="6" width="18" height="26" rx="2" fill="white" fillOpacity="0.45" />
          
          {/* Main "B" letter & graph in front */}
          <path
            d="M15 12H27C29.7614 12 32 14.2386 32 17C32 19.3496 30.3809 21.3211 28.1884 21.8546C30.9856 22.2573 33.1 24.6293 33.1 27.5C33.1 30.5376 30.6376 33 27.6 33H15V12Z"
            fill="white"
          />
          {/* Inner cutouts of B */}
          <path
            d="M20 16H26C27.1046 16 28 16.8954 28 18C28 19.1046 27.1046 20 26 20H20V16Z"
            fill="#1e40af"
          />
          <path
            d="M20 24H27C28.1046 24 29 24.8954 29 26C29 27.1046 28.1046 28 27 28H20V24Z"
            fill="#1e40af"
          />
          {/* Upward green chart tick arrow */}
          <path
            d="M29 33L36 26M36 26H31M36 26V31"
            stroke="#10b981"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Brand Name Typography */}
      <div style={{ textAlign: align === 'center' ? 'left' : 'left' }}>
        <div
          style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 800,
            letterSpacing: '-0.02em',
            display: 'flex',
            alignItems: 'baseline',
            gap: '2px',
            lineHeight: 1.1,
          }}
        >
          <span
            style={{
              color: '#1d4ed8',
              fontSize: size === 'xl' ? '28px' : size === 'lg' ? '22px' : size === 'md' ? '18px' : '15px',
            }}
          >
            Bill
          </span>
          <span
            style={{
              color: '#0f172a',
              fontSize: size === 'xl' ? '28px' : size === 'lg' ? '22px' : size === 'md' ? '18px' : '15px',
            }}
          >
            Master
          </span>
        </div>
        {showSubtitle && (
          <div
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: size === 'xl' ? '10px' : size === 'lg' ? '9px' : '8px',
              fontWeight: 700,
              letterSpacing: '0.08em',
              color: '#64748b',
              marginTop: '3px',
              textTransform: 'uppercase',
            }}
          >
            Billing &amp; Business Management
          </div>
        )}
      </div>
    </div>
  );
};
