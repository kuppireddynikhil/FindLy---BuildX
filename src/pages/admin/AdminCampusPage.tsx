import { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { campusService } from '../../services/campusService';
import type { CampusLocation, Building } from '../../services/campusService';
import { useAuth } from '../../hooks/useAuth';
import { LoadingSkeleton } from '../../components/ui/ArcticPearlComponents';
import {
  MapPin,
  Building as BuildingIcon,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Edit2,
  SlidersHorizontal,
  X,
  Compass
} from 'lucide-react';

export function AdminCampusPage() {
  const { user } = useAuth();
  const [locations, setLocations] = useState<CampusLocation[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState('ALL');
  const [filterActiveOnly, setFilterActiveOnly] = useState(false);

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<CampusLocation | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    building: 'Administrative Block',
    floor: 'Ground Floor',
    room: '',
    location_type: 'lab',
    latitude: 13.6288,
    longitude: 79.4192,
    is_active: true
  });
  const [saving, setSaving] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    const [bldgs, locs] = await Promise.all([
      campusService.getBuildings(),
      campusService.getAllLocations(true)
    ]);
    setBuildings(bldgs);
    setLocations(locs);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreate = () => {
    setEditingLocation(null);
    setFormData({
      name: '',
      building: buildings[0]?.name || 'Administrative Block',
      floor: 'Ground Floor',
      room: '',
      location_type: 'general',
      latitude: 13.6288,
      longitude: 79.4192,
      is_active: true
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (loc: CampusLocation) => {
    setEditingLocation(loc);
    setFormData({
      name: loc.name,
      building: loc.building,
      floor: loc.floor,
      room: loc.room || '',
      location_type: loc.location_type || 'general',
      latitude: loc.latitude,
      longitude: loc.longitude,
      is_active: loc.is_active ?? true
    });
    setIsAddModalOpen(true);
  };

  const handleSaveLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    setSaving(true);
    try {
      if (editingLocation) {
        await campusService.updateLocation(editingLocation.id, formData, user?.id);
        setLocations(prev =>
          prev.map(l => (l.id === editingLocation.id ? { ...l, ...formData } : l))
        );
        setFeedbackMessage(`Location "${formData.name}" updated successfully.`);
      } else {
        const res = await campusService.createLocation(formData, user?.id);
        if (res.data) {
          setLocations(prev => [res.data!, ...prev]);
        }
        setFeedbackMessage(`New location "${formData.name}" added successfully.`);
      }
      setIsAddModalOpen(false);
    } catch {
      setFeedbackMessage('Failed to save location changes.');
    } finally {
      setSaving(false);
      setTimeout(() => setFeedbackMessage(null), 4000);
    }
  };

  const handleToggleStatus = async (loc: CampusLocation) => {
    const nextStatus = !(loc.is_active ?? true);
    setLocations(prev =>
      prev.map(l => (l.id === loc.id ? { ...l, is_active: nextStatus } : l))
    );
    await campusService.toggleLocationStatus(loc.id, loc.is_active ?? true, user?.id);
    setFeedbackMessage(
      `Location "${loc.name}" marked as ${nextStatus ? 'ACTIVE' : 'DEACTIVATED'}.`
    );
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  // Filtered list
  const filteredLocations = locations.filter(loc => {
    const matchesSearch =
      loc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loc.building.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (loc.room && loc.room.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesBuilding =
      selectedBuilding === 'ALL' || loc.building === selectedBuilding;

    const matchesActive = !filterActiveOnly || (loc.is_active ?? true);

    return matchesSearch && matchesBuilding && matchesActive;
  });

  const activeCount = locations.filter(l => l.is_active ?? true).length;
  const deactivatedCount = locations.length - activeCount;

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary-50 text-primary-700 text-xs font-semibold mb-1">
              <Compass size={12} className="text-primary-500" />
              SVCE Tirupati Infrastructure
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
              Campus & Facilities Management
            </h1>
            <p className="text-sm text-text-secondary mt-1">
              Maintain buildings, departments, classrooms, and deterministic pinpoints for lost item reporting.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-lg text-sm font-semibold shadow-sm transition-all active:scale-[0.99]"
            >
              <Plus size={16} />
              Add Location
            </button>
          </div>
        </div>

        {/* Feedback Banner */}
        {feedbackMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>{feedbackMessage}</span>
          </div>
        )}

        {/* Quick Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white border border-border rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600">
                <MapPin size={20} />
              </div>
              <div>
                <p className="text-xs font-semibold text-text-tertiary uppercase">Total Locations</p>
                <p className="text-2xl font-bold text-text-primary">{locations.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white border border-border rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <p className="text-xs font-semibold text-text-tertiary uppercase">Active Hotspots</p>
                <p className="text-2xl font-bold text-text-primary">{activeCount}</p>
              </div>
            </div>
          </div>
          <div className="bg-white border border-border rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                <BuildingIcon size={20} />
              </div>
              <div>
                <p className="text-xs font-semibold text-text-tertiary uppercase">Campus Blocks</p>
                <p className="text-2xl font-bold text-text-primary">{buildings.length || 7}</p>
              </div>
            </div>
          </div>
          <div className="bg-white border border-border rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                <XCircle size={20} />
              </div>
              <div>
                <p className="text-xs font-semibold text-text-tertiary uppercase">Deactivated</p>
                <p className="text-2xl font-bold text-text-primary">{deactivatedCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white border border-border rounded-xl p-4 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
              <input
                type="text"
                placeholder="Search by facility name, room code, or building..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-surface rounded-lg border border-border focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
              />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={14} className="text-text-tertiary" />
                <span className="text-xs font-medium text-text-secondary">Building:</span>
                <select
                  value={selectedBuilding}
                  onChange={e => setSelectedBuilding(e.target.value)}
                  className="text-xs font-medium bg-surface border border-border rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-primary-500"
                >
                  <option value="ALL">All Blocks & Buildings</option>
                  {buildings.map(b => (
                    <option key={b.id} value={b.name}>{b.name} ({b.code})</option>
                  ))}
                </select>
              </div>

              <label className="flex items-center gap-2 text-xs font-medium text-text-secondary cursor-pointer select-none bg-surface px-2.5 py-1.5 rounded-lg border border-border">
                <input
                  type="checkbox"
                  checked={filterActiveOnly}
                  onChange={e => setFilterActiveOnly(e.target.checked)}
                  className="rounded border-border text-primary-500 focus:ring-primary-500"
                />
                Active Only
              </label>
            </div>
          </div>
        </div>

        {/* Locations Table */}
        <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-6">
              <LoadingSkeleton rows={6} />
            </div>
          ) : filteredLocations.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-12 h-12 rounded-xl bg-surface border border-border flex items-center justify-center mx-auto mb-3 text-text-tertiary">
                <MapPin size={22} />
              </div>
              <h3 className="text-base font-bold text-text-primary">No Campus Locations Found</h3>
              <p className="text-xs text-text-secondary mt-1 max-w-sm mx-auto">
                No location matches your selected filters. Try clearing the search query or adding a new location.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-surface/60 border-b border-border text-[11px] font-bold text-text-tertiary uppercase tracking-wider">
                    <th className="py-3 px-4">Location Name</th>
                    <th className="py-3 px-4">Building / Block</th>
                    <th className="py-3 px-4">Floor & Room</th>
                    <th className="py-3 px-4">Facility Type</th>
                    <th className="py-3 px-4">Coordinates</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredLocations.map(loc => {
                    const isActive = loc.is_active ?? true;
                    return (
                      <tr
                        key={loc.id}
                        className={`hover:bg-surface/50 transition-colors ${
                          !isActive ? 'opacity-65 bg-slate-50/50' : ''
                        }`}
                      >
                        <td className="py-3 px-4 font-semibold text-text-primary">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-primary-500 shrink-0" />
                            {loc.name}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-text-secondary">
                          <div className="flex items-center gap-1.5 font-medium">
                            <BuildingIcon size={14} className="text-text-tertiary" />
                            {loc.building}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-text-secondary">
                          <div className="text-xs font-medium">
                            <span className="text-text-primary">{loc.floor}</span>
                            {loc.room && (
                              <span className="ml-1.5 text-text-tertiary">({loc.room})</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-block uppercase tracking-wider text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                            {loc.location_type || 'General'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-xs font-mono text-text-tertiary">
                          {loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                              isActive
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-rose-50 text-rose-700'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isActive ? 'bg-emerald-500' : 'bg-rose-500'
                              }`}
                            />
                            {isActive ? 'Active' : 'Deactivated'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => handleOpenEdit(loc)}
                              className="p-1.5 text-text-tertiary hover:text-text-primary hover:bg-slate-100 rounded-lg transition-colors"
                              title="Edit Location Details"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => handleToggleStatus(loc)}
                              className={`px-2 py-1 text-xs font-semibold rounded-lg transition-colors ${
                                isActive
                                  ? 'text-rose-600 hover:bg-rose-50'
                                  : 'text-emerald-600 hover:bg-emerald-50'
                              }`}
                              title={isActive ? 'Soft Deactivate Location' : 'Reactivate Location'}
                            >
                              {isActive ? 'Deactivate' : 'Reactivate'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add / Edit Location Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-border shadow-2xl w-full max-w-lg overflow-hidden animate-scaleIn">
              <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface/30">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
                    <MapPin size={16} />
                  </div>
                  <h3 className="text-base font-bold text-text-primary">
                    {editingLocation ? 'Edit Campus Location' : 'Add New Campus Location'}
                  </h3>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-slate-100"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveLocation} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase mb-1">
                    Location Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., CSE High Performance Lab"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-surface rounded-lg border border-border focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-text-secondary uppercase mb-1">
                      Building / Block *
                    </label>
                    <select
                      value={formData.building}
                      onChange={e => setFormData({ ...formData, building: e.target.value })}
                      className="w-full px-3 py-2 text-sm bg-surface rounded-lg border border-border focus:outline-none focus:border-primary-500"
                    >
                      {buildings.map(b => (
                        <option key={b.id} value={b.name}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-text-secondary uppercase mb-1">
                      Floor *
                    </label>
                    <select
                      value={formData.floor}
                      onChange={e => setFormData({ ...formData, floor: e.target.value })}
                      className="w-full px-3 py-2 text-sm bg-surface rounded-lg border border-border focus:outline-none focus:border-primary-500"
                    >
                      <option value="Ground Floor">Ground Floor</option>
                      <option value="1st Floor">1st Floor</option>
                      <option value="2nd Floor">2nd Floor</option>
                      <option value="3rd Floor">3rd Floor</option>
                      <option value="4th Floor">4th Floor</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-text-secondary uppercase mb-1">
                      Room / Hall Code
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Lab CS-101"
                      value={formData.room}
                      onChange={e => setFormData({ ...formData, room: e.target.value })}
                      className="w-full px-3 py-2 text-sm bg-surface rounded-lg border border-border focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-text-secondary uppercase mb-1">
                      Facility Type
                    </label>
                    <select
                      value={formData.location_type}
                      onChange={e => setFormData({ ...formData, location_type: e.target.value })}
                      className="w-full px-3 py-2 text-sm bg-surface rounded-lg border border-border focus:outline-none focus:border-primary-500"
                    >
                      <option value="lab">Lab</option>
                      <option value="library">Library</option>
                      <option value="cafeteria">Cafeteria</option>
                      <option value="hall">Seminar / Auditorium</option>
                      <option value="office">Office / Helpdesk</option>
                      <option value="sports">Sports</option>
                      <option value="general">General Campus Ground</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-text-secondary uppercase mb-1">
                      Latitude
                    </label>
                    <input
                      type="number"
                      step="0.0001"
                      value={formData.latitude}
                      onChange={e => setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 text-sm font-mono bg-surface rounded-lg border border-border focus:outline-none focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-text-secondary uppercase mb-1">
                      Longitude
                    </label>
                    <input
                      type="number"
                      step="0.0001"
                      value={formData.longitude}
                      onChange={e => setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 text-sm font-mono bg-surface rounded-lg border border-border focus:outline-none focus:border-primary-500"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                      className="rounded border-border text-primary-500 focus:ring-primary-500"
                    />
                    <span className="text-xs font-semibold text-text-secondary">
                      Active (available in Lost & Found reporting wizard)
                    </span>
                  </label>
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 text-sm font-semibold text-text-secondary hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 text-sm font-semibold text-white bg-primary-500 hover:bg-primary-600 disabled:opacity-50 rounded-lg shadow-sm transition-all"
                  >
                    {saving ? 'Saving...' : editingLocation ? 'Update Location' : 'Create Location'}
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
