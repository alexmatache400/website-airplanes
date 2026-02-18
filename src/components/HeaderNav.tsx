import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { listProducts, searchProducts, highlightMatch, type Product } from '../lib/products';
import { CategoryIcon } from './CategoryIcon';

const HeaderNav: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true); // Dark mode is default
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);
  const mobileSuggestionsRef = useRef<HTMLDivElement>(null);
  const suggestionButtonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const navLinks = [
    { label: 'Products', href: '/products' },
    { label: 'Setups', href: '/setups' },
    { label: 'Complete Setup', href: '/complete-setup' },
    { label: 'About Us', href: '/about' },
  ];

  // Initialize theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    } else {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    }
  }, []);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;

      // Check if click is inside desktop search
      const isDesktopSearch =
        (suggestionsRef.current && suggestionsRef.current.contains(target)) ||
        (searchInputRef.current && searchInputRef.current.contains(target));

      // Check if click is inside mobile search
      const isMobileSearch =
        (mobileSuggestionsRef.current && mobileSuggestionsRef.current.contains(target)) ||
        (mobileSearchInputRef.current && mobileSearchInputRef.current.contains(target));

      // Close only if clicked outside both desktop and mobile search
      if (!isDesktopSearch && !isMobileSearch) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // Scroll selected item to center when navigating with arrow keys
  useEffect(() => {
    if (selectedIndex >= 0 && selectedIndex < suggestionButtonRefs.current.length) {
      const selectedButton = suggestionButtonRefs.current[selectedIndex];
      if (selectedButton) {
        selectedButton.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [selectedIndex]);

  // Update suggestions when search query changes
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setSelectedIndex(-1);

    if (value.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Use smart search function with prioritization
    const allProducts = listProducts();
    const results = searchProducts(allProducts, value);

    setSuggestions(results); // Already limited to 10 by searchProducts
    setShowSuggestions(results.length > 0);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Enter') {
        handleSearchSubmit(e);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > -1 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          // Navigate to selected product slug
          const selectedProduct = suggestions[selectedIndex];
          navigate(`/products?q=${encodeURIComponent(selectedProduct.name)}`);
          setShowSuggestions(false);
          setSearchQuery('');
        } else {
          // Navigate to products page with query
          handleSearchSubmit(e);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Handle clicking on a suggestion
  const handleSuggestionClick = (product: Product) => {
    navigate(`/products?q=${encodeURIComponent(product.name)}`);
    setShowSuggestions(false);
    setSearchQuery('');
  };

  // Handle search submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    navigate(`/products?q=${encodeURIComponent(searchQuery)}`);
    setShowSuggestions(false);
    setSearchQuery('');
  };

  // Handle theme toggle
  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);

    if (newTheme) {
      // Switch to dark mode
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      localStorage.setItem('theme', 'dark');
    } else {
      // Switch to light mode
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <header className="sticky top-0 z-50 glass border-b border-dark-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[74px]">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link
                to="/"
                className="flex items-center space-x-2 focus:outline-none"
              >
                <div className="w-9 h-9 bg-gradient-to-br from-accent-400 to-accent-600 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
                  </svg>
                </div>
                <span className="text-xl font-semibold text-dark-100">Pilot Setup</span>
              </Link>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  className="text-dark-300 hover:text-accent-400 px-3 py-3 text-base font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 focus:ring-offset-dark-900 rounded-md"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Search and Compare */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Search */}
            <form onSubmit={handleSearchSubmit} className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => searchQuery.length >= 2 && suggestions.length > 0 && setShowSuggestions(true)}
                className="glass-light pl-10 pr-4 py-3 w-64 text-base text-dark-100 placeholder-dark-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
              />

              {/* Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div
                  ref={suggestionsRef}
                  className="absolute top-full mt-2 w-full bg-dark-800 border border-dark-700 rounded-lg shadow-lg max-h-[280px] overflow-y-auto z-50"
                >
                  {suggestions.map((product, index) => (
                    <button
                      key={product.id}
                      ref={(el) => { suggestionButtonRefs.current[index] = el; }}
                      type="button"
                      onClick={() => handleSuggestionClick(product)}
                      className={`w-full text-left px-4 py-3 text-sm flex items-center gap-3 transition-colors border-b border-dark-700/50 last:border-0 ${
                        index === selectedIndex
                          ? 'bg-dark-700 text-dark-100'
                          : 'text-dark-300 hover:bg-dark-700/70'
                      }`}
                    >
                      <div className="w-10 h-10 flex-shrink-0 rounded bg-dark-700/40 flex items-center justify-center overflow-hidden">
                        {product.images[0] ? (
                          <img src={product.images[0]} alt="" className="w-full h-full object-contain p-1" />
                        ) : (
                          <CategoryIcon category={product.category} className="w-5 h-5 opacity-40" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-dark-100 truncate">{highlightMatch(product.name, searchQuery)}</div>
                        <div className="text-xs text-dark-400 mt-0.5">
                          {product.brand} · {product.category}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </form>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 text-dark-300 hover:text-accent-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 focus:ring-offset-dark-900 rounded-md"
              aria-label="Toggle theme"
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? (
                // Sun icon for light mode
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                // Moon icon for dark mode
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2.5 text-dark-300 hover:text-accent-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 focus:ring-offset-dark-900 rounded-md"
            >
              <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-dark-700/50">
              {/* Mobile Search */}
              <div className="relative z-50 mb-4">
                <form onSubmit={handleSearchSubmit} className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  ref={mobileSearchInputRef}
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => searchQuery.length >= 2 && suggestions.length > 0 && setShowSuggestions(true)}
                  className="glass-light pl-10 pr-4 py-3 w-full text-base text-dark-100 placeholder-dark-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                />

                {/* Mobile Suggestions Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div ref={mobileSuggestionsRef} className="absolute top-full mt-2 w-full bg-dark-800 border border-dark-700 rounded-lg shadow-lg max-h-[280px] overflow-y-auto z-[60]">
                    {suggestions.map((product, index) => (
                      <button
                        key={product.id}
                        ref={(el) => { suggestionButtonRefs.current[index] = el; }}
                        type="button"
                        onClick={() => {
                          handleSuggestionClick(product);
                          setIsMenuOpen(false);
                        }}
                        className={`w-full text-left px-4 py-3 text-sm transition-colors border-b border-dark-700/50 last:border-0 ${
                          index === selectedIndex
                            ? 'bg-dark-700 text-dark-100'
                            : 'text-dark-300 hover:bg-dark-700/70'
                        }`}
                      >
                        <div className="font-medium text-dark-100">{highlightMatch(product.name, searchQuery)}</div>
                        <div className="text-xs text-dark-400 mt-1">
                          {product.brand} · {product.category}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </form>
            </div>

              {/* Mobile Navigation Links */}
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  className="text-dark-300 hover:text-accent-400 block px-3 py-2 text-base font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 focus:ring-offset-dark-900 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}

              {/* Mobile Theme Toggle */}
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-dark-300 text-base font-medium">Theme</span>
                <button
                  onClick={toggleTheme}
                  className="p-2.5 text-dark-300 hover:text-accent-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 focus:ring-offset-dark-900 rounded-md"
                  aria-label="Toggle theme"
                >
                  {isDarkMode ? (
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  ) : (
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default HeaderNav;