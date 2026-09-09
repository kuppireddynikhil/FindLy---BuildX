import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, CheckCircle2 } from 'lucide-react';

// Assets
import mainHeroStudent from '../../assets/illustrations/main-hero-student.png';
import softLoginGradientBackground from '../../assets/backgrounds/soft-login-gradient-background.png';
import loginPageRadarNetwork from '../../assets/backgrounds/login-page-radar-network.png';
import blueBackpack from '../../assets/items/blue-backpack.png';
import blueWaterBottle from '../../assets/items/blue-water-bottle.png';
import blackWallet from '../../assets/items/black-wallet.png';
import carKeysWithKeychain from '../../assets/items/car-keys-with-keychain.png';
import smartphoneShowingFoundItem from '../../assets/items/smartphone-showing-found-item.png';
import secureLoginFloatingCard from '../../assets/ui/secure-login-floating-card.png';
import floatingSearchIconCard from '../../assets/ui/floating-search-icon-card.png';
import itemMatchedSuccessCard from '../../assets/ui/item-matched-success-card.png';
import securityFeaturesCard from '../../assets/ui/security-features-card.png';
import heroDecorativeLeaves from '../../assets/decorative/hero-decorative-leaves.png';

// ----------------------------------------------------
// 1. NavbarLogo Component
// ----------------------------------------------------
export function NavbarLogo() {
  return (
    <Link to="/" className="flex items-center gap-3 select-none group mb-8">
      <img
        src="/findly-logo.svg"
        alt="Findly Logo"
        className="w-11 h-11 transition-transform duration-300 group-hover:scale-105"
      />
      <div className="flex flex-col">
        <span className="text-xl font-black tracking-wider text-slate-900 leading-none">
          FINDLY
        </span>
        <span className="text-[10px] text-slate-500 font-bold tracking-wider mt-1">
          Lost &amp; Found Portal
        </span>
      </div>
    </Link>
  );
}

// ----------------------------------------------------
// 2. InputField Component
// ----------------------------------------------------
interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: React.ReactNode;
  error?: string;
}

export function InputField({ label, icon, error, type = 'text', className = '', ...props }: InputFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className={`flex flex-col w-full text-left gap-1.5 ${className}`}>
      <label className="text-sm font-semibold text-slate-700 tracking-wide">{label}</label>
      <div className="relative flex items-center">
        {icon && (
          <div className="absolute left-4 text-slate-400 pointer-events-none flex items-center justify-center">
            {icon}
          </div>
        )}
        <input
          type={inputType}
          className={`w-full h-14 ${icon ? 'pl-11' : 'px-4'} ${isPassword ? 'pr-12' : 'pr-4'} rounded-2xl border ${error ? 'border-red-500 bg-red-50/5' : 'border-slate-200 bg-white'
            } text-slate-900 placeholder-slate-400 text-sm font-medium transition-all duration-200 focus:outline-none focus:border-findlyBlue focus:ring-4 focus:ring-findlyBlue/10`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 text-slate-400 hover:text-slate-600 transition-colors flex items-center justify-center"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && <span className="text-xs font-semibold text-red-500 mt-0.5">{error}</span>}
    </div>
  );
}

