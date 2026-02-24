/**
 * Compliance & Legal Configuration
 *
 * Central configuration for legal notices, affiliate disclosures,
 * and GDPR/ePrivacy compliance across the site.
 */

export const COMPLIANCE = {
  site: {
    legalName: 'Pilot Setup',
    tradeName: 'Pilot Setup',
    regCountry: 'Romania',
    contactEmail: 'contact@pilotsetup.com',
    baseUrl: 'https://pilotsetup.com',
    lastUpdatedISO: '2025-12-27',
    businessHours: 'Monday - Friday, 9:00 - 17:00 EET',
  },
  programs: {
    amazonAssociates: {
      enabled: true,
      disclosureSentence: 'As an Amazon Associate, we earn from qualifying purchases.',
    },
    otherAffiliates: {
      enabled: true,
      networks: ['Winwing', 'Thrustmaster', '2Performant', 'Impact'],
    },
  },
  consent: {
    storageKey: 'cookieConsent',
    affiliateKey: 'affiliate',
    analyticsKey: 'analytics',
    bannerAckKey: 'affiliateDisclosure:ack',
  },
  social: {
    // Optional social media links for structured data
    twitter: '',
    facebook: '',
    youtube: '',
    discord: '',
  },
  seo: {
    siteName: 'Pilot Setup',
    siteDescription: 'Expert flight simulator hardware recommendations, comparisons, and setup guides for MSFS 2020/2024 and X-Plane 11/12.',
    logoUrl: '/logo.png', // Update with actual logo path
  },
};

/**
 * Affiliate disclosure text variations
 */
export const DISCLOSURE_TEXT = {
  banner: {
    short: 'This site uses affiliate links. If you buy through them, we may earn a commission at no extra cost to you.',
    withAmazon: (amazonSentence: string) =>
      `This site uses affiliate links. If you buy through them, we may earn a commission at no extra cost to you. ${amazonSentence}`,
  },
  full: {
    intro: 'This website contains affiliate links to products and services. When you make a purchase through these links, we may earn a commission at no additional cost to you.',
    howItWorks: [
      'When you click an affiliate link, you are redirected to the merchant\'s website.',
      'If you make a purchase, the merchant may share a small percentage of the sale with us.',
      'This does not affect the price you pay - the commission comes from the merchant\'s margin.',
      'These commissions help us maintain and improve this site.',
    ],
    independence: 'Our editorial content and recommendations are independent of affiliate relationships. We only recommend products we believe provide value to flight simulator enthusiasts.',
  },
};

/**
 * Cookie categories for consent management
 */
export const COOKIE_CATEGORIES = {
  necessary: {
    id: 'necessary',
    label: 'Necessary',
    description: 'Essential cookies required for the website to function properly. These cannot be disabled.',
    required: true,
    cookies: [
      { name: 'theme', purpose: 'Remembers your light/dark mode preference', retention: '1 year' },
      { name: COMPLIANCE.consent.storageKey, purpose: 'Stores your cookie preferences', retention: '1 year' },
      { name: COMPLIANCE.consent.bannerAckKey, purpose: 'Remembers if you\'ve acknowledged the affiliate disclosure', retention: '1 year' },
    ],
  },
  analytics: {
    id: 'analytics',
    label: 'Analytics',
    description: 'Help us understand how visitors interact with our website by collecting anonymous usage data.',
    required: false,
    cookies: [
      { name: '_ga', purpose: 'Google Analytics - Main cookie', retention: '2 years' },
      { name: '_ga_*', purpose: 'Google Analytics - Property-specific cookie', retention: '2 years' },
      { name: '_gid', purpose: 'Google Analytics - Session identifier', retention: '24 hours' },
    ],
  },
  affiliate: {
    id: 'affiliate',
    label: 'Affiliate & Marketing',
    description: 'Enable affiliate tracking when you click product links. This helps us earn commissions at no cost to you.',
    required: false,
    cookies: [
      { name: 'amazon_*', purpose: 'Amazon Associates tracking', retention: '24 hours' },
      { name: 'affiliate_*', purpose: 'Third-party affiliate network tracking', retention: '30 days' },
    ],
  },
};

export type ConsentState = {
  analytics: boolean;
  affiliate: boolean;
  timestamp: string;
};

export const DEFAULT_CONSENT: ConsentState = {
  analytics: false,
  affiliate: false,
  timestamp: new Date().toISOString(),
};

/** Pre-formatted last-updated date string for legal pages */
export const formattedLastUpdated = new Date(COMPLIANCE.site.lastUpdatedISO).toLocaleDateString('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});
