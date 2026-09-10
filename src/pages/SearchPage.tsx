<<<<<<< HEAD
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
=======
import { useState, useMemo } from 'react';
import { Search, MapPin, Calendar, Tag, User, HelpCircle, PackageOpen } from 'lucide-react';
import { ItemCard } from '../components/ui/ItemCard';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { ITEM_CATEGORIES, type Item } from '../types/database';
import './SearchPage.css';

// Mock items database
const MOCK_ITEMS: Item[] = [
  {
    id: '1',
    user_id: 'u1',
    type: 'lost',
    title: 'MacBook Pro 14" (Space Grey)',
    description: 'Left it on the third floor of the Library, near the window desks. Has a sticker of a rocket on the back.',
    category: 'Electronics',
    location: 'Library',
    date: '2026-06-12',
    image_url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80',
    contact_info: 'Email: student1@college.edu',
    status: 'open',
    created_at: '2026-06-12T10:00:00Z',
    updated_at: '2026-06-12T10:00:00Z',
  },
  {
    id: '2',
    user_id: 'u2',
    type: 'found',
    title: 'Keyring with 3 Keys and Gym Badge',
    description: 'Found near the Cafeteria entrance benches. One key has a blue plastic cover.',
    category: 'Keys',
    location: 'Cafeteria',
    date: '2026-06-13',
    image_url: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=600&q=80',
    contact_info: 'Drop off at library front desk',
    status: 'open',
    created_at: '2026-06-13T08:30:00Z',
    updated_at: '2026-06-13T08:30:00Z',
  },
  {
    id: '3',
    user_id: 'u3',
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
    id: '4',
    user_id: 'u4',
    type: 'found',
    title: 'Student ID Card - Emily Watson',
    description: 'Found on the ground outside the Science Block. Emily, please collect this at your convenience.',
    category: 'ID Cards & Documents',
    location: 'Science Block',
    date: '2026-06-13',
    image_url: 'https://images.unsplash.com/photo-1578358378071-77d29b6807d4?auto=format&fit=crop&w=600&q=80',
    contact_info: 'science block admin desk',
    status: 'open',
    created_at: '2026-06-13T09:15:00Z',
    updated_at: '2026-06-13T09:15:00Z',
  },
  {
    id: '5',
    user_id: 'u5',
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
    id: '6',
    user_id: 'u6',
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
  {
    id: '7',
    user_id: 'u7',
    type: 'lost',
    title: 'Black Casio G-Shock Watch',
    description: 'Left on the sink edge in the main Cafeteria restroom. Digital clock display with red accents.',
    category: 'Accessories',
    location: 'Cafeteria',
    date: '2026-06-09',
    image_url: 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=600&q=80',
    contact_info: 'Text or call 555-4921',
    status: 'open',
    created_at: '2026-06-09T10:15:00Z',
    updated_at: '2026-06-09T10:15:00Z',
  },
  {
    id: '8',
    user_id: 'u8',
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
    id: '9',
    user_id: 'u9',
    type: 'lost',
    title: 'Eastpak Backpack (Olive Green)',
    description: 'Contains a yellow water bottle and physics textbook. Forgotten near the parking lot benches.',
    category: 'Bags & Wallets',
    location: 'Parking Lot',
    date: '2026-06-08',
    image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80',
    contact_info: 'Call 555-8833',
    status: 'resolved',
    created_at: '2026-06-08T09:40:00Z',
    updated_at: '2026-06-11T15:30:00Z',
  },
  {
    id: '10',
    user_id: 'u10',
    type: 'found',
    title: 'Wireless Charging Pad (Black)',
    description: 'Found plugged in at Library Study Room 4. Brand is Anker.',
    category: 'Electronics',
    location: 'Library',
    date: '2026-06-13',
    image_url: 'https://images.unsplash.com/photo-1622445262465-2481c4574875?auto=format&fit=crop&w=600&q=80',
    contact_info: 'Leave message or drop by room 4',
    status: 'open',
    created_at: '2026-06-13T10:45:00Z',
    updated_at: '2026-06-13T10:45:00Z',
  },
  {
    id: '11',
    user_id: 'u11',
    type: 'lost',
    title: 'Wilson Basketball',
    description: 'Left on the outdoor basketball court next to the sports locker rooms.',
    category: 'Sports Equipment',
    location: 'Sports Complex',
    date: '2026-06-07',
    image_url: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=600&q=80',
    contact_info: 'Email: bballfan@college.edu',
    status: 'claimed',
    created_at: '2026-06-07T18:00:00Z',
    updated_at: '2026-06-08T12:00:00Z',
  },
  {
    id: '12',
    user_id: 'u12',
    type: 'found',
    title: 'Gold Ring',
    description: 'Found inside Lab 3B on the Engineering block. Please verify with description of engravings inside.',
    category: 'Other',
    location: 'Lab',
    date: '2026-06-11',
    image_url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=600&q=80',
    contact_info: 'Claim at engineering reception',
    status: 'open',
    created_at: '2026-06-11T13:10:00Z',
    updated_at: '2026-06-11T13:10:00Z',
  },
];

export function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeType, setActiveType] = useState<'all' | 'lost' | 'found'>('all');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeStatus, setActiveStatus] = useState<'all' | 'open' | 'resolved' | 'claimed'>('all');
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  // Compute filtered items list
  const filteredItems = useMemo(() => {
    return MOCK_ITEMS.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesType = activeType === 'all' || item.type === activeType;
      const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
      const matchesStatus = activeStatus === 'all' || item.status === activeStatus;

      return matchesSearch && matchesType && matchesCategory && matchesStatus;
    });
  }, [searchQuery, activeType, activeCategory, activeStatus]);

  const handleCardClick = (item: Item) => {
    setSelectedItem(item);
  };

  const handleCloseModal = () => {
    setSelectedItem(null);
  };

  return (
    <div className="search-page page-container">
      <div className="container">
        {/* Header */}
        <div className="search-page__header">
          <h1 className="section-title">Search Items</h1>
          <p className="section-subtitle">
            Search and filter the live database of lost and found logs on campus.
          </p>
        </div>

        {/* Search Bar */}
        <div className="search-page__bar glass">
          <Search className="search-page__bar-icon" size={20} />
          <input
            type="text"
            className="search-page__input"
            placeholder="Search by title, keyword, or detail..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filters Panel */}
        <div className="search-page__filters glass-card">
          {/* Type Filter */}
          <div className="filter-group">
            <span className="filter-group__label">Type:</span>
            <div className="filter-group__chips">
              {(['all', 'lost', 'found'] as const).map((type) => (
                <button
                  key={type}
                  className={`filter-chip ${activeType === type ? 'filter-chip--active' : ''}`}
                  onClick={() => setActiveType(type)}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Status Filter */}
          <div className="filter-group">
            <span className="filter-group__label">Status:</span>
            <div className="filter-group__chips">
              {(['all', 'open', 'resolved', 'claimed'] as const).map((status) => (
                <button
                  key={status}
                  className={`filter-chip ${activeStatus === status ? 'filter-chip--active' : ''}`}
                  onClick={() => setActiveStatus(status)}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div className="filter-group">
            <span className="filter-group__label">Category:</span>
            <div className="filter-group__chips select-chips">
              <button
                className={`filter-chip ${activeCategory === 'all' ? 'filter-chip--active' : ''}`}
                onClick={() => setActiveCategory('all')}
              >
                All Categories
              </button>
              {ITEM_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  className={`filter-chip ${activeCategory === cat ? 'filter-chip--active' : ''}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Counter */}
        <div className="search-page__results-meta">
          <span>Showing {filteredItems.length} items</span>
        </div>

        {/* Results Grid */}
        {filteredItems.length > 0 ? (
          <div className="search-page__grid">
            {filteredItems.map((item) => (
              <ItemCard key={item.id} item={item} onClick={handleCardClick} />
            ))}
          </div>
        ) : (
          <div className="search-page__empty glass-card">
            <PackageOpen size={64} className="search-page__empty-icon" />
            <h3 className="search-page__empty-title">No items found</h3>
            <p className="search-page__empty-desc">
              We couldn't find any matches. Try adjusting your query or resetting filters.
            </p>
            <Button
              variant="secondary"
              onClick={() => {
                setSearchQuery('');
                setActiveType('all');
                setActiveCategory('all');
                setActiveStatus('all');
              }}
            >
              Reset Filters
            </Button>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <Modal isOpen={!!selectedItem} onClose={handleCloseModal} title="Item Details">
        {selectedItem && (
          <div className="item-detail animate-scale-in">
            {selectedItem.image_url && (
              <div className="item-detail__image">
                <img src={selectedItem.image_url} alt={selectedItem.title} />
              </div>
            )}

            <div className="item-detail__content">
              <div className="item-detail__badges">
                <Badge variant={selectedItem.type === 'lost' ? 'lost' : 'found'}>
                  {selectedItem.type === 'lost' ? 'Lost' : 'Found'}
                </Badge>
                <Badge
                  variant={
                    selectedItem.status === 'open'
                      ? 'warning'
                      : selectedItem.status === 'resolved'
                      ? 'success'
                      : 'info'
                  }
                >
                  {selectedItem.status}
                </Badge>
              </div>

              <h2 className="item-detail__title">{selectedItem.title}</h2>

              <p className="item-detail__desc">
                {selectedItem.description || 'No description provided.'}
              </p>

              <div className="item-detail__meta">
                <div className="meta-row">
                  <Tag size={16} />
                  <span>
                    <strong>Category:</strong> {selectedItem.category}
                  </span>
                </div>
                <div className="meta-row">
                  <MapPin size={16} />
                  <span>
                    <strong>Location:</strong> {selectedItem.location}
                  </span>
                </div>
                <div className="meta-row">
                  <Calendar size={16} />
                  <span>
                    <strong>Date reported:</strong>{' '}
                    {new Date(selectedItem.date).toLocaleDateString()}
                  </span>
                </div>
                <div className="meta-row">
                  <User size={16} />
                  <span>
                    <strong>Reporter ID:</strong> {selectedItem.user_id}
                  </span>
                </div>
              </div>

              <div className="item-detail__contact glass">
                <div className="contact-header">
                  <HelpCircle size={16} />
                  <h3>How to claim/contact</h3>
                </div>
                <p className="contact-body">
                  {selectedItem.contact_info ||
                    'Please contact campus reception desk or raise a dispute with the administration.'}
                </p>
              </div>

              <div className="item-detail__actions">
                <Button variant="secondary" onClick={handleCloseModal}>
                  Close Window
                </Button>
                {selectedItem.type === 'lost' ? (
                  <Button
                    variant="primary"
                    onClick={() => {
                      alert('A notification has been sent to the owner.');
                      handleCloseModal();
                    }}
                  >
                    I Found This Item
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    onClick={() => {
                      alert('Claim request sent to administrators. Please carry your student ID.');
                      handleCloseModal();
                    }}
                  >
                    Claim Ownership
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
>>>>>>> origin/main
    </div>
  );
}
