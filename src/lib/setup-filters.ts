/**
 * Setup Filters - Utility functions for Complete Setup wizard filtering logic
 *
 * This module provides functions to:
 * - Filter aircraft families based on product presence in preferredProducts
 * - Determine which tiers contain a specific product
 * - Auto-select roles based on product specifications
 * - Build dropdown options with Match/Downgrade sections
 */

import { Product, Tier } from './products';
import { AircraftPreset } from './aircraft';
import { CATEGORY_EQUIVALENCE } from './suggestions';

export interface TierSplit {
  match: Tier[];
  downgrade: Tier[];
}

/**
 * Calculate which categories a product satisfies based on equivalence rules
 * Imported logic from suggestions.ts for consistency
 *
 * @param product - Product to evaluate
 * @returns Array of categories this product satisfies
 */
function getSatisfiedCategories(product: Product): Product['category'][] {
  return CATEGORY_EQUIVALENCE[product.category] || [product.category];
}

/**
 * Finds all aircraft families that contain a specific product in their preferredProducts arrays
 *
 * @param productSlug - The product slug or ID to search for
 * @param aircraftPresets - Array of all aircraft presets to search through
 * @returns Array of aircraft presets that include the product in any tier's preferredProducts
 *
 * @example
 * // Find which aircraft include the "orion2-hotas-viperace" product
 * const aircraft = findAircraftFamiliesWithProduct('orion2-hotas-viperace', allPresets);
 * // Returns: [F-16 Viper preset] (product appears in all 3 tiers)
 *
 * @example
 * // Product not in any preferredProducts
 * const aircraft = findAircraftFamiliesWithProduct('unknown-product', allPresets);
 * // Returns: [] (empty array)
 */
export function findAircraftFamiliesWithProduct(
  productSlug: string,
  aircraftPresets: AircraftPreset[]
): AircraftPreset[] {
  if (!productSlug || !aircraftPresets) {
    return [];
  }

  const normalizedSlug = productSlug.toLowerCase().trim();

  return aircraftPresets.filter(aircraft => {
    // Check all tiers for this aircraft
    const tiers = aircraft.tiers;

    // Check if the product appears in any tier's preferredProducts
    return Object.values(tiers).some(tierConfig => {
      if (!tierConfig.preferredProducts) return false;
      return tierConfig.preferredProducts.some(productId =>
        productId.toLowerCase() === normalizedSlug
      );
    });
  });
}

/**
 * Finds which tier configurations contain a specific product for a given aircraft
 *
 * @param aircraftId - The aircraft preset ID (e.g., 'f16-viper', 'airbus-a32f')
 * @param productSlug - The product slug or ID to search for
 * @param aircraftPresets - Array of all aircraft presets
 * @param allProducts - Array of all products (needed to check category for downgrade tiers)
 * @returns Object with 'match' (tiers containing product) and 'downgrade' (tiers without product but needing its category)
 *
 * @example
 * // Find tiers for a product in F-16 Viper
 * const tierSplit = findTiersWithProduct('f16-viper', 'orion2-hotas-viperace', allPresets, allProducts);
 * // Returns: { match: ['First', 'Business', 'Economy'], downgrade: [] }
 *
 * @example
 * // Find tiers for a Joystick only in First class
 * const tierSplit = findTiersWithProduct('airbus-a32f', 'winwing-ursa-minor-joystick-l', allPresets, allProducts);
 * // Returns: { match: ['First', 'Business'], downgrade: [] } (Economy needs HOTAS, not Joystick)
 */
export function findTiersWithProduct(
  aircraftId: string,
  productSlug: string,
  aircraftPresets: AircraftPreset[],
  allProducts: Product[]
): TierSplit {
  const defaultResult: TierSplit = { match: [], downgrade: [] };

  if (!aircraftId || !productSlug || !aircraftPresets) {
    return defaultResult;
  }

  // Find the aircraft preset
  const aircraft = aircraftPresets.find(a => a.id === aircraftId || a.slug === aircraftId);
  if (!aircraft) {
    return defaultResult;
  }

  const normalizedSlug = productSlug.toLowerCase().trim();
  const allTiers: Tier[] = ['First', 'Business', 'Economy'];
  const matchTiers: Tier[] = [];
  const downgradeTiers: Tier[] = [];

  // Find the product to get its category
  const product = allProducts.find(p =>
    p.slug?.toLowerCase() === normalizedSlug || p.id.toLowerCase() === normalizedSlug
  );

  // If product not found, return empty result
  if (!product) {
    return defaultResult;
  }

  // Get categories this product satisfies (handles equivalence like HOTAS -> Joystick + Throttle)
  const productSatisfiesCategories = getSatisfiedCategories(product);

  // Check each tier
  allTiers.forEach(tier => {
    const tierConfig = aircraft.tiers[tier];
    if (!tierConfig) {
      return;
    }

    // Check if product is in this tier's preferredProducts
    const hasProduct = tierConfig.preferredProducts?.some(productId =>
      productId.toLowerCase() === normalizedSlug
    ) || false;

    if (hasProduct) {
      matchTiers.push(tier);
    } else {
      // Only add to downgrade if the tier actually needs this product's category
      // Extract category names from tier's needs
      const tierNeedsCategories = tierConfig.needs.map(need => need.category);

      // Check if any of the categories this product satisfies are needed by this tier
      const isCategoryNeeded = productSatisfiesCategories.some(category =>
        tierNeedsCategories.includes(category)
      );

      if (isCategoryNeeded) {
        downgradeTiers.push(tier);
      }
      // If category is not needed, don't add to downgrade options at all
    }
  });

  return {
    match: matchTiers,
    downgrade: downgradeTiers
  };
}

