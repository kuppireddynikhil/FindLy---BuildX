import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { reportsService } from '../services/reportsService';
import type { ReportItem } from '../services/reportsService';
import { StatusBadge } from '../components/ui/ArcticPearlComponents';
import {
  Search,
  PlusCircle,
  AlertCircle,
  MapPin,
  Clock,
  Compass,
  FileText,
  ShieldCheck,
  ChevronRight,
  LifeBuoy,
  RefreshCw
} from 'lucide-react';

export function CampusFeedPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const loadFeed = async () => {
    setLoading(true);
    const data = await reportsService.getReports({ status: 'ACTIVE' });
    setReports(data);
    setLoading(false);
  };

  useEffect(() => {
    loadFeed();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Student';

  return (
    <div className="min-h-screen bg-[#F5F8FC] pb-16 pt-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Top Greeting & Action Banner */}
        <div className="bg-white rounded-xl p-6 sm:p-8 border border-border-default shadow-card relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary-50 rounded-full blur-3xl -z-0 pointer-events-none transform translate-x-1/3 -translate-y-1/3" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-primary-50 text-primary-600 text-xs font-semibold mb-2">
                <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
                SVCE Tirupati Campus Network
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
                Hello, {displayName}
              </h1>
              <p className="mt-1 text-sm text-text-secondary max-w-xl">
                Track campus items, report misplaced belongings, or verify items discovered across SVCE Tirupati academic facilities.
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/report?type=FOUND"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold rounded-md shadow-sm transition-all hover:shadow-soft"
              >
                <PlusCircle className="w-4 h-4" />
                Report Found Item
              </Link>
              <Link
                to="/report?type=LOST"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-slate-50 text-text-primary border border-border-default text-sm font-semibold rounded-md shadow-sm transition-all"
              >
                <AlertCircle className="w-4 h-4 text-warning" />
                Report Lost Item
              </Link>
            </div>
          </div>

          {/* Quick Search Bar */}
          <form onSubmit={handleSearchSubmit} className="mt-6 relative max-w-2xl">
            <Search className="w-4 h-4 text-text-disabled absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search lost or found belongings (e.g., MacBook, College ID card, Bike keys, Black wallet)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-24 py-2.5 text-sm bg-surface-subtle border border-border-default rounded-md focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-all text-text-primary"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3.5 py-1.5 text-xs font-semibold bg-primary-500 text-white rounded hover:bg-primary-600 transition-colors"
            >
              Search
            </button>
          </form>
        </div>

        {/* Main Grid: 2/3 Feed, 1/3 Shortcuts & Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recently Reported Feed (2 Columns) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-text-primary">Recently Reported</h2>
                <p className="text-xs text-text-secondary">Real-time reports across SVCE Tirupati campus</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={loadFeed}
                  className="p-1.5 text-text-secondary hover:text-primary-500 rounded border border-border-default bg-white transition-colors"
                  title="Refresh Feed"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                </button>
                <Link
                  to="/search"
                  className="text-xs font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1"
                >
                  View all <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="p-4 bg-white rounded-lg border border-border-default animate-pulse flex gap-4">
                    <div className="w-20 h-20 bg-slate-100 rounded-md flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-slate-100 rounded w-1/3" />
                      <div className="h-3 bg-slate-100 rounded w-3/4" />
                      <div className="h-3 bg-slate-100 rounded w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : reports.length === 0 ? (
              <div className="p-10 bg-white rounded-lg border border-border-default text-center">
                <div className="w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center mx-auto mb-3 text-primary-500">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-semibold text-text-primary">No reports found.</h3>
                <p className="text-xs text-text-secondary mt-1 max-w-sm mx-auto">
                  There are currently no active lost or found reports. Misplaced an item? Submit a new report to trigger campus-wide matching.
                </p>
                <div className="mt-4 flex justify-center gap-2">
                  <Link
                    to="/report?type=LOST"
                    className="px-3.5 py-1.5 bg-primary-500 text-white rounded text-xs font-medium hover:bg-primary-600 transition-colors"
                  >
                    Report Item
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {reports.slice(0, 8).map((item) => (
                  <Link
                    key={item.id}
                    to={`/items/${item.id}`}
                    className="block p-4 bg-white rounded-lg border border-border-default shadow-card hover:shadow-soft hover:border-primary-300 transition-all duration-150"
                  >
                    <div className="flex gap-4">
                      <div className="w-20 h-20 rounded-md bg-slate-50 border border-border-default overflow-hidden flex-shrink-0 flex items-center justify-center">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="text-xs text-text-disabled font-medium">No Photo</div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="text-sm font-bold text-text-primary truncate">{item.title}</h3>
                            <StatusBadge status={item.type} size="sm" />
                          </div>
                          <p className="text-xs text-text-secondary line-clamp-2 mt-1">
                            {item.description}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-[11px] text-text-secondary">
                          <span className="inline-flex items-center gap-1 font-medium text-slate-700">
                            <MapPin className="w-3 h-3 text-primary-500" />
                            {item.building || item.location_description || 'SVCE Campus'}
                          </span>
                          <span className="inline-flex items-center gap-1 text-slate-500">
                            <Clock className="w-3 h-3" />
                            {new Date(item.created_at).toLocaleDateString()}
                          </span>
                          <span className="text-primary-600 font-medium">
                            Category: {item.category}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar: Shortcuts, Live Activity & Security Support */}
          <div className="space-y-6">
            {/* Campus Shortcuts */}
            <div className="bg-white rounded-lg p-5 border border-border-default shadow-card">
              <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider text-xs mb-3">
                Campus Shortcuts
              </h3>
              <div className="grid grid-cols-2 gap-2.5">
                <Link
                  to="/campus"
                  className="flex flex-col items-center justify-center p-3 rounded-md bg-surface-subtle hover:bg-primary-50 hover:text-primary border border-border-default transition-all text-center group"
                >
                  <Compass className="w-5 h-5 text-primary-500 mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-semibold text-text-primary group-hover:text-primary">Campus Map</span>
                  <span className="text-[10px] text-text-secondary">SVCE Explorer</span>
                </Link>
                <Link
                  to="/my-reports"
                  className="flex flex-col items-center justify-center p-3 rounded-md bg-surface-subtle hover:bg-primary-50 hover:text-primary border border-border-default transition-all text-center group"
                >
                  <FileText className="w-5 h-5 text-primary-500 mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-semibold text-text-primary group-hover:text-primary">My Reports</span>
                  <span className="text-[10px] text-text-secondary">Track claims</span>
                </Link>
                <Link
                  to="/recovery"
                  className="flex flex-col items-center justify-center p-3 rounded-md bg-surface-subtle hover:bg-primary-50 hover:text-primary border border-border-default transition-all text-center group"
                >
                  <ShieldCheck className="w-5 h-5 text-primary-500 mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-semibold text-text-primary group-hover:text-primary">Recovery</span>
                  <span className="text-[10px] text-text-secondary">Handovers</span>
                </Link>
                <Link
                  to="/search"
                  className="flex flex-col items-center justify-center p-3 rounded-md bg-surface-subtle hover:bg-primary-50 hover:text-primary border border-border-default transition-all text-center group"
                >
                  <Search className="w-5 h-5 text-primary-500 mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-semibold text-text-primary group-hover:text-primary">Search DB</span>
                  <span className="text-[10px] text-text-secondary">Filtered query</span>
                </Link>
              </div>
            </div>

            {/* Live Campus Activity */}
            <div className="bg-white rounded-lg p-5 border border-border-default shadow-card">
              <h3 className="text-sm font-bold text-text-primary mb-3">Live Campus Activity</h3>
              <div className="space-y-3 text-xs">
                <div className="flex gap-2.5 items-start">
                  <span className="w-2 h-2 rounded-full bg-success mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-text-primary">Central Library</p>
                    <p className="text-text-secondary">Item returned to owner at Main Desk</p>
                    <span className="text-[10px] text-text-disabled">12 mins ago</span>
                  </div>
                </div>
                <div className="flex gap-2.5 items-start">
                  <span className="w-2 h-2 rounded-full bg-primary-500 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-text-primary">CSE & IT Block</p>
                    <p className="text-text-secondary">Potential match evaluated (92% score)</p>
                    <span className="text-[10px] text-text-disabled">35 mins ago</span>
                  </div>
                </div>
                <div className="flex gap-2.5 items-start">
                  <span className="w-2 h-2 rounded-full bg-warning mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-text-primary">Student Cafeteria</p>
                    <p className="text-text-secondary">Found item registered: Blue Water Bottle</p>
                    <span className="text-[10px] text-text-disabled">1 hour ago</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Security & Support Desk */}
            <div className="bg-[#EEF5FF] rounded-lg p-5 border border-[#DCEAFF]">
              <div className="flex items-center gap-2 text-primary-700 font-bold text-xs uppercase mb-1">
                <LifeBuoy className="w-4 h-4" />
                Campus Support & Security
              </div>
              <h4 className="text-sm font-bold text-text-primary">SVCE Security Desk</h4>
              <p className="text-xs text-text-secondary mt-1">
                Handover verification takes place at the Central Administrative Security Desk, Ground Floor Main Block.
              </p>
              <div className="mt-3 pt-3 border-t border-primary-100 flex items-center justify-between text-xs">
                <span className="text-text-secondary font-medium">Desk Hours: 08:30 AM – 05:30 PM</span>
                <span className="text-primary-700 font-semibold">Ext: 204</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
