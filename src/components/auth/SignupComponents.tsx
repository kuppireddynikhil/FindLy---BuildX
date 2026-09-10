import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

// Assets
import studentUsingLaptop from '../../assets/illustrations/student-using-laptop.png';
import softLoginGradientBackground from '../../assets/backgrounds/soft-login-gradient-background.png';
import loginPageRadarNetwork from '../../assets/backgrounds/login-page-radar-network.png';
import blueBackpack from '../../assets/items/blue-backpack.png';
import blackWallet from '../../assets/items/black-wallet.png';
import carKeysWithKeychain from '../../assets/items/car-keys-with-keychain.png';
import studentIdCard from '../../assets/items/student-id-card.png';
import largeVerificationShield from '../../assets/illustrations/large-verification-shield.png';
import accountCreatedSuccessCard from '../../assets/ui/account-created-success-card.png';
import secureLoginFloatingCard from '../../assets/ui/secure-login-floating-card.png';
import floatingSearchIconCard from '../../assets/ui/floating-search-icon-card.png';
import notificationBellFloatingCard from '../../assets/ui/notification-bell-floating-card.png';
import securityFeaturesCard from '../../assets/ui/security-features-card.png';
import heroDecorativeLeaves from '../../assets/decorative/hero-decorative-leaves.png';

// ----------------------------------------------------
// 1. LogoHeader Component
// ----------------------------------------------------
export function LogoHeader() {
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
          Lost & Found Portal
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
      <label className="text-xs font-bold text-slate-700 tracking-wider uppercase">{label}</label>
      <div className="relative flex items-center">
        {icon && (
          <div className="absolute left-4 text-slate-400 pointer-events-none flex items-center justify-center">
            {icon}
          </div>
        )}
        <input
          type={inputType}
          className={`w-full h-14 ${icon ? 'pl-11' : 'px-4'} ${isPassword ? 'pr-12' : 'pr-4'} rounded-2xl border ${
            error ? 'border-red-500 bg-red-50/5' : 'border-slate-200 bg-white'
<<<<<<< HEAD
          } text-slate-900 placeholder-slate-400 text-sm font-medium transition-all duration-200 focus:outline-none focus:border-findlyBlue focus:ring-4 focus:ring-findlyBlue/10`}
=======
          } text-slate-900 placeholder-slate-400 text-sm font-medium transition-all duration-200 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10`}
>>>>>>> origin/main
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
// 3. PasswordStrengthBar Component
// ----------------------------------------------------
interface PasswordStrengthBarProps {
  passwordVal: string;
}

export function PasswordStrengthBar({ passwordVal }: PasswordStrengthBarProps) {
  if (!passwordVal) return null;

  let strength: 'Weak' | 'Medium' | 'Strong' = 'Weak';
  let progressColor = 'bg-red-500';
  let progressWidth = 'w-1/3';

  const hasLetters = /[a-zA-Z]/.test(passwordVal);
  const hasNumbers = /[0-9]/.test(passwordVal);
  const hasSpecial = /[^A-Za-z0-9]/.test(passwordVal);
  const length = passwordVal.length;

  if (length >= 8 && hasLetters && (hasNumbers || hasSpecial)) {
    strength = 'Strong';
    progressColor = 'bg-emerald-500';
    progressWidth = 'w-full';
  } else if (length >= 6) {
    strength = 'Medium';
    progressColor = 'bg-amber-500';
    progressWidth = 'w-2/3';
  }

  return (
    <div className="flex items-center gap-3 w-full text-left mt-1">
      <div className="h-1.5 flex-1 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${progressColor} ${progressWidth} transition-all duration-300`} />
      </div>
      <span className="text-[11px] font-bold text-slate-500 whitespace-nowrap">
        Password strength: <span className={
          strength === 'Strong' ? 'text-emerald-500' : strength === 'Medium' ? 'text-amber-500' : 'text-red-500'
        }>{strength}</span>
      </span>
    </div>
  );
}

// ----------------------------------------------------
// 4. CheckboxField Component
// ----------------------------------------------------
interface CheckboxFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: React.ReactNode;
  error?: string;
}

export function CheckboxField({ label, error, className = '', ...props }: CheckboxFieldProps) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label className="flex items-start gap-2.5 cursor-pointer text-left select-none">
        <input
          type="checkbox"
<<<<<<< HEAD
          className="w-[18px] h-[18px] mt-0.5 rounded-md border-slate-200 text-findlyCyan accent-findlyCyan focus:ring-findlyBlue/20 cursor-pointer"
=======
          className="w-[18px] h-[18px] mt-0.5 rounded-md border-slate-200 text-blue-600 accent-blue-600 focus:ring-blue-500/20 cursor-pointer"
>>>>>>> origin/main
          {...props}
        />
        <span className="text-sm font-semibold text-slate-600 leading-normal">{label}</span>
      </label>
      {error && <span className="text-xs font-semibold text-red-500 pl-7">{error}</span>}
    </div>
  );
}

