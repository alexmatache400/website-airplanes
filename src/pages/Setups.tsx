import React, { useState, useEffect, useMemo } from 'react';
import { getProductsByIds, type Tier, type Product } from '../lib/products';
import ProductCard from '../components/ProductCard';
import { listSetups } from '../lib/setups';
import { useData } from '../lib/DataProvider';
import { getTierStyle } from '../lib/tier-config';
import AirplaneAnimation from '../components/AirplaneAnimation';
import { CustomDropdown, type DropdownOption } from '../components/CustomDropdown';
import { CategoryIcon } from '../components/CategoryIcon';
import { useThemeMode } from '../hooks/useThemeMode';
import { PageBackground } from '../components/PageBackground';

const Setups: React.FC = () => {
  const [selectedAircraft, setSelectedAircraft] = useState<string>('');
  const [selectedTier, setSelectedTier] = useState<Tier | 'All'>('All');
  const [selectedRole, setSelectedRole] = useState<string>('All');

  const setup = listSetups();
  const { tiers, aircraftFamilies, roleTypes } = useData();
  const tierNames = useMemo(() => tiers.map(t => t.name), [tiers]);
  const isLightMode = useThemeMode();

  // Load saved selections from localStorage on mount
  useEffect(() => {
    const savedAircraft = localStorage.getItem('setups_selectedAircraft');
    const savedTier = localStorage.getItem('setups_selectedTier');

    // Validate and restore aircraft
    if (savedAircraft && setup.find(s => s.aircraft === savedAircraft)) {
      setSelectedAircraft(savedAircraft);
    }

    // Validate and restore tier
    if (savedTier && (savedTier === 'All' || tierNames.includes(savedTier))) {
      setSelectedTier(savedTier as Tier | 'All');
    }

    // Validate and restore role
    const savedRole = localStorage.getItem('setups_selectedRole');
    if (savedRole && (savedRole === 'All' || roleTypes.some(rt => rt.name === savedRole))) {
      setSelectedRole(savedRole);
    }
  }, [setup, tierNames, roleTypes]);

  const handleAircraftChange = (value: string | string[]) => {
    const stringValue = Array.isArray(value) ? value[0] : value;
    const aircraftValue = stringValue;
    setSelectedAircraft(aircraftValue);
    localStorage.setItem('setups_selectedAircraft', aircraftValue);
    setSelectedTier('All'); // Reset tier filter when aircraft changes
    localStorage.setItem('setups_selectedTier', 'All');
    setSelectedRole('All'); // Reset role filter when aircraft changes
    localStorage.setItem('setups_selectedRole', 'All');
  };

  const handleTierChange = (value: string | string[]) => {
    const stringValue = Array.isArray(value) ? value[0] : value;
    const tierValue = stringValue as Tier | 'All';
    setSelectedTier(tierValue);
    localStorage.setItem('setups_selectedTier', tierValue);
  };

  const handleRoleChange = (value: string | string[]) => {
    const stringValue = Array.isArray(value) ? value[0] : value;
    setSelectedRole(stringValue);
    localStorage.setItem('setups_selectedRole', stringValue);
  };

  // Get setup data for selected aircraft
  const getCurrentSetup = () => {
    if (!selectedAircraft) return null;

    return setup.find(setup => setup.aircraft === selectedAircraft);
  };

  // Filter products by role — Universal products always included
  const filterProductsByRole = (products: Product[]): Product[] => {
    if (selectedRole === 'All') return products;
    return products.filter(
      product => product.roleType === selectedRole || product.roleType === 'Universal'
    );
  };

  // Aircraft dropdown options — built dynamically from DB setups + aircraft_families
  const aircraftOptions: DropdownOption[] = useMemo(() => {
    const sorted = [...setup].sort((a, b) => a.sort_order - b.sort_order);
    const familyLabels = new Map(aircraftFamilies.map(f => [f.name, f.label]));

    return [
      { value: '', label: '-- Select an aircraft --' },
      ...sorted.map(s => ({
        value: s.aircraft,
        label: s.aircraft,
        group: familyLabels.get(s.family) || s.family,
      })),
    ];
  }, [setup, aircraftFamilies]);

  // Role dropdown options — built dynamically from DB role_types
  const roleOptions: DropdownOption[] = useMemo(() => [
    { value: 'All', label: 'All Roles' },
    ...roleTypes
      .filter(rt => rt.name !== 'Universal')
      .map(rt => ({ value: rt.name, label: rt.name, icon: rt.name.toLowerCase() })),
  ], [roleTypes]);

  // Tier dropdown options — built dynamically from DB tiers
  const tierOptions: DropdownOption[] = useMemo(() => [
    { value: 'All', label: 'All Tiers' },
    ...tiers.map(t => ({ value: t.name, label: t.label, icon: t.name.toLowerCase() })),
  ], [tiers]);

  const currentSetup = getCurrentSetup();

  return (
    <div className="relative min-h-screen">
      <PageBackground />

      {/* Content */}
      <div className="relative z-10 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-3">
            Full Setups
          </h1>
          <p className="text-slate-400 text-lg">
            Pre-configured hardware bundles for specific aircraft
          </p>
        </div>

        {/* Selection Controls */}
        <div className="mb-8 max-w-4xl mx-auto space-y-6">
          {/* Row 1: Aircraft (left) + Tier (right) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

          {/* Row 2: Role (left) + Animation (right) in dark mode / Role centered in light mode */}
          {!isLightMode ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  onChange={handleRoleChange}
                  options={roleOptions}
                  placeholder="-- Select role --"
                />
              </div>
              <div className="hidden md:flex items-center justify-center">
                <AirplaneAnimation />
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-full md:w-[calc(50%-0.75rem)]">
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
                  onChange={handleRoleChange}
                  options={roleOptions}
                  placeholder="-- Select role --"
                />
              </div>
            </div>
          )}
        </div>


        {/* Product Cards - Airbus (Tiered) */}
        {selectedAircraft && currentSetup && 'tiers' in currentSetup && (
          <>
            {selectedTier === 'All' ? (
              // Show all tiers as separate sections
              <>
                {tiers.map(tier => {
                  const productIds = currentSetup.tiers[tier.name] || [];
                  if (productIds.length === 0) return null;
                  const filteredProducts = filterProductsByRole(getProductsByIds(productIds));
                  if (filteredProducts.length === 0) return null;
                  const style = getTierStyle(tier.name);
                  return (
                    <div key={tier.name} className="mb-12">
                      <div className="flex items-center gap-3 mb-6">
                        <CategoryIcon category={tier.name.toLowerCase()} size={32} className={style.iconClass} />
                        <h3 className={`text-2xl font-bold ${style.textColor}`}>{tier.label}</h3>
                        <span className="text-sm text-slate-500 ml-auto">{style.sublabel}</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {filteredProducts.map((product) => (
                          <ProductCard key={product.id} product={product} context="grid" />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </>
            ) : (() => {
              // Show only selected tier with header
              const style = getTierStyle(selectedTier);
              const tierRef = tiers.find(t => t.name === selectedTier);
              return (
                <div className="mb-12">
                  <div className="flex items-center gap-3 mb-6">
                    <CategoryIcon
                      category={selectedTier.toLowerCase()}
                      size={32}
                      className={style.iconClass}
                    />
                    <h3 className={`text-2xl font-bold ${style.textColor}`}>
                      {tierRef?.label || `${selectedTier} Class`}
                    </h3>
                    <span className="text-sm text-slate-500 ml-auto">
                      {style.sublabel}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filterProductsByRole(getProductsByIds(currentSetup.tiers[selectedTier as Tier] || [])).map((product) => (
                      <ProductCard key={product.id} product={product} context="grid" />
                    ))}
                  </div>
                </div>
              );
            })()}
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
