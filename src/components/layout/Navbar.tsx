import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  FileText,
  Search,
  Bell,
  MessageSquare,
  ShieldCheck,
  Compass,
  PlusCircle,
  Home,
  User
} from 'lucide-react';
import { FindlyLogo } from '../landing/FindlyLogo';
import { notificationsService } from '../../services/notificationsService';

export function Navbar() {
  const location = useLocation();
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  // Monitor scroll for shadow effect on landing page
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Monitor unread notifications
  useEffect(() => {
    if (user?.id) {
      notificationsService.getNotifications(user.id).then((notes) => {
        const unread = notes.filter((n) => !n.is_read).length;
        setUnreadNotifications(unread);
      });
    }
  }, [user?.id, location.pathname]);

  // Auth pages have their own integrated split-screen layout
  if (
    location.pathname === '/login' ||
    location.pathname === '/signup' ||
    location.pathname === '/forgot-password'
  ) {
    return null;
  }

  // Admin routes use AdminLayout with dedicated sidebar
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  const isLanding = location.pathname === '/';

  const handleSignOut = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  // Helper for landing scroll navigation
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (location.pathname !== '/') {
      return;
    }
    e.preventDefault();
    setIsOpen(false);
    const element = document.querySelector(href);
    if (element) {
      const topOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - topOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  // Navigation Links for landing page vs app pages
  const landingNavLinks = [
    { label: 'Home', href: '#hero' },
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#process' },
    { label: 'About', href: '#solution' },
    { label: 'Contact', href: '#contact' },
  ];

  const appNavLinks = [
    { label: 'Feed', path: '/home', icon: Home },
    { label: 'Campus Map', path: '/campus', icon: Compass },
    { label: 'Search', path: '/search', icon: Search },
    { label: 'Report Item', path: '/report', icon: PlusCircle, highlight: true },
    { label: 'My Reports', path: '/my-reports', icon: FileText },
    { label: 'Messages', path: '/messages', icon: MessageSquare },
    { label: 'Recovery', path: '/recovery', icon: ShieldCheck },
  ];

  const isRouteActive = (path: string) => {
    if (path === '/home' && (location.pathname === '/home' || location.pathname === '/dashboard')) return true;
    return location.pathname === path;
  };

  const isAdmin = role === 'admin' || role === 'super_admin';

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 h-20 transition-all duration-300 ${
        isLanding && !scrolled
          ? 'bg-transparent'
          : 'bg-white/90 backdrop-blur-md shadow-sm border-b border-findlyBorder'
      }`}
    >
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 h-full flex items-center justify-between">
        {/* Left Section: Logo + Brand + Tagline */}
        <Link
          to={isLanding ? '/' : '/home'}
          onClick={(e) => isLanding && handleNavClick(e, '#hero')}
          className="flex items-center gap-3 group select-none flex-shrink-0"
        >
          <FindlyLogo className="w-10 h-10 transition-transform duration-300 group-hover:scale-105" />
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-findlyTextPrimary flex items-center">
                FINDLY
              </span>
              <span className="hidden sm:inline-block text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-sky-50 text-findlyBlue uppercase tracking-wider border border-sky-100">
                SVCE
              </span>
            </div>
            <span className="text-[10px] leading-tight text-findlyTextSecondary font-medium hidden xs:block">
              Connecting Lost Items With Their Owners
            </span>
          </div>
        </Link>

        {/* Center Section: Navigation Links */}
        <nav className="hidden xl:flex items-center gap-6">
          {isLanding
            ? landingNavLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className="text-sm font-semibold text-findlyTextSecondary hover:text-findlyBlue transition-colors duration-200"
                >
                  {link.label}
                </a>
              ))
            : appNavLinks.map((link) => {
                const active = isRouteActive(link.path);
                return (
                  <Link
                    key={link.label}
                    to={link.path}
                    className={`flex items-center gap-1.5 text-sm font-semibold transition-colors duration-200 py-1.5 px-2.5 rounded-lg ${
                      active
                        ? 'text-findlyBlue font-bold bg-sky-50/80'
                        : link.highlight
                        ? 'text-findlyBlue bg-sky-50 hover:bg-sky-100'
                        : 'text-findlyTextSecondary hover:text-findlyBlue hover:bg-slate-50'
                    }`}
                  >
                    <link.icon size={15} />
                    {link.label}
                  </Link>
                );
              })}
        </nav>

        {/* Right Section: Auth & User Actions */}
        <div className="hidden lg:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2">
              {/* If on landing, provide quick link to App */}
              {isLanding && (
                <Link
                  to="/home"
                  className="px-4 py-2 text-xs font-semibold text-findlyBlue bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-xl transition-all mr-1"
                >
                  Go to Feed
                </Link>
              )}

              {/* Notifications Button */}
              <Link
                to="/notifications"
                className={`relative p-2.5 rounded-xl text-findlyTextSecondary hover:text-findlyBlue hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200 ${
                  location.pathname === '/notifications' ? 'text-findlyBlue bg-sky-50 border-sky-100' : ''
                }`}
                aria-label="Notifications"
              >
                <Bell size={18} />
                {unreadNotifications > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-findlyBlue ring-2 ring-white" />
                )}
              </Link>

              {/* Admin Portal Shortcut if Admin */}
              {isAdmin && (
                <Link
                  to="/admin"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-sky-800 bg-sky-50 border border-sky-200 hover:bg-sky-100 transition-colors"
                >
                  <LayoutDashboard size={14} />
                  Admin
                </Link>
              )}

              {/* User Dropdown Pill Button */}
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-slate-100 transition-colors duration-200 border border-slate-200 cursor-pointer"
                  aria-label="User Menu"
                >
                  <div className="w-8 h-8 rounded-full bg-findlyBlue/20 text-findlyBlue flex items-center justify-center font-bold text-sm">
                    {user.email?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-findlyTextPrimary max-w-[120px] truncate">
                    {user.user_metadata?.full_name || user.email?.split('@')[0]}
                  </span>
                </button>

                {dropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-premium border border-findlyBorder py-2 z-20 animate-scale-in">
                      <div className="px-4 py-2.5 border-b border-findlyBorder">
                        <p className="text-sm font-bold text-findlyTextPrimary truncate">
                          {user.user_metadata?.full_name || 'SVCE Student'}
                        </p>
                        <p className="text-xs text-findlyTextSecondary truncate mt-0.5">
                          {user.email}
                        </p>
                      </div>

                      <div className="py-1">
                        <Link
                          to="/home"
                          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-findlyTextSecondary hover:bg-slate-50 hover:text-findlyBlue transition-colors duration-200"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <Home size={15} />
                          Campus Feed
                        </Link>
                        <Link
                          to="/profile"
                          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-findlyTextSecondary hover:bg-slate-50 hover:text-findlyBlue transition-colors duration-200"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <User size={15} />
                          Profile & Account
                        </Link>
                        <Link
                          to="/my-reports"
                          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-findlyTextSecondary hover:bg-slate-50 hover:text-findlyBlue transition-colors duration-200"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <FileText size={15} />
                          My Reports
                        </Link>
                        <Link
                          to="/messages"
                          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-findlyTextSecondary hover:bg-slate-50 hover:text-findlyBlue transition-colors duration-200"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <MessageSquare size={15} />
                          Direct Messages
                        </Link>
                        <Link
                          to="/recovery"
                          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-findlyTextSecondary hover:bg-slate-50 hover:text-findlyBlue transition-colors duration-200"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <ShieldCheck size={15} />
                          Recovery Desk
                        </Link>
                        {isAdmin && (
                          <Link
                            to="/admin"
                            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-findlyBlue hover:bg-sky-50 transition-colors duration-200"
                            onClick={() => setDropdownOpen(false)}
                          >
                            <LayoutDashboard size={15} />
                            Admin Dashboard
                          </Link>
                        )}
                      </div>

                      <div className="border-t border-findlyBorder my-1" />
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          handleSignOut();
                        }}
                        className="flex w-full items-center gap-2 px-4 py-2 text-xs font-semibold text-findlyDanger hover:bg-red-50 transition-colors duration-200 text-left"
                      >
                        <LogOut size={15} />
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="px-5 py-2.5 text-sm font-semibold text-findlyTextSecondary hover:text-findlyBlue transition-colors duration-200 border border-slate-200 hover:border-findlyBlue/30 rounded-xl"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="px-5 py-2.5 text-sm font-semibold text-white bg-findlyBlue hover:bg-findlyBlue/90 rounded-xl shadow-sm transition-all duration-200 hover:-translate-y-[1px]"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="xl:hidden text-findlyTextPrimary p-2 hover:bg-slate-100 rounded-lg transition-colors"
          aria-label="Toggle Menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="xl:hidden fixed top-20 left-0 w-full bg-white/95 backdrop-blur-xl border-b border-findlyBorder shadow-xl px-6 py-6 transition-all duration-300 max-h-[85vh] overflow-y-auto">
          <div className="flex flex-col gap-2">
            {isLanding
              ? landingNavLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.href)}
                    className="text-base font-semibold text-findlyTextSecondary hover:text-findlyBlue py-2.5 border-b border-slate-100"
                  >
                    {link.label}
                  </a>
                ))
              : appNavLinks.map((link) => (
                  <Link
                    key={link.label}
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 text-base font-semibold py-2.5 border-b border-slate-100 ${
                      isRouteActive(link.path)
                        ? 'text-findlyBlue font-bold'
                        : 'text-findlyTextSecondary hover:text-findlyBlue'
                    }`}
                  >
                    <link.icon size={18} />
                    {link.label}
                  </Link>
                ))}

            {user ? (
              <div className="flex flex-col gap-2 pt-3">
                <Link
                  to="/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 text-base font-semibold text-findlyTextSecondary py-2"
                >
                  <User size={18} />
                  Profile
                </Link>
                <Link
                  to="/notifications"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between text-base font-semibold text-findlyTextSecondary py-2"
                >
                  <span className="flex items-center gap-3">
                    <Bell size={18} />
                    Notifications
                  </span>
                  {unreadNotifications > 0 && (
                    <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-findlyBlue text-white">
                      {unreadNotifications}
                    </span>
                  )}
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 text-base font-bold text-findlyBlue py-2"
                  >
                    <LayoutDashboard size={18} />
                    Admin Operations Desk
                  </Link>
                )}
                <button
                  onClick={() => {
                    setIsOpen(false);
                    handleSignOut();
                  }}
                  className="flex items-center gap-3 text-base font-semibold text-findlyDanger py-2 text-left"
                >
                  <LogOut size={18} />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3 pt-4">
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center py-3 text-sm font-semibold text-findlyTextSecondary border border-slate-200 rounded-xl"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center py-3 text-sm font-semibold text-white bg-findlyBlue rounded-xl shadow-sm"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
