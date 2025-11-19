import React, { useState, useEffect } from 'react';
import { getProductsByIds, type Tier } from '../lib/products';
import ProductCard from '../components/ProductCard';
import setupsData from '../data/setups.json';

type AircraftModel =
  | 'F-16 Viper'
  | 'F/A-18 Hornet'
  | 'Boeing 737'
  | 'General Aviation'
  | 'A318'
  | 'A319'
  | 'A319neo'
  | 'A320'
  | 'A320neo'
  | 'A321'
  | 'A321neo'
  | '';

interface SetupMapping {
  [key: string]: {
    productIds: string[];
    description: string;
  };
}

interface AirbusSetup {
  aircraft: string;
  description: string;
  tiers: {
    First: string[];
    Business: string[];
    Economy: string[];
  };
}

const Setups: React.FC = () => {
  const [selectedAircraft, setSelectedAircraft] = useState<AircraftModel>('');
  const [selectedTier, setSelectedTier] = useState<Tier | 'All'>('All');
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

  const setup = setupsData as AirbusSetup[];

  const handleAircraftChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedAircraft(e.target.value as AircraftModel);
    setSelectedTier('All'); // Reset tier filter when aircraft changes
  };

  const handleTierChange = (tier: Tier | 'All') => {
    setSelectedTier(tier);
  };

  // Get setup data for selected aircraft
  const getCurrentSetup = () => {
    if (!selectedAircraft) return null;

    return setup.find(setup => setup.aircraft === selectedAircraft);
  };

  const currentSetup = getCurrentSetup();

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
            Recommended Setups
          </h1>
          <p className="text-slate-400 text-lg">
            Pre-configured hardware bundles for specific aircraft
          </p>
        </div>

        {/* Aircraft Selection Dropdown */}
        <div className="mb-8 max-w-2xl mx-auto">
          <label
            htmlFor="aircraft-select"
            className="block text-lg font-medium text-dropdown-text mb-3"
          >
            Choose Aircraft Model
          </label>
          <select
            id="aircraft-select"
            value={selectedAircraft}
            onChange={handleAircraftChange}
            className="w-full bg-dropdown-bg text-dropdown-text border-2 border-dropdown-border rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-dropdown-focus-ring focus:border-transparent hover:bg-dropdown-hover-bg transition-colors appearance-none cursor-pointer"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='none' stroke='%23cbd5e1' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' d='M2 4l4 4 4-4'/%3E%3C/svg%3E")`,
              backgroundPosition: 'right 1rem center',
              backgroundRepeat: 'no-repeat',
              paddingRight: '2.5rem'
            }}
          >
            <option value="">-- Select an aircraft --</option>
            <optgroup label="Fighter Jets">
              <option value="F-16 Viper">F-16 Viper</option>
              <option value="F/A-18 Hornet">F/A-18 Hornet</option>
            </optgroup>
            <optgroup label="Airbus A320 Family">
              <option value="A318">Airbus A318</option>
              <option value="A319">Airbus A319</option>
              <option value="A319neo">Airbus A319neo</option>
              <option value="A320">Airbus A320</option>
              <option value="A320neo">Airbus A320neo</option>
              <option value="A321">Airbus A321</option>
              <option value="A321neo">Airbus A321neo</option>
            </optgroup>
            <optgroup label="Other Commercial">
              <option value="Boeing 737">Boeing 737</option>
            </optgroup>
            <optgroup label="General Aviation">
              <option value="General Aviation">General Aviation</option>
            </optgroup>
          </select>
        </div>

        {currentSetup && (
          <div className="mb-8 max-w-2xl mx-auto">
            <label className="block text-lg font-medium text-dropdown-text mb-3">
              Equipment Tier
            </label>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleTierChange('All')}
                className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                  selectedTier === 'All'
                    ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/50'
                    : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700'
                }`}
              >
                All Tiers
              </button>
              <button
                onClick={() => handleTierChange('First')}
                className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                  selectedTier === 'First'
                    ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/50'
                    : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700'
                }`}
              >
                🥇 First Class
              </button>
              <button
                onClick={() => handleTierChange('Business')}
                className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                  selectedTier === 'Business'
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/50'
                    : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700'
                }`}
              >
                🥈 Business Class
              </button>
              <button
                onClick={() => handleTierChange('Economy')}
                className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                  selectedTier === 'Economy'
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/50'
                    : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700'
                }`}
              >
                🥉 Economy Class
              </button>
            </div>
          </div>
        )}

        {/* Setup Description */}
        {selectedAircraft && currentSetup && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-white mb-2">
                {selectedAircraft} Setup
              </h2>
              <p className="text-slate-300">
                {'description' in currentSetup
                  ? currentSetup.description
                  : (currentSetup as any).description}
              </p>
            </div>
          </div>
        )}

        {/* Product Cards - Airbus (Tiered) */}
        {currentSetup && 'tiers' in currentSetup && (
          <>
            {selectedTier === 'All' ? (
              // Show all tiers as separate sections
              <>
                {/* First Class */}
                {currentSetup.tiers.First.length > 0 && (
                  <div className="mb-12">
                    <div className="flex items-center gap-3 mb-6">
                      <span className="text-3xl">🥇</span>
                      <h3 className="text-2xl font-bold text-amber-400">First Class</h3>
                      <span className="text-sm text-slate-500 ml-auto">Premium tier</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {getProductsByIds(currentSetup.tiers.First).map((product) => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Business Class */}
                {currentSetup.tiers.Business.length > 0 && (
                  <div className="mb-12">
                    <div className="flex items-center gap-3 mb-6">
                      <span className="text-3xl">🥈</span>
                      <h3 className="text-2xl font-bold text-blue-400">Business Class</h3>
                      <span className="text-sm text-slate-500 ml-auto">Mid-tier</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {getProductsByIds(currentSetup.tiers.Business).map((product) => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Economy Class */}
                {currentSetup.tiers.Economy.length > 0 && (
                  <div className="mb-12">
                    <div className="flex items-center gap-3 mb-6">
                      <span className="text-3xl">🥉</span>
                      <h3 className="text-2xl font-bold text-emerald-400">Economy Class</h3>
                      <span className="text-sm text-slate-500 ml-auto">Entry-level</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {getProductsByIds(currentSetup.tiers.Economy).map((product) => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              // Show only selected tier
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {getProductsByIds(currentSetup.tiers[selectedTier as Tier]).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </>
        )}

        {/* Product Cards - Legacy (Non-Tiered)
        {!setups && selectedAircraft && currentSetup && 'productIds' in currentSetup && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {getProductsByIds(currentSetup.productIds).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )} */}

        {/* Empty State */}
        {!selectedAircraft && (
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-lg p-12 text-center max-w-2xl mx-auto">
            <svg
              className="w-16 h-16 mx-auto mb-4 text-slate-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
              />
            </svg>
            <p className="text-slate-400 text-lg">
              Please select an aircraft model to view the recommended setup.
            </p>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default Setups;
