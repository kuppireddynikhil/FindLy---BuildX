import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { reportsService } from '../services/reportsService';
import type { ReportItem } from '../services/reportsService';
import { StatusBadge, EmptyState, LoadingSkeleton } from '../components/ui/ArcticPearlComponents';
import {
  Search as SearchIcon,
  Filter,
  SlidersHorizontal,
  MapPin,
  Calendar,
  X
} from 'lucide-react';

export function SearchPage() {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [search, setSearch] = useState(initialQuery);
  const [debouncedSearch, setDebouncedSearch] = useState(initialQuery);
  const [selectedType, setSelectedType] = useState<'ALL' | 'LOST' | 'FOUND'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedBuilding, setSelectedBuilding] = useState('All Buildings');
  const [sortBy, setSortBy] = useState<'recent' | 'relevance'>('recent');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 250);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch reports
  useEffect(() => {
    async function fetchReports() {
      setLoading(true);
      const data = await reportsService.getReports({
        type: selectedType,
        category: selectedCategory,
        building: selectedBuilding,
        search: debouncedSearch,
        status: 'ACTIVE',
      });
      setReports(data);
      setLoading(false);
    }
    fetchReports();
  }, [selectedType, selectedCategory, selectedBuilding, debouncedSearch]);

  const categories = [
    'All Categories',
    'Electronics & Gadgets',
    'ID Cards & Documents',
    'Bags & Backpacks',
    'Keys & Access Cards',
    'Books & Stationery',
    'Clothing & Accessories',
    'Personal Belongings',
  ];

  const buildings = [
    'All Buildings',
    'Administrative Block',
    'CSE & IT Block',
    'Central Library',
    'Student Cafeteria',
    'Sports Complex',
    'ECE Block',
    'Mechanical Block',
  ];

  const sortedReports = useMemo(() => {
    const list = [...reports];
    if (sortBy === 'recent') {
      return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    return list;
  }, [reports, sortBy]);

  return (
    <div className="min-h-screen bg-[#F5F8FC] py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Search Campus Reports</h1>
          <p className="text-xs text-text-secondary mt-1">
            Search lost & found belongings across SVCE Tirupati academic facilities
          </p>

          <div className="mt-4 flex gap-3">
            <div className="relative flex-1">
              <SearchIcon className="w-4 h-4 text-text-disabled absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by title, description, or identifying marks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-border-default rounded-md shadow-card focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500 text-text-primary"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-disabled hover:text-text-primary"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Mobile Filter Toggle Button */}
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="md:hidden inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-border-default rounded-md text-xs font-semibold text-text-secondary shadow-card"
            >
              <SlidersHorizontal className="w-4 h-4" /> Filters
            </button>
          </div>
        </div>

        {/* Main Content: Desktop Filter Sidebar + Results */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Desktop Filter Sidebar */}
          <aside className={`${mobileFilterOpen ? 'fixed inset-0 z-50 p-6 bg-white overflow-y-auto block' : 'hidden'} md:static md:block bg-white rounded-lg border border-border-default shadow-card p-5 space-y-6 h-fit`}>
            <div className="flex items-center justify-between pb-3 border-b border-border-default">
              <span className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-primary-500" /> Filter Reports
              </span>
              {mobileFilterOpen && (
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="md:hidden p-1 text-text-secondary hover:text-text-primary"
                >
                  <X size={18} />
                </button>
              )}
              {(selectedType !== 'ALL' || selectedCategory !== 'All Categories' || selectedBuilding !== 'All Buildings') && (
                <button
                  onClick={() => {
                    setSelectedType('ALL');
                    setSelectedCategory('All Categories');
                    setSelectedBuilding('All Buildings');
                  }}
                  className="text-[11px] text-primary-600 hover:text-primary-700 font-semibold"
                >
                  Reset
                </button>
              )}
            </div>

            {/* Report Type (Lost / Found / All) */}
            <div>
              <label className="text-xs font-bold text-text-primary mb-2 block">Report Type</label>
              <div className="grid grid-cols-3 gap-1 bg-surface-subtle p-1 rounded-md border border-border-default">
                {(['ALL', 'LOST', 'FOUND'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setSelectedType(t)}
                    className={`py-1 text-xs font-semibold rounded transition-colors ${
                      selectedType === t
                        ? 'bg-white text-primary-600 shadow-sm'
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    {t === 'ALL' ? 'All' : t === 'LOST' ? 'Lost' : 'Found'}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="text-xs font-bold text-text-primary mb-2 block">Category</label>
              <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                {categories.map((c) => (
                  <button
                    key={c}
                    onClick={() => setSelectedCategory(c)}
                    className={`w-full text-left px-2.5 py-1.5 rounded text-xs transition-colors truncate block ${
                      selectedCategory === c
                        ? 'bg-primary-50 text-primary-700 font-semibold'
                        : 'text-text-secondary hover:bg-slate-50'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Building Filter */}
            <div>
              <label className="text-xs font-bold text-text-primary mb-2 block">Building (SVCE)</label>
              <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                {buildings.map((b) => (
                  <button
                    key={b}
                    onClick={() => setSelectedBuilding(b)}
                    className={`w-full text-left px-2.5 py-1.5 rounded text-xs transition-colors truncate block ${
                      selectedBuilding === b
                        ? 'bg-primary-50 text-primary-700 font-semibold'
                        : 'text-text-secondary hover:bg-slate-50'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Results Column */}
          <main className="md:col-span-3 space-y-4">
            {/* Results Bar */}
            <div className="flex items-center justify-between bg-white px-4 py-2.5 rounded-lg border border-border-default shadow-card text-xs">
              <span className="text-text-secondary font-medium">
                Showing <strong className="text-text-primary">{sortedReports.length}</strong> reports
              </span>
              <div className="flex items-center gap-2">
                <span className="text-text-secondary hidden sm:inline">Sort:</span>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-surface-subtle border border-border-default rounded px-2.5 py-1 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-primary-500 font-medium"
                  >
                    <option value="recent">Most Recent</option>
                    <option value="relevance">Relevance</option>
                  </select>
                </div>
              </div>
            </div>

            {/* List / Loading / Empty */}
            {loading ? (
              <LoadingSkeleton rows={4} />
            ) : sortedReports.length === 0 ? (
              <EmptyState
                title="No reports found."
                description="We couldn't find any reports matching your active filter criteria. Try broadening your keywords or clearing selected filters."
                actionLabel="Reset All Filters"
                onAction={() => {
                  setSelectedType('ALL');
                  setSelectedCategory('All Categories');
                  setSelectedBuilding('All Buildings');
                  setSearch('');
                }}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {sortedReports.map((item) => (
                  <Link
                    key={item.id}
                    to={`/items/${item.id}`}
                    className="bg-white rounded-lg border border-border-default shadow-card hover:shadow-soft hover:border-primary-300 transition-all duration-150 flex flex-col overflow-hidden group"
                  >
                    {/* Item Image */}
                    <div className="h-44 bg-slate-50 border-b border-border-default relative overflow-hidden flex items-center justify-center">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="text-xs text-text-disabled font-medium">No Image Uploaded</div>
                      )}
                      <div className="absolute top-2.5 left-2.5">
                        <StatusBadge status={item.type} size="sm" />
                      </div>
                      <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-sm text-[11px] font-semibold text-text-primary border border-border-default">
                        {item.category}
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-text-primary group-hover:text-primary transition-colors line-clamp-1">
                          {item.title}
                        </h3>
                        <p className="text-xs text-text-secondary line-clamp-2 mt-1">
                          {item.description}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-border-default flex items-center justify-between text-xs text-text-secondary">
                        <span className="flex items-center gap-1 text-slate-700 truncate max-w-[160px]">
                          <MapPin className="w-3.5 h-3.5 text-primary-500 flex-shrink-0" />
                          <span className="truncate">{item.building || 'SVCE Campus'}</span>
                        </span>
                        <span className="flex items-center gap-1 text-text-disabled">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(item.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
