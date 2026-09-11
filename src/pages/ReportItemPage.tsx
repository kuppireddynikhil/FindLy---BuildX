import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { reportsService } from '../services/reportsService';
import { campusService, SVCE_BUILDINGS } from '../services/campusService';
import type { CampusLocation, Building } from '../services/campusService';
import { useToast } from '../components/ui/Toast';
import {
  AlertCircle,
  CheckCircle2,
  MapPin,
  Upload,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  X,
  Compass
} from 'lucide-react';

export function ReportItemPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [searchParams] = useSearchParams();

  const initialType = searchParams.get('type') === 'FOUND' ? 'FOUND' : 'LOST';

  const [step, setStep] = useState<number>(1);
  const [reportType, setReportType] = useState<'LOST' | 'FOUND'>(initialType);

  // Form Details State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Electronics & Gadgets');
  const [description, setDescription] = useState('');
  const [identifyingFeatures, setIdentifyingFeatures] = useState('');
  const [brand, setBrand] = useState('');
  const [color, setColor] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('10:30');

  // Location State
  const [locations, setLocations] = useState<CampusLocation[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState('Central Library');
  const [selectedFloor, setSelectedFloor] = useState('1st Floor');
  const [selectedLocationId, setSelectedLocationId] = useState('');
  const [locationDescription, setLocationDescription] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({ lat: 13.6288, lng: 79.4192 });

  // Images State
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [submittedReportId, setSubmittedReportId] = useState<string | null>(null);

  useEffect(() => {
    async function loadLocations() {
      const [locs, bldgs] = await Promise.all([
        campusService.getLocations(),
        campusService.getBuildings(),
      ]);
      setLocations(locs);
      setBuildings(bldgs.length > 0 ? bldgs : SVCE_BUILDINGS);
      if (locs.length > 0) {
        setSelectedLocationId(locs[0].id);
        setCoords({ lat: locs[0].latitude, lng: locs[0].longitude });
      }
    }
    loadLocations();
  }, []);

  const categories = [
    'Electronics & Gadgets',
    'ID Cards & Documents',
    'Bags & Backpacks',
    'Keys & Access Cards',
    'Books & Stationery',
    'Clothing & Accessories',
    'Personal Belongings',
  ];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      // Validate file size (max 5MB)
      const validFiles = files.filter((f) => {
        if (f.size > 5 * 1024 * 1024) {
          addToast(`${f.name} exceeds 5MB limit.`, 'error');
          return false;
        }
        return true;
      });

      setImageFiles((prev) => [...prev, ...validFiles]);
      const newUrls = validFiles.map((f) => URL.createObjectURL(f));
      setPreviewUrls((prev) => [...prev, ...newUrls]);
    }
  };

  const removeImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      if (!title.trim() || !description.trim()) {
        addToast('Please provide a title and detailed description.', 'error');
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (!selectedBuilding) {
        addToast('Please select a campus facility or building.', 'error');
        return;
      }
      setStep(4);
    } else if (step === 4) {
      setStep(5);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      addToast('Please login to submit a report.', 'error');
      navigate('/login');
      return;
    }

    setSubmitting(true);
    try {
      const res = await reportsService.createReport(
        {
          reporter_id: user.id,
          reporter_email: user.email,
          reporter: {
            id: user.id,
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'SVCE Student',
            avatar_url: user.user_metadata?.avatar_url,
          },
          type: reportType,
          title: title.trim(),
          description: description.trim(),
          category,
          brand: brand.trim() || undefined,
          color: color.trim() || undefined,
          identifying_features: identifyingFeatures.trim() || undefined,
          campus_location_id: selectedLocationId || undefined,
          building: selectedBuilding,
          floor: selectedFloor,
          location_description: locationDescription.trim() || `Near ${selectedBuilding}, ${selectedFloor}`,
          latitude: coords.lat,
          longitude: coords.lng,
          date,
          time,
        },
        imageFiles[0]
      );

      if (!res.success) {
        throw new Error(res.error || 'Failed to submit report');
      }

      setSubmittedReportId(res.id || 'new');
      addToast('Report submitted and campus matching process initiated!', 'success');
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : 'Error submitting report.';
      addToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F8FC] py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Breadcrumb */}
        <div className="mb-6">
          <Link
            to="/home"
            className="text-xs font-semibold text-text-secondary hover:text-primary-600 flex items-center gap-1 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Campus Feed
          </Link>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Report Campus Item</h1>
          <p className="text-xs text-text-secondary mt-1">
            Register lost or found belongings to notify the SVCE Tirupati student community
          </p>
        </div>

        {/* Step Indicator */}
        <div className="bg-white rounded-lg p-4 border border-border-default shadow-card mb-6 flex items-center justify-between">
          {[
            { num: 1, label: 'Type' },
            { num: 2, label: 'Details' },
            { num: 3, label: 'Location' },
            { num: 4, label: 'Images' },
            { num: 5, label: 'Review' },
          ].map((s) => (
            <div key={s.num} className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${step === s.num
                    ? 'bg-primary-500 text-white shadow-sm ring-2 ring-primary-100'
                    : step > s.num
                      ? 'bg-success text-white'
                      : 'bg-surface-subtle text-text-disabled border border-border-default'
                  }`}
              >
                {step > s.num ? <CheckCircle2 className="w-4 h-4" /> : s.num}
              </div>
              <span
                className={`text-xs hidden sm:inline ${step === s.num ? 'font-bold text-text-primary' : 'text-text-secondary'
                  }`}
              >
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* Main Step Container */}
        <div className="bg-white rounded-xl p-6 sm:p-8 border border-border-default shadow-card">
          {/* STEP 1: REPORT TYPE */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-bold text-text-primary">What are you reporting?</h2>
                <p className="text-xs text-text-secondary mt-0.5">
                  Select whether you lost an item or discovered an unattended item on campus
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  onClick={() => setReportType('LOST')}
                  className={`p-5 rounded-lg border-2 cursor-pointer transition-all ${reportType === 'LOST'
                      ? 'border-warning bg-[#FBF0DD]/30 shadow-soft'
                      : 'border-border-default hover:border-slate-300'
                    }`}
                >
                  <div className="w-10 h-10 rounded-full bg-[#FBF0DD] text-warning flex items-center justify-center mb-3">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-text-primary">I Lost Something</h3>
                  <p className="text-xs text-text-secondary mt-1">
                    Report a misplaced item to search for matches and notify students who might discover it.
                  </p>
                </div>

                <div
                  onClick={() => setReportType('FOUND')}
                  className={`p-5 rounded-lg border-2 cursor-pointer transition-all ${reportType === 'FOUND'
                      ? 'border-primary-500 bg-primary-50/50 shadow-soft'
                      : 'border-border-default hover:border-slate-300'
                    }`}
                >
                  <div className="w-10 h-10 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center mb-3">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-text-primary">I Found Something</h3>
                  <p className="text-xs text-text-secondary mt-1">
                    Help return an unattended item found in class, labs, library, or canteen to its rightful owner.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: ITEM DETAILS */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-bold text-text-primary">Item Details</h2>
                <p className="text-xs text-text-secondary mt-0.5">
                  Provide descriptive information to ensure accurate deterministic matching
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-text-primary mb-1 block">Item Title *</label>
                <input
                  type="text"
                  placeholder="e.g., Navy Blue North Face Backpack, Silver MacBook Air, SVCE College ID Card..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-border-default rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 text-text-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-text-primary mb-1 block">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-white border border-border-default rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 text-text-primary"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-text-primary mb-1 block">Brand (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g., Apple, Dell, Fastrack, Wildcraft..."
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-white border border-border-default rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 text-text-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-text-primary mb-1 block">Primary Color</label>
                  <input
                    type="text"
                    placeholder="e.g., Navy Blue, Matte Black, Silver..."
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-white border border-border-default rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 text-text-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-semibold text-text-primary mb-1 block">Incident Date *</label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm bg-white border border-border-default rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 text-text-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-text-primary mb-1 block">Approx. Time</label>
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm bg-white border border-border-default rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 text-text-primary"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-text-primary mb-1 block">Detailed Description *</label>
                <textarea
                  rows={3}
                  placeholder="Describe where you last saw the item, visible scratches, stickers, condition, contents..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-border-default rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 text-text-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-text-primary mb-1 block">
                  Private Identifying Features (Used for Verification)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Keychain has SVCE logo, wallpaper is an astronaut, serial ends with 4910..."
                  value={identifyingFeatures}
                  onChange={(e) => setIdentifyingFeatures(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-border-default rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 text-text-primary"
                />
                <span className="text-[11px] text-text-secondary mt-1 block">
                  This detail is kept private and used by moderators to verify claimant identity.
                </span>
              </div>
            </div>
          )}

          {/* STEP 3: STRUCTURED CAMPUS LOCATION & PIN */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-base font-bold text-text-primary">Campus Location</h2>
                <p className="text-xs text-text-secondary mt-0.5">
                  Pinpoint the SVCE Tirupati academic building and specific room/area
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-text-primary mb-1 block">Building *</label>
                  <select
                    value={selectedBuilding}
                    onChange={(e) => setSelectedBuilding(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-white border border-border-default rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 text-text-primary"
                  >
                    {buildings.map((b) => (
                      <option key={b.id} value={b.name}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-text-primary mb-1 block">Floor Level *</label>
                  <select
                    value={selectedFloor}
                    onChange={(e) => setSelectedFloor(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-white border border-border-default rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 text-text-primary"
                  >
                    <option value="Ground Floor">Ground Floor</option>
                    <option value="1st Floor">1st Floor</option>
                    <option value="2nd Floor">2nd Floor</option>
                    <option value="3rd Floor">3rd Floor</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-text-primary mb-1 block">
                  Known Campus Facility / Room
                </label>
                <select
                  value={selectedLocationId}
                  onChange={(e) => {
                    setSelectedLocationId(e.target.value);
                    const found = locations.find((l) => l.id === e.target.value);
                    if (found) {
                      setCoords({ lat: found.latitude, lng: found.longitude });
                    }
                  }}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-border-default rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 text-text-primary"
                >
                  <option value="">Select a known facility / room (optional)</option>
                  {locations
                    .filter((l) => l.building === selectedBuilding)
                    .map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name} {l.room ? `(${l.room})` : ''}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-text-primary mb-1 block">
                  Specific Location Landmark / Description
                </label>
                <input
                  type="text"
                  placeholder="e.g., Near third table beside the library window, CS Lab 102 rack..."
                  value={locationDescription}
                  onChange={(e) => setLocationDescription(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-border-default rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 text-text-primary"
                />
              </div>

              {/* Fixed Center Pin Map Confirmation Box */}
              <div className="border border-border-default rounded-lg p-4 bg-surface-subtle">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-primary-500" />
                    Spatial Map Location (SVCE Coordinates)
                  </span>
                  <span className="text-[11px] text-text-secondary">
                    Lat: {coords.lat.toFixed(4)}, Lng: {coords.lng.toFixed(4)}
                  </span>
                </div>
                <div className="h-44 bg-[#EBF2FA] rounded-md relative flex items-center justify-center border border-border-default overflow-hidden">
                  <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#CBD5E1_1px,transparent_1px)] [background-size:16px_16px]" />
                  <div className="z-10 flex flex-col items-center">
                    <MapPin className="w-8 h-8 text-primary-600 drop-shadow-md animate-bounce" />
                    <span className="mt-1 px-2.5 py-1 bg-white/95 backdrop-blur-sm rounded text-[11px] font-bold text-text-primary shadow-sm border border-border-default">
                      {selectedBuilding} ({selectedFloor})
                    </span>
                  </div>
                </div>
                <span className="text-[11px] text-text-disabled mt-2 block text-center">
                  Location coordinates locked to selected campus facility.
                </span>
              </div>
            </div>
          )}

          {/* STEP 4: IMAGES UPLOAD */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-bold text-text-primary">Upload Photos</h2>
                <p className="text-xs text-text-secondary mt-0.5">
                  Clear images significantly improve deterministic matching speed and verification
                </p>
              </div>

              <label className="border-2 border-dashed border-border-default hover:border-primary-400 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer bg-surface-subtle/50 transition-colors">
                <Upload className="w-8 h-8 text-primary-500 mb-2" />
                <span className="text-sm font-semibold text-text-primary">Click to select photos</span>
                <span className="text-xs text-text-secondary mt-1">PNG, JPG, or WEBP up to 5MB</span>
                <input
                  type="file"
                  multiple
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>

              {previewUrls.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-text-primary mb-2">Selected Images ({previewUrls.length})</h4>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {previewUrls.map((url, i) => (
                      <div key={i} className="relative rounded-md overflow-hidden border border-border-default h-24 group">
                        <img src={url} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-full hover:bg-red-600 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 5: REVIEW & SUBMIT */}
          {step === 5 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-base font-bold text-text-primary">Review & Confirm Report</h2>
                <p className="text-xs text-text-secondary mt-0.5">
                  Please review the details below before submitting to the campus database
                </p>
              </div>

              <div className="bg-surface-subtle rounded-lg p-4 border border-border-default space-y-3 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-border-default">
                  <span className="text-text-secondary">Report Type:</span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded-full ${reportType === 'LOST' ? 'bg-[#FBF0DD] text-[#B7791F]' : 'bg-[#EEF5FF] text-[#2F7BFF]'
                      }`}
                  >
                    {reportType === 'LOST' ? 'Lost Item Report' : 'Found Item Report'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Title:</span>
                  <span className="font-bold text-text-primary">{title}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Category:</span>
                  <span className="font-semibold text-text-primary">{category}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Location:</span>
                  <span className="font-semibold text-text-primary">
                    {selectedBuilding} ({selectedFloor})
                  </span>
                </div>

                {locationDescription && (
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary">Specific Spot:</span>
                    <span className="font-medium text-text-primary">{locationDescription}</span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Date:</span>
                  <span className="font-medium text-text-primary">{date}</span>
                </div>

                <div className="pt-2 border-t border-border-default">
                  <span className="text-text-secondary block mb-1">Description:</span>
                  <p className="text-text-primary">{description}</p>
                </div>

                {previewUrls.length > 0 && (
                  <div className="pt-2 border-t border-border-default">
                    <span className="text-text-secondary block mb-1">Photos Attached:</span>
                    <span className="font-semibold text-text-primary">{previewUrls.length} photo(s)</span>
                  </div>
                )}
              </div>

              <div className="p-3 bg-[#EEF5FF] rounded-lg border border-[#DCEAFF] text-xs text-primary-800 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-primary-600 flex-shrink-0 mt-0.5" />
                <span>
                  Upon submission, the deterministic auto-matching engine will evaluate opposing active campus reports and notify potential owners.
                </span>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="mt-8 pt-4 border-t border-border-default flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="px-4 py-2 text-xs font-semibold text-text-secondary hover:text-text-primary border border-border-default rounded-md transition-colors flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
            ) : (
              <div />
            )}

            {step < 5 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-5 py-2 text-xs font-semibold text-white bg-primary-500 hover:bg-primary-600 rounded-md shadow-sm transition-colors flex items-center gap-1"
              >
                Continue <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                disabled={submitting}
                onClick={handleSubmit}
                className="px-6 py-2 text-xs font-bold text-white bg-success hover:bg-emerald-700 rounded-md shadow-sm transition-colors flex items-center gap-1 disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Report'}
              </button>
            )}
          </div>
        </div>

        {/* Success Modal */}
        {submittedReportId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white rounded-xl max-w-md w-full p-6 text-center border border-border-default shadow-premium">
              <div className="w-14 h-14 rounded-full bg-success-bg text-success flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-text-primary">Report Registered Successfully!</h3>
              <p className="text-xs text-text-secondary mt-1">
                Your report has been broadcast to the SVCE Tirupati campus database. Matching algorithms are evaluating potential records.
              </p>

              <div className="my-4 p-3 bg-surface-subtle rounded-md text-xs font-mono text-text-secondary border border-border-default">
                Tracking ID: <strong className="text-text-primary">{submittedReportId}</strong>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 mt-4">
                <Link
                  to={`/items/${submittedReportId}`}
                  className="flex-1 py-2 px-3 text-xs font-semibold bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors"
                >
                  View Report Details
                </Link>
                <Link
                  to="/home"
                  className="flex-1 py-2 px-3 text-xs font-semibold bg-surface-subtle text-text-primary border border-border-default rounded-md hover:bg-slate-100 transition-colors"
                >
                  Back to Campus Feed
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
