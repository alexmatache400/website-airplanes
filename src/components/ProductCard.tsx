import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Product } from '../lib/products';
import Modal from './Modal';
import Lightbox from './Lightbox';

interface ProductCardProps {
  product: Product;
  className?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  className = ''
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const didPushStateRef = useRef(false);

  // Category-based colors
  const categoryColors = {
    HOTAS: 'from-sky-500/20 to-blue-600/20 border-sky-500/30 text-sky-300',
    Throttle: 'from-teal-500/20 to-teal-600/20 border-teal-500/30 text-teal-300',
    Joystick: 'from-indigo-500/20 to-indigo-600/20 border-indigo-500/30 text-indigo-300',
    Pedals: 'from-cyan-500/20 to-cyan-600/20 border-cyan-500/30 text-cyan-300',
    Panel: 'from-violet-500/20 to-violet-600/20 border-violet-500/30 text-violet-300',
    Mount: 'from-emerald-500/20 to-emerald-600/20 border-emerald-500/30 text-emerald-300',
    Accessory: 'from-slate-500/20 to-slate-600/20 border-slate-500/30 text-slate-300',
    Bundle: 'from-purple-500/20 to-purple-600/20 border-purple-500/30 text-purple-300',
  };

  const categoryIcons = {
    HOTAS: '🕹️',
    Throttle: '🎚️',
    Joystick: '🎮',
    Pedals: '🦶',
    Panel: '📱',
    Mount: '🔧',
    Accessory: '⚙️',
    Bundle: '📦',
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
        <div className="text-4xl opacity-40">{categoryIcons[product.category]}</div>
        <div className="text-sm text-dark-400">{product.category}</div>
      </div>
    </div>
  );

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

        {/* Hover Overlay - Affiliate Buttons */}
        {isHovered && (
          <div className="absolute inset-0 bg-dark-900/80 flex items-center justify-center gap-2 transition-opacity duration-200 flex-wrap p-4">
            {product.affiliate_urls.winwingsim && (
              <a
                href={product.affiliate_urls.winwingsim}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-accent-500 hover:bg-accent-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
              >
                Winwing
              </a>
            )}
            {product.affiliate_urls.eu && (
              <a
                href={product.affiliate_urls.eu}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-accent-500 hover:bg-accent-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
              >
                {product.brand === 'Winwing' && !product.affiliate_urls.winwingsim ? 'Winwing' : 'Amazon UK'}
              </a>
            )}
            {product.affiliate_urls.us && (
              <a
                href={product.affiliate_urls.us}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-accent-500 hover:bg-accent-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
              >
                Amazon US
              </a>
            )}
          </div>
        )}

        {/* Category Badge (top-left) */}
        <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${categoryColors[product.category]} backdrop-blur-sm border`}>
          {categoryIcons[product.category]} {product.category}
        </div>

        {/* Price Badge */}
        {(product.price_eur || product.price_label) && (
          <div className="absolute top-3 right-3 bg-dark-900/80 backdrop-blur-sm text-accent-400 px-2 py-1 rounded-full text-sm font-semibold">
            {product.price_eur ? formatPrice(product.price_eur) : product.price_label}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Product Name */}
        <div>
          <h3 className="font-semibold text-dark-100 mb-1 line-clamp-2 group-hover:text-accent-400 transition-colors duration-200">
            {product.name}
          </h3>
        </div>

        {/* Description */}
        <p className="text-sm text-dark-300 line-clamp-2">
          {product.description}
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
            {categoryIcons[product.category]} {product.category}
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

          {/* Affiliate Buttons */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-dark-100">Purchase</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              {product.affiliate_urls.winwingsim && (
                <a
                  href={product.affiliate_urls.winwingsim}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-accent-500 hover:bg-accent-600 text-white py-3 px-6 rounded-lg text-sm font-medium transition-colors duration-200 text-center focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 focus:ring-offset-dark-800"
                >
                  Winwing
                </a>
              )}
              {product.affiliate_urls.eu && (
                <a
                  href={product.affiliate_urls.eu}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-accent-500 hover:bg-accent-600 text-white py-3 px-6 rounded-lg text-sm font-medium transition-colors duration-200 text-center focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 focus:ring-offset-dark-800"
                >
                  {product.brand === 'Winwing' && !product.affiliate_urls.winwingsim ? 'Winwing' : 'Amazon UK'}
                </a>
              )}
              {product.affiliate_urls.us && (
                <a
                  href={product.affiliate_urls.us}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-accent-500 hover:bg-accent-600 text-white py-3 px-6 rounded-lg text-sm font-medium transition-colors duration-200 text-center focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 focus:ring-offset-dark-800"
                >
                  Amazon US
                </a>
              )}
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