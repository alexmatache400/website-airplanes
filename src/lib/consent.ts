/**
 * Consent Management Library
 *
 * Handles GDPR/ePrivacy cookie consent with granular category control.
 * Provides event-based notification when consent changes.
 */

import { useState, useEffect, useCallback } from 'react';
import { COMPLIANCE, DEFAULT_CONSENT, type ConsentState } from '../config/compliance';

type ConsentListener = (consent: ConsentState) => void;

class ConsentManager {
  private listeners: Set<ConsentListener> = new Set();
  private storageKey: string;

  constructor(storageKey: string) {
    this.storageKey = storageKey;
  }

  /**
   * Get current consent state from localStorage
   */
  getConsent(): ConsentState | null {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) return null;

      const parsed = JSON.parse(stored);
      // Validate structure
      if (typeof parsed.analytics === 'boolean' &&
          typeof parsed.affiliate === 'boolean' &&
          typeof parsed.timestamp === 'string') {
        return parsed as ConsentState;
      }
      return null;
    } catch (error) {
      console.error('Failed to read consent state:', error);
      return null;
    }
  }

  /**
   * Set consent state and notify listeners
   */
  setConsent(consent: Partial<ConsentState>): void {
    const current = this.getConsent() || DEFAULT_CONSENT;
    const updated: ConsentState = {
      ...current,
      ...consent,
      timestamp: new Date().toISOString(),
    };

    try {
      localStorage.setItem(this.storageKey, JSON.stringify(updated));
      this.notifyListeners(updated);
    } catch (error) {
      console.error('Failed to save consent state:', error);
    }
  }

  /**
   * Accept all optional cookies
   */
  acceptAll(): void {
    this.setConsent({
      analytics: true,
      affiliate: true,
    });
  }

  /**
   * Reject all optional cookies
   */
  rejectAll(): void {
    this.setConsent({
      analytics: false,
      affiliate: false,
    });
  }

  /**
   * Check if user has made a consent choice
   */
  hasConsent(): boolean {
    return this.getConsent() !== null;
  }

  /**
   * Subscribe to consent changes
   */
  subscribe(listener: ConsentListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notify all listeners of consent change
   */
  private notifyListeners(consent: ConsentState): void {
    this.listeners.forEach(listener => {
      try {
        listener(consent);
      } catch (error) {
        console.error('Consent listener error:', error);
      }
    });
  }

  /**
   * Clear all consent data (for testing or user request)
   */
  clearConsent(): void {
    try {
      localStorage.removeItem(this.storageKey);
      this.notifyListeners(DEFAULT_CONSENT);
    } catch (error) {
      console.error('Failed to clear consent:', error);
    }
  }
}

// Singleton instance
export const consentManager = new ConsentManager(COMPLIANCE.consent.storageKey);

/**
 * React hook for consent management
 *
 * @example
 * const { consent, hasConsent, setConsent, acceptAll, rejectAll } = useConsent();
 */
export function useConsent() {
  const [consent, setConsentState] = useState<ConsentState | null>(() =>
    consentManager.getConsent()
  );

  useEffect(() => {
    // Subscribe to consent changes
    const unsubscribe = consentManager.subscribe((newConsent) => {
      setConsentState(newConsent);
    });

    return unsubscribe;
  }, []);

  const setConsent = useCallback((update: Partial<ConsentState>) => {
    consentManager.setConsent(update);
  }, []);

  const acceptAll = useCallback(() => {
    consentManager.acceptAll();
  }, []);

  const rejectAll = useCallback(() => {
    consentManager.rejectAll();
  }, []);

  const clearConsent = useCallback(() => {
    consentManager.clearConsent();
  }, []);

  return {
    consent: consent || DEFAULT_CONSENT,
    hasConsent: consent !== null,
    setConsent,
    acceptAll,
    rejectAll,
    clearConsent,
  };
}

/**
 * Check if a specific consent category is granted
 */
export function hasConsentFor(category: 'analytics' | 'affiliate'): boolean {
  const consent = consentManager.getConsent();
  if (!consent) return false;
  return consent[category] === true;
}

/**
 * Load Google Analytics script if consent is granted
 */
export function loadAnalytics(measurementId: string): void {
  if (!hasConsentFor('analytics')) return;

  // Check if already loaded
  if (typeof window.gtag === 'function') return;

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  // Initialize gtag
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: any[]) {
    window.dataLayer.push(args);
  };
  window.gtag('js', new Date());
  window.gtag('config', measurementId, {
    anonymize_ip: true,
    cookie_flags: 'SameSite=None;Secure',
  });
}

/**
 * TypeScript declarations for gtag
 */
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

/**
 * Utility to check if affiliate disclosure has been acknowledged
 */
export function hasAcknowledgedAffiliateDisclosure(): boolean {
  try {
    return localStorage.getItem(COMPLIANCE.consent.bannerAckKey) === '1';
  } catch {
    return false;
  }
}

/**
 * Mark affiliate disclosure as acknowledged
 */
export function acknowledgeAffiliateDisclosure(): void {
  try {
    localStorage.setItem(COMPLIANCE.consent.bannerAckKey, '1');
  } catch (error) {
    console.error('Failed to save affiliate disclosure acknowledgment:', error);
  }
}
