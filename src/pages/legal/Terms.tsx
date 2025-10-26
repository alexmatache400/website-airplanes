import React from 'react';
import { Link } from 'react-router-dom';
import { COMPLIANCE } from '../../config/compliance';

const Terms: React.FC = () => {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-dark-100 mb-4">Terms of Use</h1>
          <p className="text-dark-400">
            Last updated: {new Date(COMPLIANCE.site.lastUpdatedISO).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </header>

        <div className="space-y-8 text-dark-300">
          {/* 1. Acceptance */}
          <section className="bg-dark-800/40 backdrop-blur-sm rounded-xl border border-dark-700/50 p-6 space-y-4">
            <h2 className="text-2xl font-semibold text-dark-100">1. Acceptance of Terms</h2>
            <p>
              By accessing and using {COMPLIANCE.seo.siteName} (the "Site"), you accept and agree to be bound by
              these Terms of Use. If you do not agree to these terms, please do not use this Site.
            </p>
          </section>

          {/* 2. Not a Retailer */}
          <section className="bg-dark-800/40 backdrop-blur-sm rounded-xl border border-dark-700/50 p-6 space-y-4">
            <h2 className="text-2xl font-semibold text-dark-100">2. We Are Not a Retailer</h2>
            <p>
              <strong>Important:</strong> {COMPLIANCE.seo.siteName} does not sell, ship, or handle any products.
              We provide <strong>informational content and affiliate links</strong> to third-party merchants.
            </p>
            <p>
              When you click a product link or "Buy" button on this Site, you are redirected to a third-party
              merchant's website (such as Amazon, Winwing, Thrustmaster, etc.). <strong>All purchases are made
              directly with that merchant</strong>, not with us.
            </p>
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
              <p className="text-sm">
                We have no control over, and assume no responsibility for, the content, privacy policies, shipping
                practices, product quality, or customer service of any third-party merchants.
              </p>
            </div>
          </section>

          {/* 3. Merchant Responsibilities */}
          <section className="bg-dark-800/40 backdrop-blur-sm rounded-xl border border-dark-700/50 p-6 space-y-4">
            <h2 className="text-2xl font-semibold text-dark-100">3. Merchant Responsibilities</h2>
            <p>The third-party merchant from whom you purchase is solely responsible for:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Order fulfillment and shipping</li>
              <li>Product quality, warranties, and support</li>
              <li>Returns, refunds, and exchanges</li>
              <li>Customer service inquiries</li>
              <li>Payment processing and security</li>
            </ul>
            <p>
              Any disputes, claims, or issues related to your purchase must be resolved directly with the merchant.
            </p>
          </section>

          {/* 4. Content Accuracy */}
          <section className="bg-dark-800/40 backdrop-blur-sm rounded-xl border border-dark-700/50 p-6 space-y-4">
            <h2 className="text-2xl font-semibold text-dark-100">4. Content Accuracy and Disclaimers</h2>
            <p>
              We make reasonable efforts to ensure that product information, specifications, and prices displayed
              on this Site are accurate. However:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Prices may change</strong> without notice. The final price is determined by the merchant at checkout.</li>
              <li><strong>Availability may vary</strong>. Products shown may be out of stock or discontinued.</li>
              <li><strong>Specifications</strong> are provided for informational purposes. Always verify technical details on the manufacturer's official website.</li>
            </ul>
            <p className="text-sm italic">
              We cannot guarantee that all content is error-free or up-to-date. Use this information at your own discretion.
            </p>
          </section>

          {/* 5. Affiliate Disclosure */}
          <section className="bg-dark-800/40 backdrop-blur-sm rounded-xl border border-dark-700/50 p-6 space-y-4">
            <h2 className="text-2xl font-semibold text-dark-100">5. Affiliate Relationships</h2>
            <p>
              This Site contains affiliate links. When you make a purchase through these links, we may earn a
              commission at no extra cost to you. This helps us maintain and improve the Site.
            </p>
            <p>
              For complete details, see our{' '}
              <Link to="/about#affiliate-disclosure" className="text-accent-400 hover:text-accent-300 underline">
                Affiliate Disclosure
              </Link>.
            </p>
          </section>

          {/* 6. Intellectual Property */}
          <section className="bg-dark-800/40 backdrop-blur-sm rounded-xl border border-dark-700/50 p-6 space-y-4">
            <h2 className="text-2xl font-semibold text-dark-100">6. Intellectual Property</h2>
            <p>
              All content on this Site (text, images, logos, design, code) is protected by copyright and other
              intellectual property laws. You may not:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Reproduce, distribute, or publicly display our content without permission</li>
              <li>Use our content for commercial purposes</li>
              <li>Scrape, harvest, or automate data extraction from this Site</li>
            </ul>
            <p>
              Brand names, trademarks, and logos belong to their respective owners. Their use on this Site does not
              imply endorsement.
            </p>
          </section>

          {/* 7. Limitation of Liability */}
          <section className="bg-dark-800/40 backdrop-blur-sm rounded-xl border border-dark-700/50 p-6 space-y-4">
            <h2 className="text-2xl font-semibold text-dark-100">7. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, {COMPLIANCE.site.legalName} shall not be liable for any
              indirect, incidental, special, consequential, or punitive damages arising from:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Your use of or inability to use this Site</li>
              <li>Any transactions with third-party merchants</li>
              <li>Inaccuracies in product information or pricing</li>
              <li>Unauthorized access to your data or communications</li>
            </ul>
            <p className="text-sm font-semibold">
              THE SITE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED.
            </p>
          </section>

          {/* 8. Governing Law */}
          <section className="bg-dark-800/40 backdrop-blur-sm rounded-xl border border-dark-700/50 p-6 space-y-4">
            <h2 className="text-2xl font-semibold text-dark-100">8. Governing Law and Jurisdiction</h2>
            <p>
              These Terms are governed by the laws of <strong>{COMPLIANCE.site.regCountry}</strong>, without
              regard to conflict of law principles. Any disputes shall be resolved in the competent courts of{' '}
              {COMPLIANCE.site.address.city}, {COMPLIANCE.site.regCountry}.
            </p>
          </section>

          {/* 9. Changes to Terms */}
          <section className="bg-dark-800/40 backdrop-blur-sm rounded-xl border border-dark-700/50 p-6 space-y-4">
            <h2 className="text-2xl font-semibold text-dark-100">9. Changes to These Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. Changes will be effective immediately upon
              posting. Your continued use of the Site constitutes acceptance of the updated Terms.
            </p>
          </section>

          {/* 10. Contact */}
          <section className="bg-dark-800/40 backdrop-blur-sm rounded-xl border border-dark-700/50 p-6 space-y-4">
            <h2 className="text-2xl font-semibold text-dark-100">10. Contact Us</h2>
            <p>
              If you have questions about these Terms, please contact us:
            </p>
            <div className="bg-dark-700/50 rounded-lg p-4">
              <p className="font-medium text-dark-100">{COMPLIANCE.site.legalName}</p>
              <p className="text-sm mt-2">
                Email:{' '}
                <a
                  href={`mailto:${COMPLIANCE.site.contactEmail}`}
                  className="text-accent-400 hover:text-accent-300 underline"
                >
                  {COMPLIANCE.site.contactEmail}
                </a>
              </p>
              <p className="text-sm mt-1">
                Address: {COMPLIANCE.site.address.line}, {COMPLIANCE.site.address.city},{' '}
                {COMPLIANCE.site.address.postcode}, {COMPLIANCE.site.address.country}
              </p>
            </div>
          </section>
        </div>

        {/* Back Link */}
        <div className="mt-12 pt-8 border-t border-dark-700">
          <Link
            to="/about"
            className="text-accent-400 hover:text-accent-300 underline"
          >
            ← Back to About Us
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Terms;
