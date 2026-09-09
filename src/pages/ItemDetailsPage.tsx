import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { reportsService } from '../services/reportsService';
import type { ReportItem } from '../services/reportsService';
import { messagingService } from '../services/messagingService';
import { matchingService } from '../services/matchingService';
import type { MatchRecord } from '../services/matchingService';
import { StatusBadge, LoadingSkeleton } from '../components/ui/ArcticPearlComponents';
import { useToast } from '../components/ui/Toast';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Share2,
  AlertCircle
} from 'lucide-react';

export function ItemDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [item, setItem] = useState<ReportItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [similarReports, setSimilarReports] = useState<ReportItem[]>([]);
  const [matches, setMatches] = useState<MatchRecord[]>([]);
  const [contacting, setContacting] = useState(false);

  useEffect(() => {
    async function loadItem() {
      if (!id) return;
      setLoading(true);
      const data = await reportsService.getReportById(id);
      setItem(data);

      if (data) {
        // Fetch similar reports in same category
        const similar = await reportsService.getReports({
          category: data.category,
          status: 'ACTIVE',
        });
        setSimilarReports(similar.filter((r) => r.id !== id).slice(0, 3));

        // Fetch matches if user is the reporter or admin
        if (user && (user.id === data.reporter_id || user.user_metadata?.role === 'admin')) {
          const matchData = await matchingService.getMatchesForReport(id);
          setMatches(matchData);
        }
      }
      setLoading(false);
    }
    loadItem();
  }, [id, user]);

  const handleContact = async () => {
    if (!user) {
      addToast('Please log in to initiate secure messaging.', 'error');
      navigate('/login');
      return;
    }
    if (!item) return;

    if (user.id === item.reporter_id) {
      addToast('You are the reporter of this item.', 'info');
      return;
    }

    setContacting(true);
    try {
      const conv = await messagingService.createOrGetConversation(item.id, user.id, item.reporter_id);
      navigate(`/messages?conversation=${conv.id}`);
    } catch (err) {
      console.error(err);
      addToast('Failed to initiate conversation. Please try again.', 'error');
    } finally {
      setContacting(false);
    }
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    addToast('Report link copied to clipboard!', 'success');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F8FC] py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <LoadingSkeleton rows={4} />
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-[#F5F8FC] py-16 text-center">
        <div className="max-w-md mx-auto p-8 bg-white rounded-xl border border-border-default shadow-card">
          <AlertCircle className="w-10 h-10 text-error mx-auto mb-3" />
          <h2 className="text-base font-bold text-text-primary">Item Not Found</h2>
          <p className="text-xs text-text-secondary mt-1">
            This campus report may have been resolved, archived, or removed by its reporter.
          </p>
          <Link
            to="/home"
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-primary-500 text-white rounded-md text-xs font-semibold hover:bg-primary-600 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Return to Campus Feed
          </Link>
        </div>
      </div>
    );
  }

  const images = item.images && item.images.length > 0 ? item.images : [item.image_url].filter(Boolean) as string[];
  const isFound = item.type === 'FOUND';
  const isOwner = user?.id === item.reporter_id;

  return (
    <div className="min-h-screen bg-[#F5F8FC] py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation & Actions Top Bar */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="text-xs font-semibold text-text-secondary hover:text-primary-600 flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={copyShareLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-text-secondary hover:text-text-primary bg-white border border-border-default rounded-md shadow-card transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" /> Share
            </button>
            <StatusBadge status={item.type} size="md" />
          </div>
        </div>

        {/* Bento Grid: Left Gallery + Right Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white rounded-xl p-6 sm:p-8 border border-border-default shadow-card">
          {/* Gallery Section */}
          <div className="space-y-4">
            <div className="h-72 sm:h-96 rounded-lg bg-slate-50 border border-border-default overflow-hidden relative flex items-center justify-center">
              {images.length > 0 ? (
                <img
                  src={images[activeImageIndex]}
                  alt={item.title}
                  className="w-full h-full object-contain p-2"
                />
              ) : (
                <div className="text-xs font-medium text-text-disabled">No Photo Provided</div>
              )}
              <div className="absolute top-3 left-3">
                <StatusBadge status={item.status} size="sm" />
              </div>
            </div>

            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImageIndex(i)}
                    className={`w-16 h-16 rounded-md overflow-hidden border-2 flex-shrink-0 transition-all ${
                      activeImageIndex === i ? 'border-primary-500 ring-2 ring-primary-100' : 'border-border-default'
                    }`}
                  >
                    <img src={img} alt="Thumb" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Safety & Verification Notice */}
            <div className="p-3.5 bg-surface-subtle rounded-lg border border-border-default text-xs text-text-secondary flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-text-primary block mb-0.5">SVCE Privacy & Security Guard</span>
                Contact information is mediated exclusively through Findly controlled messaging. Private personal phone numbers and emails are never exposed.
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-xs px-2.5 py-1 rounded-full bg-surface-subtle font-semibold text-text-secondary border border-border-default">
                  {item.category}
                </span>
                {item.brand && (
                  <span className="text-xs px-2.5 py-1 rounded-full bg-surface-subtle font-semibold text-text-secondary border border-border-default">
                    Brand: {item.brand}
                  </span>
                )}
                {item.color && (
                  <span className="text-xs px-2.5 py-1 rounded-full bg-surface-subtle font-semibold text-text-secondary border border-border-default">
                    Color: {item.color}
                  </span>
                )}
              </div>

              <h1 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight">
                {item.title}
              </h1>

              <div className="space-y-2 py-3 border-y border-border-default text-xs text-text-secondary">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary-500" />
                  <span className="font-semibold text-text-primary">Campus Facility:</span>
                  <span>{item.building || 'SVCE Campus'} {item.floor ? `(${item.floor})` : ''}</span>
                </div>
                {item.location_description && (
                  <div className="flex items-center gap-2 pl-6">
                    <span className="text-text-disabled">Spot:</span>
                    <span>{item.location_description}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary-500" />
                  <span className="font-semibold text-text-primary">Reported Date:</span>
                  <span>{new Date(item.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-1.5">Description</h3>
                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">
                  {item.description}
                </p>
              </div>

              {item.identifying_features && isOwner && (
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs">
                  <span className="font-bold text-amber-800 block mb-0.5">Private Verification Mark (You):</span>
                  <span className="text-amber-700">{item.identifying_features}</span>
                </div>
              )}
            </div>

            {/* Action Bar */}
            <div className="pt-4 border-t border-border-default space-y-3">
              {!isOwner ? (
                <button
                  onClick={handleContact}
                  disabled={contacting}
                  className="w-full py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold text-sm rounded-md shadow-sm transition-colors flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  {contacting
                    ? 'Connecting...'
                    : isFound
                    ? 'Contact Finder (Secure Chat)'
                    : 'Contact Reporter (Secure Chat)'}
                </button>
              ) : (
                <div className="p-3 bg-surface-subtle rounded-md border border-border-default text-xs text-text-secondary text-center">
                  You are the author of this report. Manage status from{' '}
                  <Link to="/my-reports" className="text-primary-600 font-semibold underline">
                    My Reports
                  </Link>.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Potential Match Information (if authorized) */}
        {matches.length > 0 && (
          <div className="mt-8 bg-white rounded-xl p-6 border border-primary-200 shadow-card">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-primary-600" />
              <h3 className="text-base font-bold text-text-primary">
                Deterministic Potential Matches ({matches.length})
              </h3>
            </div>
            <div className="space-y-3">
              {matches.map((m) => (
                <div key={m.id} className="p-3.5 bg-primary-50/60 rounded-lg border border-primary-100 flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-primary-700">
                        {m.score}% Match Confidence
                      </span>
                      <StatusBadge status={m.status} size="sm" />
                    </div>
                    <p className="text-xs text-text-secondary mt-1">
                      {m.match_reasons?.explanation || 'Evaluated via 30/20/20/15/15 deterministic scoring.'}
                    </p>
                  </div>
                  <Link
                    to={`/recovery`}
                    className="px-3 py-1.5 bg-primary-500 text-white rounded text-xs font-semibold hover:bg-primary-600 transition-colors whitespace-nowrap"
                  >
                    View Recovery Case
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Similar Reports */}
        {similarReports.length > 0 && (
          <div className="mt-8">
            <h3 className="text-sm font-bold text-text-primary mb-3">Similar Campus Reports</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {similarReports.map((sim) => (
                <Link
                  key={sim.id}
                  to={`/items/${sim.id}`}
                  className="bg-white rounded-lg p-3.5 border border-border-default shadow-card hover:shadow-soft hover:border-primary-300 transition-all block"
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-bold text-text-primary truncate">{sim.title}</span>
                    <StatusBadge status={sim.type} size="sm" />
                  </div>
                  <p className="text-[11px] text-text-secondary line-clamp-2">{sim.description}</p>
                  <span className="text-[10px] text-primary-600 mt-2 block font-medium">
                    {sim.building || 'SVCE Campus'}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