// ----------------------------------------------------
// 3. PrimaryButton Component
// ----------------------------------------------------
interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export function PrimaryButton({ children, loading, icon, className = '', ...props }: PrimaryButtonProps) {
  return (
    <button
      type={props.type || 'button'}
      disabled={loading || props.disabled}
      className={`w-full h-14 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-findlyBlue to-findlyCyan text-white font-semibold text-base transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/25 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none transform hover:-translate-y-[2px] ${className}`}
      {...props}
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : (
        <>
          {icon && <span className="flex items-center">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
}

// ----------------------------------------------------
// 4. SocialLoginButton Component
// ----------------------------------------------------
interface SocialLoginButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  provider: 'google' | 'microsoft';
  children: React.ReactNode;
}

export function SocialLoginButton({ provider, children, className = '', ...props }: SocialLoginButtonProps) {
  const isGoogle = provider === 'google';
  return (
    <button
      type="button"
      className={`w-full h-14 flex items-center justify-center gap-3.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm transition-all duration-200 hover:shadow-md active:scale-[0.99] ${className}`}
      {...props}
    >
      {isGoogle ? (
        <svg viewBox="0 0 24 24" width="20" height="20" className="flex-shrink-0">
          <path
            fill="#EA4335"
            d="M12 5.04c1.67 0 3.17.58 4.35 1.71l3.25-3.25C17.65 1.58 15.02 1 12 1 7.37 1 3.41 3.65 1.5 7.51l3.79 2.94c.89-2.67 3.39-4.41 6.71-4.41z"
          />
          <path
            fill="#4285F4"
            d="M23.49 12.27c0-.81-.07-1.59-.2-2.34H12v4.43h6.44c-.28 1.48-1.12 2.73-2.38 3.58l3.69 2.87c2.16-1.99 3.74-4.92 3.74-8.54z"
          />
          <path
            fill="#FBBC05"
            d="M5.29 14.51c-.23-.68-.36-1.42-.36-2.18s.13-1.5.36-2.18L1.5 7.21C.54 9.15 0 11.24 0 13.43s.54 4.28 1.5 6.22l3.79-2.94c-.23-.68-.36-1.42-.36-2.18z"
          />
          <path
            fill="#34A853"
            d="M12 23c3.24 0 5.97-1.07 7.96-2.92l-3.69-2.87c-1.02.68-2.33 1.09-3.95 1.09-3.32 0-5.82-2.16-6.71-4.83l-3.79 2.94C3.41 20.35 7.37 23 12 23z"
          />
        </svg>
      ) : (
        <svg viewBox="0 0 23 23" width="20" height="20" className="flex-shrink-0">
          <rect width="10.5" height="10.5" fill="#F25022" />
          <rect x="11.5" width="10.5" height="10.5" fill="#7FBA00" />
          <rect y="11.5" width="10.5" height="10.5" fill="#00A1F1" />
          <rect x="11.5" y="11.5" width="10.5" height="10.5" fill="#FFB900" />
        </svg>
      )}
      <span>{children}</span>
    </button>
  );
}

// ----------------------------------------------------
// 5. FloatingObject Component
// ----------------------------------------------------
interface FloatingObjectProps {
  src: string;
  alt: string;
  style?: React.CSSProperties;
  className?: string;
  animationClass?: string;
}

export function FloatingObject({ src, alt, style, className = '', animationClass = 'animate-float-slow' }: FloatingObjectProps) {
  return (
    <div
      className={`absolute pointer-events-none select-none drop-shadow-2xl ${animationClass} ${className}`}
      style={style}
    >
      <img src={src} alt={alt} className="w-full h-full object-contain" />
    </div>
  );
}

// ----------------------------------------------------
// 6. FloatingCard Component
// ----------------------------------------------------
interface FloatingCardProps {
  src: string;
  alt: string;
  style?: React.CSSProperties;
  className?: string;
  animationClass?: string;
}

export function FloatingCard({ src, alt, style, className = '', animationClass = 'animate-float-medium' }: FloatingCardProps) {
  return (
    <div
      className={`absolute pointer-events-none select-none drop-shadow-xl ${animationClass} ${className}`}
      style={style}
    >
      <img src={src} alt={alt} className="w-full h-full object-contain" />
    </div>
  );
}

// ----------------------------------------------------
// 7. MagnifyingGlass SVG Component (Center Focus)
// ----------------------------------------------------
function MagnifyingGlass() {
  return (
    <svg
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      {/* Outer glow */}
      <defs>
        <radialGradient id="glassGradient" cx="40%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#EFF6FF" stopOpacity="0.95" />
          <stop offset="60%" stopColor="#DBEAFE" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#BFDBFE" stopOpacity="0.7" />
        </radialGradient>
        <radialGradient id="innerGlow" cx="35%" cy="30%" r="55%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#93C5FD" stopOpacity="0.2" />
        </radialGradient>
        <filter id="glassShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="10" floodColor="#3B82F6" floodOpacity="0.18" />
        </filter>
        <filter id="handleShadow">
          <feDropShadow dx="2" dy="3" stdDeviation="4" floodColor="#1E40AF" floodOpacity="0.25" />
        </filter>
      </defs>

      {/* Handle */}
      <g filter="url(#handleShadow)">
        <rect
          x="128"
          y="128"
          width="52"
          height="18"
          rx="9"
          transform="rotate(45 128 128)"
          fill="url(#handleGrad)"
        />
        <defs>
          <linearGradient id="handleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#1D4ED8" />
          </linearGradient>
        </defs>
        <rect
          x="130"
          y="130"
          width="48"
          height="14"
          rx="7"
          transform="rotate(45 130 130)"
          fill="url(#handleGradInner)"
        />
        <defs>
          <linearGradient id="handleGradInner" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60A5FA" />
            <stop offset="100%" stopColor="#2563EB" />
          </linearGradient>
        </defs>
      </g>

      {/* Outer ring */}
      <circle
        cx="88"
        cy="88"
        r="72"
        fill="none"
        stroke="#93C5FD"
        strokeWidth="6"
        opacity="0.5"
        filter="url(#glassShadow)"
      />

      {/* Glass body */}
      <circle
        cx="88"
        cy="88"
        r="68"
        fill="url(#glassGradient)"
        filter="url(#glassShadow)"
      />

      {/* Inner glass highlight */}
      <circle
        cx="88"
        cy="88"
        r="68"
        fill="url(#innerGlow)"
      />

      {/* Rim ring */}
      <circle
        cx="88"
        cy="88"
        r="68"
        fill="none"
        stroke="#60A5FA"
        strokeWidth="4"
        opacity="0.7"
      />

      {/* Inner ring detail */}
      <circle
        cx="88"
        cy="88"
        r="60"
        fill="none"
        stroke="#BFDBFE"
        strokeWidth="1.5"
        opacity="0.6"
      />

      {/* Shine highlight top-left */}
      <ellipse
        cx="68"
        cy="62"
        rx="20"
        ry="12"
        fill="white"
        opacity="0.55"
        transform="rotate(-30 68 62)"
      />

      {/* Search icon inside glass */}
      <circle
        cx="84"
        cy="84"
        r="18"
        fill="none"
        stroke="#3B82F6"
        strokeWidth="5"
        strokeLinecap="round"
        opacity="0.85"
      />
      <line
        x1="97"
        y1="97"
        x2="108"
        y2="108"
        stroke="#3B82F6"
        strokeWidth="5"
        strokeLinecap="round"
        opacity="0.85"
      />
    </svg>
  );
}

// ----------------------------------------------------
// 8. HeroIllustration Component
// ----------------------------------------------------
export function HeroIllustration() {
  return (
    <div
      className="relative w-full h-full select-none overflow-hidden"
      style={{ minHeight: '100vh', background: 'transparent' }}
    >
      {/* ── Z0: Gradient Background ───────────────────── */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${softLoginGradientBackground})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          zIndex: 0,
        }}
      />

      {/* ── Z1: Radar Network — fills entire left section ── */}
      <div
        className="absolute animate-pulse-gentle pointer-events-none"
        style={{
          top: '30%',
          left: '20%',
          transform: 'translate(-60%, -46%)',
          width: '60%',
          aspectRatio: '3 / 2',
          opacity: 0.65,
          zIndex: 1,
        }}
      >
        <img
          src={loginPageRadarNetwork}
          alt="Radar network background"
          className="w-full h-full object-contain"
        />
      </div>

      {/* ── Z10: Top-Left Text Block ─────────────────── */}
      <div
        className="absolute pointer-events-none"
        style={{ top: '5%', left: '5%', zIndex: 10, maxWidth: '52%' }}
      >
        {/* Heading */}
        <h1
          style={{
            fontSize: 'clamp(1.6rem, 2.5vw, 2.5rem)',
            fontWeight: 900,
            color: '#0F172A',
            lineHeight: 1.15,
            marginBottom: '10px',
            letterSpacing: '-0.03em',
          }}
        >
          Find Today.<br />
          <span
            style={{
              background: 'linear-gradient(90deg, #2563EB, #38BDF8)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Reunite Tomorrow.
          </span>
        </h1>
        <p
          style={{
            fontSize: 'clamp(0.75rem, 1.1vw, 0.9rem)',
            color: '#475569',
            fontWeight: 500,
            lineHeight: 1.55,
            marginBottom: '12px',
            maxWidth: '220px',
          }}
        >
          A smart platform to report, discover and recover lost items across campus.
        </p>
        {/* Trusted Badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            borderRadius: '999px',
            background: 'rgba(255,255,255,0.75)',
            border: '1px solid rgba(203,213,225,0.6)',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 2px 8px rgba(15,23,42,0.06)',
          }}
        >
          <CheckCircle2 size={12} color="#2563EB" />
          <span
            style={{
              fontSize: '0.65rem',
              fontWeight: 700,
              color: '#334155',
              letterSpacing: '0.04em',
            }}
          >
            Trusted by students, built for campuses
          </span>
        </div>
      </div>

      {/* ── Z15: Floating Items Layer ─────────────────── */}

      {/* Secure Login Card — Top Center */}
      <div
        className="absolute pointer-events-none animate-float-slow"
        style={{ top: '14%', left: '55%', width: '25%', zIndex: 15 }}
      >
        <img src={secureLoginFloatingCard} alt="Secure Login" className="w-full object-contain drop-shadow-xl" />
        <div
          style={{
            textAlign: 'center',
            fontSize: '0.75rem',
            fontWeight: 700,
            color: '#334155',
            marginTop: '0px',
            lineHeight: 1.2,
          }}
        >
          Secure<br />Login
        </div>
      </div>

      {/* Floating Search Icon — Below Secure Login */}
      <div
        className="absolute pointer-events-none animate-float-medium"
        style={{ top: '22%', left: '67%', width: '20%', zIndex: 15 }}
      >
        <img src={floatingSearchIconCard} alt="Search" className="w-full object-contain drop-shadow-lg" />
      </div>

      {/* Blue Backpack — Top Center */}
      <div
        className="absolute pointer-events-none animate-float-slow"
        style={{ top: '15%', left: '40%', width: '22%', zIndex: 15 }}
      >
        <img src={blueBackpack} alt="Blue Backpack" className="w-full object-contain drop-shadow-2xl" />
      </div>

      {/* Blue Water Bottle — Upper Right */}
      <div
        className="absolute pointer-events-none animate-float-medium"
        style={{ top: ' 25%', left: '82%', width: '15 %', zIndex: 15 }}
      >
        <img src={blueWaterBottle} alt="Blue Water Bottle" className="w-full object-contain drop-shadow-xl" />
      </div>

      {/* Black Wallet — Center Right */}
      <div
        className="absolute pointer-events-none animate-float-fast"
        style={{ top: '35%', left: '59%', width: '13%', zIndex: 15 }}
      >
        <img src={blackWallet} alt="Black Wallet" className="w-full object-contain drop-shadow-xl" />
      </div>

      {/* Car Keys — Lower Right */}
      <div
        className="absolute pointer-events-none animate-float-slow"
        style={{ top: '45%', left: '70%', width: '20%', zIndex: 15 }}
      >
        <img src={carKeysWithKeychain} alt="Car Keys" className="w-full object-contain drop-shadow-xl" />
      </div>

      {/* Student Phone — Bottom Left beside student */}
      <div
        className="absolute pointer-events-none animate-float-medium"
        style={{ top: '56%', left: '26%', width: '13%', zIndex: 22 }}
      >
        <img src={smartphoneShowingFoundItem} alt="Smartphone Showing Found Item" className="w-full object-contain drop-shadow-xl" />
      </div>

      {/* ── Z20: Magnifying Glass — Center of Radar (35% smaller → 15%) ── */}
      <div
        className="absolute pointer-events-none animate-float-slow"
        style={{
          opacity: 0.35,
          top: '40%',
          left: '45%',
          width: '12%',
          zIndex: 20,
        }}
      >
        <MagnifyingGlass />
      </div>

      {/* ── Z22: Item Matched Card — Below magnifying glass, between student and wallet ── */}
      <div
        className="absolute pointer-events-none animate-float-medium"
        style={{
          top: '59%',
          left: '40%',
          width: '38%',
          zIndex: 22,
          filter: 'drop-shadow(0 6px 20px rgba(59,130,246,0.15))',
        }}
      >
        <img
          src={itemMatchedSuccessCard}
          alt="Item Matched Success Card"
          className="w-full object-contain"
        />
      </div>

      {/* ── Z30: Main Student — PRIMARY FOCAL POINT, enlarged, slightly upward ── */}
      <div
        className="absolute pointer-events-none select-none"
        style={{
          bottom: '1%',
          left: '-4%',
          width: '62%',
          zIndex: 30,
          filter: 'drop-shadow(0 24px 32px rgba(15,23,42,0.12))',
        }}
      >
        <img
          src={mainHeroStudent}
          alt="Student holding smartphone"
          className="w-full object-contain object-bottom"
        />
      </div>

      {/* ── Z20: Decorative Leaves — Lower Right ─────── */}
      <div
        className="absolute pointer-events-none animate-pulse-gentle"
        style={{
          top: '30%',
          left: '25 %',
          bottom: '12%',
          right: '5%',
          width: '80%',
          zIndex: 20,
          opacity: 0.85,
        }}
      >
        <img
          src={heroDecorativeLeaves}
          alt="Decorative Leaves"
          className="w-full object-contain object-right-bottom"
        />
      </div>

      {/* ── Z25: Feature Strip — Compact, bottom-left, BELOW student z-index ── */}
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: '15%',
          left: '66%',
          width: '70%',
          zIndex: 25,
          filter: 'drop-shadow(0 -2px 12px rgba(15,23,42,0.05))',
        }}
      >
        <img
          src={securityFeaturesCard}
          alt="Security Features: Secure Authentication, Privacy Protected, Campus Verified"
          style={{ height: '11vh', width: 'auto', maxWidth: '82%', display: 'block' }}
        />
      </div>
    </div>
  );
}

// ----------------------------------------------------
// 9. AuthCard Component
// ----------------------------------------------------
interface AuthCardProps {
  children: React.ReactNode;
  className?: string;
}

export function AuthCard({ children, className = '' }: AuthCardProps) {
  return (
    <div className={`login-form-card ${className}`}>
      {children}
    </div>
  );
}

// ----------------------------------------------------
// 10. FooterLinks Component
// ----------------------------------------------------
export function FooterLinks() {
  return (
    <div className="flex items-center justify-center gap-4 mt-6 text-xs font-semibold text-slate-400 select-none">
      <a href="#" className="hover:text-slate-600 transition-colors">Privacy Policy</a>
      <span>&bull;</span>
      <a href="#" className="hover:text-slate-600 transition-colors">Terms of Service</a>
      <span>&bull;</span>
      <a href="#" className="hover:text-slate-600 transition-colors">Support</a>
    </div>
  );
}
