import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Dice5, Lock, Unlock, Shuffle } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { listProducts, type Product, type Tier } from '../lib/products';
import { listAircraft, type AircraftPreset } from '../lib/aircraft';
import { generateSuggestions, replaceSuggestion, type SuggestionResult } from '../lib/suggestions';

const CompleteSetup: React.FC = () => {
  // State management
  const [selectedAircraft, setSelectedAircraft] = useState<AircraftPreset | null>(null);
  const [selectedTier, setSelectedTier] = useState<Tier>('Business');
  const [ownedGear, setOwnedGear] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
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

  // Search suggestions
  const searchSuggestions = searchQuery.length >= 2
    ? listProducts({ q: searchQuery }).slice(0, 5)
    : [];

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
    setSearchQuery('');
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
    });

    setResult(generatedResult);
  };

  const handleShuffleAll = () => {
    if (!selectedAircraft || !result) return;

    // Keep locked products, reseed others
    const newSeed = Date.now().toString();
    setSeed(newSeed);

    const generatedResult = generateSuggestions({
      aircraft: selectedAircraft,
      tier: selectedTier,
      owned: ownedGear,
      allProducts,
      seed: newSeed,
      lockedSuggestions: lockedProducts,
    });

    setResult(generatedResult);
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
              Pick your aircraft, add the gear you already own, select a class, then we'll fill
              the gaps with smart suggestions.
            </p>
          </div>

          {/* Configuration Panel */}
          <div className="bg-dark-800/40 backdrop-blur-sm rounded-2xl border border-dark-700/50 p-8 mb-8">
            {/* Row A: Aircraft Selector */}
            <div className="mb-6">
              <label
                htmlFor="aircraft-select"
                className="block text-sm font-medium text-dark-200 mb-2"
              >
                1. Choose your aircraft
              </label>
              <select
                id="aircraft-select"
                value={selectedAircraft?.id || ''}
                onChange={(e) => {
                  const aircraft = allAircraft.find(a => a.id === e.target.value);
                  setSelectedAircraft(aircraft || null);
                  setResult(null); // Reset results when aircraft changes
                }}
                className="w-full bg-dark-700/60 border border-dark-600/50 rounded-lg px-4 py-3 text-dark-100 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
              >
                <option value="">Select an aircraft...</option>
                {allAircraft.map((aircraft) => (
                  <option key={aircraft.id} value={aircraft.id}>
                    {aircraft.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Row B: Add Current Gear */}
            <div className="mb-6">
              <label
                htmlFor="gear-search"
                className="block text-sm font-medium text-dark-200 mb-2"
              >
                2. Add your current gear
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
                    setSearchQuery(e.target.value);
                    setShowSuggestions(e.target.value.length >= 2);
                  }}
                  onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
                  placeholder="Search for gear you own..."
                  className="w-full bg-dark-700/60 border border-dark-600/50 rounded-lg pl-10 pr-4 py-3 text-dark-100 placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                />

                {/* Search Suggestions Dropdown */}
                {showSuggestions && searchSuggestions.length > 0 && (
                  <div
                    ref={suggestionsRef}
                    className="absolute z-20 w-full mt-2 bg-dark-800 border border-dark-700 rounded-lg shadow-xl overflow-hidden"
                  >
                    {searchSuggestions.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => handleAddGear(product)}
                        className="w-full px-4 py-3 text-left hover:bg-dark-700/60 transition-colors focus:outline-none focus:bg-dark-700/60"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium text-dark-100">
                              {product.name}
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

            {/* Row C: Class Tier Selector */}
            <div className="mb-6">
              <label
                htmlFor="tier-select"
                className="block text-sm font-medium text-dark-200 mb-2"
              >
                3. Select class tier
              </label>
              <select
                id="tier-select"
                value={selectedTier}
                onChange={(e) => {
                  setSelectedTier(e.target.value as Tier);
                  setResult(null); // Reset results when tier changes
                }}
                className="w-full bg-dark-700/60 border border-dark-600/50 rounded-lg px-4 py-3 text-dark-100 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
              >
                <option value="First">First class (Premium)</option>
                <option value="Business">Business class (Mid-tier)</option>
                <option value="Economy">Economy (Budget-friendly)</option>
              </select>
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

                {result.missingByCategory.length > 0 && (
                  <div className="text-dark-300 mb-4">
                    <span className="font-medium">Missing components:</span>{' '}
                    {result.missingByCategory.map((missing, idx) => (
                      <span key={missing.category}>
                        {missing.category} × {missing.needed}
                        {idx < result.missingByCategory.length - 1 ? ', ' : ''}
                      </span>
                    ))}
                  </div>
                )}

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

                      {/* Controls Overlay - Top Center */}
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
