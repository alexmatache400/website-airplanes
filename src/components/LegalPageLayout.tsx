import React from 'react';
import { formattedLastUpdated } from '../config/compliance';

interface LegalPageLayoutProps {
  title: string;
  children: React.ReactNode;
  footerLinks: React.ReactNode;
}

/**
 * Shared layout wrapper for legal pages (Terms, Privacy, Cookie).
 * Provides consistent header, max-width container, and footer navigation.
 */
export const LegalPageLayout: React.FC<LegalPageLayoutProps> = ({ title, children, footerLinks }) => (
  <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
    <div className="max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-dark-100 mb-4">{title}</h1>
        <p className="text-dark-400">Last updated: {formattedLastUpdated}</p>
      </header>

      <div className="space-y-8 text-dark-300">
        {children}
      </div>

      <div className="mt-12 pt-8 border-t border-dark-700 flex gap-6">
        {footerLinks}
      </div>
    </div>
  </div>
);

/**
 * Consistent section card used across all legal pages.
 * Replaces the repeated `bg-dark-800/40 backdrop-blur-sm rounded-xl border border-dark-700/50 p-6 space-y-4` pattern.
 */
export const LegalSection: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <section className="bg-dark-800/40 backdrop-blur-sm rounded-xl border border-dark-700/50 p-6 space-y-4">
    {children}
  </section>
);
