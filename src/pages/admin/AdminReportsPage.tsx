import { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { reportsService } from '../../services/reportsService';
import type { ReportItem } from '../../services/reportsService';
import { StatusBadge, EmptyState, LoadingSkeleton } from '../../components/ui/ArcticPearlComponents';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../components/ui/Toast';
import { Search, X } from 'lucide-react';

export function AdminReportsPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);

  const loadReports = async () => {
    setLoading(true);
    const data = await reportsService.getReports({});
    setReports(data);
    setLoading(false);
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleStatusChange = async (reportId: string, newStatus: string) => {
    if (!user) return;
    const res = await reportsService.updateReportStatus(reportId, newStatus, user.id);
    if (res.success) {
      addToast(`Report status updated to ${newStatus}.`, 'success');
      loadReports();
      if (selectedReport && selectedReport.id === reportId) {
        setSelectedReport({ ...selectedReport, status: newStatus as any });
      }
    } else {
      addToast(res.error || 'Failed to update status', 'error');
    }
  };

  const filteredReports = reports.filter((r) => {
    const matchesSearch =
      !search ||
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase()) ||
      (r.building && r.building.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    const matchesType = typeFilter === 'ALL' || r.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">Manage Campus Reports</h1>
            <p className="text-xs text-text-secondary mt-0.5">
              Review, verify, and moderate all campus Lost & Found submissions across SVCE
            </p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-xl p-4 border border-border-default shadow-card flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-text-disabled absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search reports by title, description, or building..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-surface-subtle border border-border-default rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 text-text-primary"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-text-secondary font-medium">Type:</span>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-surface-subtle border border-border-default rounded px-2.5 py-1 text-xs text-text-primary font-medium focus:outline-none"
              >
                <option value="ALL">All Types</option>
                <option value="LOST">Lost Only</option>
                <option value="FOUND">Found Only</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-xs text-text-secondary font-medium">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-surface-subtle border border-border-default rounded px-2.5 py-1 text-xs text-text-primary font-medium focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="PENDING_REVIEW">Pending Review</option>
                <option value="MATCHED">Matched</option>
                <option value="RECOVERED">Recovered</option>
                <option value="WITHDRAWN">Withdrawn</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-xl border border-border-default shadow-card overflow-hidden">
          {loading ? (
            <div className="p-6">
              <LoadingSkeleton rows={4} />
            </div>
          ) : filteredReports.length === 0 ? (
            <EmptyState
              title="No reports found."
              description="No reports match your active filter criteria."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-subtle border-b border-border-default text-text-secondary uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="px-5 py-3.5">ID</th>
                    <th className="px-5 py-3.5">Item</th>
                    <th className="px-5 py-3.5">Type</th>
                    <th className="px-5 py-3.5">Facility</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Reported</th>
                    <th className="px-5 py-3.5 text-right">Moderator Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-default">
                  {filteredReports.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3.5 font-mono text-primary-700 font-bold">
                        {r.id.substring(0, 8).toUpperCase()}
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-text-primary max-w-xs truncate">
                        {r.title}
                        <span className="block text-[11px] font-normal text-text-secondary">{r.category}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={r.type} size="sm" />
                      </td>
                      <td className="px-5 py-3.5 text-text-secondary">
                        {r.building || 'SVCE Campus'}
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={r.status} size="sm" />
                      </td>
                      <td className="px-5 py-3.5 text-text-disabled">
                        {new Date(r.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3.5 text-right space-x-1.5">
                        <button
                          onClick={() => setSelectedReport(r)}
                          className="px-2.5 py-1 text-xs font-semibold text-primary-600 hover:text-primary-800 bg-primary-50 rounded transition-colors"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Admin Detail Drawer */}
        {selectedReport && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm animate-fade-in">
            <div className="bg-white w-full max-w-xl h-full shadow-premium flex flex-col justify-between overflow-y-auto p-6 sm:p-8 space-y-6">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-border-default">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded">
                      {selectedReport.id.substring(0, 8).toUpperCase()}
                    </span>
                    <StatusBadge status={selectedReport.type} size="sm" />
                    <StatusBadge status={selectedReport.status} size="sm" />
                  </div>
                  <button
                    onClick={() => setSelectedReport(null)}
                    className="p-1 rounded text-text-disabled hover:text-text-primary hover:bg-slate-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-4 space-y-4">
                  <h2 className="text-xl font-bold text-text-primary">{selectedReport.title}</h2>
                  <p className="text-xs text-text-secondary leading-relaxed">{selectedReport.description}</p>

                  {selectedReport.image_url && (
                    <div className="h-48 rounded-lg overflow-hidden border border-border-default bg-slate-50 flex items-center justify-center">
                      <img
                        src={selectedReport.image_url}
                        alt="Evidence"
                        className="w-full h-full object-contain p-2"
                      />
                    </div>
                  )}

                  <div className="p-4 bg-surface-subtle rounded-lg border border-border-default space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Category:</span>
                      <span className="font-semibold text-text-primary">{selectedReport.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Facility:</span>
                      <span className="font-semibold text-text-primary">
                        {selectedReport.building || 'SVCE Campus'}
                      </span>
                    </div>
                    {selectedReport.location_description && (
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Spot:</span>
                        <span className="font-medium text-text-primary">{selectedReport.location_description}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Submitted:</span>
                      <span className="font-medium text-text-primary">
                        {new Date(selectedReport.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {selectedReport.identifying_features && (
                    <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs">
                      <span className="font-bold text-amber-800 block mb-0.5">Private Verification Note:</span>
                      <span className="text-amber-700">{selectedReport.identifying_features}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Status Transition Action Bar */}
              <div className="pt-4 border-t border-border-default space-y-3">
                <span className="text-xs font-bold text-text-primary block">Update Report State (Audited):</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    onClick={() => handleStatusChange(selectedReport.id, 'ACTIVE')}
                    className="py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200 transition-colors"
                  >
                    Approve (Active)
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedReport.id, 'RECOVERED')}
                    className="py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 transition-colors"
                  >
                    Mark Recovered
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedReport.id, 'REJECTED')}
                    className="py-1.5 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 rounded border border-red-200 transition-colors"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedReport.id, 'WITHDRAWN')}
                    className="py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 rounded border border-slate-200 transition-colors"
                  >
                    Withdraw
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
