import { useState } from 'react';
import type { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  LayoutDashboard,
  FileText,
  Users,
  ShieldCheck,
  BarChart3,
  Building,
  Settings,
  ArrowLeft,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { FindlyLogo } from '../landing/FindlyLogo';

export function AdminLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'Manage Reports', path: '/admin/reports', icon: FileText },
    { label: 'User Directory', path: '/admin/users', icon: Users },
    { label: 'Recovery Cases', path: '/admin/recovery', icon: ShieldCheck },
    { label: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
    { label: 'Campus Management', path: '/admin/campus', icon: Building },
    { label: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  const handleSignOut = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-findlyBg text-findlyTextPrimary flex flex-col md:flex-row">
      {/* Mobile Admin Header */}
      <div className="md:hidden bg-white border-b border-findlyBorder px-4 py-3 flex items-center justify-between shadow-card">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-md text-findlyTextSecondary hover:text-findlyTextPrimary hover:bg-slate-100"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-2">
            <FindlyLogo className="w-6 h-6" />
            <span className="text-sm font-bold text-findlyTextPrimary">FINDLY Admin</span>
          </div>
        </div>
        <Link to="/home" className="text-xs text-findlyBlue font-semibold flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Student View
        </Link>
      </div>

      {/* Desktop Admin Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-screen w-64 bg-white border-r border-findlyBorder shadow-card flex flex-col justify-between transition-transform duration-200 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Admin Branding */}
          <div className="p-5 border-b border-findlyBorder flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <FindlyLogo className="w-8 h-8" />
              <div>
                <span className="text-sm font-bold text-findlyTextPrimary block leading-none">FINDLY Admin</span>
                <span className="text-[10px] text-findlyTextSecondary font-medium">SVCE Operations</span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-findlyBlue border border-sky-100">
              DESK
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    active
                      ? 'bg-sky-50 text-findlyBlue font-bold border-l-4 border-findlyBlue'
                      : 'text-findlyTextSecondary hover:text-findlyBlue hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-findlyBlue' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions: Return to Student & Logout */}
        <div className="p-4 border-t border-findlyBorder space-y-2">
          <Link
            to="/home"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-findlyTextSecondary hover:text-findlyBlue hover:bg-sky-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-findlyBlue" />
            <span>Switch to Student Feed</span>
          </Link>

          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-findlyDanger hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-x-hidden min-h-screen p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
