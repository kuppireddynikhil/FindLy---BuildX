import React from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
  XCircle,
  Archive,
  Search,
  Lock,
  RefreshCw,
  HelpCircle
} from 'lucide-react';

// ============================================================
// 1. StatusBadge Component
// ============================================================
export interface StatusBadgeProps {
  status: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '', size = 'md' }) => {
  const norm = (status || '').toUpperCase().trim();

  let bg = 'bg-[#F1F5F9] text-[#475569] border-[#E2E8F0]';
  let Icon: LucideIcon = HelpCircle;
  let label = status;

  if (norm === 'LOST') {
    bg = 'bg-[#FBF0DD] text-[#B7791F] border-[#F6E0B5]';
    Icon = AlertCircle;
    label = 'Lost Item';
  } else if (norm === 'FOUND') {
    bg = 'bg-[#EEF5FF] text-[#2F7BFF] border-[#DCEAFF]';
    Icon = CheckCircle2;
    label = 'Found Item';
  } else if (norm === 'ACTIVE' || norm === 'OPEN') {
    bg = 'bg-[#E6F6EE] text-[#12875A] border-[#C3EBD7]';
    Icon = CheckCircle2;
    label = 'Active';
  } else if (norm === 'MATCHED' || norm === 'POTENTIAL_MATCH' || norm === 'SUGGESTED') {
    bg = 'bg-[#DCEAFF] text-[#1E63E0] border-[#B9D5FF]';
    Icon = Sparkles;
    label = 'Potential Match';
  } else if (norm === 'RECOVERED' || norm === 'COMPLETED' || norm === 'RESOLVED') {
    bg = 'bg-[#E6F6EE] text-[#12875A] border-[#C3EBD7]';
    Icon = ShieldCheck;
    label = 'Recovered';
  } else if (norm === 'PENDING' || norm === 'PENDING_REVIEW') {
    bg = 'bg-[#FBF0DD] text-[#B7791F] border-[#F6E0B5]';
    Icon = Clock;
    label = 'Pending Review';
  } else if (norm === 'VERIFIED') {
    bg = 'bg-[#DCEAFF] text-[#154FB8] border-[#B9D5FF]';
    Icon = ShieldCheck;
    label = 'Verified';
  } else if (norm === 'HANDOVER_SCHEDULED') {
    bg = 'bg-[#F0E7FE] text-[#7C3AED] border-[#DDD6FE]';
    Icon = Clock;
    label = 'Handover Scheduled';
  } else if (norm === 'DECLINED' || norm === 'REVOKED' || norm === 'REJECTED') {
    bg = 'bg-[#FCEBEB] text-[#C53030] border-[#F8D2D2]';
    Icon = XCircle;
    label = norm === 'REVOKED' ? 'Access Revoked' : norm === 'DECLINED' ? 'Declined' : 'Rejected';
  } else if (norm === 'WITHDRAWN' || norm === 'CLOSED' || norm === 'ARCHIVED' || norm === 'CANCELLED') {
    bg = 'bg-[#F1F5F9] text-[#64748B] border-[#E2E8F0]';
    Icon = Archive;
    label = norm === 'WITHDRAWN' ? 'Withdrawn' : norm === 'CANCELLED' ? 'Cancelled' : 'Closed';
  }

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5 font-medium',
    lg: 'px-3 py-1.5 text-sm gap-2 font-medium',
  }[size];

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full border shadow-sm transition-all duration-150 ${sizeClasses} ${bg} ${className}`}
    >
      <Icon className={iconSizes} />
      <span>{label}</span>
    </span>
  );
};

// ============================================================
// 2. AdminStatCard Component
// ============================================================
export interface AdminStatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendPositive?: boolean;
  subtext?: string;
  badgeColor?: string;
  className?: string;
}

export const AdminStatCard: React.FC<AdminStatCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  trendPositive = true,
  subtext,
  className = '',
}) => {
  return (
    <div
      className={`bg-white rounded-lg p-5 border border-border-default shadow-card hover:shadow-soft transition-all duration-200 ${className}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-text-secondary">{title}</span>
        <div className="w-10 h-10 rounded-md bg-[#EEF5FF] text-primary flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary" />
        </div>
      </div>
      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-3xl font-bold text-text-primary tracking-tight">{value}</span>
        {trend && (
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              trendPositive ? 'bg-success-bg text-success' : 'bg-error-bg text-error'
            }`}
          >
            {trend}
          </span>
        )}
      </div>
      {subtext && <p className="mt-1.5 text-xs text-text-secondary">{subtext}</p>}
    </div>
  );
};

// ============================================================
// 3. EmptyState Component
// ============================================================
export interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: LucideIcon;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No reports found.',
  description = 'No matching items or records were found for this query.',
  icon: Icon = Search,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-12 text-center bg-white rounded-lg border border-border-default shadow-card ${className}`}
    >
      <div className="w-14 h-14 rounded-full bg-surface-subtle border border-border-default flex items-center justify-center mb-4 text-text-disabled">
        <Icon className="w-7 h-7 text-primary-500/70" />
      </div>
      <h3 className="text-base font-semibold text-text-primary mb-1">{title}</h3>
      <p className="text-sm text-text-secondary max-w-sm mb-6">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-md shadow-sm transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

