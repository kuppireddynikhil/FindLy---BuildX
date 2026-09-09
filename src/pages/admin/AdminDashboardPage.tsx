import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { adminService } from '../../services/adminService';
import type { AdminKpis } from '../../services/adminService';
import { reportsService } from '../../services/reportsService';
import type { ReportItem } from '../../services/reportsService';
import { AdminStatCard, StatusBadge, LoadingSkeleton } from '../../components/ui/ArcticPearlComponents';
import {
  Users,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  FileText,
  ChevronRight,
  RefreshCw,
  Clock
} from 'lucide-react';

export function AdminDashboardPage() {
  const [kpis, setKpis] = useState<AdminKpis>({
    totalUsers: 0,
    lostReports: 0,
    foundReports: 0,
    matchRate: 0,
    activeReports: 0,
    recoveryCases: 0,
  });
  const [recentReports, setRecentReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const [kpiData, reportsData] = await Promise.all([
      adminService.getAdminKpis(),
      reportsService.getReports({}),
    ]);
    setKpis(kpiData);
    setRecentReports(reportsData.slice(0, 6));
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Title Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary-50 text-primary-700 text-xs font-semibold mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
              Administrative Operations Desk
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
              System Overview & Control
            </h1>
            <p className="text-xs text-text-secondary mt-0.5">
              Live campus telemetry, recovery operations, and item verification metrics across SVCE Tirupati
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              className="p-2 bg-white border border-border-default rounded-md text-text-secondary hover:text-primary transition-colors shadow-card"
              title="Refresh Telemetry"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <Link
              to="/admin/reports"
              className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-md text-xs font-semibold shadow-sm transition-colors"
            >
              Manage All Reports
            </Link>
          </div>
        </div>

        {/* 6 Real Database KPI Stat Cards */}
        {loading ? (
          <LoadingSkeleton rows={2} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <AdminStatCard
              title="Total Campus Users"
              value={kpis.totalUsers}
              icon={Users}
              trend="+14% this month"
              trendPositive={true}
              subtext="Registered students, staff & faculty"
            />
            <AdminStatCard
              title="Active Lost Reports"
              value={kpis.lostReports}
              icon={AlertCircle}
              trend="Requires investigation"
              trendPositive={false}
              subtext="Unresolved lost items"
            />
            <AdminStatCard
              title="Found Items Logged"
              value={kpis.foundReports}
              icon={CheckCircle2}
              trend="+8% this week"
              trendPositive={true}
              subtext="Secured in custody or with finders"
            />
            <AdminStatCard
              title="Deterministic Match Rate"
              value={`${kpis.matchRate}%`}
              icon={Sparkles}
              trend="Algorithm Accuracy"
              trendPositive={true}
              subtext="30/20/20/15/15 scoring accuracy"
            />
            <AdminStatCard
              title="Active Campus Reports"
              value={kpis.activeReports}
              icon={TrendingUp}
              trend="Broadcast live"
              trendPositive={true}
              subtext="Visible on Campus Feed & Map"
            />
            <AdminStatCard
              title="Recovery Cases"
              value={kpis.recoveryCases}
              icon={ShieldCheck}
              trend="Handover Pipeline"
              trendPositive={true}
              subtext="Claims progressing to handover"
            />
          </div>
        )}

        {/* Recovery Trends & Quick Actions Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Trends Visual Representation (2 Cols) */}
          <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-border-default shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-text-primary">Campus Recovery Trends (Last 7 Days)</h3>
                <p className="text-xs text-text-secondary">Reported volume vs successful campus handovers</p>
              </div>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                89% Resolution Rate
              </span>
            </div>

            {/* SVG Visual Area Chart matching stitch Arctic Pearl style */}
            <div className="h-60 bg-surface-subtle rounded-lg p-4 flex flex-col justify-between border border-border-default relative overflow-hidden">
              <div className="flex justify-between text-[11px] text-text-secondary">
                <span>Items Processed</span>
                <span className="font-semibold text-primary-600">Peak: 14 Reports/Day (Central Library)</span>
              </div>

              {/* Vector Smooth Trend Graph */}
              <div className="flex-1 flex items-end justify-between gap-3 pt-6 pb-2">
                {[
                  { day: 'Mon', count: 4, height: '40%' },
                  { day: 'Tue', count: 7, height: '65%' },
                  { day: 'Wed', count: 12, height: '90%' },
                  { day: 'Thu', count: 9, height: '75%' },
                  { day: 'Fri', count: 14, height: '100%' },
                  { day: 'Sat', count: 6, height: '50%' },
                  { day: 'Sun', count: 3, height: '30%' },
                ].map((bar) => (
                  <div key={bar.day} className="flex-1 flex flex-col items-center gap-1 group">
                    <div className="w-full bg-[#DCEAFF] hover:bg-primary-500 rounded-t transition-all relative flex items-end" style={{ height: bar.height }}>
                      <span className="opacity-0 group-hover:opacity-100 absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-1.5 py-0.5 rounded font-bold transition-opacity">
                        {bar.count}
                      </span>
                    </div>
                    <span className="text-[10px] text-text-secondary font-medium">{bar.day}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-border-default flex items-center justify-between text-[10px] text-text-disabled">
                <span>Mon, Sep 3</span>
                <span>Sun, Sep 9</span>
              </div>
            </div>
          </div>

          {/* Quick Actions & Moderation Alerts (1 Col) */}
          <div className="bg-white rounded-xl p-6 border border-border-default shadow-card space-y-4">
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider text-xs">
              Moderator Quick Actions
            </h3>
            <div className="space-y-2.5 text-xs">
              <Link
                to="/admin/reports"
                className="flex items-center justify-between p-3 rounded-md bg-surface-subtle hover:bg-primary-50 hover:text-primary border border-border-default transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-primary-500" />
                  <span className="font-semibold text-text-primary group-hover:text-primary">Review Pending Reports</span>
                </div>
                <ChevronRight className="w-4 h-4 text-text-disabled" />
              </Link>

              <Link
                to="/admin/recovery"
                className="flex items-center justify-between p-3 rounded-md bg-surface-subtle hover:bg-primary-50 hover:text-primary border border-border-default transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-success" />
                  <span className="font-semibold text-text-primary group-hover:text-primary">Schedule Handover Appointments</span>
                </div>
                <ChevronRight className="w-4 h-4 text-text-disabled" />
              </Link>

              <Link
                to="/admin/users"
                className="flex items-center justify-between p-3 rounded-md bg-surface-subtle hover:bg-primary-50 hover:text-primary border border-border-default transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-primary-600" />
                  <span className="font-semibold text-text-primary group-hover:text-primary">Inspect User Directory Stats</span>
                </div>
                <ChevronRight className="w-4 h-4 text-text-disabled" />
              </Link>

              <Link
                to="/admin/campus"
                className="flex items-center justify-between p-3 rounded-md bg-surface-subtle hover:bg-primary-50 hover:text-primary border border-border-default transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-warning" />
                  <span className="font-semibold text-text-primary group-hover:text-primary">Manage Campus Geometry</span>
                </div>
                <ChevronRight className="w-4 h-4 text-text-disabled" />
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Reports Queue Table */}
        <div className="bg-white rounded-xl border border-border-default shadow-card overflow-hidden">
          <div className="p-5 border-b border-border-default flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-text-primary">Recent Reports Queue</h3>
              <p className="text-xs text-text-secondary">Incoming campus reports requiring review or verification</p>
            </div>
            <Link
              to="/admin/reports"
              className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              View complete table <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-subtle border-b border-border-default text-text-secondary uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-5 py-3">Report ID</th>
                  <th className="px-5 py-3">Item Details</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Campus Location</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-default">
                {recentReports.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-8 text-center text-text-disabled">
                      No reports in queue.
                    </td>
                  </tr>
                ) : (
                  recentReports.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3.5 font-mono text-primary-700 font-bold">
                        {r.id.substring(0, 8).toUpperCase()}
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-text-primary">
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
                      <td className="px-5 py-3.5 text-right">
                        <Link
                          to={`/items/${r.id}`}
                          className="px-2.5 py-1 text-xs font-semibold text-primary-600 hover:text-primary-800 bg-primary-50 rounded transition-colors"
                        >
                          Inspect
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
