import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send } from 'lucide-react';

// Assets
import largeVerificationShield from '../../assets/illustrations/large-verification-shield.png';
import heroDecorativeLeaves from '../../assets/decorative/hero-decorative-leaves.png';
import loginPageRadarNetwork from '../../assets/backgrounds/login-page-radar-network.png';
import forgotPasswordEnvelope from '../../assets/illustrations/forgot-password-envelope.svg';
import telegramSendIcon from '../../assets/ui/telegram-send-icon.svg';

// ─────────────────────────────────────────
// 1. LogoHeader
// ─────────────────────────────────────────
export function LogoHeader() {
  return (
    <div className="flex items-center justify-center gap-3 select-none mb-6">
      <img
        src="/findly-logo.svg"
        alt="Findly Logo"
        className="w-12 h-12 transition-transform duration-300 hover:scale-105"
      />
      <div className="flex flex-col">
        <span className="text-xl font-black tracking-wider text-slate-900 leading-none">FINDLY</span>
        <span className="text-[10px] text-slate-500 font-bold tracking-wider mt-0.5">Lost & Found Portal</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// 2. HeroIllustration
// ─────────────────────────────────────────
export function HeroIllustration() {
  return (
    <div className="relative flex items-center justify-center w-full h-52 mb-2 select-none">
      {/* Faint radar network behind */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
        <img
          src={loginPageRadarNetwork}
          alt=""
          className="w-full h-full object-contain"
        />
      </div>

      {/* Decorative leaves (bottom) */}
      <div className="absolute -bottom-4 left-0 w-28 pointer-events-none opacity-70">
        <img
          src={heroDecorativeLeaves}
          alt=""
          className="w-full object-contain animate-leaves-sway"
        />
      </div>
      <div className="absolute -bottom-4 right-0 w-28 pointer-events-none opacity-70 scale-x-[-1]">
        <img
          src={heroDecorativeLeaves}
          alt=""
          className="w-full object-contain animate-leaves-sway"
        />
      </div>

      {/* Main envelope illustration */}
      <div className="relative z-10 w-52 h-44 animate-envelope-float">
        <img
          src={forgotPasswordEnvelope}
          alt="Forgot password envelope"
          className="w-full h-full object-contain drop-shadow-xl"
        />
      </div>

      {/* Large verification shield (top right) */}
      <div className="absolute top-0 right-8 z-20 w-14 animate-shield-pulse">
        <img
          src={largeVerificationShield}
          alt="Verification shield"
          className="w-full object-contain"
          style={{ filter: 'drop-shadow(0 4px 12px rgba(37,99,235,0.3))' }}
        />
      </div>

      {/* Telegram send icon (center right) */}
      <div className="absolute bottom-4 right-0 z-20 w-14 animate-telegram-float">
        <img
          src={telegramSendIcon}
          alt="Send icon"
          className="w-full object-contain"
        />
      </div>

      {/* Decorative tiny dots */}
      <div className="absolute top-4 left-4 z-10 flex gap-1.5 flex-col pointer-events-none opacity-40">
        {[0, 1, 2].map(row => (
          <div key={row} className="flex gap-1.5">
            {[0, 1, 2].map(col => (
<<<<<<< HEAD
              <div key={col} className="w-1 h-1 rounded-full bg-findlyBlue" />
=======
              <div key={col} className="w-1 h-1 rounded-full bg-blue-400" />
>>>>>>> origin/main
            ))}
          </div>
        ))}
      </div>
      <div className="absolute top-4 right-4 z-10 flex gap-1.5 flex-col pointer-events-none opacity-40">
        {[0, 1, 2].map(row => (
          <div key={row} className="flex gap-1.5">
            {[0, 1, 2].map(col => (
              <div key={col} className="w-1 h-1 rounded-full bg-cyan-400" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// 3. EmailInput
// ─────────────────────────────────────────
interface EmailInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export function EmailInput({ error, className = '', ...props }: EmailInputProps) {
  return (
    <div className={`flex flex-col w-full text-left gap-1.5 ${className}`}>
      <label className="text-sm font-bold text-slate-700 tracking-wide">Email Address</label>
      <div className="relative flex items-center">
        <div className="absolute left-4 text-slate-400 pointer-events-none flex items-center justify-center">
          <Mail size={18} />
        </div>
        <input
          type="email"
          className={`w-full h-14 pl-11 pr-4 rounded-2xl border ${
            error ? 'border-red-400 bg-red-50/5' : 'border-slate-200 bg-white'
<<<<<<< HEAD
          } text-slate-900 placeholder-slate-400 text-sm font-medium transition-all duration-200 focus:outline-none focus:border-findlyBlue focus:ring-4 focus:ring-findlyBlue/10`}
=======
          } text-slate-900 placeholder-slate-400 text-sm font-medium transition-all duration-200 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10`}
>>>>>>> origin/main
          {...props}
        />
      </div>
      {error && <span className="text-xs font-semibold text-red-500 mt-0.5">{error}</span>}
    </div>
  );
}

// ─────────────────────────────────────────
// 4. GradientButton
// ─────────────────────────────────────────
interface GradientButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  children: React.ReactNode;
}

export function GradientButton({ children, loading, className = '', ...props }: GradientButtonProps) {
  return (
    <button
      type={props.type || 'button'}
      disabled={loading || props.disabled}
<<<<<<< HEAD
      className={`w-full h-14 flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-findlyBlue to-findlyCyan text-white font-semibold text-base transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/30 hover:-translate-y-[2px] hover:from-sky-400 hover:to-cyan-500 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none ${className}`}
=======
      className={`w-full h-14 flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-sky-400 text-white font-semibold text-base transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-[2px] hover:from-blue-500 hover:to-sky-300 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none ${className}`}
>>>>>>> origin/main
      {...props}
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : (
        <>
          <Send size={18} className="flex-shrink-0" />
          {children}
        </>
      )}
    </button>
  );
}

// ─────────────────────────────────────────
// 5. Divider
// ─────────────────────────────────────────
export function Divider() {
  return (
    <div className="flex items-center justify-center gap-4 w-full my-2">
      <div className="flex-1 h-px bg-slate-200" />
      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">or</span>
      <div className="flex-1 h-px bg-slate-200" />
    </div>
  );
}

// ─────────────────────────────────────────
// 6. SecondaryButton
// ─────────────────────────────────────────
interface SecondaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  to?: string;
}

export function SecondaryButton({ children, to, className = '', ...props }: SecondaryButtonProps) {
<<<<<<< HEAD
  const classes = `w-full h-14 flex items-center justify-center gap-2.5 rounded-2xl border-2 border-slate-200 bg-white text-slate-700 font-semibold text-sm transition-all duration-200 hover:bg-findlyBlue hover:text-white hover:border-findlyBlue hover:shadow-md active:scale-[0.99] ${className}`;
=======
  const classes = `w-full h-14 flex items-center justify-center gap-2.5 rounded-2xl border-2 border-slate-200 bg-white text-slate-700 font-semibold text-sm transition-all duration-200 hover:bg-blue-600 hover:text-white hover:border-blue-600 hover:shadow-md active:scale-[0.99] ${className}`;
>>>>>>> origin/main

  if (to) {
    return (
      <Link to={to} className={classes}>
        <ArrowLeft size={18} className="flex-shrink-0" />
        {children}
      </Link>
    );
  }

  return (
    <button type="button" className={classes} {...props}>
      <ArrowLeft size={18} className="flex-shrink-0" />
      {children}
    </button>
  );
}

// ─────────────────────────────────────────
// 7. FooterText
// ─────────────────────────────────────────
export function FooterText() {
  return (
    <p className="text-center text-sm font-semibold text-slate-500 mt-2">
      Remember your password?{' '}
<<<<<<< HEAD
      <Link to="/login" className="text-findlyCyan font-bold hover:text-cyan-700 hover:underline transition-colors">
=======
      <Link to="/login" className="text-blue-600 font-bold hover:text-blue-700 hover:underline transition-colors">
>>>>>>> origin/main
        Sign In
      </Link>
    </p>
  );
}

// ─────────────────────────────────────────
// 8. ForgotPasswordCard
// ─────────────────────────────────────────
interface ForgotPasswordCardProps {
  children: React.ReactNode;
}

export function ForgotPasswordCard({ children }: ForgotPasswordCardProps) {
  return (
    <div
      className="w-full max-w-[520px] bg-white rounded-[32px] p-10 flex flex-col items-center gap-5 animate-card-slide-up"
      style={{
        boxShadow: '0 20px 60px rgba(15,23,42,0.08), 0 0 2px 1px rgba(15,23,42,0.01)',
        border: '1px solid #E2E8F0',
      }}
    >
      {children}
    </div>
  );
}
