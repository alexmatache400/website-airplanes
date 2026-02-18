// Aircraft preset data model and utilities — reads from module-level cache populated by DataProvider

import type { Product, Tier } from './products';

export type AircraftId = string;

// Module-level cache populated by DataProvider before any component renders
let aircraftCache: AircraftPreset[] = [];
export function setAircraftCache(presets: AircraftPreset[]) { aircraftCache = presets; }

/**
 * Represents a category requirement for a complete setup
 */
export interface CategoryNeed {
  category: Product['category'];
  count: number;
}

/**
 * Tier-specific preset configuration
 */
export interface TierPreset {
  /** Categories and counts required for this aircraft + tier combination */
  needs: CategoryNeed[];

  /** Optional curated product preferences (product slugs or IDs) */
  preferredProducts?: string[];
}

/**
 * Complete aircraft preset with tier configurations
 */
export interface AircraftPreset {
  id: AircraftId;
  name: string;
  slug: string;
  tiers: Record<Tier, TierPreset>;
  notes?: string;
}

/**
 * Get all available aircraft presets
 *
 * @returns Array of all aircraft presets
 */
export function listAircraft(): AircraftPreset[] {
  return aircraftCache;
}

/**
 * Get a single aircraft preset by slug
 *
 * @param slug - Aircraft slug identifier
 * @returns Aircraft preset if found, null otherwise
 */
export function getAircraftBySlug(slug: string): AircraftPreset | null {
  const aircraft = aircraftCache;
  return aircraft.find(a => a.slug === slug) || null;
}

/**
 * Get a single aircraft preset by ID
 *
 * @param id - Aircraft ID
 * @returns Aircraft preset if found, null otherwise
 */
export function getAircraftById(id: string): AircraftPreset | null {
  const aircraft = aircraftCache;
  return aircraft.find(a => a.id === id) || null;
}

/**
 * Get needs for a specific aircraft and tier
 *
 * @param aircraftId - Aircraft ID
 * @param tier - Class tier (First, Business, Economy)
 * @returns Array of category needs, or empty array if not found
 */
export function getNeeds(aircraftId: string, tier: Tier): CategoryNeed[] {
  const aircraft = getAircraftById(aircraftId);
  if (!aircraft) return [];

  return aircraft.tiers[tier]?.needs || [];
}

/**
 * Get preferred products for a specific aircraft and tier
 *
 * @param aircraftId - Aircraft ID
 * @param tier - Class tier (First, Business, Economy)
 * @returns Array of preferred product slugs, or empty array if not found
 */
export function getPreferredProducts(aircraftId: string, tier: Tier): string[] {
  const aircraft = getAircraftById(aircraftId);
  if (!aircraft) return [];

  return aircraft.tiers[tier]?.preferredProducts || [];
}
