import { useState, type FormEvent } from 'react';
import { supabase } from '../lib/supabase';
import { useToast } from '../components/ui/Toast';
import './ForgotPasswordPage.css';

// Background assets
import softLoginGradientBackground from '../assets/backgrounds/soft-login-gradient-background.png';
import loginPageRadarNetwork from '../assets/backgrounds/login-page-radar-network.png';
import heroDecorativeLeaves from '../assets/decorative/hero-decorative-leaves.png';

// Reusable components
import {
  LogoHeader,
  HeroIllustration,
  EmailInput,
  GradientButton,
  Divider,
  SecondaryButton,
  FooterText,
  ForgotPasswordCard,
} from '../components/auth/ForgotPasswordComponents';

export function ForgotPasswordPage() {
  const { addToast } = useToast();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const validate = () => {
    if (!email) {
      setEmailError('Email address is required');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/login`,
      });
      if (error) throw error;
      setSent(true);
      addToast(`Password reset instructions sent to ${email}!`, 'success');
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'Failed to send reset link. Please try again.';
      addToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-page">
      {/* Full-page background gradient */}
      <div
        className="forgot-password-bg"
        style={{ backgroundImage: `url(${softLoginGradientBackground})` }}
      />

      {/* Radar network overlay */}
      <div className="forgot-password-radar">
        <img src={loginPageRadarNetwork} alt="" />
      </div>

      {/* Soft glow blobs */}
      <div className="forgot-password-blob-1" />
      <div className="forgot-password-blob-2" />

      {/* Decorative dots */}
      <div className="forgot-password-dots top-left">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="forgot-password-dot" style={{ gridColumn: (i % 3) + 1, gridRow: Math.floor(i / 3) + 1 }} />
        ))}
      </div>
      <div className="forgot-password-dots top-right">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="forgot-password-dot" style={{ gridColumn: (i % 3) + 1, gridRow: Math.floor(i / 3) + 1 }} />
        ))}
      </div>
      <div className="forgot-password-dots bottom-right">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="forgot-password-dot" style={{ gridColumn: (i % 3) + 1, gridRow: Math.floor(i / 3) + 1 }} />
        ))}
      </div>

      {/* Decorative leaves behind the card */}
      <img src={heroDecorativeLeaves} alt="" className="forgot-password-leaves-left animate-leaves-sway" />
      <img src={heroDecorativeLeaves} alt="" className="forgot-password-leaves-right animate-leaves-sway" />

      {/* Main centered card */}
      <div className="forgot-password-card-wrapper">
        <ForgotPasswordCard>
          {/* Logo & branding */}
          <LogoHeader />

          {/* Hero illustration (envelope + shield + telegram icon) */}
          <HeroIllustration />

          {/* Title & subtitle */}
          <div className="w-full text-center">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-3">
              Forgot Password?
            </h1>
            <p className="text-slate-500 font-semibold text-sm leading-relaxed max-w-sm mx-auto">
              No worries! Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          {/* Form */}
          {!sent ? (
            <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
              <EmailInput
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError('');
                }}
                placeholder="Enter your email address"
                error={emailError}
                disabled={loading}
                aria-label="Email address"
                autoComplete="email"
                required
              />

              <GradientButton
                type="submit"
                loading={loading}
                aria-label="Send reset link"
              >
                Send Reset Link
              </GradientButton>
            </form>
          ) : (
            <div className="w-full rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-center">
              <p className="text-emerald-700 font-bold text-sm">
                ✓ Reset link sent! Please check your inbox at <span className="underline">{email}</span>.
              </p>
            </div>
          )}

          {/* OR divider */}
          <Divider />

          {/* Back to Login secondary button */}
          <SecondaryButton to="/login">
            Back to Login
          </SecondaryButton>

          {/* Footer sign-in link */}
          <FooterText />
        </ForgotPasswordCard>
      </div>
    </div>
  );
}
