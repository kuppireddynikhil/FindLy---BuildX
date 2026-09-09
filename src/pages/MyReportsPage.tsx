import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { reportsService } from '../services/reportsService';
import type { ReportItem } from '../services/reportsService';
import { StatusBadge, EmptyState, LoadingSkeleton } from '../components/ui/ArcticPearlComponents';
import { useToast } from '../components/ui/Toast';
import {
  PlusCircle,
  MapPin,
  Calendar,
  Eye,
  CheckCircle2
} from 'lucide-react';

export function MyReportsPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'RESOLVED'>('ALL');

  const loadReports = async () => {
    if (!user) return;
    setLoading(true);
    const data = await reportsService.getMyReports(user.id);
    setReports(data);
    setLoading(false);
  };

  useEffect(() => {
    loadReports();
  }, [user]);

  const handleWithdraw = async (id: string) => {
    if (!user) return;
    if (!confirm('Are you sure you want to withdraw this campus report?')) return;

    const res = await reportsService.updateReportStatus(id, 'WITHDRAWN', user.id);
    if (res.success) {
      addToast('Report withdrawn successfully.', 'info');
      loadReports();
    } else {
      addToast(res.error || 'Failed to withdraw report', 'error');
    }
  };

  const handleMarkRecovered = async (id: string) => {
    if (!user) return;
    if (!confirm('Confirm that this item has been safely recovered?')) return;

    const res = await reportsService.updateReportStatus(id, 'RECOVERED', user.id);
    if (res.success) {
      addToast('Item marked as recovered! Thank you for keeping SVCE safe.', 'success');
      loadReports();
    } else {
      addToast(res.error || 'Failed to update report', 'error');
    }
  };

  const filteredReports = reports.filter((r) => {
    if (statusFilter === 'ACTIVE') return r.status === 'ACTIVE' || r.status === 'PENDING_REVIEW';
    if (statusFilter === 'RESOLVED') return r.status === 'RECOVERED' || r.status === 'WITHDRAWN' || r.status === 'MATCHED';
    return true;
  });

  return (
    <div className="min-h-screen bg-[#F5F8FC] py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">My Campus Reports</h1>
            <p className="text-xs text-text-secondary mt-1">
              Track, edit, or resolve belongings reported by your student account
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/report"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-xs font-semibold rounded-md shadow-sm transition-colors"
            >
              <PlusCircle className="w-4 h-4" /> New Report
            </Link>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 border-b border-border-default mb-6 pb-2">
          {(['ALL', 'ACTIVE', 'RESOLVED'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                statusFilter === tab
                  ? 'bg-white text-primary-600 shadow-card border border-border-default'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {tab === 'ALL' ? 'All Reports' : tab === 'ACTIVE' ? 'Active / In Progress' : 'Resolved / Recovered'}
            </button>
          ))}
        </div>

        {/* Content Listing */}
        {loading ? (
          <LoadingSkeleton rows={3} />
        ) : filteredReports.length === 0 ? (
          <EmptyState
            title="No reports found."
            description="You haven't submitted any reports in this category yet. Misplaced an item or found something unattended?"
            actionLabel="Create a Report"
            onAction={() => (window.location.href = '/report')}
          />
        ) : (
          <div className="space-y-4">
            {filteredReports.map((rep) => {
              const isResolved = rep.status === 'RECOVERED' || rep.status === 'WITHDRAWN';
              return (
                <div
                  key={rep.id}
                  className="bg-white rounded-lg p-5 border border-border-default shadow-card hover:shadow-soft transition-all duration-150 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                >
                  <div className="flex gap-4 items-start">
                    <div className="w-20 h-20 rounded-md bg-slate-50 border border-border-default overflow-hidden flex-shrink-0 flex items-center justify-center">
                      {rep.image_url ? (
                        <img
                          src={rep.image_url}
                          alt={rep.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <span className="text-[11px] text-text-disabled">No Photo</span>
                      )}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <StatusBadge status={rep.type} size="sm" />
                        <StatusBadge status={rep.status} size="sm" />
                        <span className="text-[11px] font-semibold text-text-secondary">
                          {rep.category}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-text-primary">{rep.title}</h3>
                      <p className="text-xs text-text-secondary line-clamp-1 mt-0.5 max-w-xl">
                        {rep.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-[11px] text-text-secondary">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-primary-500" />
                          {rep.building || rep.location_description || 'SVCE Campus'}
                        </span>
                        <span className="flex items-center gap-1 text-text-disabled">
                          <Calendar className="w-3 h-3" />
                          {new Date(rep.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Column */}
                  <div className="flex items-center gap-2 md:self-center pt-3 md:pt-0 border-t md:border-t-0 border-border-default">
                    <Link
                      to={`/items/${rep.id}`}
                      className="px-3 py-1.5 text-xs font-semibold text-text-secondary hover:text-primary-600 bg-surface-subtle hover:bg-slate-100 rounded-md border border-border-default transition-colors flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" /> View
                    </Link>

                    {!isResolved && (
                      <>
                        <button
                          onClick={() => handleMarkRecovered(rep.id)}
                          className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md border border-emerald-200 transition-colors flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Mark Recovered
                        </button>
                        <button
                          onClick={() => handleWithdraw(rep.id)}
                          className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-red-600 bg-white hover:bg-red-50 rounded-md border border-border-default transition-colors"
                        >
                          Withdraw
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
