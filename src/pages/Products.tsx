import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { listProducts, findProductByName, type Product } from '../lib/products';
import ProductCard from '../components/ProductCard';
import { CustomDropdown, type DropdownOption } from '../components/CustomDropdown';
import { useData } from '../lib/DataProvider';
import { PageBackground } from '../components/PageBackground';
import { useDocumentHead } from '../hooks/useDocumentHead';

const Products: React.FC = () => {
  useDocumentHead({
    title: 'Flight Sim Hardware — HOTAS, Joysticks, Throttles & More | Pilot Setup',
    description: 'Browse curated flight simulator hardware: HOTAS, joysticks, throttles, pedals, panels and more for MSFS 2020/2024 and X-Plane 11/12.',
    canonical: '/products',
  });
  const [searchParams] = useSearchParams();
  const [allProducts] = useState<Product[]>(listProducts());
  const { categories, roleTypes } = useData();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('All');
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const productRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Filter products by category and role
  // Universal products always show regardless of role selection
  // Empty selection shows all products
  const products = allProducts.filter(p => {
    // Category filter: if no categories selected, show all; otherwise show matching categories (OR logic)
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(p.category);
    const matchesRole = selectedRole === 'All' || p.roleType === selectedRole || p.roleType === 'Universal';

    return matchesCategory && matchesRole;
  });

  // Category dropdown options — built dynamically from DB categories
  const categoryOptions: DropdownOption[] = useMemo(() => {
    const dynamicOptions = categories.map(cat => ({
      value: cat.name,
      label: cat.name,
      icon: cat.name.toLowerCase(),
      count: allProducts.filter(p => p.category === cat.name).length,
    }));

    // Filter out categories with 0 products, prepend "All" option
    return [
      { value: 'All', label: 'All Products', count: allProducts.length },
      ...dynamicOptions.filter(opt => opt.count > 0),
    ];
  }, [allProducts, categories]);

  // Role dropdown options — built dynamically from DB role_types
  const roleOptions: DropdownOption[] = useMemo(() => {
    const categoryFilter = (p: Product) => selectedCategories.length === 0 || selectedCategories.includes(p.category);

    return [
      {
        value: 'All',
        label: 'All Roles',
        count: allProducts.filter(categoryFilter).length
      },
      ...roleTypes
        .filter(rt => rt.name !== 'Universal')
        .map(rt => ({
          value: rt.name,
          label: rt.name,
          icon: rt.name.toLowerCase(),
          count: allProducts.filter(p => categoryFilter(p) && (p.roleType === rt.name || p.roleType === 'Universal')).length
        })),
    ];
  }, [allProducts, selectedCategories, roleTypes]);

  // Inject ItemList schema for the currently visible products
  useEffect(() => {
    const BASE_URL = 'https://pilotsetup.com';
    const itemListSchema = {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Flight Simulator Hardware',
      url: `${BASE_URL}/products`,
      numberOfItems: allProducts.length,
      itemListElement: allProducts.slice(0, 50).map((p, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        item: {
          '@type': 'Product',
          name: p.name,
          description: p.description,
          brand: { '@type': 'Brand', name: p.brand },
          ...(p.images[0] ? { image: p.images[0] } : {}),
          ...(p.price_label ? { offers: { '@type': 'Offer', priceSpecification: { '@type': 'PriceSpecification', description: p.price_label } } } : {}),
        },
      })),
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'schema-products-itemlist';
    script.text = JSON.stringify(itemListSchema);
    document.head.appendChild(script);

    return () => {
      document.getElementById('schema-products-itemlist')?.remove();
    };
  }, [allProducts]);

  // Handle search query or highlight from URL
  useEffect(() => {
    const query = searchParams.get('q');
    const highlightSlug = searchParams.get('highlight');

    // Determine which parameter to use (highlight takes precedence)
    const searchTerm = highlightSlug || query;
    if (!searchTerm) {
      setHighlightedId(null);
      return;
    }

    // Find matching product
    const matchedProduct = highlightSlug
      ? allProducts.find(p => p.slug === highlightSlug)
      : findProductByName(allProducts, query!);
    if (!matchedProduct) {
      setHighlightedId(null);
      return;
    }

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
      const timeoutId = setTimeout(() => {
        setHighlightedId(null);
      }, 5000);

      // Cleanup function: Clear timeout when effect re-runs or unmounts
      return () => {
        clearTimeout(timeoutId);
      };
    } else {
      setHighlightedId(null);
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
      <PageBackground />

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

        {/* Filter Section - Category + Role */}
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
                onChange={(value) => setSelectedRole(Array.isArray(value) ? value[0] : value)}
                options={roleOptions}
                placeholder="-- Select role --"
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
              className={`transition-all h-full ${
                highlightedId === product.id ? 'pulse-5s' : ''
              }`}
            >
              <ProductCard product={product} context="grid" />
            </div>
          ))}
        </div>

        {/* Product Count - Bottom */}
        <div className="mt-8 text-center">
          <p className="text-sm text-slate-400">
            Showing {products.length} {
              selectedCategories.length === 0
                ? 'products'
                : `products (${selectedCategories.length} ${selectedCategories.length === 1 ? 'category' : 'categories'})`
            }
          </p>
        </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
