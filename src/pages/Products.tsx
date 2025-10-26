import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { listProducts, findProductByName, type Product } from '../lib/products';
import ProductCard from '../components/ProductCard';

type Category = 'All' | 'HOTAS' | 'Throttle' | 'Joystick' | 'Pedals' | 'Panel' | 'Mount' | 'Accessory' | 'Bundle';

const Products: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [allProducts] = useState<Product[]>(listProducts());
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const productRefs = useRef<Map<string, HTMLDivElement>>(new Map());
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

  // Filter products by category
  const products = selectedCategory === 'All'
    ? allProducts
    : allProducts.filter(p => p.category === selectedCategory);

  // Handle search query from URL
  useEffect(() => {
    const query = searchParams.get('q');
    if (!query) return;

    // Find matching product in all products
    const matchedProduct = findProductByName(allProducts, query);
    if (!matchedProduct) return;

    // Reset category filter to show the matched product
    setSelectedCategory('All');

    // Scroll to product
    const element = productRefs.current.get(matchedProduct.slug);
    if (element) {
      setTimeout(() => {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);

      // Highlight for 5 seconds
      setHighlightedId(matchedProduct.id);
      setTimeout(() => {
        setHighlightedId(null);
      }, 5000);
    }
  }, [searchParams, allProducts]);

  // Set product ref
  const setProductRef = (slug: string) => (el: HTMLDivElement | null) => {
    if (el) {
      productRefs.current.set(slug, el);
    } else {
      productRefs.current.delete(slug);
    }
  };

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
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-3">
            Flight Sim Hardware
          </h1>
          <p className="text-slate-400 text-lg">
            Premium HOTAS, pedals, and panels for serious sim pilots
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-8 max-w-2xl mx-auto">
          <label
            htmlFor="category-select"
            className="block text-lg font-medium text-dropdown-text mb-3"
          >
            Filter by Product Type
          </label>
          <select
            id="category-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as Category)}
            className="w-full bg-dropdown-bg text-dropdown-text border-2 border-dropdown-border rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-dropdown-focus-ring focus:border-transparent hover:bg-dropdown-hover-bg transition-colors appearance-none cursor-pointer"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='none' stroke='%23cbd5e1' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' d='M2 4l4 4 4-4'/%3E%3C/svg%3E")`,
              backgroundPosition: 'right 1rem center',
              backgroundRepeat: 'no-repeat',
              paddingRight: '2.5rem'
            }}
          >
            <option value="All">All Products ({allProducts.length})</option>
            <option value="HOTAS">🕹️ HOTAS ({allProducts.filter(p => p.category === 'HOTAS').length})</option>
            <option value="Throttle">🎚️ Throttle ({allProducts.filter(p => p.category === 'Throttle').length})</option>
            <option value="Joystick">🎮 Joystick ({allProducts.filter(p => p.category === 'Joystick').length})</option>
            <option value="Pedals">🦶 Pedals ({allProducts.filter(p => p.category === 'Pedals').length})</option>
            <option value="Panel">📱 Panel ({allProducts.filter(p => p.category === 'Panel').length})</option>
            <option value="Mount">🔧 Mount ({allProducts.filter(p => p.category === 'Mount').length})</option>
            <option value="Accessory">⚙️ Accessory ({allProducts.filter(p => p.category === 'Accessory').length})</option>
            <option value="Bundle">📦 Bundle ({allProducts.filter(p => p.category === 'Bundle').length})</option>
          </select>
        </div>

        {/* Product Count */}
        <div className="mb-6 text-center">
          <p className="text-sm text-slate-400">
            Showing {products.length} {selectedCategory === 'All' ? 'products' : `${selectedCategory} products`}
          </p>
        </div>

        {/* 2-per-row grid on md+, 1 per row on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              id={product.slug}
              ref={setProductRef(product.slug)}
              className={`transition-all ${
                highlightedId === product.id ? 'pulse-5s' : ''
              }`}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