// ============================================================
// 4. LoadingSkeleton Component
// ============================================================
export const LoadingSkeleton: React.FC<{ rows?: number; className?: string }> = ({
  rows = 3,
  className = '',
}) => {
  return (
    <div className={`space-y-4 animate-pulse ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="p-4 bg-white rounded-lg border border-border-default shadow-card flex gap-4">
          <div className="w-16 h-16 rounded-md bg-slate-100 flex-shrink-0" />
          <div className="flex-1 space-y-2 py-1">
            <div className="h-4 bg-slate-100 rounded w-1/3" />
            <div className="h-3 bg-slate-100 rounded w-2/3" />
            <div className="h-3 bg-slate-100 rounded w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );
};

// ============================================================
// 5. ErrorState Component
// ============================================================
export const ErrorState: React.FC<{
  message?: string;
  onRetry?: () => void;
  className?: string;
}> = ({
  message = 'An unexpected error occurred while communicating with the campus server.',
  onRetry,
  className = '',
}) => {
  return (
    <div
      className={`p-6 bg-[#FCEBEB] border border-[#F8D2D2] rounded-lg text-center ${className}`}
    >
      <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-red-100 text-error mb-3">
        <AlertCircle className="w-5 h-5" />
      </div>
      <h4 className="text-sm font-semibold text-error mb-1">Service Error</h4>
      <p className="text-xs text-red-700 max-w-md mx-auto mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-800 bg-white border border-red-300 hover:bg-red-50 rounded-md transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Retry
        </button>
      )}
    </div>
  );
};

// ============================================================
// 6. PermissionDenied Component
// ============================================================
export const PermissionDenied: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-12 text-center bg-white rounded-lg border border-border-default shadow-card ${className}`}
    >
      <div className="w-14 h-14 rounded-full bg-red-50 border border-red-200 flex items-center justify-center mb-4 text-error">
        <Lock className="w-7 h-7" />
      </div>
      <h3 className="text-base font-semibold text-text-primary mb-1">
        You don't have permission to view this.
      </h3>
      <p className="text-sm text-text-secondary max-w-md mb-6">
        This section is restricted to authorized campus staff and administrators. Please log in with an administrative account.
      </p>
      <a
        href="/home"
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-md shadow-sm transition-colors"
      >
        Return to Campus Home
      </a>
    </div>
  );
};

// ============================================================
// 7. RecoveryTimeline Component
// ============================================================
export interface RecoveryTimelineProps {
  currentStatus: string;
  reportedDate?: string;
  matchScore?: number;
  verifiedDate?: string;
  handoverDate?: string;
  completedDate?: string;
  className?: string;
}

export const RecoveryTimeline: React.FC<RecoveryTimelineProps> = ({
  currentStatus,
  reportedDate,
  matchScore,
  verifiedDate,
  handoverDate,
  completedDate,
  className = '',
}) => {
  const steps = [
    { key: 'REPORTED', label: 'Reported', date: reportedDate || 'Submitted' },
    { key: 'MATCH', label: 'Potential Match', date: matchScore ? `${matchScore}% match` : 'Evaluated' },
    { key: 'VERIFIED', label: 'Identity Verification', date: verifiedDate || 'Pending review' },
    { key: 'HANDOVER', label: 'Handover Scheduled', date: handoverDate || 'At Security Desk' },
    { key: 'COMPLETED', label: 'Completed', date: completedDate || 'Handed Over' },
  ];

  const norm = (currentStatus || '').toUpperCase();
  let activeIndex = 0;
  if (norm === 'COMPLETED' || norm === 'RECOVERED') activeIndex = 4;
  else if (norm === 'HANDOVER_SCHEDULED') activeIndex = 3;
  else if (norm === 'VERIFIED') activeIndex = 2;
  else if (norm === 'MATCHED' || norm === 'SUGGESTED') activeIndex = 1;
  else activeIndex = 0;

  return (
    <div className={`py-4 ${className}`}>
      <div className="flex items-center justify-between relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-border-default w-full -z-0" />
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-primary-500 transition-all duration-300 -z-0"
          style={{ width: `${(activeIndex / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step, idx) => {
          const isDone = idx <= activeIndex;
          const isCurrent = idx === activeIndex;
          return (
            <div key={step.key} className="flex flex-col items-center relative z-10">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  isDone
                    ? 'bg-primary-500 text-white shadow-sm ring-4 ring-primary-50'
                    : 'bg-white border-2 border-border-default text-text-disabled'
                }`}
              >
                {isDone && !isCurrent ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
              </div>
              <span
                className={`text-xs mt-2 font-medium ${
                  isCurrent ? 'text-primary-600 font-semibold' : isDone ? 'text-text-primary' : 'text-text-disabled'
                }`}
              >
                {step.label}
              </span>
              <span className="text-[11px] text-text-secondary mt-0.5">{step.date}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
