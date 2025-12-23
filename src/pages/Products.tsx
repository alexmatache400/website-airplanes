import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { listProducts, findProductByName, type Product } from '../lib/products';
import ProductCard from '../components/ProductCard';
import { CustomDropdown, type DropdownOption } from '../components/CustomDropdown';

type Category = 'All' | 'HOTAS' | 'Throttle' | 'Joystick' | 'Pedals' | 'Panel' | 'Bundle' | 'MCDU' | 'Rudder' | 'Base' | 'Accessories';
type RoleType = 'All' | 'Pilot' | 'Copilot';

const Products: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [allProducts] = useState<Product[]>(listProducts());
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState<RoleType>('All');
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

  // Filter products by category and role
  // Universal products always show regardless of role selection
  // Empty selection shows all products
  const products = allProducts.filter(p => {
    // Category filter: if no categories selected, show all; otherwise show matching categories (OR logic)
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(p.category);
    const matchesRole = selectedRole === 'All' || p.roleType === selectedRole || p.roleType === 'Universal';

    return matchesCategory && matchesRole;
  });

  // Category dropdown options with icons
  const categoryOptions: DropdownOption[] = useMemo(() => {
    const allOptions = [
      { value: 'All', label: 'All Products', count: allProducts.length },
      { value: 'HOTAS', label: 'HOTAS', icon: 'hotas', count: allProducts.filter(p => p.category === 'HOTAS').length },
      { value: 'Throttle', label: 'Throttle', icon: 'throttle', count: allProducts.filter(p => p.category === 'Throttle').length },
      { value: 'Joystick', label: 'Joystick', icon: 'joystick', count: allProducts.filter(p => p.category === 'Joystick').length },
      { value: 'Pedals', label: 'Pedals', icon: 'pedals', count: allProducts.filter(p => p.category === 'Pedals').length },
      { value: 'Panel', label: 'Panel', icon: 'panel', count: allProducts.filter(p => p.category === 'Panel').length },
      { value: 'MCDU', label: 'MCDU', icon: 'mcdu', count: allProducts.filter(p => p.category === 'MCDU').length },
      { value: 'Rudder', label: 'Rudder', icon: 'rudder', count: allProducts.filter(p => p.category === 'Rudder').length },
      { value: 'Base', label: 'Base', icon: 'base', count: allProducts.filter(p => p.category === 'Base').length },
      { value: 'Accessories', label: 'Accessories', icon: 'accessories', count: allProducts.filter(p => p.category === 'Accessories').length },
      { value: 'Bundle', label: 'Bundle', icon: 'bundles', count: allProducts.filter(p => p.category === 'Bundle').length },
    ];

    // Filter out categories with 0 products (keep "All" option)
    return allOptions.filter(opt => opt.value === 'All' || (opt.count && opt.count > 0));
  }, [allProducts]);

  // Role dropdown options with icons
  const roleOptions: DropdownOption[] = useMemo(() => {
    const categoryFilter = (p: Product) => selectedCategories.length === 0 || selectedCategories.includes(p.category);

    return [
      {
        value: 'All',
        label: 'All Roles',
        count: allProducts.filter(categoryFilter).length
      },
      {
        value: 'Pilot',
        label: 'Pilot',
        icon: 'pilot',
        count: allProducts.filter(p => categoryFilter(p) && (p.roleType === 'Pilot' || p.roleType === 'Universal')).length
      },
      {
        value: 'Copilot',
        label: 'Copilot',
        icon: 'copilot',
        count: allProducts.filter(p => categoryFilter(p) && (p.roleType === 'Copilot' || p.roleType === 'Universal')).length
      },
    ];
  }, [allProducts, selectedCategories]);

  // Handle search query from URL
  useEffect(() => {
    const query = searchParams.get('q');
    if (!query) return;

    // Find matching product in all products
    const matchedProduct = findProductByName(allProducts, query);
    if (!matchedProduct) return;

    // Reset category filter to show the matched product
    setSelectedCategories([]);

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
            Premium Equipment chosen by pilots for pilots
          </p>
        </div>

        {/* Filter Section - Category and Role */}
        <div className="mb-8 max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Select Flight Gear Dropdown */}
            <div>
              <label
                id="category-select-label"
                htmlFor="category-select"
                className="block text-lg font-medium text-dropdown-text mb-3"
              >
                Select Flight Gear
              </label>
              <CustomDropdown
                id="category-select"
                value={selectedCategories}
                onChange={(value) => setSelectedCategories(value as string[])}
                options={categoryOptions}
                placeholder="-- Select categories --"
                multiSelect={true}
              />
            </div>

            {/* Your Role Dropdown */}
            <div>
              <label
                id="role-select-label"
                htmlFor="role-select"
                className="block text-lg font-medium text-dropdown-text mb-3"
              >
                Your Role
              </label>
              <CustomDropdown
                id="role-select"
                value={selectedRole}
                onChange={(value) => setSelectedRole(value as RoleType)}
                options={roleOptions}
                placeholder="-- Select a role --"
              />
            </div>
          </div>
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

        {/* Product Count - Bottom */}
        <div className="mt-8 text-center">
          <p className="text-sm text-slate-400">
            Showing {products.length} {
              selectedCategories.length === 0 && selectedRole === 'All'
                ? 'products'
                : selectedCategories.length === 0
                ? `products for ${selectedRole}`
                : selectedRole === 'All'
                ? `products (${selectedCategories.length} ${selectedCategories.length === 1 ? 'category' : 'categories'})`
                : `products (${selectedCategories.length} ${selectedCategories.length === 1 ? 'category' : 'categories'}, ${selectedRole})`
            }
          </p>
        </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
