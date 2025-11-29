import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, X, Dice5, Lock, Unlock, Shuffle } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { listProducts, searchProducts, highlightMatch, filterProductsByFamily, type Product, type Tier } from '../lib/products';
import { listAircraft, type AircraftPreset } from '../lib/aircraft';
import { generateSuggestions, replaceSuggestion, hasReplacementOptions, type SuggestionResult } from '../lib/suggestions';
import { CustomDropdown, type DropdownOption } from '../components/CustomDropdown';

type RoleType = '' | 'Pilot' | 'Copilot';

const CompleteSetup: React.FC = () => {
  // State management
  const [selectedAircraft, setSelectedAircraft] = useState<AircraftPreset | null>(null);
  const [selectedRole, setSelectedRole] = useState<RoleType>('');
  const [selectedTier, setSelectedTier] = useState<Tier>('Business');
  const [ownedGear, setOwnedGear] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [result, setResult] = useState<SuggestionResult | null>(null);
  const [lockedProducts, setLockedProducts] = useState<Map<string, Product>>(new Map());
  const [seed, setSeed] = useState<string>('');

  // Refs
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Load data
  const allAircraft = listAircraft();
  const allProducts = listProducts();

  // Load role from localStorage on mount
  useEffect(() => {
    const savedRole = localStorage.getItem('completesetup_selectedRole');
    if (savedRole && (savedRole === '' || savedRole === 'Pilot' || savedRole === 'Copilot')) {
      setSelectedRole(savedRole as RoleType);
    }
  }, []);

  // Role change handler
  const handleRoleChange = (value: string | string[]) => {
    const stringValue = Array.isArray(value) ? value[0] : value;
    const roleValue = stringValue as RoleType;
    setSelectedRole(roleValue);
    localStorage.setItem('completesetup_selectedRole', roleValue);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handlers
  const handleAddGear = (product: Product) => {
    if (!ownedGear.find(g => g.id === product.id)) {
      setOwnedGear([...ownedGear, product]);
    }
    // Clear search state and close dropdown
    setSearchQuery('');
    setSearchSuggestions([]);
    setShowSuggestions(false);
    searchInputRef.current?.focus();
  };

  const handleRemoveGear = (productId: string) => {
    setOwnedGear(ownedGear.filter(g => g.id !== productId));
  };

  const handleGenerate = () => {
    if (!selectedAircraft) return;

    const newSeed = seed || Date.now().toString();
    setSeed(newSeed);

    const generatedResult = generateSuggestions({
      aircraft: selectedAircraft,
      tier: selectedTier,
      owned: ownedGear,
      allProducts,
      seed: newSeed,
      lockedSuggestions: lockedProducts,
      roleType: selectedRole || undefined,
    });

    setResult(generatedResult);
  };

  const handleShuffleAll = () => {
    if (!selectedAircraft || !result) return;

    // Create a copy of current suggestions
    let updatedSuggestions = [...result.suggestions];

    // Iterate through each product and replace if:
    // 1. Not locked
    // 2. Has replacement options available (canBeReplaced)
    result.suggestions.forEach((product, index) => {
      const locked = isLocked(product);
      const hasAlternatives = canBeReplaced(product);

      // Only shuffle if not locked AND has alternatives
      if (!locked && hasAlternatives) {
        // Use the same excludeIds logic as handleReplace
        const excludeIds = new Set([product.id]);

        // Get a replacement using the same logic as individual dice
        const replacement = replaceSuggestion(
          result.suggestions,
          product.category,
          {
            aircraft: selectedAircraft,
            tier: selectedTier,
            owned: ownedGear,
            allProducts,
            seed: seed + product.id + Date.now() + Math.random(),
            roleType: selectedRole || undefined,
          },
          excludeIds
        );

        // Update the suggestion if replacement found
        if (replacement) {
          updatedSuggestions[index] = replacement;
        }
      }
    });

    // Update result with new suggestions
    setResult({
      ...result,
      suggestions: updatedSuggestions,
    });
  };

  const handleReplace = (product: Product) => {
    if (!selectedAircraft || !result) return;

    const currentSuggestions = result.suggestions;
    const excludeIds = new Set(lockedProducts.values()).has(product)
      ? new Set<string>()
      : new Set([product.id]);

    const replacement = replaceSuggestion(
      currentSuggestions,
      product.category,
      {
        aircraft: selectedAircraft,
        tier: selectedTier,
        owned: ownedGear,
        allProducts,
        seed: seed + product.id + Date.now(),
        roleType: selectedRole || undefined,
      },
      excludeIds
    );

    if (replacement) {
      setResult({
        ...result,
        suggestions: result.suggestions.map(s =>
          s.id === product.id ? replacement : s
        ),
      });
    }
  };

  const handleToggleLock = (product: Product) => {
    const newLocked = new Map(lockedProducts);
    if (newLocked.has(product.category)) {
      newLocked.delete(product.category);
    } else {
      newLocked.set(product.category, product);
    }
    setLockedProducts(newLocked);
  };

  const handleClear = () => {
    setResult(null);
    setLockedProducts(new Map());
    setSeed('');
  };

  const isLocked = (product: Product): boolean => {
    return lockedProducts.get(product.category)?.id === product.id;
  };

  // Track theme for conditional background image
  const [isLightMode, setIsLightMode] = useState(false);

  useEffect(() => {
    // Check initial theme
    const checkTheme = () => {
      setIsLightMode(document.documentElement.classList.contains('light'));
    };

    checkTheme();

    // Listen for theme changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  // Role dropdown options with icons
  const roleOptions: DropdownOption[] = useMemo(() => [
    { value: '', label: '-- Select a role --' },
    { value: 'Pilot', label: 'Pilot', icon: 'pilot' },
    { value: 'Copilot', label: 'Copilot', icon: 'copilot' },
  ], []);

  /**
   * Memoized map of product category to whether replacement options exist
   * Recalculates only when result, selectedAircraft, selectedTier, ownedGear, or selectedRole change
   */
  const replacementAvailability = useMemo(() => {
    if (!result || !selectedAircraft) return new Map<string, boolean>();

    const availabilityMap = new Map<string, boolean>();

    result.suggestions.forEach(product => {
      const hasOptions = hasReplacementOptions(
        result.suggestions,
        product.category,
        {
          aircraft: selectedAircraft,
          tier: selectedTier,
          owned: ownedGear,
          allProducts,
          roleType: selectedRole || undefined,
        }
      );

      availabilityMap.set(product.category, hasOptions);
    });

    return availabilityMap;
  }, [result, selectedAircraft, selectedTier, ownedGear, selectedRole, allProducts]);

  /**
   * Check if a product has replacement options available
   */
  const canBeReplaced = (product: Product): boolean => {
    return replacementAvailability.get(product.category) ?? false;
  };

  // Tier dropdown options with icons
  const tierOptions: DropdownOption[] = useMemo(() => [
    { value: 'First', label: 'First class (Premium)', icon: 'first' },
    { value: 'Business', label: 'Business class (Mid-tier)', icon: 'business' },
    { value: 'Economy', label: 'Economy (Budget-friendly)', icon: 'economy' },
  ], []);

  // Aircraft dropdown options (dynamic from allAircraft)
  const aircraftOptions: DropdownOption[] = useMemo(() => [
    { value: '', label: '-- Select an aircraft --' },
    ...allAircraft.map(aircraft => ({
      value: aircraft.id,
      label: aircraft.name
    }))
  ], [allAircraft]);

  // Aircraft change handler
  const handleAircraftChange = (value: string | string[]) => {
    const stringValue = Array.isArray(value) ? value[0] : value;
    const aircraft = allAircraft.find(a => a.id === stringValue);
    setSelectedAircraft(aircraft || null);
    setResult(null); // Reset results when aircraft changes
  };

  // Tier change handler
  const handleTierChange = (value: string | string[]) => {
    const stringValue = Array.isArray(value) ? value[0] : value;
    setSelectedTier(stringValue as Tier);
    setResult(null); // Reset results when tier changes
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
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-dark-100 mb-4">
              Complete your setup
            </h1>
            <p className="text-lg text-dark-300 max-w-3xl mx-auto">
              Pick your aircraft, select a role, add the gear you already own, select a class, then we'll fill
              the gaps with smart suggestions.
            </p>
          </div>

          {/* Configuration Panel */}
          <div className="bg-dark-800/40 backdrop-blur-sm rounded-2xl border border-dark-700/50 p-8 mb-8">
            {/* Row A: Aircraft Selector */}
            <div className="mb-6">
              <label
                id="aircraft-select-label"
                htmlFor="aircraft-select"
                className="block text-sm font-medium text-dark-200 mb-2"
              >
                1. Choose your aircraft
              </label>
              <CustomDropdown
                id="aircraft-select"
                value={selectedAircraft?.id || ''}
                onChange={handleAircraftChange}
                options={aircraftOptions}
                placeholder="-- Select an aircraft --"
              />
            </div>

            {/* Row B: Role Selector */}
            <div className="mb-6">
              <label
                id="role-select-label"
                htmlFor="role-select"
                className="block text-sm font-medium text-dark-200 mb-2"
              >
                2. Select your role
              </label>
              <CustomDropdown
                id="role-select"
                value={selectedRole}
                onChange={handleRoleChange}
                options={roleOptions}
                placeholder="-- Select a role --"
              />
            </div>

            {/* Row C: Add Current Gear */}
            <div className="mb-6">
              <label
                htmlFor="gear-search"
                className="block text-sm font-medium text-dark-200 mb-2"
              >
                3. Add your current gear
              </label>

              {/* Search Input */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-400 w-5 h-5" />
                <input
                  id="gear-search"
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSearchQuery(value);

                    // Calculate suggestions synchronously (fixes state timing bug)
                    if (value.trim().length < 2) {
                      setSearchSuggestions([]);
                      setShowSuggestions(false);
                      return;
                    }

                    const allProductsForSearch = listProducts();

                    // Apply family filter FIRST (based on selected aircraft)
                    const familyFiltered = filterProductsByFamily(
                      allProductsForSearch,
                      selectedAircraft?.id || null
                    );

                    // Then apply role filter to ensure 10 relevant results
                    const roleFiltered = selectedRole === ''
                      ? familyFiltered
                      : familyFiltered.filter(p => p.roleType === selectedRole || p.roleType === 'Universal');

                    const results = searchProducts(roleFiltered, value);

                    setSearchSuggestions(results);
                    setShowSuggestions(results.length > 0);
                  }}
                  onFocus={() => searchQuery.length >= 2 && searchSuggestions.length > 0 && setShowSuggestions(true)}
                  placeholder="Search for gear you own..."
                  className="w-full bg-dark-700/60 border border-dark-600/50 rounded-lg pl-10 pr-4 py-3 text-dark-100 placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                />

                {/* Search Suggestions Dropdown */}
                {showSuggestions && searchSuggestions.length > 0 && (
                  <div
                    ref={suggestionsRef}
                    className="absolute z-20 w-full mt-2 bg-dark-800 border border-dark-700 rounded-lg shadow-xl max-h-[280px] overflow-y-auto"
                  >
                    {searchSuggestions.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => handleAddGear(product)}
                        className="w-full px-4 py-3 text-left hover:bg-dark-700/60 transition-colors focus:outline-none focus:bg-dark-700/60 border-b border-dark-700/50 last:border-0"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium text-dark-100">
                              {highlightMatch(product.name, searchQuery)}
                            </div>
                            <div className="text-xs text-dark-400">
                              {product.brand} • {product.category}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Owned Gear Chips */}
              <div className="flex flex-wrap gap-2">
                {ownedGear.length === 0 && (
                  <div className="text-sm text-dark-400 italic">
                    No gear added yet. Search to add products you already own.
                  </div>
                )}
                {ownedGear.map((gear) => (
                  <div
                    key={gear.id}
                    className="inline-flex items-center gap-2 bg-dark-700/80 border border-dark-600/50 rounded-lg px-3 py-2 group"
                  >
                    <span className="text-xs font-medium text-dark-200">
                      {gear.brand} {gear.name}
                    </span>
                    <span className="text-xs text-dark-400">
                      ({gear.category})
                    </span>
                    <button
                      onClick={() => handleRemoveGear(gear.id)}
                      className="text-dark-400 hover:text-accent-400 transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500 rounded"
                      aria-label={`Remove ${gear.name}`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Row D: Class Tier Selector */}
            <div className="mb-6">
              <label
                id="tier-select-label"
                htmlFor="tier-select"
                className="block text-sm font-medium text-dark-200 mb-2"
              >
                4. Select class tier
              </label>
              <CustomDropdown
                id="tier-select"
                value={selectedTier}
                onChange={handleTierChange}
                options={tierOptions}
                placeholder="-- Select tier --"
              />
            </div>

            {/* Row D: Generate Button */}
            <div className="flex justify-center">
              <button
                onClick={handleGenerate}
                disabled={!selectedAircraft}
                className="bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 disabled:from-dark-700 disabled:to-dark-700 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 disabled:transform-none focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 focus:ring-offset-dark-800"
              >
                Generate ideas for your current setup
              </button>
            </div>
          </div>

          {/* Row E: Results */}
          {result && (
            <div className="space-y-6">
              {/* Summary */}
              <div className="bg-dark-800/40 backdrop-blur-sm rounded-xl border border-dark-700/50 p-6">
                <h2 className="text-xl font-semibold text-dark-100 mb-3">
                  Suggestions for {selectedAircraft?.name} ({selectedTier} class)
                </h2>

                {result.warnings.length > 0 && (
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                    {result.warnings.map((warning, idx) => (
                      <p key={idx} className="text-sm text-yellow-400">
                        {warning}
                      </p>
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={handleShuffleAll}
                    className="inline-flex items-center gap-2 bg-dark-700/60 hover:bg-dark-700 border border-dark-600/50 rounded-lg px-4 py-2 text-dark-200 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500"
                  >
                    <Shuffle className="w-4 h-4" />
                    Shuffle all
                  </button>
                  <button
                    onClick={handleClear}
                    className="inline-flex items-center gap-2 bg-dark-700/60 hover:bg-dark-700 border border-dark-600/50 rounded-lg px-4 py-2 text-dark-200 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500"
                  >
                    <X className="w-4 h-4" />
                    Clear results
                  </button>
                </div>
              </div>

              {/* Product Grid */}
              {result.suggestions.length === 0 && ownedGear.length === 0 ? (
                <div className="text-center py-12 text-dark-400">
                  <p>No suggestions available. Try adjusting your owned gear or tier.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Display Owned Gear First */}
                  {ownedGear.map((product) => (
                    <div key={`owned-${product.id}`} className="relative">
                      {/* Product Card */}
                      <ProductCard product={product} />

                      {/* Owned Badge - Top Center */}
                      <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
                        <div className="bg-green-500/90 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg border border-green-400/50">
                          ✓ Owned
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Display Suggestions */}
                  {result.suggestions.map((product) => (
                    <div key={product.id} className="relative">
                      {/* Product Card */}
                      <ProductCard product={product} />

                      {/* Controls Overlay - Top Center (only show if replacement options exist) */}
                      {canBeReplaced(product) && (
                        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                          <button
                            onClick={() => handleToggleLock(product)}
                            className={`p-2 rounded-lg backdrop-blur-sm transition-all focus:outline-none focus:ring-2 focus:ring-accent-500 ${
                              isLocked(product)
                                ? 'bg-accent-500/90 hover:bg-accent-600 text-white'
                                : 'bg-dark-800/80 hover:bg-dark-700 text-dark-300 hover:text-dark-100'
                            }`}
                            title={isLocked(product) ? 'Locked' : 'Lock this suggestion'}
                            aria-label={isLocked(product) ? 'Unlock' : 'Lock'}
                          >
                            {isLocked(product) ? (
                              <Lock className="w-4 h-4" />
                            ) : (
                              <Unlock className="w-4 h-4" />
                            )}
                          </button>

                          <button
                            onClick={() => handleReplace(product)}
                            disabled={isLocked(product)}
                            className="p-2 rounded-lg bg-dark-800/80 hover:bg-dark-700 text-dark-300 hover:text-dark-100 backdrop-blur-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-accent-500"
                            title="Replace this suggestion"
                            aria-label="Replace"
                          >
                            <Dice5 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Empty State */}
          {!result && (
            <div className="text-center py-16 text-dark-400">
              <p className="text-lg">
                Start by choosing an aircraft and adding your current gear.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompleteSetup;
