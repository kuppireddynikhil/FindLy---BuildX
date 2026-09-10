import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { campusService, SVCE_BUILDINGS } from '../services/campusService';
import type { CampusLocation, Building } from '../services/campusService';
import { reportsService } from '../services/reportsService';
import type { ReportItem } from '../services/reportsService';
import { StatusBadge } from '../components/ui/ArcticPearlComponents';
import {
  MapPin,
  Search,
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  X,
  ExternalLink,
  Building2,
  List,
  Compass,
  Filter
} from 'lucide-react';

export function CampusExplorerPage() {
  const [locations, setLocations] = useState<CampusLocation[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState<string>('All Buildings');
  const [selectedFloor, setSelectedFloor] = useState<string>('All Floors');
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [viewMode, setViewMode] = useState<'map' | 'directory'>('map');

  useEffect(() => {
    async function loadData() {
      const [locs, bldgs, reps] = await Promise.all([
        campusService.getLocations(),
        campusService.getBuildings(),
        reportsService.getReports({ status: 'ACTIVE' }),
      ]);
      setLocations(locs);
      setBuildings(bldgs.length > 0 ? bldgs : SVCE_BUILDINGS);
      setReports(reps);
    }
    loadData();
  }, []);

  const filteredReports = reports.filter((r) => {
    const matchesBuilding =
      selectedBuilding === 'All Buildings' ||
      (r.building && r.building.toLowerCase().includes(selectedBuilding.toLowerCase()));
    const matchesFloor =
      selectedFloor === 'All Floors' || (r.floor && r.floor.toLowerCase().includes(selectedFloor.toLowerCase()));
    const matchesSearch =
      !searchQuery ||
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.location_description && r.location_description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesBuilding && matchesFloor && matchesSearch;
  });

  const availableFloors = ['All Floors', 'Ground Floor', '1st Floor', '2nd Floor', '3rd Floor'];

  const resetMap = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  return (
    <div className="min-h-screen bg-[#F5F8FC] flex flex-col">
      {/* Top Breadcrumb & Controls Header */}
      <div className="bg-white border-b border-border-default px-4 sm:px-6 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-primary-50 text-primary-600 flex items-center justify-center font-bold">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-text-primary flex items-center gap-2">
                SVCE Campus Explorer
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary-50 text-primary-700 font-medium">
                  Tirupati Campus
                </span>
              </h1>
              <p className="text-xs text-text-secondary">
                Spatial lost & found navigator across academic facilities
              </p>
            </div>
          </div>

          {/* View Mode Toggle & Active Reports Counter */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-text-secondary hidden md:inline">
              <strong className="text-primary-600">{filteredReports.length}</strong> active markers on map
            </span>
            <div className="flex items-center bg-surface-subtle border border-border-default rounded-md p-0.5">
              <button
                onClick={() => setViewMode('map')}
                className={`flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded ${
                  viewMode === 'map' ? 'bg-white text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <Layers className="w-3.5 h-3.5" /> Map View
              </button>
              <button
                onClick={() => setViewMode('directory')}
                className={`flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded ${
                  viewMode === 'directory' ? 'bg-white text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <List className="w-3.5 h-3.5" /> Directory
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Workspace: Left Directory Sidebar + Right Interactive Map */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 gap-6">
        {/* Left Sidebar: Buildings & Floors Directory */}
        <aside className="w-full md:w-80 bg-white rounded-lg border border-border-default shadow-card p-4 flex flex-col gap-4 flex-shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 text-text-disabled absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter location or item..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-surface-subtle border border-border-default rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 text-text-primary"
            />
          </div>

          {/* Building Selector */}
          <div>
            <label className="text-xs font-bold text-text-primary uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-primary-500" />
              Buildings
            </label>
            <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
              <button
                onClick={() => setSelectedBuilding('All Buildings')}
                className={`w-full text-left px-3 py-1.5 rounded-md text-xs transition-colors flex items-center justify-between ${
                  selectedBuilding === 'All Buildings'
                    ? 'bg-primary-50 text-primary-700 font-semibold'
                    : 'text-text-secondary hover:bg-slate-50'
                }`}
              >
                <span>All Campus Buildings</span>
                <span className="text-[10px] text-text-disabled">{reports.length}</span>
              </button>
              {buildings.map((b) => {
                const count = reports.filter(
                  (r) => r.building && r.building.toLowerCase().includes(b.name.toLowerCase())
                ).length;
                return (
                  <button
                    key={b.id}
                    onClick={() => setSelectedBuilding(b.name)}
                    className={`w-full text-left px-3 py-1.5 rounded-md text-xs transition-colors flex items-center justify-between ${
                      selectedBuilding === b.name
                        ? 'bg-primary-50 text-primary-700 font-semibold'
                        : 'text-text-secondary hover:bg-slate-50'
                    }`}
                  >
                    <span className="truncate">{b.name}</span>
                    <span className="text-[10px] text-text-disabled">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Floor Level Filter */}
          <div>
            <label className="text-xs font-bold text-text-primary uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-primary-500" />
              Floor Levels
            </label>
            <div className="flex flex-wrap gap-1.5">
              {availableFloors.map((fl) => (
                <button
                  key={fl}
                  onClick={() => setSelectedFloor(fl)}
                  className={`px-2.5 py-1 rounded text-xs transition-colors ${
                    selectedFloor === fl
                      ? 'bg-primary-500 text-white font-semibold shadow-sm'
                      : 'bg-surface-subtle text-text-secondary hover:bg-slate-100 border border-border-default'
                  }`}
                >
                  {fl}
                </button>
              ))}
            </div>
          </div>

          {/* Quick List of Active Items in Selected Area */}
          <div className="flex-1 border-t border-border-default pt-3">
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-2">
              Items in Selected Area ({filteredReports.length})
            </h3>
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {filteredReports.length === 0 ? (
                <p className="text-xs text-text-disabled italic py-2">No active reports in this facility.</p>
              ) : (
                filteredReports.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedReport(item)}
                    className={`p-2.5 rounded-md border text-xs cursor-pointer transition-all ${
                      selectedReport?.id === item.id
                        ? 'bg-primary-50 border-primary-300'
                        : 'bg-white border-border-default hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-semibold text-text-primary truncate">{item.title}</span>
                      <StatusBadge status={item.type} size="sm" />
                    </div>
                    <p className="text-[11px] text-text-secondary mt-0.5 truncate">
                      {item.building || item.location_description}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>

        {/* Right Area: Interactive Campus Map / Directory Table */}
        <main className="flex-1 bg-white rounded-lg border border-border-default shadow-card relative overflow-hidden flex flex-col min-h-[500px]">
          {viewMode === 'map' ? (
            <div className="flex-1 relative overflow-hidden bg-[#EBF2FA] flex items-center justify-center select-none">
              {/* Floating Map Controls */}
              <div className="absolute top-4 right-4 z-20 flex flex-col gap-1.5 bg-white/95 backdrop-blur-md rounded-md border border-border-default p-1 shadow-soft">
                <button
                  onClick={() => setZoomLevel((z) => Math.min(2.2, z + 0.2))}
                  className="p-1.5 hover:bg-slate-100 rounded text-text-secondary hover:text-primary transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.2))}
                  className="p-1.5 hover:bg-slate-100 rounded text-text-secondary hover:text-primary transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  onClick={resetMap}
                  className="p-1.5 hover:bg-slate-100 rounded text-text-secondary hover:text-primary transition-colors"
                  title="Recenter Map"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              {/* Map Legend Overlay */}
              <div className="absolute bottom-4 left-4 z-20 bg-white/90 backdrop-blur-md rounded-md border border-border-default px-3 py-2 text-[11px] text-text-secondary shadow-card flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#B7791F]" />
                  <span>Lost Item</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#2F7BFF]" />
                  <span>Found Item</span>
                </div>
                <div className="flex items-center gap-1.5 text-text-disabled">
                  <span>Pan & Zoom enabled</span>
                </div>
              </div>

              {/* Interactive Vector Campus Canvas */}
              <div
                className="w-full h-full relative cursor-grab active:cursor-grabbing transition-transform duration-100 flex items-center justify-center"
                style={{
                  transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`,
                }}
              >
                {/* SVCE Campus Blueprint Schematic SVG */}
                <svg
                  viewBox="0 0 1000 700"
                  className="w-full h-full max-w-[900px] max-h-[620px] drop-shadow-sm"
                >
                  {/* Campus Grounds Background */}
                  <rect x="50" y="40" width="900" height="620" rx="16" fill="#F0F4FA" stroke="#D1DCEE" strokeWidth="2" />
                  
                  {/* Campus Internal Walkways & Roads */}
                  <path d="M 120 350 L 880 350" stroke="#CBD5E1" strokeWidth="16" strokeLinecap="round" />
                  <path d="M 500 80 L 500 620" stroke="#CBD5E1" strokeWidth="16" strokeLinecap="round" />
                  <path d="M 260 200 L 260 500" stroke="#E2E8F0" strokeWidth="8" strokeDasharray="4 4" />
                  <path d="M 740 200 L 740 500" stroke="#E2E8F0" strokeWidth="8" strokeDasharray="4 4" />

                  {/* Campus Greens / Courtyards */}
                  <circle cx="500" cy="350" r="45" fill="#E2F0D9" stroke="#B8D7A3" strokeWidth="2" />
                  <text x="500" y="354" textAnchor="middle" fill="#5E7D46" fontSize="10" fontWeight="bold">Central Plaza</text>

                  {/* 1. Administrative Block */}
                  <g
                    className="cursor-pointer transition-all hover:opacity-90"
                    onClick={() => setSelectedBuilding('Administrative Block')}
                  >
                    <rect
                      x="100"
                      y="100"
                      width="200"
                      height="120"
                      rx="8"
                      fill={selectedBuilding === 'Administrative Block' ? '#DCEAFF' : '#FFFFFF'}
                      stroke={selectedBuilding === 'Administrative Block' ? '#2F7BFF' : '#CBD5E1'}
                      strokeWidth="2"
                    />
                    <text x="200" y="150" textAnchor="middle" fill="#101828" fontSize="12" fontWeight="bold">Administrative Block</text>
                    <text x="200" y="170" textAnchor="middle" fill="#64748B" fontSize="10">Helpdesk & Security Desk</text>
                  </g>

                  {/* 2. CSE & IT Engineering Block */}
                  <g
                    className="cursor-pointer transition-all hover:opacity-90"
                    onClick={() => setSelectedBuilding('CSE & IT Block')}
                  >
                    <rect
                      x="700"
                      y="100"
                      width="200"
                      height="120"
                      rx="8"
                      fill={selectedBuilding === 'CSE & IT Block' ? '#DCEAFF' : '#FFFFFF'}
                      stroke={selectedBuilding === 'CSE & IT Block' ? '#2F7BFF' : '#CBD5E1'}
                      strokeWidth="2"
                    />
                    <text x="800" y="150" textAnchor="middle" fill="#101828" fontSize="12" fontWeight="bold">CSE & IT Block</text>
                    <text x="800" y="170" textAnchor="middle" fill="#64748B" fontSize="10">Labs 1-4 & Seminar Hall</text>
                  </g>

                  {/* 3. Central Library */}
                  <g
                    className="cursor-pointer transition-all hover:opacity-90"
                    onClick={() => setSelectedBuilding('Central Library')}
                  >
                    <rect
                      x="400"
                      y="110"
                      width="200"
                      height="100"
                      rx="8"
                      fill={selectedBuilding === 'Central Library' ? '#DCEAFF' : '#FFFFFF'}
                      stroke={selectedBuilding === 'Central Library' ? '#2F7BFF' : '#CBD5E1'}
                      strokeWidth="2"
                    />
                    <text x="500" y="155" textAnchor="middle" fill="#101828" fontSize="12" fontWeight="bold">Central Library</text>
                    <text x="500" y="175" textAnchor="middle" fill="#64748B" fontSize="10">Reading Halls & Digital Lab</text>
                  </g>

                  {/* 4. Student Cafeteria */}
                  <g
                    className="cursor-pointer transition-all hover:opacity-90"
                    onClick={() => setSelectedBuilding('Student Cafeteria')}
                  >
                    <rect
                      x="100"
                      y="460"
                      width="200"
                      height="110"
                      rx="8"
                      fill={selectedBuilding === 'Student Cafeteria' ? '#DCEAFF' : '#FFFFFF'}
                      stroke={selectedBuilding === 'Student Cafeteria' ? '#2F7BFF' : '#CBD5E1'}
                      strokeWidth="2"
                    />
                    <text x="200" y="510" textAnchor="middle" fill="#101828" fontSize="12" fontWeight="bold">Student Cafeteria</text>
                    <text x="200" y="530" textAnchor="middle" fill="#64748B" fontSize="10">Food Court & Dining</text>
                  </g>

                  {/* 5. Sports Complex */}
                  <g
                    className="cursor-pointer transition-all hover:opacity-90"
                    onClick={() => setSelectedBuilding('Sports Complex')}
                  >
                    <rect
                      x="700"
                      y="460"
                      width="200"
                      height="110"
                      rx="8"
                      fill={selectedBuilding === 'Sports Complex' ? '#DCEAFF' : '#FFFFFF'}
                      stroke={selectedBuilding === 'Sports Complex' ? '#2F7BFF' : '#CBD5E1'}
                      strokeWidth="2"
                    />
                    <text x="800" y="510" textAnchor="middle" fill="#101828" fontSize="12" fontWeight="bold">Sports Complex</text>
                    <text x="800" y="530" textAnchor="middle" fill="#64748B" fontSize="10">Badminton & Indoor Courts</text>
                  </g>

                  {/* 6. ECE & Mechanical Block */}
                  <g
                    className="cursor-pointer transition-all hover:opacity-90"
                    onClick={() => setSelectedBuilding('ECE Block')}
                  >
                    <rect
                      x="400"
                      y="470"
                      width="200"
                      height="100"
                      rx="8"
                      fill={selectedBuilding === 'ECE Block' ? '#DCEAFF' : '#FFFFFF'}
                      stroke={selectedBuilding === 'ECE Block' ? '#2F7BFF' : '#CBD5E1'}
                      strokeWidth="2"
                    />
                    <text x="500" y="515" textAnchor="middle" fill="#101828" fontSize="12" fontWeight="bold">ECE & Mech Block</text>
                    <text x="500" y="535" textAnchor="middle" fill="#64748B" fontSize="10">Hardware & CAD Centers</text>
                  </g>

                  {/* Render Report Markers on Map */}
                  {filteredReports.map((rep, idx) => {
                    // Place markers over their corresponding building quadrants
                    let mx = 500;
                    let my = 350;
                    const b = (rep.building || '').toLowerCase();
                    if (b.includes('admin')) {
                      mx = 180 + (idx * 20) % 40;
                      my = 140 + (idx * 15) % 30;
                    } else if (b.includes('cs') || b.includes('it')) {
                      mx = 780 + (idx * 20) % 40;
                      my = 140 + (idx * 15) % 30;
                    } else if (b.includes('lib')) {
                      mx = 480 + (idx * 20) % 40;
                      my = 145 + (idx * 15) % 25;
                    } else if (b.includes('cafe') || b.includes('canteen')) {
                      mx = 180 + (idx * 20) % 40;
                      my = 500 + (idx * 15) % 30;
                    } else if (b.includes('sport')) {
                      mx = 780 + (idx * 20) % 40;
                      my = 500 + (idx * 15) % 30;
                    } else {
                      mx = 480 + (idx * 20) % 40;
                      my = 505 + (idx * 15) % 25;
                    }

                    const isLost = rep.type === 'LOST';
                    const isSelected = selectedReport?.id === rep.id;

                    return (
                      <g
                        key={rep.id}
                        className="cursor-pointer group"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedReport(rep);
                        }}
                      >
                        <circle
                          cx={mx}
                          cy={my}
                          r={isSelected ? 16 : 11}
                          fill={isLost ? '#B7791F' : '#2F7BFF'}
                          stroke="#FFFFFF"
                          strokeWidth={isSelected ? 3 : 2}
                          className="drop-shadow-md animate-pulse"
                        />
                        <text
                          x={mx}
                          y={my + 4}
                          textAnchor="middle"
                          fill="#FFFFFF"
                          fontSize="9"
                          fontWeight="bold"
                        >
                          {isLost ? 'L' : 'F'}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Selected Report Floating Panel (Bottom-Right) */}
              {selectedReport && (
                <div className="absolute bottom-4 right-4 z-30 w-80 bg-white rounded-lg border border-border-default shadow-premium p-4 animate-fade-in">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={selectedReport.type} size="sm" />
                      <span className="text-[11px] text-text-secondary">{selectedReport.category}</span>
                    </div>
                    <button
                      onClick={() => setSelectedReport(null)}
                      className="text-text-disabled hover:text-text-primary p-1 rounded"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h4 className="text-sm font-bold text-text-primary mt-2">{selectedReport.title}</h4>
                  <p className="text-xs text-text-secondary line-clamp-2 mt-1">
                    {selectedReport.description}
                  </p>

                  <div className="mt-3 pt-3 border-t border-border-default flex items-center justify-between text-xs">
                    <span className="text-text-secondary flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-primary-500" />
                      {selectedReport.building || 'SVCE Campus'}
                    </span>
                    <Link
                      to={`/items/${selectedReport.id}`}
                      className="inline-flex items-center gap-1 font-semibold text-primary-600 hover:text-primary-700"
                    >
                      View Details <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Accessible Textual Campus Directory Alternative */
            <div className="p-6 overflow-y-auto max-h-[600px]">
              <h2 className="text-base font-bold text-text-primary mb-1">Campus Directory Listing</h2>
              <p className="text-xs text-text-secondary mb-4">
                Textual reference for all academic locations, facilities, and rooms across SVCE Tirupati.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {locations.map((loc) => (
                  <div key={loc.id} className="p-3.5 rounded-lg border border-border-default bg-surface-subtle">
                    <h4 className="text-xs font-bold text-text-primary">{loc.name}</h4>
                    <p className="text-xs text-text-secondary mt-0.5">
                      Building: {loc.building} • Floor: {loc.floor} {loc.room ? `• ${loc.room}` : ''}
                    </p>
                    <div className="mt-2 flex items-center justify-between text-[11px]">
                      <span className="text-primary-600 font-medium">Type: {loc.location_type}</span>
                      <span className="text-text-disabled">Lat: {loc.latitude}, Long: {loc.longitude}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
