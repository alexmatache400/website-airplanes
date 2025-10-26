// Suggestion engine for complete setup recommendations

import type { Product, Tier } from './products';
import type { AircraftPreset, CategoryNeed } from './aircraft';

/**
 * Category equivalence map for combo products
 * e.g., HOTAS satisfies both Joystick and Throttle needs
 */
export const CATEGORY_EQUIVALENCE: Record<Product['category'], Product['category'][]> = {
  HOTAS: ['Joystick', 'Throttle', 'HOTAS'],
  Bundle: ['Bundle'], // Bundles should be evaluated case-by-case
  Joystick: ['Joystick'],
  Throttle: ['Throttle'],
  Pedals: ['Pedals'],
  Panel: ['Panel'],
  Mount: ['Mount'],
  Accessory: ['Accessory'],
};

/**
 * Input for generating product suggestions
 */
export interface SuggestionInput {
  aircraft: AircraftPreset;
  tier: Tier;
  owned: Product[]; // User-selected existing gear
  allProducts: Product[]; // Product catalog
  seed?: string; // For reproducible randomness
  lockedSuggestions?: Map<string, Product>; // Locked suggestions per category
}

/**
 * Result of suggestion generation
 */
export interface SuggestionResult {
  missingByCategory: Array<{ category: Product['category']; needed: number; available: number }>;
  suggestions: Product[];
  warnings: string[];
}

/**
 * Seeded PRNG using mulberry32 algorithm
 * Returns a function that generates random numbers in [0, 1) range
 *
 * @param seed - String seed for deterministic randomness
 * @returns Random number generator function
 */
