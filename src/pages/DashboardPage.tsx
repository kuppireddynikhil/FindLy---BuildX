import { Link } from 'react-router-dom';
import { ArrowRight, Bell, FileText, MapPin, Plus, Search, ShieldCheck } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import './DashboardPage.css';

const shortcuts = [
  { to: '/report/lost', label: 'Report lost item', icon: <Plus size={18} /> },
  { to: '/report/found', label: 'Report found item', icon: <ShieldCheck size={18} /> },
  { to: '/search', label: 'Search campus items', icon: <Search size={18} /> },
  { to: '/my-reports', label: 'View my reports', icon: <FileText size={18} /> },
];

export function DashboardPage() {
  const { profile, user } = useAuth();
  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'there';

  return (
    <div className="dashboard-page page-container">
      <div className="container">
        <section className="dashboard-page__welcome animate-fade-in-up">
          <div>
            <p className="dashboard-page__eyebrow">Campus feed</p>
            <h1 className="section-title">Hello, {displayName}</h1>
            <p className="section-subtitle">Keep an eye on the items moving through campus today.</p>
          </div>
          <Link to="/notifications" className="dashboard-page__notification" aria-label="View notifications">
            <Bell size={20} />
            <span>Notifications</span>
          </Link>
        </section>

        <section className="dashboard-page__hero glass-card">
          <div>
            <p className="dashboard-page__eyebrow">Help the campus community</p>
            <h2>Lost something? Found something?</h2>
            <p>Report it with a few details so the right person can find it faster.</p>
          </div>
          <div className="dashboard-page__hero-actions">
            <Link to="/report/lost"><Button variant="primary">Report Lost</Button></Link>
            <Link to="/report/found"><Button variant="secondary">Report Found</Button></Link>
          </div>
        </section>

        <section className="dashboard-page__grid" aria-label="Campus shortcuts">
          {shortcuts.map((shortcut) => (
            <Link key={shortcut.to} to={shortcut.to} className="dashboard-page__shortcut glass-card">
              <span className="dashboard-page__shortcut-icon">{shortcut.icon}</span>
              <span>{shortcut.label}</span>
              <ArrowRight size={16} />
            </Link>
          ))}
        </section>

        <section className="dashboard-page__columns">
          <div className="glass-card dashboard-page__activity">
            <div className="dashboard-page__section-heading">
              <div>
                <p className="dashboard-page__eyebrow">Live campus activity</p>
                <h2>Recent reports</h2>
              </div>
              <Link to="/search" aria-label="Browse recent reports"><ArrowRight size={18} /></Link>
            </div>
            <div className="dashboard-page__empty">
              <MapPin size={24} />
              <p>Recent campus reports will appear here.</p>
              <Link to="/search">Browse searchable items</Link>
            </div>
          </div>

          <aside className="glass-card dashboard-page__support">
            <p className="dashboard-page__eyebrow">Safety first</p>
            <h2>Protect your details</h2>
            <p>Keep passwords, access codes, and sensitive identifiers out of public report descriptions.</p>
            <Link to="/report/found">Report responsibly <ArrowRight size={16} /></Link>
          </aside>
        </section>
      </div>
    </div>
  );
}
