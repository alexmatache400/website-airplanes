import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, AlertCircle } from 'lucide-react';
import { acknowledgeAffiliateDisclosure, hasAcknowledgedAffiliateDisclosure } from '../lib/consent';
import { COMPLIANCE, DISCLOSURE_TEXT } from '../config/compliance';

const AffiliateDisclosure: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(!hasAcknowledgedAffiliateDisclosure());
  }, []);

  const handleDismiss = () => {
    acknowledgeAffiliateDisclosure();
    setIsVisible(false);
  };

  if (!isVisible) return null;

  const amazonEnabled = COMPLIANCE.programs.amazonAssociates.enabled;
  const amazonSentence = COMPLIANCE.programs.amazonAssociates.disclosureSentence;

  const message = amazonEnabled
    ? DISCLOSURE_TEXT.banner.withAmazon(amazonSentence)
    : DISCLOSURE_TEXT.banner.short;

  return (
    <div
      className="relative z-[60] bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-b border-amber-500/30 backdrop-blur-sm"
      role="region"
      aria-label="Affiliate disclosure notice"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center gap-4">
          {/* Icon */}
          <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" aria-hidden="true" />

          {/* Message */}
          <p className="flex-1 text-sm text-dark-200">
            {message}{' '}
            <Link
              to="/about#affiliate-disclosure"
              className="text-amber-400 hover:text-amber-300 underline font-medium"
            >
              Learn more
            </Link>
          </p>

          {/* Dismiss Button */}
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 px-4 py-1.5 text-sm font-medium text-amber-400 hover:text-amber-300 border border-amber-500/30 hover:border-amber-500/50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-dark-950"
            aria-label="Dismiss affiliate disclosure"
          >
            Got it
          </button>

          {/* Close Icon (mobile alternative) */}
          <button
            onClick={handleDismiss}
            className="sm:hidden flex-shrink-0 p-1.5 text-dark-400 hover:text-dark-200 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500"
            aria-label="Close affiliate disclosure"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AffiliateDisclosure;
