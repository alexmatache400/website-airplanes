import React from 'react';
import { Link } from 'react-router-dom';
import { COMPLIANCE } from '../../config/compliance';
import { LegalPageLayout, LegalSection } from '../../components/LegalPageLayout';
import { useDocumentHead } from '../../hooks/useDocumentHead';

const PrivacyPolicy: React.FC = () => {
  useDocumentHead({
    title: 'Privacy Policy | Pilot Setup',
    description: 'Learn how Pilot Setup collects, uses, and protects your personal data. Full GDPR-compliant privacy policy for EU visitors.',
    canonical: '/legal/privacy',
  });

  return (
    <LegalPageLayout
      title="Privacy Policy"
      footerLinks={
        <>
          <Link to="/about" className="text-accent-400 hover:text-accent-300 underline">← Back to About Us</Link>
          <Link to="/legal/cookies" className="text-accent-400 hover:text-accent-300 underline">View Cookie Policy →</Link>
        </>
      }
    >
      <LegalSection>
        <h2 className="text-2xl font-semibold text-dark-100">1. Data We Collect</h2>
        <p><strong>We collect minimal personal data:</strong></p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li><strong>Analytics data:</strong> Anonymous usage statistics via Google Analytics (if consented)</li>
          <li><strong>Affiliate tracking:</strong> Click data for commission tracking (if consented)</li>
          <li><strong>Preferences:</strong> Theme choice, cookie consent settings (stored locally)</li>
        </ul>
        <p className="text-sm italic">We do NOT collect names, emails, or payment information.</p>
      </LegalSection>

      <LegalSection>
        <h2 className="text-2xl font-semibold text-dark-100">2. How We Use Data</h2>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Understand site usage patterns (analytics)</li>
          <li>Track affiliate link clicks for commission attribution</li>
          <li>Remember your preferences (theme, consent)</li>
        </ul>
      </LegalSection>

      <LegalSection>
        <h2 className="text-2xl font-semibold text-dark-100">3. Your Rights (GDPR)</h2>
        <p>Under EU GDPR, you have the right to:</p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li><strong>Access:</strong> Request what data we hold</li>
          <li><strong>Erasure:</strong> Request deletion of your data</li>
          <li><strong>Withdraw consent:</strong> Change cookie preferences anytime</li>
        </ul>
        <p>
          Manage your preferences via "Cookie settings" in the footer or contact{' '}
          <a href={`mailto:${COMPLIANCE.site.contactEmail}`} className="text-accent-400 underline">
            {COMPLIANCE.site.contactEmail}
          </a>
        </p>
      </LegalSection>

      <LegalSection>
        <h2 className="text-2xl font-semibold text-dark-100">4. Third-Party Services</h2>
        <p>We use:</p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li><strong>Google Analytics:</strong> For anonymous usage statistics (only with your consent)</li>
          <li><strong>Affiliate networks:</strong> For tracking clicks and commissions (only with your consent)</li>
        </ul>
        <p className="text-sm">
          These services have their own privacy policies. We cannot control their data practices.
        </p>
      </LegalSection>

      <LegalSection>
        <h2 className="text-2xl font-semibold text-dark-100">5. Contact</h2>
        <div className="bg-dark-700/50 rounded-lg p-4">
          <p className="font-medium text-dark-100">{COMPLIANCE.site.legalName}</p>
          <p className="text-sm mt-2">
            Email: <a href={`mailto:${COMPLIANCE.site.contactEmail}`} className="text-accent-400 underline">{COMPLIANCE.site.contactEmail}</a>
          </p>
        </div>
      </LegalSection>
    </LegalPageLayout>
  );
};

export default PrivacyPolicy;
