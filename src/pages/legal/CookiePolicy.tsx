import React from 'react';
import { Link } from 'react-router-dom';
import { COMPLIANCE, COOKIE_CATEGORIES } from '../../config/compliance';

const CookiePolicy: React.FC = () => {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-dark-100 mb-4">Cookie Policy</h1>
          <p className="text-dark-400">
            Last updated: {new Date(COMPLIANCE.site.lastUpdatedISO).toLocaleDateString()}
          </p>
        </header>

        <div className="space-y-8 text-dark-300">
          <section className="bg-dark-800/40 backdrop-blur-sm rounded-xl border border-dark-700/50 p-6 space-y-4">
            <h2 className="text-2xl font-semibold text-dark-100">What Are Cookies?</h2>
            <p>
              Cookies are small text files stored on your device when you visit a website. They help websites
              remember your preferences and provide analytics data.
            </p>
          </section>

          {/* Necessary Cookies */}
          <section className="bg-dark-800/40 backdrop-blur-sm rounded-xl border border-dark-700/50 p-6 space-y-4">
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
          </section>

          {/* Analytics Cookies */}
          <section className="bg-dark-800/40 backdrop-blur-sm rounded-xl border border-dark-700/50 p-6 space-y-4">
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
          </section>

          {/* Affiliate Cookies */}
          <section className="bg-dark-800/40 backdrop-blur-sm rounded-xl border border-dark-700/50 p-6 space-y-4">
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
          </section>

          {/* Managing Cookies */}
          <section className="bg-dark-800/40 backdrop-blur-sm rounded-xl border border-dark-700/50 p-6 space-y-4">
            <h2 className="text-2xl font-semibold text-dark-100">Managing Your Cookie Preferences</h2>
            <p>You can withdraw or change your consent at any time by:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Clicking "Cookie settings" in the site footer</li>
              <li>Clearing your browser cookies (this will reset all preferences)</li>
            </ul>
            <p className="text-sm italic">
              Note: Disabling necessary cookies may affect site functionality.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-dark-700 flex gap-6">
          <Link to="/about" className="text-accent-400 hover:text-accent-300 underline">← Back to About Us</Link>
          <Link to="/legal/privacy" className="text-accent-400 hover:text-accent-300 underline">View Privacy Policy →</Link>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicy;
