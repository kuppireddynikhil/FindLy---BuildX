<<<<<<< HEAD
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
=======
import { useState } from 'react';
import { FileText, MapPin, Calendar, Check, Trash2, Plus, ArchiveRestore } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useToast } from '../components/ui/Toast';
import type { Item } from '../types/database';
import './MyReportsPage.css';

// Mock owner items database
const INITIAL_MY_ITEMS: Item[] = [
  {
    id: 'mr1',
    user_id: 'owner_id',
    type: 'lost',
    title: 'Sony WH-1000XM4 Headphones',
    description: 'Silver colored Sony noise-canceling headphones, last seen in the Engineering Block Lab 2A.',
    category: 'Electronics',
    location: 'Engineering Block',
    date: '2026-06-10',
    image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
    contact_info: 'Contact: prof.smith@college.edu room 405',
    status: 'open',
    created_at: '2026-06-10T16:45:00Z',
    updated_at: '2026-06-10T16:45:00Z',
  },
  {
    id: 'mr2',
    user_id: 'owner_id',
    type: 'lost',
    title: 'Blue Hydro Flask (32oz)',
    description: 'Lost in the Sports Complex gym area. Has some scratches on the bottom.',
    category: 'Water Bottles',
    location: 'Sports Complex',
    date: '2026-06-11',
    image_url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80',
    contact_info: 'Text: 555-0192',
    status: 'open',
    created_at: '2026-06-11T14:20:00Z',
    updated_at: '2026-06-11T14:20:00Z',
  },
  {
    id: 'mr3',
    user_id: 'owner_id',
    type: 'found',
    title: 'Warm Beige Knit Scarf',
    description: 'Found draped over a chair in the Arts Building Lobby. Soft wool material.',
    category: 'Clothing',
    location: 'Arts Building',
    date: '2026-06-10',
    image_url: 'https://images.unsplash.com/photo-1520635360276-79f3dbd809f6?auto=format&fit=crop&w=600&q=80',
    contact_info: 'Left at arts building staff box',
    status: 'open',
    created_at: '2026-06-10T12:00:00Z',
    updated_at: '2026-06-10T12:00:00Z',
  },
  {
    id: 'mr4',
    user_id: 'owner_id',
    type: 'found',
    title: 'Calculus Lecture Notebook',
    description: 'Black spiral notebook with handwritten math notes. Found in the Auditorium row F seat 12.',
    category: 'Books & Notes',
    location: 'Auditorium',
    date: '2026-06-12',
    image_url: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&w=600&q=80',
    contact_info: 'Left with the Auditorium supervisor Office 1B',
    status: 'resolved',
    created_at: '2026-06-12T11:30:00Z',
    updated_at: '2026-06-12T17:00:00Z',
  },
];

export function MyReportsPage() {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<'lost' | 'found'>('lost');
  const [items, setItems] = useState<Item[]>(INITIAL_MY_ITEMS);

  const filteredItems = items.filter((item) => item.type === activeTab);

  const handleResolve = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: item.status === 'open' ? 'resolved' : 'open',
            }
          : item
      )
    );
    const item = items.find((i) => i.id === id);
    if (item) {
      const isNowResolved = item.status === 'open';
      addToast(
        `Item status updated to ${isNowResolved ? 'Resolved' : 'Open'}!`,
        'success'
      );
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      setItems((prev) => prev.filter((item) => item.id !== id));
      addToast('Report deleted successfully.', 'info');
    }
  };

  return (
    <div className="my-reports-page page-container">
      <div className="container">
        {/* Header */}
        <div className="my-reports-page__header">
          <div className="header-text">
            <h1 className="section-title">My Reports</h1>
            <p className="section-subtitle">
              Manage items you have reported lost or found on campus.
            </p>
          </div>
          <div className="header-actions">
            <Link to="/report/lost">
              <Button size="sm" variant="secondary" icon={<Plus size={16} />}>
                Report Lost
              </Button>
            </Link>
            <Link to="/report/found">
              <Button size="sm" variant="primary" icon={<Plus size={16} />}>
                Report Found
              </Button>
>>>>>>> origin/main
            </Link>
          </div>
        </div>

<<<<<<< HEAD
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
=======
        {/* Tab Selector */}
        <div className="my-reports-page__tabs glass">
          <button
            className={`tab-btn ${activeTab === 'lost' ? 'tab-btn--active' : ''}`}
            onClick={() => setActiveTab('lost')}
          >
            Lost Items
            <span className="tab-badge">
              {items.filter((i) => i.type === 'lost').length}
            </span>
          </button>
          <button
            className={`tab-btn ${activeTab === 'found' ? 'tab-btn--active' : ''}`}
            onClick={() => setActiveTab('found')}
          >
            Found Items
            <span className="tab-badge">
              {items.filter((i) => i.type === 'found').length}
            </span>
          </button>
        </div>

        {/* Reports List */}
        {filteredItems.length > 0 ? (
          <div className="my-reports-page__list">
            {filteredItems.map((item) => {
              const formattedDate = new Date(item.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });

              return (
                <div key={item.id} className="my-reports-card glass-card">
                  {item.image_url && (
                    <div className="my-reports-card__img">
                      <img src={item.image_url} alt={item.title} />
                    </div>
                  )}

                  <div className="my-reports-card__content">
                    <div className="my-reports-card__meta-top">
                      <Badge variant={item.type === 'lost' ? 'lost' : 'found'}>
                        {item.type}
                      </Badge>
                      <Badge
                        variant={
                          item.status === 'open'
                            ? 'warning'
                            : item.status === 'resolved'
                            ? 'success'
                            : 'info'
                        }
                      >
                        {item.status}
                      </Badge>
                    </div>

                    <h3 className="my-reports-card__title">{item.title}</h3>
                    <p className="my-reports-card__desc">{item.description}</p>

                    <div className="my-reports-card__meta-bottom">
                      <div className="meta-item">
                        <MapPin size={14} />
                        <span>{item.location}</span>
                      </div>
                      <div className="meta-item">
                        <Calendar size={14} />
                        <span>{formattedDate}</span>
>>>>>>> origin/main
                      </div>
                    </div>
                  </div>

<<<<<<< HEAD
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
=======
                  <div className="my-reports-card__actions">
                    <Button
                      variant={item.status === 'open' ? 'primary' : 'secondary'}
                      size="sm"
                      onClick={() => handleResolve(item.id)}
                      icon={item.status === 'open' ? <Check size={16} /> : <ArchiveRestore size={16} />}
                    >
                      {item.status === 'open' ? 'Mark Resolved' : 'Mark Open'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="delete-btn"
                      onClick={() => handleDelete(item.id)}
                      icon={<Trash2 size={16} />}
                    >
                      Delete
                    </Button>
>>>>>>> origin/main
                  </div>
                </div>
              );
            })}
          </div>
<<<<<<< HEAD
=======
        ) : (
          <div className="my-reports-page__empty glass-card">
            <FileText size={48} className="empty-icon" />
            <h3>No reports in this tab</h3>
            <p>You haven't logged any items under this status yet.</p>
            <Link to={activeTab === 'lost' ? '/report/lost' : '/report/found'}>
              <Button variant="primary">Create a Report</Button>
            </Link>
          </div>
>>>>>>> origin/main
        )}
      </div>
    </div>
  );
}
