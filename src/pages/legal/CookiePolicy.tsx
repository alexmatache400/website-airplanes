import React from 'react';
import { Link } from 'react-router-dom';
import { COOKIE_CATEGORIES } from '../../config/compliance';
import { LegalPageLayout, LegalSection } from '../../components/LegalPageLayout';

const CookiePolicy: React.FC = () => {
  return (
    <LegalPageLayout
      title="Cookie Policy"
      footerLinks={
        <>
          <Link to="/about" className="text-accent-400 hover:text-accent-300 underline">← Back to About Us</Link>
          <Link to="/legal/privacy" className="text-accent-400 hover:text-accent-300 underline">View Privacy Policy →</Link>
        </>
      }
    >
      <LegalSection>
        <h2 className="text-2xl font-semibold text-dark-100">What Are Cookies?</h2>
        <p>
          Cookies are small text files stored on your device when you visit a website. They help websites
          remember your preferences and provide analytics data.
        </p>
      </LegalSection>

      {/* Necessary Cookies */}
      <LegalSection>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-dark-100">{COOKIE_CATEGORIES.necessary.label}</h2>
          <span className="px-3 py-1 text-xs font-medium bg-accent-500/20 text-accent-400 rounded-full">
            Required
          </span>
        </div>
        <p>{COOKIE_CATEGORIES.necessary.description}</p>
        <div className="bg-dark-700/50 rounded-lg p-4">
          <h3 className="font-medium text-dark-100 mb-3">Cookies in this category:</h3>
          <ul className="space-y-2 text-sm">
            {COOKIE_CATEGORIES.necessary.cookies.map((cookie, idx) => (
              <li key={idx} className="flex flex-col gap-1">
                <span className="font-mono text-accent-400">{cookie.name}</span>
                <span className="text-dark-300">{cookie.purpose}</span>
                <span className="text-dark-400">Retention: {cookie.retention}</span>
              </li>
            ))}
          </ul>
        </div>
      </LegalSection>

      {/* Analytics Cookies */}
      <LegalSection>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-dark-100">{COOKIE_CATEGORIES.analytics.label}</h2>
          <span className="px-3 py-1 text-xs font-medium bg-amber-500/20 text-amber-400 rounded-full">
            Optional
          </span>
        </div>
        <p>{COOKIE_CATEGORIES.analytics.description}</p>
        <div className="bg-dark-700/50 rounded-lg p-4">
          <h3 className="font-medium text-dark-100 mb-3">Cookies in this category:</h3>
          <ul className="space-y-2 text-sm">
            {COOKIE_CATEGORIES.analytics.cookies.map((cookie, idx) => (
              <li key={idx} className="flex flex-col gap-1">
                <span className="font-mono text-accent-400">{cookie.name}</span>
                <span className="text-dark-300">{cookie.purpose}</span>
                <span className="text-dark-400">Retention: {cookie.retention}</span>
              </li>
            ))}
          </ul>
        </div>
      </LegalSection>

      {/* Affiliate Cookies */}
      <LegalSection>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-dark-100">{COOKIE_CATEGORIES.affiliate.label}</h2>
          <span className="px-3 py-1 text-xs font-medium bg-amber-500/20 text-amber-400 rounded-full">
            Optional
          </span>
        </div>
        <p>{COOKIE_CATEGORIES.affiliate.description}</p>
        <div className="bg-dark-700/50 rounded-lg p-4">
          <h3 className="font-medium text-dark-100 mb-3">Cookies in this category:</h3>
          <ul className="space-y-2 text-sm">
            {COOKIE_CATEGORIES.affiliate.cookies.map((cookie, idx) => (
              <li key={idx} className="flex flex-col gap-1">
                <span className="font-mono text-accent-400">{cookie.name}</span>
                <span className="text-dark-300">{cookie.purpose}</span>
                <span className="text-dark-400">Retention: {cookie.retention}</span>
              </li>
            ))}
          </ul>
        </div>
      </LegalSection>

      {/* Managing Cookies */}
      <LegalSection>
        <h2 className="text-2xl font-semibold text-dark-100">Managing Your Cookie Preferences</h2>
        <p>You can withdraw or change your consent at any time by:</p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Clicking "Cookie settings" in the site footer</li>
          <li>Clearing your browser cookies (this will reset all preferences)</li>
        </ul>
        <p className="text-sm italic">
          Note: Disabling necessary cookies may affect site functionality.
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
};

export default CookiePolicy;
