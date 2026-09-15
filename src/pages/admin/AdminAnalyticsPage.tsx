import { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { adminService } from '../../services/adminService';
import type { AdminKpis } from '../../services/adminService';
import { reportsService } from '../../services/reportsService';
import type { ReportItem } from '../../services/reportsService';
import { AdminStatCard, LoadingSkeleton } from '../../components/ui/ArcticPearlComponents';
import {
  TrendingUp,
  Clock,
  ShieldCheck,
  Users,
  MapPin,
  Sparkles,
  Calendar
} from 'lucide-react';

export function AdminAnalyticsPage() {
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [kpis, setKpis] = useState<AdminKpis>({
    totalUsers: 0,
    lostReports: 0,
    foundReports: 0,
    matchRate: 0,
    activeReports: 0,
    recoveryCases: 0,
  });
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      setLoading(true);
      const [kpiData, reportData] = await Promise.all([
        adminService.getAdminKpis(),
        reportsService.getReports({}),
      ]);
      setKpis(kpiData);
      setReports(reportData);
      setLoading(false);
    }
    loadAnalytics();
  }, [dateRange]);

  // Dynamic calculations from database reports
  const totalReports = reports.length;
  const recoveredReports = reports.filter((r) => r.status === 'RECOVERED');
  const recoveryRatePct = totalReports > 0
    ? `${((recoveredReports.length / totalReports) * 100).toFixed(1)}%`
    : '0.0%';

  // Average resolution time for recovered reports
  const resolutionTimes = recoveredReports
    .map((r) => {
      const start = new Date(r.created_at).getTime();
      const end = new Date(r.updated_at || r.created_at).getTime();
      return Math.max(0, end - start) / (1000 * 60 * 60 * 24);
    })
    .filter((t) => !isNaN(t));

  const avgResolutionDays = resolutionTimes.length > 0
    ? `${(resolutionTimes.reduce((a, b) => a + b, 0) / resolutionTimes.length).toFixed(1)} Days`
    : totalReports > 0
    ? 'In Progress'
    : '0.0 Days';

  // Aggregate Category Breakdown from real database reports
  const categoryCounts = reports.reduce((acc: Record<string, number>, r) => {
    const cat = r.category || 'Other';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  const sortedCategories = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);

  // Aggregate Location Breakdown from real database reports
  const locationCounts = reports.reduce((acc: Record<string, number>, r) => {
    const bldg = r.building || 'Campus Central';
    acc[bldg] = (acc[bldg] || 0) + 1;
    return acc;
  }, {});
  const sortedLocations = Object.entries(locationCounts).sort((a, b) => b[1] - a[1]);

  // Dynamic Time Buckets for the Bar Graph based on dateRange
  const now = new Date();
  let timeBuckets: { label: string; count: number }[] = [];

  if (dateRange === '7d') {
    timeBuckets = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().split('T')[0];
      const count = reports.filter((r) => (r.created_at || '').split('T')[0] === dateStr).length;
      return {
        label: d.toLocaleDateString('en-US', { weekday: 'short' }),
        count,
      };
    });
  } else if (dateRange === '30d') {
    // 4 weeks
    timeBuckets = [
      { label: 'Week 1', count: 0 },
      { label: 'Week 2', count: 0 },
      { label: 'Week 3', count: 0 },
      { label: 'Week 4', count: 0 },
    ];
    reports.forEach((r) => {
      const daysAgo = Math.floor((now.getTime() - new Date(r.created_at).getTime()) / (1000 * 60 * 60 * 24));
      if (daysAgo >= 0 && daysAgo < 7) timeBuckets[3].count++;
      else if (daysAgo >= 7 && daysAgo < 14) timeBuckets[2].count++;
      else if (daysAgo >= 14 && daysAgo < 21) timeBuckets[1].count++;
      else if (daysAgo >= 21 && daysAgo < 30) timeBuckets[0].count++;
    });
  } else {
    // 90d -> 3 Months
    timeBuckets = Array.from({ length: 3 }, (_, i) => {
      const d = new Date(now);
      d.setMonth(d.getMonth() - (2 - i));
      const monthLabel = d.toLocaleDateString('en-US', { month: 'short' });
      const year = d.getFullYear();
      const month = d.getMonth();
      const count = reports.filter((r) => {
        const repDate = new Date(r.created_at);
        return repDate.getFullYear() === year && repDate.getMonth() === month;
      }).length;
      return { label: monthLabel, count };
    });
  }

  const maxBucketCount = Math.max(...timeBuckets.map((b) => b.count), 1);
  const chartColumns = timeBuckets.map((b) => ({
    label: b.label,
    val: b.count,
    height: b.count === 0 ? '6px' : `${Math.max(16, Math.round((b.count / maxBucketCount) * 100))}%`,
  }));

  const peakHotspot = sortedLocations[0];
  const peakHotspotText = peakHotspot
    ? `Peak: ${peakHotspot[0]} (${peakHotspot[1]} Reports)`
    : totalReports > 0
    ? `Total: ${totalReports} Reports`
    : 'No incidents logged in range';

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">Campus Analytics & Intelligence</h1>
            <p className="text-xs text-text-secondary mt-0.5">
              Aggregate Lost & Found telemetry, facility hotspot distributions, and recovery benchmarks
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-white border border-border-default rounded-md p-1 shadow-card text-xs">
            <button
              onClick={() => setDateRange('7d')}
              className={`px-3 py-1 font-semibold rounded transition-colors ${
                dateRange === '7d' ? 'bg-primary-50 text-primary-700' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Last 7 Days
            </button>
            <button
              onClick={() => setDateRange('30d')}
              className={`px-3 py-1 font-semibold rounded transition-colors ${
                dateRange === '30d' ? 'bg-primary-50 text-primary-700' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Last 30 Days
            </button>
            <button
              onClick={() => setDateRange('90d')}
              className={`px-3 py-1 font-semibold rounded transition-colors ${
                dateRange === '90d' ? 'bg-primary-50 text-primary-700' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Last 90 Days
            </button>
          </div>
        </div>

        {/* 4 Key Metrics */}
        {loading ? (
          <LoadingSkeleton rows={2} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <AdminStatCard
              title="Campus Recovery Rate"
              value={recoveryRatePct}
              icon={ShieldCheck}
              trend={`${recoveredReports.length} of ${totalReports} resolved`}
              trendPositive={recoveredReports.length > 0}
              subtext="Ratio of resolved claims"
            />
            <AdminStatCard
              title="Avg. Resolution Time"
              value={avgResolutionDays}
              icon={Clock}
              trend={recoveredReports.length > 0 ? 'Handover completed' : 'Awaiting claims'}
              trendPositive={true}
              subtext="From report to handover"
            />
            <AdminStatCard
              title="Active Campus Reports"
              value={kpis.activeReports}
              icon={TrendingUp}
              trend={kpis.activeReports > 0 ? 'Telemetry Live' : 'Feed Clear'}
              trendPositive={true}
              subtext="Visible on explorer"
            />
            <AdminStatCard
              title="Total Campus Users"
              value={kpis.totalUsers}
              icon={Users}
              trend={kpis.totalUsers > 0 ? `${kpis.totalUsers} Active Profiles` : 'Awaiting Registrations'}
              trendPositive={kpis.totalUsers > 0}
              subtext="Students, staff & faculty"
            />
          </div>
        )}

        {/* Bento Grid: Trends Over Time (8 cols) + Most Lost Categories (4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Report Trends Over Time (2 Cols) */}
          <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-border-default shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-text-primary">Report Trends Over Time</h3>
                <p className="text-xs text-text-secondary">Incident volume distribution across recent periods</p>
              </div>
              <span className="text-xs font-semibold text-primary-600 bg-primary-50 px-2.5 py-1 rounded-full border border-primary-200">
                {peakHotspotText}
              </span>
            </div>

            <div className="h-64 bg-surface-subtle rounded-lg p-4 flex flex-col justify-between border border-border-default">
              <div className="flex-1 flex items-end justify-between gap-3 pt-6 pb-2">
                {chartColumns.map((col) => (
                  <div key={col.label} className="flex-1 flex flex-col items-center gap-1 group">
                    <div
                      className={`w-full rounded-t transition-all relative flex items-end ${
                        col.val > 0 ? 'bg-[#DCEAFF] hover:bg-primary-500' : 'bg-slate-200'
                      }`}
                      style={{ height: col.height }}
                    >
                      <span className="opacity-0 group-hover:opacity-100 absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-1.5 py-0.5 rounded font-bold transition-opacity pointer-events-none">
                        {col.val}
                      </span>
                    </div>
                    <span className="text-[10px] text-text-secondary font-medium">{col.label}</span>
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t border-border-default flex items-center justify-between text-[10px] text-text-disabled">
                <span>Start of Window</span>
                <span>Current Date</span>
              </div>
            </div>
          </div>

          {/* Most-Lost Categories Breakdown (1 Col) */}
          <div className="bg-white rounded-xl p-6 border border-border-default shadow-card space-y-4">
            <h3 className="text-sm font-bold text-text-primary">Most-Lost Categories</h3>
            <p className="text-xs text-text-secondary">Percentage share by item category</p>

            <div className="space-y-3 pt-2">
              {sortedCategories.length === 0 ? (
                <div className="text-xs text-text-disabled py-8 text-center">
                  No category telemetry available yet.
                </div>
              ) : (
                sortedCategories.slice(0, 5).map(([cat, count]) => {
                  const pct = totalReports > 0 ? Math.round((count / totalReports) * 100) : 0;
                  return (
                    <div key={cat} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-text-primary truncate">{cat}</span>
                        <span className="text-text-secondary font-mono">{pct}% ({count})</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary-500 rounded-full"
                          style={{ width: `${Math.max(5, pct)}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Most-Reported Locations (Hotspots) + System Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Most Reported Facilities */}
          <div className="bg-white rounded-xl p-6 border border-border-default shadow-card space-y-4">
            <h3 className="text-sm font-bold text-text-primary">Facility Hotspot Density</h3>
            <p className="text-xs text-text-secondary">Campus buildings with highest lost & found registration</p>

            <div className="space-y-3 pt-2">
              {sortedLocations.length === 0 ? (
                <div className="text-xs text-text-disabled py-8 text-center">
                  No campus location telemetry available yet.
                </div>
              ) : (
                sortedLocations.slice(0, 5).map(([loc, count]) => {
                  const pct = totalReports > 0 ? Math.round((count / totalReports) * 100) : 0;
                  return (
                    <div key={loc} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-text-primary flex items-center gap-1.5 truncate">
                          <MapPin className="w-3.5 h-3.5 text-primary-500 flex-shrink-0" />
                          {loc}
                        </span>
                        <span className="text-text-secondary font-mono">{count} reports</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary-600 rounded-full"
                          style={{ width: `${Math.max(10, pct)}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Dynamic System Insights */}
          <div className="bg-white rounded-xl p-6 border border-border-default shadow-card space-y-4">
            <h3 className="text-sm font-bold text-text-primary">System Insights & Recommendations</h3>
            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-primary-50/60 rounded-lg border border-primary-100 flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-primary-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-primary-900 block">
                    {sortedCategories.length > 0
                      ? `Dominant Category: ${sortedCategories[0][0]}`
                      : 'AI Category Matching Active'}
                  </span>
                  {sortedCategories.length > 0
                    ? `${sortedCategories[0][0]} accounts for ${Math.round((sortedCategories[0][1] / Math.max(totalReports, 1)) * 100)}% (${sortedCategories[0][1]} items) of all campus submissions.`
                    : 'System classification is active and ready to categorize incoming student and staff reports.'}
                </div>
              </div>

              <div className="p-3.5 bg-amber-50/60 rounded-lg border border-amber-200 flex items-start gap-3">
                <Calendar className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-amber-900 block">
                    {sortedLocations.length > 0
                      ? `Primary Hotspot: ${sortedLocations[0][0]}`
                      : 'Hotspot Surveillance Active'}
                  </span>
                  {sortedLocations.length > 0
                    ? `${sortedLocations[0][0]} has recorded ${sortedLocations[0][1]} reports. Security desks are advised to inspect items deposited here.`
                    : 'Facility telemetry maps lost & found incidents to campus buildings and zones automatically.'}
                </div>
              </div>

              <div className="p-3.5 bg-emerald-50/60 rounded-lg border border-emerald-200 flex items-start gap-3">
                <ShieldCheck className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-emerald-900 block">
                    {totalReports > 0 ? `${recoveryRatePct} Resolution Rate` : 'Secure Handover Ready'}
                  </span>
                  {totalReports > 0
                    ? `${recoveredReports.length} of ${totalReports} reported items have been verified and returned to their verified owners.`
                    : 'Identity verification and custody handovers ready for campus operations.'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
