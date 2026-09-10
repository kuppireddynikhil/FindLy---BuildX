import { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { useAuth } from '../../hooks/useAuth';
import { adminService } from '../../services/adminService';
import type { AuditLogItem } from '../../services/adminService';
import { supabase } from '../../lib/supabase';
import {
  Shield,
  Sliders,
  Bell,
  SlidersHorizontal,
  CheckCircle2,
  AlertTriangle,
  Lock,
  User,
  Activity,
  Save,
  RotateCcw,
  Sparkles
} from 'lucide-react';

export function AdminSettingsPage() {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'system' | 'security' | 'notifications' | 'audit'>('system');

  // System Config State
  const [matchThreshold, setMatchThreshold] = useState(65);
  const [preliminaryLimit, setPreliminaryLimit] = useState(2);
  const [retentionDays, setRetentionDays] = useState(90);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [autoVerifyMatches, setAutoVerifyMatches] = useState(false);

  // Notification Preferences
  const [notifyNewLost, setNotifyNewLost] = useState(true);
  const [notifyNewFound, setNotifyNewFound] = useState(true);
  const [notifyHighMatch, setNotifyHighMatch] = useState(true);
  const [notifyHandoverScheduled, setNotifyHandoverScheduled] = useState(true);

  // Password update state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Audit logs state
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [loadingAudit, setLoadingAudit] = useState(false);

  // Feedback State
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === 'audit') {
      loadAuditLogs();
    }
  }, [activeTab]);

  const loadAuditLogs = async () => {
    setLoadingAudit(true);
    const logs = await adminService.getAuditLogs(25);
    setAuditLogs(logs);
    setLoadingAudit(false);
  };

  const handleSaveSystemConfig = async () => {
    if (user?.id) {
      await adminService.logAudit(user.id, 'SYSTEM_CONFIG_UPDATED', 'system_settings', undefined, {
        matchThreshold,
        preliminaryLimit,
        retentionDays,
        maintenanceMode,
        autoVerifyMatches
      });
    }
    setSavedMessage('System configuration and matching algorithm parameters updated successfully.');
    setTimeout(() => setSavedMessage(null), 4000);
  };

  const handleSaveNotifications = async () => {
    if (user?.id) {
      await adminService.logAudit(user.id, 'ADMIN_NOTIFICATIONS_UPDATED', 'admin_preferences', undefined, {
        notifyNewLost,
        notifyNewFound,
        notifyHighMatch,
        notifyHandoverScheduled
      });
    }
    setSavedMessage('Admin alert preferences updated.');
    setTimeout(() => setSavedMessage(null), 4000);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setPasswordLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        setPasswordError(error.message);
      } else {
        setSavedMessage('Admin credential password updated successfully.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        if (user?.id) {
          await adminService.logAudit(user.id, 'PASSWORD_CHANGED', 'profiles', user.id);
        }
      }
    } catch {
      setPasswordError('Failed to update password.');
    } finally {
      setPasswordLoading(false);
      setTimeout(() => setSavedMessage(null), 4000);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary-50 text-primary-700 text-xs font-semibold mb-1">
            <Sliders size={12} className="text-primary-500" />
            Global Administration & Policies
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
            System Settings & Security Desk
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Configure deterministic matching criteria, preliminary message safety limits, alerts, and access logs.
          </p>
        </div>

        {/* Saved Banner */}
        {savedMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>{savedMessage}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-border bg-white rounded-xl p-1 shadow-sm gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('system')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'system'
                ? 'bg-primary-50 text-primary-600 shadow-xs'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface'
            }`}
          >
            <SlidersHorizontal size={16} />
            System & Matching Engine
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'security'
                ? 'bg-primary-50 text-primary-600 shadow-xs'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface'
            }`}
          >
            <Shield size={16} />
            Security & Authentication
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'notifications'
                ? 'bg-primary-50 text-primary-600 shadow-xs'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface'
            }`}
          >
            <Bell size={16} />
            Alerts & Security Desk
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'audit'
                ? 'bg-primary-50 text-primary-600 shadow-xs'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface'
            }`}
          >
            <Activity size={16} />
            Audit Trails
          </button>
        </div>

        {/* Tab 1: System & Matching Engine */}
        {activeTab === 'system' && (
          <div className="space-y-6">
            <div className="bg-white border border-border rounded-xl p-6 shadow-sm space-y-6">
              <div>
                <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
                  <Sparkles size={18} className="text-primary-500" />
                  Deterministic Algorithm Scoring Threshold
                </h3>
                <p className="text-xs text-text-secondary mt-1">
                  Reports with a deterministic match score above this threshold trigger automatic candidate pairing and student notifications. Formula weight: 30% title/keywords, 20% category, 20% campus location, 15% date proximity, 15% description.
                </p>
              </div>

              <div className="bg-surface/50 border border-border rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-text-secondary uppercase">
                    Minimum Auto-Match Score
                  </label>
                  <span className="text-base font-bold text-primary-600 font-mono">
                    {matchThreshold}%
                  </span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="90"
                  step="5"
                  value={matchThreshold}
                  onChange={e => setMatchThreshold(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
                />
                <div className="flex justify-between text-[11px] text-text-tertiary font-medium">
                  <span>50% (Permissive)</span>
                  <span>65% (Recommended Baseline)</span>
                  <span>90% (Strict Exact)</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="bg-surface/50 border border-border rounded-xl p-4 space-y-2">
                  <label className="block text-xs font-bold text-text-secondary uppercase">
                    Controlled Preliminary Message Limit
                  </label>
                  <p className="text-xs text-text-tertiary">
                    Maximum preliminary messages allowed to a claimant while the request is in PENDING status.
                  </p>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={preliminaryLimit}
                    onChange={e => setPreliminaryLimit(parseInt(e.target.value) || 2)}
                    className="w-full px-3 py-2 text-sm bg-white border border-border rounded-lg focus:outline-none focus:border-primary-500 font-semibold text-text-primary"
                  />
                </div>

                <div className="bg-surface/50 border border-border rounded-xl p-4 space-y-2">
                  <label className="block text-xs font-bold text-text-secondary uppercase">
                    Archival Retention Period (Days)
                  </label>
                  <p className="text-xs text-text-tertiary">
                    Reports older than this duration without recovery are archived to the historic ledger.
                  </p>
                  <input
                    type="number"
                    min="30"
                    max="365"
                    value={retentionDays}
                    onChange={e => setRetentionDays(parseInt(e.target.value) || 90)}
                    className="w-full px-3 py-2 text-sm bg-white border border-border rounded-lg focus:outline-none focus:border-primary-500 font-semibold text-text-primary"
                  />
                </div>
              </div>

              <div className="p-3 bg-surface/50 border border-border rounded-xl">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={autoVerifyMatches}
                    onChange={e => setAutoVerifyMatches(e.target.checked)}
                    className="rounded border-border text-primary-500 focus:ring-primary-500 w-4 h-4"
                  />
                  <div>
                    <span className="text-xs font-bold text-text-primary block">
                      Automatic High-Confidence Pair Validation
                    </span>
                    <span className="text-[11px] text-text-secondary block">
                      Instantly recommend security desk verification when deterministic score exceeds 90%.
                    </span>
                  </div>
                </label>
              </div>

              {/* Maintenance Mode Alert Box */}
              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/70 flex items-start gap-3">
                <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-amber-900">Emergency Campus Maintenance Mode</h4>
                  <p className="text-xs text-amber-700 mt-0.5">
                    When active, campus reporting is temporarily paused for database maintenance or semester transitions.
                  </p>
                  <label className="inline-flex items-center gap-2 mt-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={maintenanceMode}
                      onChange={e => setMaintenanceMode(e.target.checked)}
                      className="rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                    />
                    <span className="text-xs font-bold text-amber-900">
                      Enable System-Wide Maintenance Mode
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-border">
                <button
                  onClick={handleSaveSystemConfig}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-lg text-sm font-semibold shadow-sm transition-all"
                >
                  <Save size={16} />
                  Save System Parameters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Security & Authentication */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <div className="bg-white border border-border rounded-xl p-6 shadow-sm space-y-6">
              <div>
                <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
                  <Lock size={18} className="text-primary-500" />
                  Admin Account Credentials
                </h3>
                <p className="text-xs text-text-secondary mt-1">
                  Update administrative password and manage SVCE staff security credentials.
                </p>
              </div>

              {passwordError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
                  {passwordError}
                </div>
              )}

              <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    placeholder="Enter existing password"
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-surface rounded-lg border border-border focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase mb-1">
                    New Password (min 8 chars)
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-surface rounded-lg border border-border focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Re-type new password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-surface rounded-lg border border-border focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-lg text-sm font-semibold shadow-sm transition-all disabled:opacity-50"
                >
                  <Save size={16} />
                  {passwordLoading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>

            {/* Session & Institutional Identity */}
            <div className="bg-white border border-border rounded-xl p-6 shadow-sm">
              <h3 className="text-base font-bold text-text-primary flex items-center gap-2 mb-4">
                <User size={18} className="text-primary-500" />
                Active Staff Identity
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="bg-surface/50 border border-border rounded-xl p-3.5">
                  <span className="text-text-tertiary block mb-1">Authenticated Admin</span>
                  <span className="font-bold text-text-primary text-sm">{user?.email}</span>
                </div>
                <div className="bg-surface/50 border border-border rounded-xl p-3.5">
                  <span className="text-text-tertiary block mb-1">Authorization Scope</span>
                  <span className="font-bold text-primary-600 uppercase text-sm">
                    {profile?.role || 'SUPER_ADMIN'}
                  </span>
                </div>
                <div className="bg-surface/50 border border-border rounded-xl p-3.5">
                  <span className="text-text-tertiary block mb-1">Institution</span>
                  <span className="font-bold text-text-primary text-sm">SVCE Tirupati</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Alerts & Security Desk */}
        {activeTab === 'notifications' && (
          <div className="bg-white border border-border rounded-xl p-6 shadow-sm space-y-6">
            <div>
              <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
                <Bell size={18} className="text-primary-500" />
                Administrative Notification Rules
              </h3>
              <p className="text-xs text-text-secondary mt-1">
                Configure when the Central Security Desk and administrators receive high-priority alerts.
              </p>
            </div>

            <div className="space-y-3">
              <label className="flex items-center justify-between p-4 bg-surface/50 border border-border rounded-xl cursor-pointer hover:bg-surface">
                <div>
                  <p className="text-sm font-semibold text-text-primary">New Lost Item Report Alerts</p>
                  <p className="text-xs text-text-secondary">
                    Alert the Administrative desk whenever a student logs a missing item on campus.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notifyNewLost}
                  onChange={e => setNotifyNewLost(e.target.checked)}
                  className="rounded border-border text-primary-500 focus:ring-primary-500 w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-4 bg-surface/50 border border-border rounded-xl cursor-pointer hover:bg-surface">
                <div>
                  <p className="text-sm font-semibold text-text-primary">High-Confidence Match Alerts</p>
                  <p className="text-xs text-text-secondary">
                    Notify administrators when a match score exceeds 80% for immediate student review.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notifyHighMatch}
                  onChange={e => setNotifyHighMatch(e.target.checked)}
                  className="rounded border-border text-primary-500 focus:ring-primary-500 w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-4 bg-surface/50 border border-border rounded-xl cursor-pointer hover:bg-surface">
                <div>
                  <p className="text-sm font-semibold text-text-primary">Security Desk Handover Scheduled</p>
                  <p className="text-xs text-text-secondary">
                    Alert the Administrative Block front desk when a recovery handover appointment is confirmed.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notifyHandoverScheduled}
                  onChange={e => setNotifyHandoverScheduled(e.target.checked)}
                  className="rounded border-border text-primary-500 focus:ring-primary-500 w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-4 bg-surface/50 border border-border rounded-xl cursor-pointer hover:bg-surface">
                <div>
                  <p className="text-sm font-semibold text-text-primary">New High-Value Found Item Submissions</p>
                  <p className="text-xs text-text-secondary">
                    Instant alert for electronic devices, laptops, or official IDs found on campus grounds.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notifyNewFound}
                  onChange={e => setNotifyNewFound(e.target.checked)}
                  className="rounded border-border text-primary-500 focus:ring-primary-500 w-4 h-4"
                />
              </label>
            </div>

            <div className="flex justify-end pt-4 border-t border-border">
              <button
                onClick={handleSaveNotifications}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-lg text-sm font-semibold shadow-sm transition-all"
              >
                <Save size={16} />
                Save Alert Preferences
              </button>
            </div>
          </div>
        )}

        {/* Tab 4: Audit Trails */}
        {activeTab === 'audit' && (
          <div className="bg-white border border-border rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
                  <Activity size={18} className="text-primary-500" />
                  System Audit Logs
                </h3>
                <p className="text-xs text-text-secondary mt-1">
                  Immutable record of administrative interventions, status transitions, and user permission updates.
                </p>
              </div>
              <button
                onClick={loadAuditLogs}
                className="p-2 text-text-tertiary hover:text-text-primary hover:bg-surface rounded-lg transition-colors"
                title="Refresh logs"
              >
                <RotateCcw size={16} />
              </button>
            </div>

            {loadingAudit ? (
              <div className="p-8 text-center text-xs text-text-secondary">
                Loading audit trail records...
              </div>
            ) : auditLogs.length === 0 ? (
              <div className="p-8 text-center text-xs text-text-secondary">
                No recent audit actions recorded.
              </div>
            ) : (
              <div className="border border-border rounded-xl overflow-hidden divide-y divide-border">
                {auditLogs.map(log => (
                  <div key={log.id} className="p-3.5 text-xs flex items-start justify-between gap-4 hover:bg-surface/50 transition-colors">
                    <div>
                      <div className="flex items-center gap-2 font-semibold text-text-primary">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                        <span className="font-mono text-primary-600">{log.action}</span>
                        <span className="text-text-tertiary">on {log.entity}</span>
                      </div>
                      {log.metadata && Object.keys(log.metadata).length > 0 && (
                        <p className="font-mono text-[11px] text-text-secondary mt-1 bg-surface px-2 py-1 rounded border border-border/50">
                          {JSON.stringify(log.metadata)}
                        </p>
                      )}
                    </div>
                    <span className="text-[11px] text-text-tertiary whitespace-nowrap shrink-0">
                      {new Date(log.created_at).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