function createSeededRandom(seed: string = ''): () => number {
  // Convert string to 32-bit integer hash
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  // mulberry32 PRNG
  return function() {
    hash = (hash + 0x6D2B79F5) | 0;
    let t = Math.imul(hash ^ (hash >>> 15), 1 | hash);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Shuffle array using seeded random function
 *
 * @param array - Array to shuffle
 * @param random - Seeded random function
 * @returns Shuffled array (does not mutate original)
 */
function shuffleArray<T>(array: T[], random: () => number): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Calculate which categories a product satisfies based on equivalence rules
 *
 * @param product - Product to evaluate
 * @returns Array of categories this product satisfies
 */
function getSatisfiedCategories(product: Product): Product['category'][] {
  return CATEGORY_EQUIVALENCE[product.category] || [product.category];
}

/**
 * Calculate remaining needs after accounting for owned products
 *
 * @param needs - Required categories and counts
 * @param owned - Products already owned by user
 * @returns Map of category to remaining count needed
 */
function calculateMissingNeeds(
  needs: CategoryNeed[],
  owned: Product[]
): Map<Product['category'], number> {
  const missing = new Map<Product['category'], number>();

  // Initialize with required counts
  needs.forEach(need => {
    missing.set(need.category, need.count);
  });

  // Subtract owned products (considering equivalence)
  owned.forEach(product => {
    const satisfiedCategories = getSatisfiedCategories(product);

    satisfiedCategories.forEach(category => {
      const current = missing.get(category);
      if (current !== undefined && current > 0) {
        missing.set(category, current - 1);
      }
    });
  });

  // Remove categories with 0 or negative needs
  const categoriesToRemove: Product['category'][] = [];
  missing.forEach((count, category) => {
    if (count <= 0) {
      categoriesToRemove.push(category);
    }
  });
  categoriesToRemove.forEach(category => missing.delete(category));

  return missing;
}

/**
 * Generate product suggestions to complete a setup
 *
 * @param input - Configuration for suggestion generation
 * @returns Structured result with suggestions and metadata
 */
export function generateSuggestions(input: SuggestionInput): SuggestionResult {
  const { aircraft, tier, owned, allProducts, seed = '', lockedSuggestions = new Map() } = input;
  const random = createSeededRandom(seed);
  const warnings: string[] = [];
  const suggestions: Product[] = [];

  // 1) Get needs for this aircraft + tier
  const tierPreset = aircraft.tiers[tier];
  if (!tierPreset) {
    return {
      missingByCategory: [],
      suggestions: [],
      warnings: [`No configuration found for ${aircraft.name} (${tier} class)`],
    };
  }

  // 2) Calculate missing categories after subtracting owned
  const missingNeeds = calculateMissingNeeds(tierPreset.needs, owned);

  // 3) Get preferred products list (slugs)
  const preferredSlugs = new Set(tierPreset.preferredProducts || []);

  // 4) Create set of owned product IDs to exclude
  const ownedIds = new Set(owned.map(p => p.id));

  // 5) For each missing category, select products
  const missingByCategory: SuggestionResult['missingByCategory'] = [];

  missingNeeds.forEach((needed, category) => {
    // Check if we have a locked suggestion for this category
    const locked = lockedSuggestions.get(category);
    if (locked && needed === 1) {
      suggestions.push(locked);
      missingByCategory.push({ category, needed: 1, available: 1 });
      return;
    }

    // Filter candidate products:
    // - Match category (considering equivalence)
    // - Match tier (prefer exact tier match, but allow fallback if needed)
    // - Exclude owned products
    // - Exclude already suggested products
    const suggestedIds = new Set(suggestions.map(p => p.id));

    let candidates = allProducts.filter(product => {
      if (ownedIds.has(product.id)) return false;
      if (suggestedIds.has(product.id)) return false;

      const satisfiedCategories = getSatisfiedCategories(product);
      if (!satisfiedCategories.includes(category)) return false;

      // Tier matching: prefer exact match, allow if no tier specified
      if (product.tier && product.tier !== tier) return false;

      return true;
    });

    // Sort candidates: preferred products first, then others
    const preferred: Product[] = [];
    const others: Product[] = [];

    candidates.forEach(product => {
      if (preferredSlugs.has(product.slug) || preferredSlugs.has(product.id)) {
        preferred.push(product);
      } else {
        others.push(product);
      }
    });

    // Shuffle each group for variety, then combine
    const shuffledPreferred = shuffleArray(preferred, random);
    const shuffledOthers = shuffleArray(others, random);
    const sortedCandidates = [...shuffledPreferred, ...shuffledOthers];

    // Select up to 'needed' products
    const selected = sortedCandidates.slice(0, needed);
    suggestions.push(...selected);

    // Track availability
    missingByCategory.push({
      category,
      needed,
      available: selected.length,
    });

    // Warn if we couldn't fill the requirement
    if (selected.length < needed) {
      warnings.push(
        `Only found ${selected.length} of ${needed} required ${category} products for ${tier} class`
      );
    }
  });

  return {
    missingByCategory,
    suggestions,
    warnings,
  };
}

/**
 * Replace a single suggestion in a category
 *
 * @param currentSuggestions - Current list of suggestions
 * @param categoryToReplace - Category of product to replace
 * @param input - Original suggestion input
 * @param excludeIds - Additional product IDs to exclude
 * @returns New suggestion for that category, or null if none available
 */
export function replaceSuggestion(
  currentSuggestions: Product[],
  categoryToReplace: Product['category'],
  input: SuggestionInput,
  excludeIds: Set<string> = new Set()
): Product | null {
  const { tier, owned, allProducts, seed = '' } = input;
  const random = createSeededRandom(seed + categoryToReplace + Date.now()); // Add timestamp for variety

  // Combine owned IDs, current suggestion IDs, and exclude IDs
  const ownedIds = new Set(owned.map(p => p.id));
  const suggestedIds = new Set(currentSuggestions.map(p => p.id));
  const allExcludedIds = new Set([
    ...Array.from(ownedIds),
    ...Array.from(suggestedIds),
    ...Array.from(excludeIds)
  ]);

  // Filter candidates
  let candidates = allProducts.filter(product => {
    if (allExcludedIds.has(product.id)) return false;

    const satisfiedCategories = getSatisfiedCategories(product);
    if (!satisfiedCategories.includes(categoryToReplace)) return false;

    if (product.tier && product.tier !== tier) return false;

    return true;
  });

  if (candidates.length === 0) {
    return null;
  }

  // Shuffle and pick first
  const shuffled = shuffleArray(candidates, random);
  return shuffled[0];
}
