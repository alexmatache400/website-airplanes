import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { X, Settings, Check } from 'lucide-react';
import { useConsent } from '../lib/consent';
import { COOKIE_CATEGORIES } from '../config/compliance';

interface PreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (preferences: { analytics: boolean; affiliate: boolean }) => void;
  initialPreferences: { analytics: boolean; affiliate: boolean };
}

const PreferencesModal: React.FC<PreferencesModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialPreferences,
}) => {
  const [preferences, setPreferences] = useState(initialPreferences);
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Focus trap
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }

      if (e.key === 'Tab') {
        if (!modalRef.current) return;

        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    closeButtonRef.current?.focus();

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSave = () => {
    onSave(preferences);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-dark-950/80 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-dark-800 rounded-2xl border border-dark-700 shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="preferences-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-dark-700">
          <h2 id="preferences-title" className="text-2xl font-semibold text-dark-100">
            Cookie Preferences
          </h2>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="p-2 text-dark-400 hover:text-dark-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500"
            aria-label="Close preferences"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Necessary Cookies */}
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold text-dark-100">
                    {COOKIE_CATEGORIES.necessary.label}
                  </h3>
                  <span className="px-2 py-0.5 text-xs font-medium bg-accent-500/20 text-accent-400 rounded-full">
                    Required
                  </span>
                </div>
                <p className="text-sm text-dark-300">
                  {COOKIE_CATEGORIES.necessary.description}
                </p>
              </div>
              <div className="ml-4">
                <div className="w-12 h-6 bg-accent-500 rounded-full flex items-center justify-end px-1 cursor-not-allowed opacity-60">
                  <div className="w-4 h-4 bg-white rounded-full" />
                </div>
              </div>
            </div>

            <details className="text-sm">
              <summary className="cursor-pointer text-dark-400 hover:text-dark-200">
                View cookies ({COOKIE_CATEGORIES.necessary.cookies.length})
              </summary>
              <ul className="mt-2 space-y-2 ml-4">
                {COOKIE_CATEGORIES.necessary.cookies.map((cookie, idx) => (
                  <li key={idx} className="text-dark-300">
                    <span className="font-mono text-accent-400">{cookie.name}</span>: {cookie.purpose} ({cookie.retention})
                  </li>
                ))}
              </ul>
            </details>
          </div>

          {/* Analytics Cookies */}
          <div className="space-y-3 pt-4 border-t border-dark-700">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-dark-100 mb-2">
                  {COOKIE_CATEGORIES.analytics.label}
                </h3>
                <p className="text-sm text-dark-300">
                  {COOKIE_CATEGORIES.analytics.description}
                </p>
              </div>
              <div className="ml-4">
                <button
                  onClick={() => setPreferences(prev => ({ ...prev, analytics: !prev.analytics }))}
                  className={`w-12 h-6 rounded-full flex items-center transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500 ${
                    preferences.analytics
                      ? 'bg-accent-500 justify-end'
                      : 'bg-dark-600 justify-start'
                  } px-1`}
                  aria-label={`${preferences.analytics ? 'Disable' : 'Enable'} analytics cookies`}
                  aria-pressed={preferences.analytics}
                >
                  <div className="w-4 h-4 bg-white rounded-full" />
                </button>
              </div>
            </div>

            <details className="text-sm">
              <summary className="cursor-pointer text-dark-400 hover:text-dark-200">
                View cookies ({COOKIE_CATEGORIES.analytics.cookies.length})
              </summary>
              <ul className="mt-2 space-y-2 ml-4">
                {COOKIE_CATEGORIES.analytics.cookies.map((cookie, idx) => (
                  <li key={idx} className="text-dark-300">
                    <span className="font-mono text-accent-400">{cookie.name}</span>: {cookie.purpose} ({cookie.retention})
                  </li>
                ))}
              </ul>
            </details>
          </div>

          {/* Affiliate Cookies */}
          <div className="space-y-3 pt-4 border-t border-dark-700">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-dark-100 mb-2">
                  {COOKIE_CATEGORIES.affiliate.label}
                </h3>
                <p className="text-sm text-dark-300">
                  {COOKIE_CATEGORIES.affiliate.description}
                </p>
              </div>
              <div className="ml-4">
                <button
                  onClick={() => setPreferences(prev => ({ ...prev, affiliate: !prev.affiliate }))}
                  className={`w-12 h-6 rounded-full flex items-center transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500 ${
                    preferences.affiliate
                      ? 'bg-accent-500 justify-end'
                      : 'bg-dark-600 justify-start'
                  } px-1`}
                  aria-label={`${preferences.affiliate ? 'Disable' : 'Enable'} affiliate cookies`}
                  aria-pressed={preferences.affiliate}
                >
                  <div className="w-4 h-4 bg-white rounded-full" />
                </button>
              </div>
            </div>

            <details className="text-sm">
              <summary className="cursor-pointer text-dark-400 hover:text-dark-200">
                View cookies ({COOKIE_CATEGORIES.affiliate.cookies.length})
              </summary>
              <ul className="mt-2 space-y-2 ml-4">
                {COOKIE_CATEGORIES.affiliate.cookies.map((cookie, idx) => (
                  <li key={idx} className="text-dark-300">
                    <span className="font-mono text-accent-400">{cookie.name}</span>: {cookie.purpose} ({cookie.retention})
                  </li>
                ))}
              </ul>
            </details>
          </div>

          {/* Learn More */}
          <div className="pt-4 border-t border-dark-700">
            <p className="text-sm text-dark-300">
              For more information, read our{' '}
              <Link
                to="/legal/privacy"
                className="text-accent-400 hover:text-accent-300 underline"
                onClick={onClose}
              >
                Privacy Policy
              </Link>{' '}
              and{' '}
              <Link
                to="/legal/cookies"
                className="text-accent-400 hover:text-accent-300 underline"
                onClick={onClose}
              >
                Cookie Policy
              </Link>.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row gap-3 p-6 border-t border-dark-700 bg-dark-900/50">
          <button
            onClick={handleSave}
            className="flex-1 inline-flex items-center justify-center gap-2 bg-accent-500 hover:bg-accent-600 text-white px-6 py-3 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 focus:ring-offset-dark-800"
          >
            <Check className="w-4 h-4" />
            Save Preferences
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 border border-dark-600 text-dark-200 hover:bg-dark-700 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 focus:ring-offset-dark-800"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

const CookieBanner: React.FC = () => {
  const { hasConsent, acceptAll, rejectAll, setConsent, consent } = useConsent();
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);

  useEffect(() => {
    setShowBanner(!hasConsent);
  }, [hasConsent]);

  // Listen for cookie settings button from Footer
  useEffect(() => {
    const handleOpenPreferences = () => {
      setShowPreferences(true);
    };

    window.addEventListener('openCookiePreferences', handleOpenPreferences);

    return () => {
      window.removeEventListener('openCookiePreferences', handleOpenPreferences);
    };
  }, []);

  const handleAcceptAll = () => {
    acceptAll();
    setShowBanner(false);
  };

  const handleRejectAll = () => {
    rejectAll();
    setShowBanner(false);
  };

  const handleManagePreferences = () => {
    setShowPreferences(true);
  };

  const handleSavePreferences = (preferences: { analytics: boolean; affiliate: boolean }) => {
    setConsent(preferences);
    setShowBanner(false);
  };

  if (!showBanner && !showPreferences) return null;

  return (
    <>
      {showBanner && (
        <div
          className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6"
          role="region"
          aria-label="Cookie consent banner"
        >
          <div className="max-w-6xl mx-auto bg-dark-800/95 backdrop-blur-lg border border-dark-700 rounded-2xl shadow-2xl p-6">
            <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center">
              {/* Content */}
              <div className="flex-1">
                <div className="flex items-start gap-3 mb-3">
                  <Settings className="w-6 h-6 text-accent-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h2 className="text-xl font-semibold text-dark-100 mb-2">
                      Cookie Preferences
                    </h2>
                    <p className="text-sm text-dark-300">
                      We use cookies to enhance your browsing experience, provide analytics, and enable affiliate tracking.
                      By clicking "Accept all", you consent to our use of cookies.{' '}
                      <Link
                        to="/legal/cookies"
                        className="text-accent-400 hover:text-accent-300 underline"
                      >
                        Learn more
                      </Link>
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <button
                  onClick={handleManagePreferences}
                  className="px-6 py-3 border border-dark-600 text-dark-200 hover:bg-dark-700 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500 whitespace-nowrap"
                >
                  Manage
                </button>
                <button
                  onClick={handleRejectAll}
                  className="px-6 py-3 border border-dark-600 text-dark-200 hover:bg-dark-700 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500 whitespace-nowrap"
                >
                  Reject All
                </button>
                <button
                  onClick={handleAcceptAll}
                  className="px-6 py-3 bg-accent-500 hover:bg-accent-600 text-white rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500 whitespace-nowrap"
                >
                  Accept All
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <PreferencesModal
        isOpen={showPreferences}
        onClose={() => setShowPreferences(false)}
        onSave={handleSavePreferences}
        initialPreferences={{
          analytics: consent.analytics,
          affiliate: consent.affiliate,
        }}
      />
    </>
  );
};

export default CookieBanner;