/**
 * Builds dropdown options for tier selection with Match and Downgrade sections
 *
 * @param matchTiers - Tiers where the selected product exists
 * @param downgradeTiers - Tiers where the selected product does NOT exist
 * @returns Array of dropdown options with group headers and dividers
 *
 * @example
 * const options = getTierOptionsForDropdown(['First'], ['Business', 'Economy']);
 * // Returns:
 * // [
 * //   { value: '', label: 'Match Your Product Tier', isGroupHeader: true },
 * //   { value: 'First', label: 'First' },
 * //   { value: '', label: '', isDivider: true },
 * //   { value: '', label: 'Downgrade Options', isGroupHeader: true },
 * //   { value: 'Business', label: 'Business (without your product)' },
 * //   { value: 'Economy', label: 'Economy (without your product)' }
 * // ]
 */
export interface TierDropdownOption {
  value: string;
  label: string;
  isGroupHeader?: boolean;
  isDivider?: boolean;
  disabled?: boolean;
}

export function getTierOptionsForDropdown(
  matchTiers: Tier[],
  downgradeTiers: Tier[]
): TierDropdownOption[] {
  const options: TierDropdownOption[] = [];

  // Add Match section if there are matching tiers
  if (matchTiers.length > 0) {
    options.push({
      value: '',
      label: 'Match Your Product Tier',
      isGroupHeader: true,
      disabled: true
    });

    matchTiers.forEach(tier => {
      options.push({
        value: tier,
        label: tier
      });
    });
  }

  // Add divider if both sections exist
  if (matchTiers.length > 0 && downgradeTiers.length > 0) {
    options.push({
      value: '',
      label: '',
      isDivider: true,
      disabled: true
    });
  }

  // Add Downgrade section if there are downgrade tiers
  if (downgradeTiers.length > 0) {
    options.push({
      value: '',
      label: 'Downgrade Options',
      isGroupHeader: true,
      disabled: true
    });

    downgradeTiers.forEach(tier => {
      options.push({
        value: tier,
        label: `${tier} (without your product)`
      });
    });
  }

  return options;
}

/**
 * Determines if a product should trigger automatic role selection
 *
 * @param product - The product to check
 * @returns 'Pilot' if product is Pilot-only, 'Copilot' if Copilot-only, null if Universal or not specified
 *
 * @example
 * // Pilot-only product
 * const role = shouldAutoSelectRole({ roleType: 'Pilot', ... });
 * // Returns: 'Pilot'
 *
 * @example
 * // Universal product (no auto-selection)
 * const role = shouldAutoSelectRole({ roleType: 'Universal', ... });
 * // Returns: null
 */
export function shouldAutoSelectRole(product: Product): 'Pilot' | 'Copilot' | null {
  if (!product || !product.roleType) {
    return null;
  }

  // Only auto-select if product is specifically Pilot or Copilot
  if (product.roleType === 'Pilot') {
    return 'Pilot';
  }

  if (product.roleType === 'Copilot') {
    return 'Copilot';
  }

  // Universal products do not trigger auto-selection
  return null;
}

/**
 * Gets the first owned product from the ownedGear array
 * This is used as the reference product for filtering logic
 *
 * @param ownedGear - Array of owned products
 * @returns The first product or null if array is empty
 */
export function getFirstOwnedProduct(ownedGear: Product[]): Product | null {
  if (!ownedGear || ownedGear.length === 0) {
    return null;
  }
  return ownedGear[0];
}

/**
 * Checks if steps 2-4 should be enabled based on owned gear
 * Steps are enabled when at least one product is selected
 *
 * @param ownedGear - Array of owned products
 * @returns true if steps should be enabled, false otherwise
 */
export function shouldEnableNextSteps(ownedGear: Product[]): boolean {
  return ownedGear && ownedGear.length > 0;
}
