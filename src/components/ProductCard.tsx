import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Product } from '../lib/products';
import Modal from './Modal';
import Lightbox from './Lightbox';
import { CategoryIcon } from './CategoryIcon';

interface ProductCardProps {
  product: Product;
  className?: string;
  context?: 'hover' | 'modal' | 'grid';
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  className = '',
  context = 'hover'
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<'amazon' | 'thrustmaster' | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const didPushStateRef = useRef(false);
  const amazonDropdownRef = useRef<HTMLDivElement>(null);
  const thrustmasterDropdownRef = useRef<HTMLDivElement>(null);

  // Helper function to truncate text to specified length
  const truncateText = (text: string, maxLength: number = 100): string => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim() + '...';
  };

  // Category-based colors (with light mode support)
  const categoryColors = {
    HOTAS: 'from-sky-500/20 to-blue-600/20 border-sky-500/30 text-sky-200\n' +
        'dark:from-sky-500/70 dark:to-blue-600/70 dark:border-sky-700 dark:text-sky-650\n',
    Throttle: 'from-emerald-300/40 to-emerald-500/80 border-emerald-600 text-slate-900 dark:from-emerald-500/30 dark:to-emerald-700/70 dark:border-emerald-400 dark:text-slate-50',
    Joystick: 'from-violet-400/40 to-fuchsia-500/80 border-violet-600 text-slate-900 dark:from-violet-500/40 dark:to-fuchsia-600/70 dark:border-violet-400 dark:text-slate-50',
    Pedals: 'from-amber-200/60 to-amber-400/90 border-amber-500 text-slate-900 dark:from-amber-400/30 dark:to-amber-600/70 dark:border-amber-300 dark:text-slate-50',
    Panel: 'from-rose-300/50 to-rose-500/90 border-rose-600 text-slate-900 dark:from-rose-500/30 dark:to-rose-700/70 dark:border-rose-400 dark:text-slate-50',
    MCDU: 'from-cyan-300/40 to-cyan-500/80 border-cyan-600 text-slate-900 dark:from-cyan-500/30 dark:to-cyan-700/70 dark:border-cyan-400 dark:text-slate-50',
    Rudder: 'from-orange-300/40 to-orange-500/80 border-orange-600 text-slate-900 dark:from-orange-500/30 dark:to-orange-700/70 dark:border-orange-400 dark:text-slate-50',
    Base: 'from-teal-300/40 to-teal-500/80 border-teal-600 text-slate-900 dark:from-teal-500/30 dark:to-teal-700/80 dark:border-teal-400 dark:text-slate-50',
    Accessories: 'from-indigo-300/40 to-indigo-500/80 border-indigo-600 text-slate-900 dark:from-indigo-500/30 dark:to-indigo-700/70 dark:border-indigo-400 dark:text-slate-50',
    Bundle: 'from-slate-200/80 to-slate-400/90 border-slate-500 text-slate-900 dark:from-slate-600/40 dark:to-slate-800/80 dark:border-slate-500 dark:text-slate-50\n',
  };

  // Check if this product's modal should be open based on URL
  const isModalOpen = searchParams.get('modal') === product.slug;

  // Open modal by adding query param
  const handleOpenModal = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('modal', product.slug);
    navigate(`?${newParams.toString()}`, { replace: false });
    didPushStateRef.current = true;
  };

  // Close modal
  const handleCloseModal = () => {
    if (didPushStateRef.current) {
      // We pushed a state, so go back
      navigate(-1);
      didPushStateRef.current = false;
    } else {
      // Just remove the modal param
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('modal');
      const newSearch = newParams.toString();
      navigate(newSearch ? `?${newSearch}` : window.location.pathname, { replace: true });
    }
  };

  // Handle back button
  const handleBack = () => {
    navigate(-1);
    didPushStateRef.current = false;
  };

  // Reset didPushStateRef when modal closes via browser back
  useEffect(() => {
    if (!isModalOpen && didPushStateRef.current) {
      didPushStateRef.current = false;
    }
  }, [isModalOpen]);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        amazonDropdownRef.current && !amazonDropdownRef.current.contains(target) &&
        thrustmasterDropdownRef.current && !thrustmasterDropdownRef.current.contains(target)
      ) {
        setOpenDropdown(null);
      }
    };

    if (openDropdown !== null) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdown]);

  const formatPrice = (price: number | null | undefined) => {
    if (!price) return null;
    return new Intl.NumberFormat('en-EU', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Fallback SVG for missing images
  const FallbackAvatar = () => (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-dark-700 to-dark-800">
      <div className="text-center space-y-2">
        <div className="opacity-40">
          <CategoryIcon category={product.category} size={48} className="w-12 h-12 mx-auto" />
        </div>
        <div className="text-sm text-dark-400">{product.category}</div>
      </div>
    </div>
  );

  // Affiliate Dropdown Component
  interface AffiliateDropdownProps {
    type: 'amazon' | 'thrustmaster';
    isOpen: boolean;
    onToggle: () => void;
    links: {
      us?: string;
      uk?: string;
      de?: string;
      eu?: string;
    };
    dropdownRef: React.RefObject<HTMLDivElement | null>;
    context?: 'hover' | 'modal' | 'grid';
  }

  const AffiliateDropdown: React.FC<AffiliateDropdownProps> = ({
    type,
    isOpen,
    onToggle,
    links,
    dropdownRef,
    context = 'hover',
  }) => {
    // All hooks must be called before any conditional returns
    const [position, setPosition] = useState<'center' | 'left' | 'right' | 'above'>('center');
    const buttonRef = useRef<HTMLButtonElement>(null);

    // Calculate values needed for hooks
    const hasLinks = !!(links.us || links.uk || links.de || links.eu);
    const label = type === 'amazon' ? 'Amazon' : 'Thrustmaster';
    const visibleLinksCount = Object.values(links).filter(Boolean).length;
    const estimatedDropdownWidth = visibleLinksCount * 88 + 32; // ~88px per button + padding

    // Smart positioning logic
    useEffect(() => {
      if (!isOpen || !buttonRef.current || !dropdownRef.current) return;

      const button = buttonRef.current.getBoundingClientRect();
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight,
      };

      // Find closest parent card (.glass)
      const card = dropdownRef.current.closest('.glass');
      const cardBounds = card?.getBoundingClientRect();

      // Calculate available space
      const spaceBelow = viewport.height - button.bottom;
      const spaceAbove = button.top;

      let horizontalPos: 'center' | 'left' | 'right' = 'center';

      if (context === 'modal' || context === 'grid') {
        // Modal/Grid: align based on button type
        // Amazon (left button) → left-aligned, Thrustmaster (right button) → right-aligned
        horizontalPos = type === 'amazon' ? 'left' : 'right';
      } else {
        // Hover overlay: check if centered dropdown fits within card bounds
        const halfDropdownWidth = estimatedDropdownWidth / 2;
        const buttonCenter = button.left + button.width / 2;

        const leftEdge = buttonCenter - halfDropdownWidth;
        const rightEdge = buttonCenter + halfDropdownWidth;

        if (cardBounds) {
          // Check overflow against card boundaries
          const cardPadding = 16; // Account for card padding
          if (leftEdge < cardBounds.left + cardPadding) {
            horizontalPos = 'left'; // Align to left edge of button
          } else if (rightEdge > cardBounds.right - cardPadding) {
            horizontalPos = 'right'; // Align to right edge of button
          }
        }
      }

      // Determine vertical position (position above if no space below)
      // Force below in modal/grid context, smart positioning in hover context
      const verticalPos = (context === 'modal' || context === 'grid')
        ? 'center' // Always show below buttons in modal/grid
        : (spaceBelow < 150 && spaceAbove > 150 ? 'above' : 'center');

      setPosition(verticalPos === 'above' ? 'above' : horizontalPos);
    }, [isOpen, estimatedDropdownWidth, context]);

    // ResizeObserver for live updates on window resize
    useEffect(() => {
      if (!dropdownRef.current) return;

      const resizeObserver = new ResizeObserver(() => {
        if (isOpen) {
          // Trigger recalculation on resize
          requestAnimationFrame(() => {
            // The positioning effect will re-run due to dependency on isOpen
          });
        }
      });

      resizeObserver.observe(dropdownRef.current);

      return () => resizeObserver.disconnect();
    }, [isOpen]);

    // Position class mapping
    const positionClasses = {
      center: 'left-1/2 -translate-x-1/2',
      left: 'left-0',
      right: 'right-0',
      above: 'bottom-full mb-2 left-1/2 -translate-x-1/2',
    };

    // Region flags for displaying with country codes
    const regionFlags: Record<string, string> = {
      us: '🇺🇸',
      uk: '🇬🇧',
      de: '🇩🇪',
      eu: '🇪🇺',
    };

    // Early return if no links available (after all hooks)
    if (!hasLinks) return null;

    return (
      <div ref={dropdownRef} className="relative">
        <button
          ref={buttonRef}
          onClick={(e) => {
            e.preventDefault();
            onToggle();
          }}
          className="bg-accent-500 hover:bg-accent-600 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 whitespace-nowrap"
          aria-expanded={isOpen}
          aria-haspopup="menu"
          aria-label={`${label} purchase options`}
        >
          {label}
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M2 4l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {isOpen && (
          <div
            className={`absolute ${position === 'above' ? '' : 'top-full mt-2'} ${positionClasses[position]} flex gap-2 z-20 bg-dark-800/95 backdrop-blur-sm p-3 rounded-lg border border-dark-700/50 shadow-xl ${type === 'amazon' ? 'animate-slide-left' : 'animate-slide-right'}`}
            role="menu"
            aria-label={`${label} regions`}
          >
            {Object.entries(links).map(
              ([region, url]) =>
                url && (
                  <a
                    key={region}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    role="menuitem"
                    className="px-4 py-2 bg-accent-500 hover:bg-accent-600 text-white rounded text-sm font-medium transition-colors whitespace-nowrap"
                  >
                    {regionFlags[region]} {region.toUpperCase()}
                  </a>
                )
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className={`glass rounded-xl overflow-hidden hover:bg-dark-800/60 transition-all duration-300 group ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-video bg-dark-800 overflow-hidden">
        {!imageError && product.images[0] ? (
          <img
            src={product.images[0]}
            alt={`${product.brand} ${product.name}`}
            className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-300"
            onError={() => setImageError(true)}
          />
        ) : (
          <FallbackAvatar />
        )}

        {/* Hover Overlay - Affiliate Dropdown Buttons */}
        {isHovered && (
          <div className="absolute inset-0 bg-dark-900/80 flex items-center justify-center p-4 transition-opacity duration-200">
            <div className="flex gap-3">
              <AffiliateDropdown
                type="amazon"
                isOpen={openDropdown === 'amazon'}
                onToggle={() => setOpenDropdown(openDropdown === 'amazon' ? null : 'amazon')}
                links={{
                  us: product.affiliate_urls.us,
                  uk: product.affiliate_urls.uk,
                  de: product.affiliate_urls.de,
                }}
                dropdownRef={amazonDropdownRef}
                context={context}
              />
              <AffiliateDropdown
                type="thrustmaster"
                isOpen={openDropdown === 'thrustmaster'}
                onToggle={() => setOpenDropdown(openDropdown === 'thrustmaster' ? null : 'thrustmaster')}
                links={{
                  us: product.affiliate_urls.thus,
                  uk: product.affiliate_urls.thuk,
                  eu: product.affiliate_urls.theu,
                }}
                dropdownRef={thrustmasterDropdownRef}
                context={context}
              />
            </div>
          </div>
        )}

        {/* Category Badge (top-left) */}
        <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${categoryColors[product.category]} backdrop-blur-sm border`}>
          <span className="inline-flex items-center gap-1.5">
            <CategoryIcon category={product.category} className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{product.category}</span>
          </span>
        </div>

        {/* Price Badge */}
        {(product.price_eur || product.price_label) && (
          <div className="absolute top-3 right-3 bg-white/90 dark:bg-dark-900/80 backdrop-blur-sm text-sky-900 dark:text-accent-400 px-2 py-1 rounded-full text-sm font-semibold border border-slate-300 dark:border-transparent">
            {product.price_eur ? formatPrice(product.price_eur) : product.price_label}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Product Name */}
        <div>
          <h3 className="font-semibold text-dark-100 mb-1 line-clamp-2 group-hover:text-accent-400 transition-colors duration-200">
            {truncateText(product.name, 40)}
          </h3>
        </div>

        {/* Description */}
        <p className="text-sm text-dark-300 line-clamp-2">
          {truncateText(product.description, 40)}
        </p>

        {/* Compatible with */}
        <div className="space-y-2">
          <p className="text-xs text-dark-400 font-medium">Compatible with:</p>
          <div className="flex flex-wrap gap-1">
            {product.sim_support.map((sim) => (
              <span
                key={sim}
                className="px-2 py-1 bg-dark-700/60 text-dark-200 text-xs rounded border border-dark-600/30"
              >
                {sim.replace('MSFS', 'MSFS ').replace('XPL', 'X-Plane ')}
              </span>
            ))}
          </div>
        </div>

        {/* More Details Button */}
        <button
          onClick={handleOpenModal}
          className="w-full mt-4 bg-dark-700/60 hover:bg-dark-700 text-dark-100 py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 focus:ring-offset-dark-900"
        >
          More details
        </button>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onBack={didPushStateRef.current ? handleBack : undefined}
        title={product.name}
      >
        {/* Product Header Info */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <span className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${categoryColors[product.category]} backdrop-blur-sm border`}>
            <span className="inline-flex items-center gap-1.5">
              <CategoryIcon category={product.category} className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{product.category}</span>
            </span>
          </span>
        </div>

        <div className="space-y-6">
          {/* Image */}
          {!imageError && product.images[0] && (
            <div
              className="relative aspect-video bg-dark-900/60 rounded-lg overflow-hidden cursor-zoom-in group/image"
              onClick={() => setIsLightboxOpen(true)}
              title="Click to zoom"
            >
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-contain p-4 transition-transform duration-200 group-hover/image:scale-105"
                onError={() => setImageError(true)}
              />
              {/* Zoom indicator overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover/image:bg-black/20 transition-colors duration-200">
                <div className="opacity-0 group-hover/image:opacity-100 transition-opacity duration-200 bg-dark-800/90 backdrop-blur-sm rounded-full p-3">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold text-dark-100 mb-2">Description</h3>
            <p className="text-dark-300">{product.description}</p>
          </div>

          {/* Platform Compatibility */}
          <div>
            <h3 className="text-lg font-semibold text-dark-100 mb-2">Compatible with</h3>
            <div className="flex flex-wrap gap-2">
              {product.sim_support.map((sim) => (
                <span
                  key={sim}
                  className="px-3 py-1.5 bg-dark-700/60 text-dark-200 text-sm rounded border border-dark-600/30"
                >
                  {sim.replace('MSFS', 'MSFS ').replace('XPL', 'X-Plane ')}
                </span>
              ))}
            </div>
          </div>

          {/* Technical Specifications */}
          {product.key_specs && Object.keys(product.key_specs).length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-dark-100 mb-3">Technical Specifications</h3>
              <div className="bg-dark-900/40 rounded-lg border border-dark-700/50 overflow-hidden">
                <table className="w-full">
                  <tbody className="divide-y divide-dark-700/50">
                    {Object.entries(product.key_specs).map(([key, value]) => (
                      <tr key={key}>
                        <td className="px-4 py-3 text-sm font-medium text-dark-400 w-1/3">{key}</td>
                        <td className="px-4 py-3 text-sm text-dark-200">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Price */}
          {(product.price_eur || product.price_label) && (
            <div className="flex items-baseline gap-2">
              {product.price_eur ? (
                <span className="text-3xl font-bold text-accent-400">{formatPrice(product.price_eur)}</span>
              ) : (
                <span className="text-xl font-semibold text-dark-300">{product.price_label}</span>
              )}
            </div>
          )}

          {/* Affiliate Dropdown Buttons */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-dark-100">Purchase</h3>
            <div className="flex gap-3 justify-start">
              <AffiliateDropdown
                type="amazon"
                isOpen={openDropdown === 'amazon'}
                onToggle={() => setOpenDropdown(openDropdown === 'amazon' ? null : 'amazon')}
                links={{
                  us: product.affiliate_urls.us,
                  uk: product.affiliate_urls.uk,
                  de: product.affiliate_urls.de,
                }}
                dropdownRef={amazonDropdownRef}
                context="modal"
              />
              <AffiliateDropdown
                type="thrustmaster"
                isOpen={openDropdown === 'thrustmaster'}
                onToggle={() => setOpenDropdown(openDropdown === 'thrustmaster' ? null : 'thrustmaster')}
                links={{
                  us: product.affiliate_urls.thus,
                  uk: product.affiliate_urls.thuk,
                  eu: product.affiliate_urls.theu,
                }}
                dropdownRef={thrustmasterDropdownRef}
                context="modal"
              />
            </div>
          </div>
        </div>
      </Modal>

      {/* Lightbox for Image Zoom */}
      <Lightbox
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        imageUrl={product.images[0] || ''}
        imageAlt={`${product.brand} ${product.name}`}
      />
    </div>
  );
};

export default ProductCard;