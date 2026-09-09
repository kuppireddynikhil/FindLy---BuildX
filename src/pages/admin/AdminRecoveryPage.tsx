import { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { recoveryService } from '../../services/recoveryService';
import type { RecoveryCase } from '../../services/recoveryService';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../components/ui/Toast';
import { StatusBadge, EmptyState, LoadingSkeleton, RecoveryTimeline } from '../../components/ui/ArcticPearlComponents';
import {
  ShieldCheck,
  Calendar,
  CheckCircle2,
  X
} from 'lucide-react';

export function AdminRecoveryPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [cases, setCases] = useState<RecoveryCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState<RecoveryCase | null>(null);

  // Modal State for Schedule Handover
  const [schedulingModal, setSchedulingModal] = useState(false);
  const [handoverDateInput, setHandoverDateInput] = useState('');
  const [handoverLocationInput, setHandoverLocationInput] = useState(
    'SVCE Tirupati Campus Security & Student Affairs Desk, Ground Floor Main Block'
  );

  const loadCases = async () => {
    setLoading(true);
    const data = await recoveryService.getAdminRecoveryCases();
    setCases(data);
    if (data.length > 0 && !selectedCase) {
      setSelectedCase(data[0]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadCases();
  }, []);

  const handleVerify = async (caseId: string) => {
    if (!user) return;
    const ok = await recoveryService.verifyCase(caseId, user.id);
    if (ok) {
      addToast('Identity verification approved! Ready to schedule handover.', 'success');
      loadCases();
      if (selectedCase?.id === caseId) {
        setSelectedCase({ ...selectedCase, status: 'VERIFIED' });
      }
    } else {
      addToast('Failed to verify case.', 'error');
    }
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedCase || !handoverDateInput) return;

    const ok = await recoveryService.scheduleHandover(
      selectedCase.id,
      user.id,
      handoverDateInput,
      handoverLocationInput
    );
    if (ok) {
      addToast('Campus security handover scheduled and parties notified!', 'success');
      setSchedulingModal(false);
      loadCases();
      setSelectedCase({
        ...selectedCase,
        status: 'HANDOVER_SCHEDULED',
        handover_date: handoverDateInput,
        handover_location: handoverLocationInput,
      });
    } else {
      addToast('Failed to schedule handover.', 'error');
    }
  };

  const handleComplete = async (caseId: string) => {
    if (!user) return;
    if (!confirm('Confirm that the physical item has been inspected and handed over to the claimant?')) return;

    const ok = await recoveryService.completeRecovery(caseId, user.id);
    if (ok) {
      addToast('Recovery case successfully completed! Report closed in database.', 'success');
      loadCases();
      if (selectedCase?.id === caseId) {
        setSelectedCase({ ...selectedCase, status: 'COMPLETED' });
      }
    } else {
      addToast('Failed to complete recovery.', 'error');
    }
  };

  const handleReject = async (caseId: string) => {
    if (!user) return;
    const reason = prompt('Please enter the justification for rejecting this claim:');
    if (!reason) return;

    const ok = await recoveryService.cancelCase(caseId, user.id, reason);
    if (ok) {
      addToast('Claim rejected.', 'info');
      loadCases();
      if (selectedCase?.id === caseId) {
        setSelectedCase({ ...selectedCase, status: 'REJECTED' });
      }
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Recovery Cases & Handovers</h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Administer identity verification, security desk scheduling, and item returns across SVCE Tirupati
          </p>
        </div>

        {loading ? (
          <LoadingSkeleton rows={4} />
        ) : cases.length === 0 ? (
          <EmptyState
            title="No recovery cases found."
            description="There are currently no active recovery cases or pending ownership claims in the database."
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cases Table (2 Cols) */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-border-default shadow-card overflow-hidden">
              <div className="p-4 border-b border-border-default bg-surface-subtle">
                <span className="text-xs font-bold text-text-primary uppercase tracking-wider">
                  Recovery Pipeline ({cases.length})
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-subtle border-b border-border-default text-text-secondary uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="px-4 py-3">Case ID</th>
                      <th className="px-4 py-3">Item</th>
                      <th className="px-4 py-3">Claimant</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-default">
                    {cases.map((c) => {
                      const isSelected = selectedCase?.id === c.id;
                      return (
                        <tr
                          key={c.id}
                          onClick={() => setSelectedCase(c)}
                          className={`cursor-pointer transition-colors ${
                            isSelected ? 'bg-primary-50/70 font-semibold' : 'hover:bg-slate-50'
                          }`}
                        >
                          <td className="px-4 py-3.5 font-mono text-primary-700 font-bold">
                            {c.case_number || `RC-${c.id.substring(0, 8)}`}
                          </td>
                          <td className="px-4 py-3.5 text-text-primary max-w-xs truncate">
                            {c.report?.title || 'Campus Item'}
                          </td>
                          <td className="px-4 py-3.5 text-text-secondary">
                            {c.claimant?.full_name || 'Student'}
                          </td>
                          <td className="px-4 py-3.5">
                            <StatusBadge status={c.status} size="sm" />
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <span className="text-xs text-primary-600 font-semibold">Inspect →</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Case Detail & Workflow Actions Panel (1 Col) */}
            <div className="bg-white rounded-xl p-6 border border-border-default shadow-card space-y-6">
              {selectedCase ? (
                <>
                  <div className="pb-3 border-b border-border-default">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-xs font-bold text-primary-700">
                        {selectedCase.case_number || `RC-${selectedCase.id.substring(0, 8)}`}
                      </span>
                      <StatusBadge status={selectedCase.status} size="sm" />
                    </div>
                    <h3 className="text-base font-bold text-text-primary">
                      {selectedCase.report?.title || 'Campus Recovery Case'}
                    </h3>
                  </div>

                  {/* Lifecycle Stepper */}
                  <div>
                    <h4 className="text-[11px] font-bold text-text-primary uppercase tracking-wider mb-2">
                      Lifecycle Progress
                    </h4>
                    <RecoveryTimeline
                      currentStatus={selectedCase.status}
                      reportedDate={new Date(selectedCase.created_at).toLocaleDateString()}
                      verifiedDate={selectedCase.verified_at ? new Date(selectedCase.verified_at).toLocaleDateString() : undefined}
                      handoverDate={selectedCase.handover_date ? new Date(selectedCase.handover_date).toLocaleDateString() : undefined}
                      completedDate={selectedCase.completed_at ? new Date(selectedCase.completed_at).toLocaleDateString() : undefined}
                    />
                  </div>

                  {/* Claimant & Finder Info */}
                  <div className="p-3.5 bg-surface-subtle rounded-lg border border-border-default space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Claimant:</span>
                      <span className="font-bold text-text-primary">{selectedCase.claimant?.full_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Department:</span>
                      <span className="text-text-primary">{selectedCase.claimant?.department || 'SVCE Student'}</span>
                    </div>
                    {selectedCase.handover_date && (
                      <div className="flex justify-between pt-1 border-t border-border-default">
                        <span className="text-text-secondary">Scheduled Date:</span>
                        <span className="font-semibold text-primary-700">
                          {new Date(selectedCase.handover_date).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Admin Lifecycle Action Controls */}
                  <div className="pt-3 border-t border-border-default space-y-2">
                    <span className="text-xs font-bold text-text-primary block mb-1">
                      Moderator Actions:
                    </span>

                    {selectedCase.status === 'OPEN' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleVerify(selectedCase.id)}
                          className="flex-1 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded text-xs font-semibold shadow-sm transition-colors flex items-center justify-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Verify Identity
                        </button>
                        <button
                          onClick={() => handleReject(selectedCase.id)}
                          className="py-2 px-3 bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded text-xs font-semibold transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    )}

                    {selectedCase.status === 'VERIFIED' && (
                      <button
                        onClick={() => setSchedulingModal(true)}
                        className="w-full py-2 bg-[#7C3AED] hover:bg-purple-700 text-white rounded text-xs font-semibold shadow-sm transition-colors flex items-center justify-center gap-1"
                      >
                        <Calendar className="w-3.5 h-3.5" /> Schedule Security Desk Handover
                      </button>
                    )}

                    {selectedCase.status === 'HANDOVER_SCHEDULED' && (
                      <button
                        onClick={() => handleComplete(selectedCase.id)}
                        className="w-full py-2 bg-success hover:bg-emerald-700 text-white rounded text-xs font-bold shadow-sm transition-colors flex items-center justify-center gap-1"
                      >
                        <ShieldCheck className="w-4 h-4" /> Complete Physical Handover
                      </button>
                    )}

                    {selectedCase.status === 'COMPLETED' && (
                      <div className="p-2.5 bg-emerald-50 text-emerald-800 rounded border border-emerald-200 text-center text-xs font-semibold flex items-center justify-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-success" /> Case Resolved & Handed Over
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center text-xs text-text-disabled py-12">
                  Select a case from the table to inspect details.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Schedule Handover Modal */}
        {schedulingModal && selectedCase && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white rounded-xl max-w-md w-full p-6 border border-border-default shadow-premium">
              <div className="flex items-center justify-between pb-3 border-b border-border-default">
                <h3 className="text-sm font-bold text-text-primary">Schedule Security Desk Handover</h3>
                <button onClick={() => setSchedulingModal(false)} className="text-text-disabled hover:text-text-primary">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleScheduleSubmit} className="space-y-4 mt-4 text-xs">
                <div>
                  <label className="font-semibold text-text-primary mb-1 block">Appointment Date & Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={handoverDateInput}
                    onChange={(e) => setHandoverDateInput(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-subtle border border-border-default rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 text-text-primary"
                  />
                </div>

                <div>
                  <label className="font-semibold text-text-primary mb-1 block">Handover Desk Location</label>
                  <input
                    type="text"
                    value={handoverLocationInput}
                    onChange={(e) => setHandoverLocationInput(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-subtle border border-border-default rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 text-text-primary"
                  />
                </div>

                <div className="p-3 bg-[#EEF5FF] rounded border border-[#DCEAFF] text-primary-800">
                  Both the claimant and finder will receive real-time notifications with this appointment schedule.
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSchedulingModal(false)}
                    className="px-3.5 py-1.5 bg-white border border-border-default text-text-secondary rounded hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded shadow-sm transition-colors"
                  >
                    Confirm Handover
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
