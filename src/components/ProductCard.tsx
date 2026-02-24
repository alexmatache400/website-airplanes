import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Product } from '../lib/products';
import { useData } from '../lib/DataProvider';
import Modal from './Modal';
import Lightbox from './Lightbox';
import { CategoryIcon } from './CategoryIcon';
import { getCategoryColor } from '../lib/category-config';
import { useClickOutside } from '../hooks/useClickOutside';
import { AffiliateDropdown } from './AffiliateDropdown';

interface ProductCardProps {
  product: Product;
  className?: string;
  context?: 'hover' | 'modal' | 'grid';
  fromCarousel?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  className = '',
  context = 'hover',
  fromCarousel = false
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const didPushStateRef = useRef(false);
  const dropdownRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const dropdownMenuRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const { affiliatePrograms } = useData();

  // Programs that have at least one link for this product
  const activePrograms = useMemo(() =>
    affiliatePrograms.filter(prog => {
      const links = product.affiliate_urls[prog.name];
      return links && Object.values(links).some(Boolean);
    }),
    [affiliatePrograms, product.affiliate_urls]
  );

  // Callback ref helpers for dynamic ref maps
  const setDropdownRef = useCallback((name: string) => (el: HTMLDivElement | null) => {
    if (el) dropdownRefs.current.set(name, el);
    else dropdownRefs.current.delete(name);
  }, []);

  const setDropdownMenuRef = useCallback((name: string) => (el: HTMLDivElement | null) => {
    if (el) dropdownMenuRefs.current.set(name, el);
    else dropdownMenuRefs.current.delete(name);
  }, []);

  // Helper function to truncate text to specified length
  const truncateText = (text: string, maxLength: number = 100): string => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim() + '...';
  };

  // Check if this product's modal should be open based on URL
  const isModalOpen = searchParams.get('modal') === product.slug;

  // Open modal by adding query param
  const handleOpenModal = () => {
    // Carousel context: Navigate to Products page with highlight + modal
    if (fromCarousel) {
      navigate(`/products?highlight=${product.slug}&modal=${product.slug}`, { replace: false });
      return;
    }

    // Standard context: Open modal with query param on current page
    const newParams = new URLSearchParams(searchParams);
    newParams.set('modal', product.slug);
    newParams.set('highlight', product.slug); // Sync highlight with modal to ensure pulse follows current modal
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
      // Remove both modal and highlight params
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('modal');
      newParams.delete('highlight');
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
  useClickOutside(
    useCallback(() => Array.from(dropdownRefs.current.values()), []),
    useCallback(() => setOpenDropdown(null), []),
    openDropdown !== null
  );

  // Auto-scroll to dropdown options when expanded in modal
  useEffect(() => {
    // Only auto-scroll when a dropdown is open AND we're in modal context
    if (openDropdown !== null && isModalOpen) {
      // Get the modal's scrollable body container
      const modalBody = document.querySelector('[role="dialog"] .overflow-y-auto');

      // Get the active dropdown menu element from the ref map
      const activeMenuEl = dropdownMenuRefs.current.get(openDropdown);

      if (modalBody && activeMenuEl) {
        // Check if user prefers reduced motion
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // Wait for dropdown animation to complete (200ms + 50ms buffer)
        setTimeout(() => {
          activeMenuEl.scrollIntoView({
            behavior: prefersReducedMotion ? 'auto' : 'smooth',
            block: 'nearest',
            inline: 'nearest'
          });
        }, 250);
      }
    }
  }, [openDropdown, isModalOpen]);


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

  return (
    <div
      className={`glass rounded-xl overflow-hidden hover:bg-dark-800/60 transition-all duration-300 group flex flex-col h-full ${className}`}
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
              {activePrograms.map((prog, i) => (
                <AffiliateDropdown
                  key={prog.name}
                  program={prog}
                  index={i}
                  totalCount={activePrograms.length}
                  isOpen={openDropdown === prog.name}
                  onToggle={() => setOpenDropdown(openDropdown === prog.name ? null : prog.name)}
                  links={product.affiliate_urls[prog.name] || {}}
                  onDropdownRef={setDropdownRef(prog.name)}
                  context={context}
                />
              ))}
            </div>
          </div>
        )}

        {/* Category Badge (top-left) */}
        <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getCategoryColor(product.category)} backdrop-blur-sm border`}>
          <span className="inline-flex items-center gap-1.5">
            <CategoryIcon category={product.category} className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{product.category}</span>
          </span>
        </div>

        {/* Price Badge */}
        {product.price_label && (
          <div className="absolute top-3 right-3 bg-white/90 dark:bg-dark-900/80 backdrop-blur-sm text-sky-900 dark:text-accent-400 px-2 py-1 rounded-full text-sm font-semibold border border-slate-300 dark:border-transparent">
            {product.price_label}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        {/* Product Name */}
        <div className="min-h-[3rem]">
          <h3 className="font-semibold text-dark-100 line-clamp-2 group-hover:text-accent-400 transition-colors duration-200">
            {product.name}
          </h3>
        </div>

        {/* Description */}
        <p className="text-sm text-dark-300 line-clamp-3 min-h-[3.75rem]">
          {truncateText(product.description, 150)}
        </p>

        {/* Compatible with */}
        <div>
          <p className="text-xs text-dark-400 font-medium mb-1.5">Compatible with:</p>
          <div className="flex flex-wrap gap-1 max-h-[1.75rem] overflow-hidden">
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
          className="w-full mt-auto bg-dark-700/60 hover:bg-dark-700 text-dark-100 py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 focus:ring-offset-dark-900"
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
          <span className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getCategoryColor(product.category)} backdrop-blur-sm border`}>
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
          {product.price_label && (
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-semibold text-dark-300">{product.price_label}</span>
            </div>
          )}

          {/* Affiliate Dropdown Buttons */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-dark-100">Purchase</h3>
            <div className="flex gap-3 justify-start">
              {activePrograms.map((prog, i) => (
                <AffiliateDropdown
                  key={prog.name}
                  program={prog}
                  index={i}
                  totalCount={activePrograms.length}
                  isOpen={openDropdown === prog.name}
                  onToggle={() => setOpenDropdown(openDropdown === prog.name ? null : prog.name)}
                  links={product.affiliate_urls[prog.name] || {}}
                  onDropdownRef={setDropdownRef(prog.name)}
                  onDropdownMenuRef={setDropdownMenuRef(prog.name)}
                  context="modal"
                />
              ))}
            </div>
            {activePrograms.length > 0 && (
              <p className="text-xs text-dark-400">
                Affiliate links — we may earn a commission at no extra cost to you.
              </p>
            )}
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