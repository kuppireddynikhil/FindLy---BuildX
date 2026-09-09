import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { recoveryService } from '../services/recoveryService';
import type { RecoveryCase } from '../services/recoveryService';
import { StatusBadge, EmptyState, LoadingSkeleton, RecoveryTimeline } from '../components/ui/ArcticPearlComponents';
import {
  MapPin,
  ExternalLink,
  LifeBuoy
} from 'lucide-react';

export function UserRecoveryPage() {
  const { user } = useAuth();
  const [cases, setCases] = useState<RecoveryCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState<RecoveryCase | null>(null);

  useEffect(() => {
    async function loadCases() {
      if (!user) return;
      setLoading(true);
      const data = await recoveryService.getUserRecoveryCases(user.id);
      setCases(data);
      if (data.length > 0) {
        setSelectedCase(data[0]);
      }
      setLoading(false);
    }
    loadCases();
  }, [user]);

  return (
    <div className="min-h-screen bg-[#F5F8FC] py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Recovery Cases</h1>
          <p className="text-xs text-text-secondary mt-1">
            Track verification, claim progress, and campus security desk handover appointments
          </p>
        </div>

        {loading ? (
          <LoadingSkeleton rows={3} />
        ) : cases.length === 0 ? (
          <EmptyState
            title="No recovery cases found."
            description="You do not currently have any active item recovery cases. When a verified match or claim is confirmed, tracking progress will be displayed here."
            actionLabel="Search Campus Feed"
            onAction={() => (window.location.href = '/search')}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Case List */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-2">
                Active Cases ({cases.length})
              </h3>
              {cases.map((c) => {
                const isSelected = selectedCase?.id === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCase(c)}
                    className={`p-4 bg-white rounded-lg border cursor-pointer transition-all shadow-card ${
                      isSelected
                        ? 'border-primary-500 ring-2 ring-primary-50 shadow-soft'
                        : 'border-border-default hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-mono font-bold text-primary-700">
                        {c.case_number || `RC-${c.id.substring(0, 8)}`}
                      </span>
                      <StatusBadge status={c.status} size="sm" />
                    </div>
                    <h4 className="text-sm font-bold text-text-primary truncate">
                      {c.report?.title || 'Campus Belonging'}
                    </h4>
                    <p className="text-xs text-text-secondary truncate mt-0.5">
                      {c.report?.building || 'SVCE Campus'}
                    </p>
                    <div className="mt-3 pt-2 border-t border-border-default flex items-center justify-between text-[10px] text-text-disabled">
                      <span>Initiated: {new Date(c.created_at).toLocaleDateString()}</span>
                      <span className="text-primary-600 font-semibold">View Case →</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Detailed Case View */}
            <div className="md:col-span-2">
              {selectedCase ? (
                <div className="bg-white rounded-xl p-6 sm:p-8 border border-border-default shadow-card space-y-6">
                  {/* Case Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-border-default">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded">
                          {selectedCase.case_number || `RC-${selectedCase.id.substring(0, 8)}`}
                        </span>
                        <StatusBadge status={selectedCase.status} size="md" />
                      </div>
                      <h2 className="text-xl font-bold text-text-primary">
                        {selectedCase.report?.title || 'Campus Lost Item Recovery'}
                      </h2>
                    </div>

                    {selectedCase.report_id && (
                      <Link
                        to={`/items/${selectedCase.report_id}`}
                        className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1 self-start sm:self-center"
                      >
                        View Original Report <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>

                  {/* Lifecycle Stepper */}
                  <div>
                    <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-4">
                      Recovery Progression Lifecycle
                    </h3>
                    <RecoveryTimeline
                      currentStatus={selectedCase.status}
                      reportedDate={new Date(selectedCase.created_at).toLocaleDateString()}
                      verifiedDate={selectedCase.verified_at ? new Date(selectedCase.verified_at).toLocaleDateString() : undefined}
                      handoverDate={selectedCase.handover_date ? new Date(selectedCase.handover_date).toLocaleDateString() : undefined}
                      completedDate={selectedCase.completed_at ? new Date(selectedCase.completed_at).toLocaleDateString() : undefined}
                    />
                  </div>

                  {/* Handover & Location Info */}
                  <div className="p-4 bg-surface-subtle rounded-lg border border-border-default space-y-3 text-xs">
                    <h4 className="font-bold text-text-primary flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-primary-500" /> Handover Instructions
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                      <div>
                        <span className="text-text-secondary block">Location:</span>
                        <span className="font-semibold text-text-primary">
                          {selectedCase.handover_location || 'SVCE Tirupati Campus Security Desk, Ground Floor Main Block'}
                        </span>
                      </div>
                      <div>
                        <span className="text-text-secondary block">Scheduled Time:</span>
                        <span className="font-semibold text-text-primary">
                          {selectedCase.handover_date
                            ? new Date(selectedCase.handover_date).toLocaleString()
                            : 'Pending Moderator Scheduling'}
                        </span>
                      </div>
                    </div>
                    {selectedCase.notes && (
                      <div className="pt-2 border-t border-border-default text-text-secondary">
                        <span className="font-semibold text-text-primary">Moderator Notes: </span>
                        {selectedCase.notes}
                      </div>
                    )}
                  </div>

                  {/* Security Verification Protocol */}
                  <div className="p-4 bg-[#EEF5FF] rounded-lg border border-[#DCEAFF] text-xs flex items-start gap-3">
                    <LifeBuoy className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-primary-900 block mb-0.5">Mandatory Verification ID</span>
                      Please bring your official SVCE Student Identity Card and any serial/photo proof to the Security Desk for physical handover clearance.
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-12 bg-white rounded-xl border border-border-default text-center text-xs text-text-disabled">
                  Select a case on the left to view details.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
