import { useLocation } from 'react-router-dom';
import { Footer as LandingFooter } from '../landing/Footer';

export function Footer() {
  const location = useLocation();

  if (
    location.pathname === '/login' ||
    location.pathname === '/signup' ||
    location.pathname === '/forgot-password' ||
    location.pathname.startsWith('/admin')
  ) {
    return null;
  }

  return <LandingFooter />;
}
