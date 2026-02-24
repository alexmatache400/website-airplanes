import React, { useEffect } from 'react';
import { COMPLIANCE } from '../config/compliance';

/**
 * Injects global Organization + WebSite JSON-LD structured data on every page.
 * Rendered once in App.tsx.
 */
const SiteSchema: React.FC = () => {
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

    const scriptOrg = document.createElement('script');
    scriptOrg.type = 'application/ld+json';
    scriptOrg.id = 'schema-organization';
    scriptOrg.text = JSON.stringify(organizationSchema);
    document.head.appendChild(scriptOrg);

    const scriptSite = document.createElement('script');
    scriptSite.type = 'application/ld+json';
    scriptSite.id = 'schema-website';
    scriptSite.text = JSON.stringify(websiteSchema);
    document.head.appendChild(scriptSite);

    return () => {
      document.getElementById('schema-organization')?.remove();
      document.getElementById('schema-website')?.remove();
    };
  }, []);

  return null;
};

export default SiteSchema;
