import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { useToast } from '../components/ui/Toast';
import {
  Mail,
  Key,
  LogOut,
  Save,
  Clock
} from 'lucide-react';

export function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [savingProfile, setSavingProfile] = useState(false);

  // Profile Fields
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('Computer Science and Engineering');
  const [institutionalId, setInstitutionalId] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [role, setRole] = useState('user');
  const [emailChangePending, setEmailChangePending] = useState(false);

  // Password Fields (Exactly 3 inputs)
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      if (!user) return;
      try {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (data) {
          setFullName(data.full_name || user.user_metadata?.full_name || '');
          setUsername(data.username || user.email?.split('@')[0] || '');
          setEmail(data.email || user.email || '');
          setPhone(data.phone || user.user_metadata?.phone || '');
          setDepartment(data.department || 'Computer Science and Engineering');
          setInstitutionalId(data.institutional_id || '');
          setAvatarUrl(data.avatar_url || '');
          setRole(data.role || 'user');
        } else {
          setFullName(user.user_metadata?.full_name || '');
          setEmail(user.email || '');
          setUsername(user.email?.split('@')[0] || '');
        }
      } catch (err) {
        console.error('Error loading profile:', err);
      }
    }
    loadProfile();
  }, [user]);

  // Handle Edit Profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validate username format (3-30 characters, alphanumeric + underscore)
    if (username.trim()) {
      const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
      if (!usernameRegex.test(username.trim())) {
        addToast('Username must be 3–30 characters and contain only letters, numbers, and underscores.', 'error');
        return;
      }
    }

    setSavingProfile(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName.trim(),
          username: username.trim(),
          phone: phone.trim(),
          department: department.trim(),
          institutional_id: institutionalId.trim() || null,
          avatar_url: avatarUrl.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;
      addToast('Profile updated successfully!', 'success');
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : 'Failed to update profile.';
      addToast(msg, 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  // Handle Email Change
  const handleInitiateEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim() || newEmail === email) {
      addToast('Please enter a new, valid email address.', 'error');
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        email: newEmail.trim(),
      });
      if (error) throw error;

      setEmailChangePending(true);
      addToast(`Verification sent to ${newEmail}. Please confirm via the link in your inbox.`, 'success');
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : 'Could not change email.';
      addToast(msg, 'error');
    }
  };

  // Handle Password Change (3 Inputs)
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      addToast('Please enter your current password.', 'error');
      return;
    }
    if (newPassword.length < 8) {
      addToast('New password must be at least 8 characters long.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      addToast('New passwords do not match.', 'error');
      return;
    }

    setUpdatingPassword(true);
    try {
      // Re-verify current password first
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email,
        password: currentPassword,
      });
      if (signInErr) {
        throw new Error('Current password verification failed. Please check your credentials.');
      }

      // Update password
      const { error: updateErr } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (updateErr) throw updateErr;

      addToast('Password updated securely!', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : 'Failed to update password.';
      addToast(msg, 'error');
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    addToast('Logged out of Findly.', 'info');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#F5F8FC] py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">Student Profile & Settings</h1>
            <p className="text-xs text-text-secondary mt-0.5">
              Manage your SVCE Tirupati academic credentials, contact info, and security preferences
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-red-600 bg-white hover:bg-red-50 border border-red-200 rounded-md shadow-card transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" /> Log Out
          </button>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-xl p-6 sm:p-8 border border-border-default shadow-card space-y-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-6 border-b border-border-default">
            {/* Avatar */}
            <div className="relative w-24 h-24 rounded-full bg-[#EEF5FF] text-primary flex items-center justify-center font-bold text-3xl border-2 border-primary-200 overflow-hidden flex-shrink-0">
              {avatarUrl ? (
                <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" />
              ) : (
                fullName.charAt(0).toUpperCase() || 'U'
              )}
            </div>

            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h2 className="text-xl font-bold text-text-primary">{fullName || 'Campus User'}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase bg-primary-50 text-primary-700 border border-primary-200">
                  {role}
                </span>
              </div>
              <p className="text-xs text-text-secondary mt-1">@{username || 'student'} • {email}</p>
              <p className="text-xs text-text-secondary mt-0.5">{department}</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">
              Profile Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-text-primary mb-1 block">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-surface-subtle border border-border-default rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 text-text-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-text-primary mb-1 block">Username (3-30 chars)</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-surface-subtle border border-border-default rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 text-text-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-text-primary mb-1 block">Phone Number</label>
                <input
                  type="text"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-surface-subtle border border-border-default rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 text-text-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-text-primary mb-1 block">Institutional ID (Roll No)</label>
                <input
                  type="text"
                  placeholder="e.g., 23SVCE0129"
                  value={institutionalId}
                  onChange={(e) => setInstitutionalId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-surface-subtle border border-border-default rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 text-text-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-text-primary mb-1 block">Department</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-surface-subtle border border-border-default rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 text-text-primary"
                >
                  <option value="Computer Science and Engineering">Computer Science and Engineering</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Electronics and Communication Engineering">Electronics and Communication Engineering</option>
                  <option value="Electrical and Electronics Engineering">Electrical and Electronics Engineering</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Civil Engineering">Civil Engineering</option>
                  <option value="Master of Business Administration">MBA</option>
                  <option value="Master of Computer Applications">MCA</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-text-primary mb-1 block">Avatar Image URL</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-surface-subtle border border-border-default rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 text-text-primary"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white rounded-md text-xs font-semibold shadow-sm transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              {savingProfile ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>

        {/* Email Change Section */}
        <div className="bg-white rounded-xl p-6 sm:p-8 border border-border-default shadow-card space-y-4">
          <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
            <Mail className="w-4 h-4 text-primary-500" /> Change Email Address
          </h3>
          <p className="text-xs text-text-secondary">
            Current verified email: <strong className="text-text-primary">{email}</strong>. New emails require confirmation before updating.
          </p>

          {emailChangePending && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-xs text-amber-800 flex items-center gap-2">
              <Clock className="w-4 h-4 text-warning" />
              <span>Verification email sent. Please click the confirmation link in your inbox.</span>
            </div>
          )}

          <form onSubmit={handleInitiateEmailChange} className="flex flex-col sm:flex-row gap-3 max-w-lg">
            <input
              type="email"
              placeholder="Enter new email address..."
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="flex-1 px-3 py-2 text-xs bg-surface-subtle border border-border-default rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 text-text-primary"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-white border border-border-default hover:bg-slate-50 text-text-primary text-xs font-semibold rounded-md transition-colors"
            >
              Send Verification
            </button>
          </form>
        </div>

        {/* Password Change Section (Exactly 3 inputs) */}
        <div className="bg-white rounded-xl p-6 sm:p-8 border border-border-default shadow-card space-y-4">
          <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
            <Key className="w-4 h-4 text-primary-500" /> Update Password
          </h3>
          <p className="text-xs text-text-secondary">
            Change your account password securely using Supabase authentication
          </p>

          <form onSubmit={handleUpdatePassword} className="space-y-3 max-w-md">
            <div>
              <label className="text-xs font-semibold text-text-primary mb-1 block">Current Password</label>
              <input
                type="password"
                placeholder="Enter current password..."
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-surface-subtle border border-border-default rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 text-text-primary"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-text-primary mb-1 block">New Password (min 8 chars)</label>
              <input
                type="password"
                placeholder="Enter new password..."
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-surface-subtle border border-border-default rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 text-text-primary"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-text-primary mb-1 block">Confirm New Password</label>
              <input
                type="password"
                placeholder="Re-enter new password..."
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-surface-subtle border border-border-default rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 text-text-primary"
              />
            </div>

            <button
              type="submit"
              disabled={updatingPassword}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white rounded-md text-xs font-semibold shadow-sm transition-colors"
            >
              {updatingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
