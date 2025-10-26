import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, ExternalLink, CheckCircle2 } from 'lucide-react';
import { COMPLIANCE, DISCLOSURE_TEXT } from '../config/compliance';

const AboutUs: React.FC = () => {
  const [activeSection, setActiveSection] = useState('');
  const [isLightMode, setIsLightMode] = useState(false);

  // Track theme for conditional background image
  useEffect(() => {
    const checkTheme = () => {
      setIsLightMode(document.documentElement.classList.contains('light'));
    };

    checkTheme();

    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  // Structured data for SEO
  useEffect(() => {
    const organizationSchema = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: COMPLIANCE.seo.siteName,
      legalName: COMPLIANCE.site.legalName,
      url: COMPLIANCE.site.baseUrl,
      logo: `${COMPLIANCE.site.baseUrl}${COMPLIANCE.seo.logoUrl}`,
      description: COMPLIANCE.seo.siteDescription,
      email: COMPLIANCE.site.contactEmail,
      address: {
        '@type': 'PostalAddress',
        streetAddress: COMPLIANCE.site.address.line,
        addressLocality: COMPLIANCE.site.address.city,
        postalCode: COMPLIANCE.site.address.postcode,
        addressCountry: COMPLIANCE.site.address.country,
      },
      sameAs: Object.values(COMPLIANCE.social).filter(Boolean),
    };

    const websiteSchema = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: COMPLIANCE.seo.siteName,
      url: COMPLIANCE.site.baseUrl,
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${COMPLIANCE.site.baseUrl}/products?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    };

    // Inject structured data
    const scriptOrg = document.createElement('script');
    scriptOrg.type = 'application/ld+json';
    scriptOrg.text = JSON.stringify(organizationSchema);
    document.head.appendChild(scriptOrg);

    const scriptSite = document.createElement('script');
    scriptSite.type = 'application/ld+json';
    scriptSite.text = JSON.stringify(websiteSchema);
    document.head.appendChild(scriptSite);

    return () => {
      document.head.removeChild(scriptOrg);
      document.head.removeChild(scriptSite);
    };
  }, []);

  // Track active section for TOC
  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        'who-we-are',
        'affiliate-disclosure',
        'scope-and-liability',
        'editorial-standards',
        'privacy-and-cookies',
        'copyright-and-assets',
        'contact',
      ];

      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top >= 0 && rect.top < window.innerHeight / 2) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const tocSections = [
    { id: 'who-we-are', label: 'Who We Are' },
    { id: 'affiliate-disclosure', label: 'Affiliate Disclosure' },
    { id: 'scope-and-liability', label: 'What We Do' },
    { id: 'editorial-standards', label: 'Editorial Integrity' },
    { id: 'privacy-and-cookies', label: 'Privacy & Cookies' },
    { id: 'copyright-and-assets', label: 'Copyright & Assets' },
    { id: 'contact', label: 'Contact Us' },
  ];

  return (
    <div className="relative min-h-screen">
      {/* Background */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `url(/backgroundPhoto/${isLightMode ? 'backgrounLight.png' : 'background.png'})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
        }}
      >
        {/* Overlay for better text readability - only in dark mode */}
        {!isLightMode && <div className="absolute inset-0 bg-dark-900/80"></div>}
      </div>

      {/* Content */}
      <div className="relative z-10 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Table of Contents - Sticky on desktop */}
          <aside className="lg:col-span-1">
            <div className="lg:sticky lg:top-24 space-y-4">
              <div className="bg-dark-800/40 backdrop-blur-sm rounded-xl border border-dark-700/50 p-6">
                <h2 className="text-lg font-semibold text-dark-100 mb-4">
                  On this page
                </h2>
                <nav aria-label="Table of contents">
                  <ul className="space-y-2">
                    {tocSections.map((section) => (
                      <li key={section.id}>
                        <button
                          onClick={() => scrollToSection(section.id)}
                          className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${
                            activeSection === section.id
                              ? 'bg-accent-500/20 text-accent-400 font-medium'
                              : 'text-dark-300 hover:text-dark-100 hover:bg-dark-700/50'
                          }`}
                        >
                          {section.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3 space-y-12">
            {/* Header */}
            <header className="space-y-4">
              <h1 className="text-4xl font-bold text-dark-100">About Us</h1>
              <p className="text-lg text-dark-300">
                Everything you need to know about {COMPLIANCE.seo.siteName}, how we operate, and our commitment to transparency.
              </p>
            </header>

            {/* Who We Are */}
            <section id="who-we-are" className="scroll-mt-24 space-y-4">
              <h2 className="text-2xl font-bold text-dark-100 border-b border-dark-700 pb-3">Who We Are</h2>
              <div className="bg-dark-800/40 backdrop-blur-sm rounded-xl border border-dark-700/50 p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-dark-400 font-medium">Legal Name:</span>
                    <p className="text-dark-100">{COMPLIANCE.site.legalName}</p>
                  </div>
                  <div>
                    <span className="text-dark-400 font-medium">Trade Name:</span>
                    <p className="text-dark-100">{COMPLIANCE.site.tradeName}</p>
                  </div>
                  <div>
                    <span className="text-dark-400 font-medium">Tax ID (CUI/CIF):</span>
                    <p className="text-dark-100">{COMPLIANCE.site.taxId}</p>
                  </div>
                  <div>
                    <span className="text-dark-400 font-medium">Registered in:</span>
                    <p className="text-dark-100">{COMPLIANCE.site.regCountry}</p>
                  </div>
                </div>
                <div className="border-t border-dark-700 pt-4">
                  <p className="text-dark-300 leading-relaxed">
                    {COMPLIANCE.seo.siteName} is a specialized resource for flight simulation enthusiasts seeking expert recommendations on hardware setups for <strong>Microsoft Flight Simulator 2020/2024</strong> and <strong>X-Plane 11/12</strong>.
                  </p>
                </div>
              </div>
            </section>

            {/* Affiliate Disclosure */}
            <section id="affiliate-disclosure" className="scroll-mt-24 space-y-4">
              <h2 className="text-2xl font-bold text-dark-100 border-b border-dark-700 pb-3">Affiliate Disclosure</h2>
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-6 space-y-4">
                <p className="text-dark-200 leading-relaxed">
                  {DISCLOSURE_TEXT.full.intro}
                  {COMPLIANCE.programs.amazonAssociates.enabled && (
                    <span className="block mt-3 font-medium">{COMPLIANCE.programs.amazonAssociates.disclosureSentence}</span>
                  )}
                </p>
                <div className="border-t border-amber-500/30 pt-4">
                  <h3 className="font-semibold text-dark-100 mb-3">How it works:</h3>
                  <ul className="space-y-2">
                    {DISCLOSURE_TEXT.full.howItWorks.map((point, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-dark-300">
                        <CheckCircle2 className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            {/* Scope and Liability */}
            <section id="scope-and-liability" className="scroll-mt-24 space-y-4">
              <h2 className="text-2xl font-bold text-dark-100 border-b border-dark-700 pb-3">What We Do (and Don't Do)</h2>
              <div className="space-y-4">
                <div className="bg-dark-800/40 backdrop-blur-sm rounded-xl border border-dark-700/50 p-6">
                  <h3 className="font-semibold text-dark-100 mb-3 flex items-center gap-2">
                    <ExternalLink className="w-5 h-5 text-accent-400" />
                    We are NOT a retailer
                  </h3>
                  <p className="text-dark-300 leading-relaxed">
                    We do not sell products directly. When you click affiliate links, you are redirected to third-party merchants. <strong>All transactions occur between you and the merchant.</strong>
                  </p>
                </div>
                <p className="text-dark-400 text-sm">
                  For full legal terms, see our <Link to="/legal/terms" className="text-accent-400 hover:text-accent-300 underline">Terms of Use</Link>.
                </p>
              </div>
            </section>

            {/* Editorial Standards */}
            <section id="editorial-standards" className="scroll-mt-24 space-y-4">
              <h2 className="text-2xl font-bold text-dark-100 border-b border-dark-700 pb-3">Editorial Integrity</h2>
              <div className="bg-dark-800/40 backdrop-blur-sm rounded-xl border border-dark-700/50 p-6 space-y-4">
                <p className="text-dark-300 leading-relaxed">
                  Our content is independently researched and written by flight simulation enthusiasts. <strong>Our recommendations are never influenced by commission rates.</strong>
                </p>
              </div>
            </section>

            {/* Privacy & Cookies */}
            <section id="privacy-and-cookies" className="scroll-mt-24 space-y-4">
              <h2 className="text-2xl font-bold text-dark-100 border-b border-dark-700 pb-3">Privacy & Cookies</h2>
              <div className="bg-dark-800/40 backdrop-blur-sm rounded-xl border border-dark-700/50 p-6 space-y-4">
                <p className="text-dark-300 leading-relaxed">
                  We respect your privacy and comply with EU GDPR regulations. Read our{' '}
                  <Link to="/legal/privacy" className="text-accent-400 hover:text-accent-300 underline">Privacy Policy</Link>
                  {' '}and{' '}
                  <Link to="/legal/cookies" className="text-accent-400 hover:text-accent-300 underline">Cookie Policy</Link>.
                </p>
              </div>
            </section>

            {/* Copyright */}
            <section id="copyright-and-assets" className="scroll-mt-24 space-y-4">
              <h2 className="text-2xl font-bold text-dark-100 border-b border-dark-700 pb-3">Copyright & Assets</h2>
              <div className="bg-dark-800/40 backdrop-blur-sm rounded-xl border border-dark-700/50 p-6">
                <p className="text-dark-300 leading-relaxed">
                  All content is protected by copyright. For takedown requests, contact{' '}
                  <a href={`mailto:${COMPLIANCE.site.contactEmail}`} className="text-accent-400 hover:text-accent-300 underline">
                    {COMPLIANCE.site.contactEmail}
                  </a>
                </p>
              </div>
            </section>

            {/* Contact */}
            <section id="contact" className="scroll-mt-24 space-y-4">
              <h2 className="text-2xl font-bold text-dark-100 border-b border-dark-700 pb-3">Contact Us</h2>
              <div className="bg-dark-800/40 backdrop-blur-sm rounded-xl border border-dark-700/50 p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-accent-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-dark-100 mb-1">Email</h3>
                      <a href={`mailto:${COMPLIANCE.site.contactEmail}`} className="text-accent-400 hover:text-accent-300 underline">
                        {COMPLIANCE.site.contactEmail}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-accent-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-dark-100 mb-1">Address</h3>
                      <address className="text-dark-300 not-italic text-sm">
                        {COMPLIANCE.site.address.line}<br />
                        {COMPLIANCE.site.address.city}, {COMPLIANCE.site.address.postcode}<br />
                        {COMPLIANCE.site.address.country}
                      </address>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-dark-700 pt-6">
              <p className="text-sm text-dark-400">
                <strong>Last updated:</strong> {new Date(COMPLIANCE.site.lastUpdatedISO).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </footer>
          </main>
        </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
