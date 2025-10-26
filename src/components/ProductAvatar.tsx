import React from 'react';

/**
 * Fallback SVG avatar for products when image is missing
 * Shows a generic joystick/throttle silhouette
 */
const ProductAvatar: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`bg-gray-700 flex items-center justify-center ${className}`}>
      <svg
        className="w-24 h-24 text-gray-500"
        fill="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Joystick/HOTAS silhouette */}
        <path d="M12 2C10.9 2 10 2.9 10 4V10H8C6.9 10 6 10.9 6 12V20C6 21.1 6.9 22 8 22H16C17.1 22 18 21.1 18 20V12C18 10.9 17.1 10 16 10H14V4C14 2.9 13.1 2 12 2M12 4C12.55 4 13 4.45 13 5C13 5.55 12.55 6 12 6C11.45 6 11 5.55 11 5C11 4.45 11.45 4 12 4M12 7C13.1 7 14 7.9 14 9C14 10.1 13.1 11 12 11C10.9 11 10 10.1 10 9C10 7.9 10.9 7 12 7Z" />
        {/* Throttle base */}
        <path d="M8 12H16V14H8V12M8 15H16V17H8V15M10 18H14V20H10V18Z" opacity="0.7" />
      </svg>
    </div>
  );
};

export default ProductAvatar;