// ----------------------------------------------------
// 5. SocialLoginButton Component
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
// 6. GradientButton Component
// ----------------------------------------------------
interface GradientButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export function GradientButton({ children, loading, icon, className = '', ...props }: GradientButtonProps) {
  return (
    <button
      type={props.type || 'button'}
      disabled={loading || props.disabled}
<<<<<<< HEAD
      className={`w-full h-14 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-findlyBlue to-findlyCyan text-white font-semibold text-base transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/25 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none transform hover:-translate-y-[2px] ${className}`}
=======
      className={`w-full h-14 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-sky-400 text-white font-semibold text-base transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none transform hover:-translate-y-[2px] ${className}`}
>>>>>>> origin/main
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
// 7. FloatingObject Component
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
// 8. FloatingCard Component
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
// 9. HeroIllustration Component
// ----------------------------------------------------
export function HeroIllustration() {
  return (
    <div className="relative w-full h-full min-h-[600px] lg:min-h-screen flex flex-col justify-between overflow-hidden p-8 lg:p-16 select-none">
      {/* Background Gradient */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-0" 
        style={{ backgroundImage: `url(${softLoginGradientBackground})` }}
      />

      {/* Dotted Radar Network Overlay */}
      <div className="absolute inset-0 flex items-center justify-center z-10 opacity-75 mix-blend-multiply">
        <img 
          src={loginPageRadarNetwork} 
          alt="Radar network background" 
          className="w-[85%] max-w-[700px] object-contain animate-pulse-gentle"
        />
      </div>

      {/* Main Student visual (Anchored to Bottom-Right) */}
      <div className="absolute right-[4%] bottom-0 z-20 w-[55%] max-w-[430px] pointer-events-none select-none">
        <img 
          src={studentUsingLaptop} 
          alt="Student using laptop" 
          className="w-full h-full object-contain object-bottom drop-shadow-3xl"
        />
      </div>

      {/* Center Shield overlay */}
      <div className="absolute left-[44%] top-[34%] z-30 w-[17%] max-w-[120px] pointer-events-none select-none">
        <img 
          src={largeVerificationShield} 
          alt="Verification Shield" 
          className="w-full h-full object-contain animate-pulse-shield"
        />
      </div>

      {/* Floating elements & cards container */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        {/* Top Left: Account Created success card */}
        <FloatingCard
          src={accountCreatedSuccessCard}
          alt="Account Created Card"
          style={{ top: '8%', left: '38%', width: '18%' }}
          animationClass="animate-float-slow"
        />

        {/* Top Right: Secure Login floating card */}
        <FloatingCard
          src={secureLoginFloatingCard}
          alt="Secure Account Card"
          style={{ top: '9%', left: '72%', width: '17%' }}
          animationClass="animate-float-slow"
        />

        {/* Right Center: Floating Search Icon card */}
        <FloatingCard
          src={floatingSearchIconCard}
          alt="Search Card"
          style={{ top: '24%', left: '84%', width: '8%' }}
          animationClass="animate-float-fast"
        />

        {/* Far Right: Notification Bell floating card */}
        <FloatingCard
          src={notificationBellFloatingCard}
          alt="Notification Bell Card"
          style={{ top: '38%', left: '88%', width: '8%' }}
          animationClass="animate-bounce-gentle"
        />

        {/* Blue Backpack (Center Left) */}
        <FloatingObject
          src={blueBackpack}
          alt="Blue Backpack"
          style={{ top: '26%', left: '32%', width: '18%' }}
          animationClass="animate-float-slow"
        />

        {/* Black Wallet (Center Left) */}
        <FloatingObject
          src={blackWallet}
          alt="Black Wallet"
          style={{ top: '44%', left: '33%', width: '11%' }}
          animationClass="animate-float-fast"
        />

        {/* Car Keys (Bottom Left) */}
        <FloatingObject
          src={carKeysWithKeychain}
          alt="Car Keys"
          style={{ top: '53%', left: '37%', width: '12%' }}
          animationClass="animate-float-slow"
        />

        {/* Student ID Card (Bottom center-ish) */}
        <FloatingObject
          src={studentIdCard}
          alt="Student ID Card"
          style={{ top: '68%', left: '44%', width: '14%' }}
          animationClass="animate-float-medium"
        />

        {/* Bottom security features card bar */}
        <FloatingCard
          src={securityFeaturesCard}
          alt="Security Features Card"
          style={{ bottom: '4%', left: '36%', width: '48%' }}
          animationClass="animate-float-slow"
        />
      </div>

      {/* Decorative Leaves (Bottom left corner) */}
      <div className="absolute left-0 bottom-0 w-[35%] max-w-[280px] z-25 pointer-events-none select-none">
        <img 
          src={heroDecorativeLeaves} 
          alt="Decorative Leaves" 
          className="w-full h-full object-contain object-left-bottom mix-blend-multiply opacity-80 animate-pulse-gentle"
        />
      </div>
    </div>
  );
}
