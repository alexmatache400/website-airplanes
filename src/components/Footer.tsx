import React from 'react';
import { Link } from 'react-router-dom';
import { COMPLIANCE } from '../config/compliance';

const Footer: React.FC = () => {
  const handleCookieSettings = () => {
    // Dispatch custom event to trigger CookieBanner preferences modal
    window.dispatchEvent(new CustomEvent('openCookiePreferences'));
  };

  return (
    <footer className="bg-dark-900/50 border-t border-dark-700/50 backdrop-blur-sm mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-8 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {/* About Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-dark-100 uppercase tracking-wide">
              About
            </h3>
            <p className="text-sm text-dark-300 leading-relaxed">
              {COMPLIANCE.seo.siteName} is your trusted resource for flight simulation hardware recommendations.
            </p>
            <Link
              to="/about"
              className="inline-block text-sm text-accent-400 hover:text-accent-300 underline transition-colors"
            >
              Learn more about us
            </Link>
          </div>

          {/* Legal Links */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-dark-100 uppercase tracking-wide">
              Legal
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/legal/terms"
                  className="text-sm text-dark-300 hover:text-dark-100 transition-colors"
                >
                  Terms of Use
                </Link>
              </li>
              <li>
                <Link
                  to="/legal/privacy"
                  className="text-sm text-dark-300 hover:text-dark-100 transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/legal/cookies"
                  className="text-sm text-dark-300 hover:text-dark-100 transition-colors"
                >
                  Cookie Policy
                </Link>
              </li>
              <li>
                <button
                  onClick={handleCookieSettings}
                  className="text-sm text-dark-300 hover:text-dark-100 transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 focus:ring-offset-dark-900 rounded text-left"
                >
                  Cookie Settings
                </button>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-dark-100 uppercase tracking-wide">
              Contact
            </h3>
            <div className="space-y-2 text-sm text-dark-300">
              <p>
                Email:{' '}
                <a
                  href={`mailto:${COMPLIANCE.site.contactEmail}`}
                  className="text-accent-400 hover:text-accent-300 underline transition-colors"
                >
                  {COMPLIANCE.site.contactEmail}
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-dark-700/50 py-6">
          <div className="flex justify-center">
            <p className="text-xs text-dark-400">
              © {new Date().getFullYear()} {COMPLIANCE.site.legalName}. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
