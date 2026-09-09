import { Link, useLocation } from 'react-router-dom';
import { Mail, Phone, Clock } from 'lucide-react';
import { FindlyLogo } from './FindlyLogo';

export function Footer() {
  const location = useLocation();

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (location.pathname !== '/') {
      return;
    }
    e.preventDefault();
    const element = document.querySelector(href);
    if (element) {
      const topOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - topOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <footer id="contact" className="bg-white border-t border-findlyBorder pt-16 pb-8 select-none">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12">
        {/* Footer Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 mb-12">
          {/* Column 1: Brand Info (4/12 cols) */}
          <div className="lg:col-span-4 flex flex-col items-start text-left">
            <Link to="/" onClick={(e) => handleNavClick(e, '#hero')} className="flex items-center gap-3 mb-4 group">
              <FindlyLogo className="w-10 h-10 transition-transform duration-300 group-hover:scale-105" />
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-findlyTextPrimary">
                  FINDLY
                </span>
                <span className="text-[10px] leading-none text-findlyTextSecondary font-medium">
                  Connecting Lost Items With Their Owners
                </span>
              </div>
            </Link>
            
            <p className="text-sm font-semibold text-findlyTextSecondary leading-relaxed mb-6 max-w-[320px]">
              A smart lost & found platform built for students and campuses to reconnect what matters.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-findlyTextSecondary hover:text-findlyBlue hover:border-findlyBlue/30 hover:bg-sky-50/50 transition-all duration-200"
                aria-label="Facebook"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" />
                </svg>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-findlyTextSecondary hover:text-findlyBlue hover:border-findlyBlue/30 hover:bg-sky-50/50 transition-all duration-200"
                aria-label="Instagram"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051C.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-findlyTextSecondary hover:text-findlyBlue hover:border-findlyBlue/30 hover:bg-sky-50/50 transition-all duration-200"
                aria-label="Twitter"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-findlyTextSecondary hover:text-findlyBlue hover:border-findlyBlue/30 hover:bg-sky-50/50 transition-all duration-200"
                aria-label="LinkedIn"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links (2/12 cols) */}
          <div className="lg:col-span-2 text-left">
            <h4 className="text-sm font-bold text-findlyTextPrimary tracking-wider uppercase mb-5">
              Quick Links
            </h4>
            <ul className="flex flex-col gap-3">
              <li>
                <a href="#hero" onClick={(e) => handleNavClick(e, '#hero')} className="text-sm font-bold text-findlyTextSecondary hover:text-findlyBlue transition-colors duration-200">
                  Home
                </a>
              </li>
              <li>
                <a href="#features" onClick={(e) => handleNavClick(e, '#features')} className="text-sm font-bold text-findlyTextSecondary hover:text-findlyBlue transition-colors duration-200">
                  Features
                </a>
              </li>
              <li>
                <a href="#process" onClick={(e) => handleNavClick(e, '#process')} className="text-sm font-bold text-findlyTextSecondary hover:text-findlyBlue transition-colors duration-200">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#solution" onClick={(e) => handleNavClick(e, '#solution')} className="text-sm font-bold text-findlyTextSecondary hover:text-findlyBlue transition-colors duration-200">
                  About Us
                </a>
              </li>
              <li>
                <a href="#contact" onClick={(e) => handleNavClick(e, '#contact')} className="text-sm font-bold text-findlyTextSecondary hover:text-findlyBlue transition-colors duration-200">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: For Students (2/12 cols) */}
          <div className="lg:col-span-2 text-left">
            <h4 className="text-sm font-bold text-findlyTextPrimary tracking-wider uppercase mb-5">
              For Students
            </h4>
            <ul className="flex flex-col gap-3">
              <li>
                <Link to="/report/lost" className="text-sm font-bold text-findlyTextSecondary hover:text-findlyBlue transition-colors duration-200">
                  Report Lost Item
                </Link>
              </li>
              <li>
                <Link to="/report/found" className="text-sm font-bold text-findlyTextSecondary hover:text-findlyBlue transition-colors duration-200">
                  Report Found Item
                </Link>
              </li>
              <li>
                <Link to="/search" className="text-sm font-bold text-findlyTextSecondary hover:text-findlyBlue transition-colors duration-200">
                  Search Items
                </Link>
              </li>
              <li>
                <a href="#features" className="text-sm font-bold text-findlyTextSecondary hover:text-findlyBlue transition-colors duration-200">
                  Safety Tips
                </a>
              </li>
              <li>
                <a href="#process" className="text-sm font-bold text-findlyTextSecondary hover:text-findlyBlue transition-colors duration-200">
                  Help Center
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Support (2/12 cols) */}
          <div className="lg:col-span-2 text-left">
            <h4 className="text-sm font-bold text-findlyTextPrimary tracking-wider uppercase mb-5">
              Support
            </h4>
            <ul className="flex flex-col gap-3">
              <li>
                <a href="#process" className="text-sm font-bold text-findlyTextSecondary hover:text-findlyBlue transition-colors duration-200">
                  FAQs
                </a>
              </li>
              <li>
                <a href="#contact" className="text-sm font-bold text-findlyTextSecondary hover:text-findlyBlue transition-colors duration-200">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#features" className="text-sm font-bold text-findlyTextSecondary hover:text-findlyBlue transition-colors duration-200">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#features" className="text-sm font-bold text-findlyTextSecondary hover:text-findlyBlue transition-colors duration-200">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>

          {/* Column 5: Contact Us (2/12 cols) */}
          <div className="lg:col-span-2 text-left">
            <h4 className="text-sm font-bold text-findlyTextPrimary tracking-wider uppercase mb-5">
              Contact Us
            </h4>
            <ul className="flex flex-col gap-3.5">
              <li className="flex items-start gap-2.5">
                <Mail size={16} className="text-findlyBlue mt-0.5 flex-shrink-0" />
                <a href="mailto:hello@findly.com" className="text-sm font-bold text-findlyTextSecondary hover:text-findlyBlue transition-colors duration-200 break-all leading-tight">
                  hello@findly.com
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Phone size={16} className="text-findlyBlue mt-0.5 flex-shrink-0" />
                <a href="tel:+919876543210" className="text-sm font-bold text-findlyTextSecondary hover:text-findlyBlue transition-colors duration-200 leading-tight">
                  +91 98765 43210
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock size={16} className="text-findlyBlue mt-0.5 flex-shrink-0" />
                <span className="text-sm font-bold text-findlyTextSecondary leading-tight">
                  Available 9AM - 6PM
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider Line */}
        <div className="border-t border-findlyBorder pt-8 mt-8 flex flex-col sm:flex-row items-center justify-center">
          <p className="text-xs font-semibold text-slate-400 text-center">
            &copy; {new Date().getFullYear()} FINDLY. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
