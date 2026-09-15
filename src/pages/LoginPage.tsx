import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn } from 'lucide-react';
import { signIn } from '../lib/auth';
import { supabase } from '../lib/supabase';
import { useToast } from '../components/ui/Toast';
import './LoginPage.css';

// Custom Reusable Components
import {
  NavbarLogo,
  HeroIllustration,
  AuthCard,
  InputField,
  SocialLoginButton,
  PrimaryButton,
  FooterLinks,
} from '../components/auth/LoginComponents';

export function LoginPage() {
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Invalid email address';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const { data, error } = await signIn(email, password);
      if (error) throw error;

      const emailLower = (data.user?.email || email || '').toLowerCase().trim();
      const metaRole = data.user?.user_metadata?.role;

      // Specific admin credentials
      const isAdminCredentials = emailLower === 'knikhilreddy2@gmail.com' && password === '123456nik';

      let isAdmin = isAdminCredentials || metaRole === 'admin' || metaRole === 'super_admin';

      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user?.id ?? '')
          .maybeSingle();

        if (profile?.role === 'admin' || profile?.role === 'super_admin') {
          isAdmin = true;
        }
      } catch {
        // continue with metadata check
      }

      if (isAdmin) {
        localStorage.setItem('findly_role', 'admin');
      } else {
        localStorage.removeItem('findly_role');
      }

      addToast(isAdmin ? 'Welcome to Findly Admin Operations!' : 'Welcome back to Findly!', 'success');
      navigate(isAdmin ? '/admin' : '/home');
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'Failed to sign in. Please check your credentials.';
      addToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = (provider: 'Google' | 'Microsoft') => {
    addToast(`${provider} Auth integration is prepared. Check Supabase configuration.`, 'info');
  };

  return (
    <div className="login-page-premium animate-fade-in">
      {/* 1. Left Illustration Side (55% width on desktop) */}
      <section className="login-left-section hidden lg:block">
        <HeroIllustration />
      </section>

      {/* 2. Right Form Side (45% width on desktop) */}
      <section className="login-right-section">
        <AuthCard>
          {/* Top Left Logo & Title Branding */}
          <NavbarLogo />

          {/* Welcome Text */}
          <h2 className="login-welcome-title">Welcome Back!</h2>
          <p className="login-welcome-subtitle">
            Sign in to continue your journey and reconnect lost items with their owners.
          </p>

          {/* Main Credentials Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full">
            <InputField
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              error={errors.email}
              icon={<Mail size={18} />}
              required
              disabled={loading}
            />

            <InputField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              error={errors.password}
              icon={<Lock size={18} />}
              required
              disabled={loading}
            />

            {/* Remember Me and Forgot Password options */}
            <div className="login-options-row">
              <label className="login-checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="login-checkbox-input"
                  disabled={loading}
                />
                <span>Remember me</span>
              </label>
              <Link to="#" onClick={() => addToast('Password reset link can be integrated here.', 'info')} className="login-forgot-link">
                Forgot Password?
              </Link>
            </div>

            {/* Main CTA Submit Button */}
            <PrimaryButton
              type="submit"
              loading={loading}
              icon={<LogIn size={18} />}
              className="mt-2"
            >
              Sign In
            </PrimaryButton>
          </form>

          {/* Social Sign-in Divider */}
          <div className="login-divider-container">
            <div className="login-divider-line" />
            <span className="login-divider-text">or continue with</span>
            <div className="login-divider-line" />
          </div>

          {/* OAuth Buttons */}
          <div className="login-oauth-grid">
            <SocialLoginButton provider="google" onClick={() => handleOAuthLogin('Google')} disabled={loading}>
              Continue with Google
            </SocialLoginButton>
            <SocialLoginButton provider="microsoft" onClick={() => handleOAuthLogin('Microsoft')} disabled={loading}>
              Continue with Microsoft
            </SocialLoginButton>
          </div>

          {/* Bottom Link for Sign up */}
          <div className="login-card-footer">
            <span>Don't have an account?</span>
            <Link to="/signup" className="login-signup-link">
              Create Account
            </Link>
          </div>

          {/* Extra Policy/Support links */}
          <FooterLinks />
        </AuthCard>
      </section>
    </div>
  );
}
