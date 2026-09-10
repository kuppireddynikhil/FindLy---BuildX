import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, UserPlus } from 'lucide-react';
import { signUp } from '../lib/auth';
import { useToast } from '../components/ui/Toast';
import './SignupPage.css';

// Reusable components
import {
  LogoHeader,
  InputField,
  PasswordStrengthBar,
  CheckboxField,
  SocialLoginButton,
  GradientButton,
  HeroIllustration,
} from '../components/auth/SignupComponents';

export function SignupPage() {
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    fullName?: string;
    email?: string;
    phone?: string;
    password?: string;
    confirmPassword?: string;
    agreeTerms?: string;
    agreePrivacy?: string;
  }>({});

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!fullName) newErrors.fullName = 'Full name is required';
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Invalid email address';
    }
    if (!phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[0-9\s-]{7,15}$/.test(phone.trim())) {
      newErrors.phone = 'Invalid phone number format';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!agreeTerms) {
      newErrors.agreeTerms = 'You must agree to the Terms & Conditions';
    }
    if (!agreePrivacy) {
      newErrors.agreePrivacy = 'You must agree to the Privacy Policy';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      addToast('Please fix the errors before continuing.', 'error');
      return;
    }

    setLoading(true);
    try {
<<<<<<< HEAD
      const { error } = await signUp(email, password, fullName, phone);
=======
      const { error } = await signUp(email, password, fullName);
>>>>>>> origin/main
      if (error) throw error;
      addToast('Account created successfully. Please login to continue.', 'success');
      navigate('/login');
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'Failed to sign up.';
      addToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = (provider: 'Google' | 'Microsoft') => {
    addToast(`${provider} OAuth authentication is prepared. Check Supabase credentials.`, 'info');
  };

  return (
    <div className="signup-page-premium animate-fade-in">
      {/* 1. Left panel: Signup Form (42% width on desktop) */}
      <section className="signup-left-section">
        <div className="signup-form-card">
          {/* Logo Header */}
          <LogoHeader />

          {/* Title & Subtitle */}
          <h2 className="signup-welcome-title">Create Your Account</h2>
          <p className="signup-welcome-subtitle">
            Join Findly and help make campuses a safer place by connecting lost items with their rightful owners.
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
            <InputField
              label="Full Name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              error={errors.fullName}
              icon={<User size={18} />}
              disabled={loading}
              required
            />

            <InputField
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              error={errors.email}
              icon={<Mail size={18} />}
              disabled={loading}
              required
            />

            <InputField
              label="Phone Number"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter your phone number"
              error={errors.phone}
              icon={<Phone size={18} />}
              disabled={loading}
              required
            />

            <div className="flex flex-col gap-1 w-full">
              <InputField
                label="Create Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a strong password"
                error={errors.password}
                icon={<Lock size={18} />}
                disabled={loading}
                required
              />
              <PasswordStrengthBar passwordVal={password} />
            </div>

            <InputField
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              error={errors.confirmPassword}
              icon={<Lock size={18} />}
              disabled={loading}
              required
            />

            {/* Checkbox fields */}
            <div className="flex flex-col gap-2.5 mt-2">
              <CheckboxField
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                label={
                  <>
                    I agree to the <Link to="#" onClick={(e) => { e.preventDefault(); addToast('Terms & Conditions document link can be placed here.', 'info'); }} className="text-blue-600 font-bold hover:underline">Terms & Conditions</Link>
                  </>
                }
                error={errors.agreeTerms}
                disabled={loading}
              />

              <CheckboxField
                checked={agreePrivacy}
                onChange={(e) => setAgreePrivacy(e.target.checked)}
                label={
                  <>
                    I agree to the <Link to="#" onClick={(e) => { e.preventDefault(); addToast('Privacy Policy document link can be placed here.', 'info'); }} className="text-blue-600 font-bold hover:underline">Privacy Policy</Link>
                  </>
                }
                error={errors.agreePrivacy}
                disabled={loading}
              />
            </div>

            {/* Gradient submit button */}
            <GradientButton
              type="submit"
              loading={loading}
              icon={<UserPlus size={18} />}
              className="mt-3"
            >
              Create Account
            </GradientButton>
          </form>

          {/* Social Sign-in Divider */}
          <div className="signup-divider-container">
            <div className="signup-divider-line" />
            <span className="signup-divider-text">or continue with</span>
            <div className="signup-divider-line" />
          </div>

          {/* OAuth Buttons */}
          <div className="signup-oauth-grid">
            <SocialLoginButton provider="google" onClick={() => handleOAuthLogin('Google')} disabled={loading}>
              Continue with Google
            </SocialLoginButton>
            <SocialLoginButton provider="microsoft" onClick={() => handleOAuthLogin('Microsoft')} disabled={loading}>
              Continue with Microsoft
            </SocialLoginButton>
          </div>

          {/* Bottom redirection */}
          <div className="signup-card-footer">
            <span>Already have an account?</span>
            <Link to="/login" className="signup-signin-link">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Right panel: Visual interactive layout (58% width on desktop) */}
      <section className="signup-right-section">
        <HeroIllustration />
      </section>
    </div>
  );
}
