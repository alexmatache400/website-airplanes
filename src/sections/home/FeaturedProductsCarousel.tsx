import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../../components/ProductCard';
import InfiniteCarousel from '../../components/carousel/InfiniteCarousel';
import { listProducts } from '../../lib/products';

interface FeaturedProductsCarouselProps {
  /** Limit number of products to display (default: all) */
  limit?: number;

  /** Additional CSS classes */
  className?: string;
}

/**
 * Featured Products Carousel Section
 *
 * Displays all products from the catalog in an infinite auto-scrolling carousel.
 * Replaces the previous static 3-product grid with a dynamic, engaging showcase.
 *
 * Features:
 * - Fetches products from the same catalog used on /products page
 * - Reuses ProductCard component (maintains badges, price, chips, CTA)
 * - Infinite scroll with seamless looping
 * - Pause on hover, drag support, keyboard navigation
 * - Fully accessible
 * - Graceful fallback to static grid if JS disabled
 *
 * @example
 * <FeaturedProductsCarousel />
 */
export const FeaturedProductsCarousel: React.FC<FeaturedProductsCarouselProps> = ({
  limit,
  className = '',
}) => {
  // Fetch all products from catalog (same data as Products page)
  const products = useMemo(() => {
    const allProducts = listProducts();
    return limit ? allProducts.slice(0, limit) : allProducts;
  }, [limit]);

  // Pre-render ProductCard components
  const productCards = useMemo(
    () =>
      products.map((product) => (
        <ProductCard key={product.id} product={product} />
      )),
    [products]
  );

  // Fallback for no products
  if (products.length === 0) {
    return (
      <section className={`py-16 px-4 sm:px-6 lg:px-8 ${className}`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-dark-100 mb-4">
              Featured Products
            </h2>
            <p className="text-lg text-dark-300">
              No products available at this time.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`py-16 px-4 sm:px-6 lg:px-8 ${className}`}>
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-dark-100 mb-4">
            Featured Products
          </h2>
          <p className="text-lg text-dark-300 max-w-2xl mx-auto">
            Handpicked flight sim hardware from top brands, tested and recommended by our community.
          </p>
        </div>

        {/* Infinite Carousel */}
        <InfiniteCarousel
          items={productCards}
          autoplay={true}
          speed={70}
          gap={24}
          ariaLabel="Featured products carousel"
          onReachEnd={() => {
            // Optional: Track carousel cycles for analytics
            if (typeof window !== 'undefined' && (window as any).gtag) {
              (window as any).gtag('event', 'carousel_cycle', {
                event_category: 'engagement',
                event_label: 'featured_products',
              });
            }
          }}
        />

        {/* View All Products CTA */}
        <div className="text-center mt-12">
          <Link
            to="/products"
            className="inline-block bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 focus:ring-offset-dark-950"
          >
            View All Products
          </Link>
        </div>

        {/* Fallback for no-JS: Static grid (hidden when JS is enabled) */}
        <noscript>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.slice(0, 3).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </noscript>
      </div>
    </section>
  );
};

export default FeaturedProductsCarousel;
