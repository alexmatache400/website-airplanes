import React, { useState, useEffect, useMemo } from 'react';
import { getProductsByIds, type Tier, type Product } from '../lib/products';
import ProductCard from '../components/ProductCard';
import setupsData from '../data/setups.json';
import AirplaneAnimation from '../components/AirplaneAnimation';
import { CustomDropdown, type DropdownOption } from '../components/CustomDropdown';
import { CategoryIcon } from '../components/CategoryIcon';

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

type RoleType = '' | 'Pilot' | 'Copilot';

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
  const [selectedRole, setSelectedRole] = useState<RoleType>('');
  const [isLightMode, setIsLightMode] = useState(false);

  const setup = setupsData as AirbusSetup[];

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

  // Load saved selections from localStorage on mount
  useEffect(() => {
    const savedAircraft = localStorage.getItem('setups_selectedAircraft');
    const savedTier = localStorage.getItem('setups_selectedTier');

    // Validate and restore aircraft
    if (savedAircraft && setup.find(s => s.aircraft === savedAircraft)) {
      setSelectedAircraft(savedAircraft as AircraftModel);
    }

    // Validate and restore tier
    if (savedTier && (savedTier === 'All' || savedTier === 'First' || savedTier === 'Business' || savedTier === 'Economy')) {
      setSelectedTier(savedTier as Tier | 'All');
    }
  }, [setup]);

  const handleAircraftChange = (value: string | string[]) => {
    const stringValue = Array.isArray(value) ? value[0] : value;
    const aircraftValue = stringValue as AircraftModel;
    setSelectedAircraft(aircraftValue);
    localStorage.setItem('setups_selectedAircraft', aircraftValue);
    setSelectedTier('All'); // Reset tier filter when aircraft changes
    localStorage.setItem('setups_selectedTier', 'All');
  };

  const handleTierChange = (value: string | string[]) => {
    const stringValue = Array.isArray(value) ? value[0] : value;
    const tierValue = stringValue as Tier | 'All';
    setSelectedTier(tierValue);
    localStorage.setItem('setups_selectedTier', tierValue);
  };

  // Get setup data for selected aircraft
  const getCurrentSetup = () => {
    if (!selectedAircraft) return null;

    return setup.find(setup => setup.aircraft === selectedAircraft);
  };

  // Filter products by role
  // NOTE: Role filtering temporarily disabled - showing all products (Universal behavior)
  // Backend logic preserved for future re-enablement
  const filterProductsByRole = (products: Product[]): Product[] => {
    // Hardcoded to show all products regardless of roleType
    return products;
  };

  // Aircraft dropdown options with optgroups
  const aircraftOptions: DropdownOption[] = useMemo(() => [
    { value: '', label: '-- Select an aircraft --' },
    // Fighter Jets
    { value: 'F-16 Viper', label: 'F-16 Viper', group: 'Fighter Jets' },
    { value: 'F/A-18 Hornet', label: 'F/A-18 Hornet', group: 'Fighter Jets' },
    // Airbus A320 Family
    { value: 'A318', label: 'Airbus A318', group: 'Airbus A320 Family' },
    { value: 'A319', label: 'Airbus A319', group: 'Airbus A320 Family' },
    { value: 'A319neo', label: 'Airbus A319neo', group: 'Airbus A320 Family' },
    { value: 'A320', label: 'Airbus A320', group: 'Airbus A320 Family' },
    { value: 'A320neo', label: 'Airbus A320neo', group: 'Airbus A320 Family' },
    { value: 'A321', label: 'Airbus A321', group: 'Airbus A320 Family' },
    { value: 'A321neo', label: 'Airbus A321neo', group: 'Airbus A320 Family' },
    // Other Commercial
    { value: 'Boeing 737', label: 'Boeing 737', group: 'Other Commercial' },
    // General Aviation
    { value: 'General Aviation', label: 'General Aviation', group: 'General Aviation' },
  ], []);

  // Role dropdown options with icons
  const roleOptions: DropdownOption[] = useMemo(() => [
    { value: '', label: '-- Select a role --' },
    { value: 'Pilot', label: 'Pilot', icon: 'pilot' },
    { value: 'Copilot', label: 'Copilot', icon: 'copilot' },
  ], []);

  // Tier dropdown options with icons
  const tierOptions: DropdownOption[] = useMemo(() => [
    { value: 'All', label: 'All Tiers' },
    { value: 'First', label: 'First Class', icon: 'first' },
    { value: 'Business', label: 'Business Class', icon: 'business' },
    { value: 'Economy', label: 'Economy Class', icon: 'economy' },
  ], []);

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
          <div className="flex items-center justify-center gap-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-3">
                Full Setups
              </h1>
              <p className="text-slate-400 text-lg">
                Pre-configured hardware bundles for specific aircraft
              </p>
            </div>
            {/* Airplane Animation (Dark Mode Only) */}
            {!isLightMode && (
              <div className="hidden md:block">
                <AirplaneAnimation />
              </div>
            )}
          </div>
        </div>

        {/* Aircraft and Equipment Tier Selection - 2 Column Layout */}
        <div className="mb-8 max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Aircraft Dropdown */}
            <div>
              <label
                id="aircraft-select-label"
                htmlFor="aircraft-select"
                className="block text-lg font-medium text-dropdown-text mb-3"
              >
                Choose Aircraft Model
              </label>
              <CustomDropdown
                id="aircraft-select"
                value={selectedAircraft}
                onChange={handleAircraftChange}
                options={aircraftOptions}
                placeholder="-- Select an aircraft --"
              />
            </div>

            {/* Equipment Tier Dropdown */}
            <div>
              <label
                id="tier-select-label"
                htmlFor="tier-select"
                className="block text-lg font-medium text-dropdown-text mb-3"
              >
                Equipment Tier
              </label>
              <CustomDropdown
                id="tier-select"
                value={selectedTier}
                onChange={handleTierChange}
                options={tierOptions}
                placeholder="-- Select tier --"
              />
            </div>
          </div>
        </div>


        {/* Product Cards - Airbus (Tiered) */}
        {selectedAircraft && currentSetup && 'tiers' in currentSetup && (
          <>
            {selectedTier === 'All' ? (
              // Show all tiers as separate sections
              <>
                {/* First Class */}
                {currentSetup.tiers.First.length > 0 && (() => {
                  const filteredProducts = filterProductsByRole(getProductsByIds(currentSetup.tiers.First));
                  return filteredProducts.length > 0 && (
                    <div className="mb-12">
                      <div className="flex items-center gap-3 mb-6">
                        <CategoryIcon category="first" size={32} className="w-8 h-8 text-amber-400" />
                        <h3 className="text-2xl font-bold text-amber-400">First Class</h3>
                        <span className="text-sm text-slate-500 ml-auto">Premium tier</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {filteredProducts.map((product) => (
                          <ProductCard key={product.id} product={product} context="grid" />
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* Business Class */}
                {currentSetup.tiers.Business.length > 0 && (() => {
                  const filteredProducts = filterProductsByRole(getProductsByIds(currentSetup.tiers.Business));
                  return filteredProducts.length > 0 && (
                    <div className="mb-12">
                      <div className="flex items-center gap-3 mb-6">
                        <CategoryIcon category="business" size={32} className="w-8 h-8 text-blue-400" />
                        <h3 className="text-2xl font-bold text-blue-400">Business Class</h3>
                        <span className="text-sm text-slate-500 ml-auto">Mid-tier</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {filteredProducts.map((product) => (
                          <ProductCard key={product.id} product={product} context="grid" />
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* Economy Class */}
                {currentSetup.tiers.Economy.length > 0 && (() => {
                  const filteredProducts = filterProductsByRole(getProductsByIds(currentSetup.tiers.Economy));
                  return filteredProducts.length > 0 && (
                    <div className="mb-12">
                      <div className="flex items-center gap-3 mb-6">
                        <CategoryIcon category="economy" size={32} className="w-8 h-8 text-emerald-400" />
                        <h3 className="text-2xl font-bold text-emerald-400">Economy Class</h3>
                        <span className="text-sm text-slate-500 ml-auto">Entry-level</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {filteredProducts.map((product) => (
                          <ProductCard key={product.id} product={product} context="grid" />
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </>
            ) : (
              // Show only selected tier with header
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <CategoryIcon
                    category={selectedTier.toLowerCase()}
                    size={32}
                    className={`w-8 h-8 ${
                      selectedTier === 'First' ? 'text-amber-400' :
                      selectedTier === 'Business' ? 'text-blue-400' :
                      'text-emerald-400'
                    }`}
                  />
                  <h3 className={`text-2xl font-bold ${
                    selectedTier === 'First' ? 'text-amber-400' :
                    selectedTier === 'Business' ? 'text-blue-400' :
                    'text-emerald-400'
                  }`}>
                    {selectedTier} Class
                  </h3>
                  <span className="text-sm text-slate-500 ml-auto">
                    {selectedTier === 'First' ? 'Premium tier' :
                     selectedTier === 'Business' ? 'Mid-tier' :
                     'Entry-level'}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filterProductsByRole(getProductsByIds(currentSetup.tiers[selectedTier as Tier])).map((product) => (
                    <ProductCard key={product.id} product={product} context="grid" />
                  ))}
                </div>
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

        {/* Empty State: No Aircraft Selected */}
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
