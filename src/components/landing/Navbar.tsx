import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Menu, X, LogOut, LayoutDashboard, FileText, Search } from 'lucide-react';
import { FindlyLogo } from './FindlyLogo';

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Monitor scroll for shadow effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const navLinks = [
    { label: 'Home', href: '#hero' },
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#process' },
    { label: 'About', href: '#solution' },
    { label: 'Contact', href: '#contact' },
  ];

  // Helper for scroll navigation
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (location.pathname !== '/') {
      // If we are not on homepage, let standard router link handle it
      return;
    }
    e.preventDefault();
    setIsOpen(false);
    const element = document.querySelector(href);
    if (element) {
      const topOffset = 80; // height of sticky navbar
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - topOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 h-20 transition-all duration-300 ${
        scrolled
          ? 'bg-white/80 backdrop-blur-md shadow-sm border-b border-findlyBorder'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 h-full flex items-center justify-between">
        {/* Left Section: Logo + Brand + Tagline */}
        <Link
          to="/"
          onClick={(e) => handleNavClick(e, '#hero')}
          className="flex items-center gap-3 group select-none"
        >
          <FindlyLogo className="w-10 h-10 transition-transform duration-300 group-hover:scale-105" />
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-findlyTextPrimary flex items-center">
              FINDLY
            </span>
            <span className="text-[10px] leading-tight text-findlyTextSecondary font-medium hidden xs:block">
              Connecting Lost Items With Their Owners
            </span>
          </div>
        </Link>

        {/* Center Section: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={location.pathname === '/' ? link.href : `/${link.href}`}
              onClick={(e) => handleNavClick(e, link.href)}
              className="text-sm font-semibold text-findlyTextSecondary hover:text-findlyBlue transition-colors duration-200"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right Section: Auth Action Buttons */}
        <div className="hidden lg:flex items-center gap-4">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-slate-100 transition-colors duration-200 border border-slate-200"
              >
                <div className="w-8 h-8 rounded-full bg-findlyBlue/20 text-findlyBlue flex items-center justify-center font-bold text-sm">
                  {user.email?.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-findlyTextPrimary">
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
                    <div className="px-4 py-2 border-b border-findlyBorder">
                      <p className="text-sm font-bold text-findlyTextPrimary truncate">
                        {user.user_metadata?.full_name || 'User'}
                      </p>
                      <p className="text-xs text-findlyTextSecondary truncate">
                        {user.email}
                      </p>
                    </div>
                    <Link
                      to="/my-reports"
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-findlyTextSecondary hover:bg-slate-50 hover:text-findlyBlue transition-colors duration-200"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <FileText size={16} />
                      My Reports
                    </Link>
                    <Link
                      to="/search"
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-findlyTextSecondary hover:bg-slate-50 hover:text-findlyBlue transition-colors duration-200"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <Search size={16} />
                      Browse Items
                    </Link>
                    <Link
                      to="/admin"
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-findlyTextSecondary hover:bg-slate-50 hover:text-findlyBlue transition-colors duration-200"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <LayoutDashboard size={16} />
                      Admin Dashboard
                    </Link>
                    <div className="border-t border-findlyBorder my-1" />
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        handleSignOut();
                      }}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-findlyDanger hover:bg-red-50 transition-colors duration-200"
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                </>
              )}
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
          className="lg:hidden text-findlyTextPrimary p-2 hover:bg-slate-100 rounded-lg transition-colors"
          aria-label="Toggle Menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 top-20 bg-white/95 z-40 lg:hidden animate-fade-in border-t border-findlyBorder flex flex-col justify-between">
          <nav className="flex flex-col p-6 gap-6">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={location.pathname === '/' ? link.href : `/${link.href}`}
                onClick={(e) => handleNavClick(e, link.href)}
                className="text-lg font-bold text-findlyTextPrimary hover:text-findlyBlue py-2 border-b border-slate-100"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="p-6 border-t border-findlyBorder flex flex-col gap-3">
            {user ? (
              <>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-findlyBlue/20 text-findlyBlue flex items-center justify-center font-bold">
                    {user.email?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-findlyTextPrimary">
                      {user.user_metadata?.full_name || 'User'}
                    </p>
                    <p className="text-xs text-findlyTextSecondary truncate max-w-[250px]">
                      {user.email}
                    </p>
                  </div>
                </div>
                <Link
                  to="/my-reports"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center py-3 font-semibold text-findlyTextSecondary hover:text-findlyBlue border border-slate-200 rounded-xl"
                >
                  My Reports
                </Link>
                <Link
                  to="/admin"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center py-3 font-semibold text-findlyTextSecondary hover:text-findlyBlue border border-slate-200 rounded-xl"
                >
                  Admin Dashboard
                </Link>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    handleSignOut();
                  }}
                  className="w-full py-3 font-semibold text-white bg-findlyDanger rounded-xl mt-2"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center py-3 font-semibold text-findlyTextSecondary border border-slate-200 rounded-xl"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center py-3 font-semibold text-white bg-findlyBlue rounded-xl"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
