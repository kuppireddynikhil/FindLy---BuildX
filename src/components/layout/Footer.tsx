<<<<<<< HEAD
import { useLocation } from 'react-router-dom';
import { Footer as LandingFooter } from '../landing/Footer';
=======
import { Link, useLocation } from 'react-router-dom';
import { Heart, Globe, Mail } from 'lucide-react';
import { Footer as LandingFooter } from '../landing/Footer';
import './Footer.css';
>>>>>>> origin/main

export function Footer() {
  const location = useLocation();

<<<<<<< HEAD
  if (
    location.pathname === '/login' ||
    location.pathname === '/signup' ||
    location.pathname === '/forgot-password' ||
    location.pathname.startsWith('/admin')
  ) {
    return null;
  }

  return <LandingFooter />;
=======
  if (location.pathname === '/login' || location.pathname === '/signup' || location.pathname === '/forgot-password') {
    return null;
  }

  if (location.pathname === '/') {
    return <LandingFooter />;
  }
  return (
    <footer className="footer">
      <div className="footer__inner container">
        <div className="footer__top">
          <div className="footer__brand">
            <Link to="/" className="footer__logo">
              <span className="footer__logo-icon">📍</span>
              <span className="footer__logo-text gradient-text">Findly</span>
            </Link>
            <p className="footer__tagline">
              Helping campus communities reunite with their lost belongings.
            </p>
          </div>

          <div className="footer__links-group">
            <h4 className="footer__links-title">Platform</h4>
            <Link to="/search" className="footer__link">Search Items</Link>
            <Link to="/report/lost" className="footer__link">Report Lost</Link>
            <Link to="/report/found" className="footer__link">Report Found</Link>
          </div>

          <div className="footer__links-group">
            <h4 className="footer__links-title">Account</h4>
            <Link to="/login" className="footer__link">Log In</Link>
            <Link to="/signup" className="footer__link">Sign Up</Link>
            <Link to="/my-reports" className="footer__link">My Reports</Link>
          </div>
        </div>

        <div className="footer__bottom">
          <p className="footer__copyright">
            © {new Date().getFullYear()} Findly. Made with <Heart size={14} className="footer__heart" /> for campus communities.
          </p>
          <div className="footer__social">
            <a href="#" className="footer__social-link" aria-label="Website">
              <Globe size={18} />
            </a>
            <a href="#" className="footer__social-link" aria-label="Email">
              <Mail size={18} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
>>>>>>> origin/main
}
