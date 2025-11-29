// Future-proof data access layer
// Currently reads from static JSON, can be swapped for API/DB calls later

import React from 'react';
import productsData from '../data/products.json';

export type Tier = 'First' | 'Business' | 'Economy';

export type Product = {
  id: string;
  brand: 'Winwing' | 'Thrustmaster' | 'Honeycomb' | 'Logitech' | 'WingFlex' | 'Other';
  name: string;
  slug: string;
  category: 'HOTAS' | 'Throttle' | 'Joystick' | 'Pedals' | 'Panel' | 'Bundle' | 'MCDU' | 'Rudder' | 'Base' | 'Accessories';
  roleType: 'Pilot' | 'Copilot' | 'Universal';
  sim_support: Array<'MSFS2020' | 'MSFS2024' | 'XPL11' | 'XPL12'>;
  tier?: Tier;
  aircraftFamily?: 'airbus-a32f' | 'boeing-737' | 'f16-viper' | 'fa18-hornet' | 'general';
  price_eur?: number;
  price_label?: string;
  images: string[];
  affiliate_urls: { eu?: string; us?: string; winwingsim?: string };
  description: string;
  key_specs?: Record<string, string | number>;
  source_url?: string;
};

interface ListProductsParams {
  q?: string;
  tier?: Tier;
}

/**
 * Retrieves products list with optional search query and tier filter
 *
 * @param params - Optional search and filter parameters
 * @returns Array of products, filtered by query and/or tier if provided
 *
 * Future: Replace with API call to /api/products?q=...&tier=...
 * Example: const response = await fetch(`/api/products?q=${params.q}&tier=${params.tier}`);
 */
export function listProducts(params: ListProductsParams = {}): Product[] {
  let products = productsData as unknown as Product[];

  // Filter by tier if specified
  if (params.tier) {
    products = products.filter(product => product.tier === params.tier);
  }

  // Filter by search query if specified
  if (params.q) {
    const query = params.q.toLowerCase();
    products = products.filter(product =>
      product.name.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query) ||
      product.brand.toLowerCase().includes(query)
    );
  }

  return products;
}

/**
 * Smart search with prioritization:
 * 1. Prefix matches (progressive length) - only for queries 3+ chars
 * 2. Substring matches (anywhere in product name) - for all queries 2+ chars
 *
 * @param products - Array of products to search
 * @param query - Search query (minimum 2 characters required)
 * @returns Prioritized array of maximum 10 products
 *
 * @example
 * // 2-char query: only substring matches (most filtered)
 * searchProducts(allProducts, 'or'); // Only products with "or" in name
 *
 * // 3-char query: prefix (3 chars) + substring
 * searchProducts(allProducts, 'ori'); // Products starting with "ori" first, then containing "ori"
 *
 * // 4+ char query: prefix (4 chars) + substring (very specific)
 * searchProducts(allProducts, 'orio'); // Products starting with "orio" first, then containing "orio"
 */
export function searchProducts(products: Product[], query: string): Product[] {
  // Minimum 2 characters required
  if (query.trim().length < 2) {
    return [];
  }

  const normalizedQuery = query.toLowerCase().trim();

  const prefixMatches: Product[] = [];
  const substringMatches: Product[] = [];
  const addedIds = new Set<string>(); // Track added products to avoid duplicates

  products.forEach(product => {
    const name = product.name.toLowerCase();
    const words = name.split(/\s+/); // Split by whitespace

    // Check if any word starts with the FULL query (not truncated)
    const hasWordPrefix = words.some(word =>
      word.startsWith(normalizedQuery)
    );

    // Check if query appears anywhere in the name (substring)
    const hasSubstring = name.includes(normalizedQuery);

    if (hasWordPrefix && !addedIds.has(product.id)) {
      prefixMatches.push(product);
      addedIds.add(product.id);
    } else if (hasSubstring && !addedIds.has(product.id)) {
      substringMatches.push(product);
      addedIds.add(product.id);
    }
  });

  // Combine: prefix first (if applicable), then substring
  const combined = [...prefixMatches, ...substringMatches];

  // Limit to 10 results
  return combined.slice(0, 10);
}

/**
 * Highlights matching portions of text with orange color
 * Case-insensitive matching
 *
 * @param text - The text to highlight (e.g., product name)
 * @param query - The search query to match
 * @returns React fragment with highlighted portions
 *
 * @example
 * // Returns: <>Win<span className="text-orange-500">wing</span> Orion</>
 * highlightMatch('Winwing Orion', 'wing');
 */
export function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query || query.trim().length < 2) {
    return text;
  }

  const normalizedQuery = query.toLowerCase().trim();
  const lowerText = text.toLowerCase();

  // Find the match position (case-insensitive)
  const matchIndex = lowerText.indexOf(normalizedQuery);

  if (matchIndex === -1) {
    return text;
  }

  // Split text into: before match, match, after match
  const before = text.slice(0, matchIndex);
  const match = text.slice(matchIndex, matchIndex + normalizedQuery.length);
  const after = text.slice(matchIndex + normalizedQuery.length);

  return React.createElement(
    React.Fragment,
    null,
    before,
    React.createElement('span', { className: 'text-orange-500' }, match),
    after
  );
}

/**
 * Build slug-to-index map for O(1) lookup
 * Useful for scroll-to-product functionality
 */
export function buildProductIndexMap(products: Product[]): Map<string, number> {
  const map = new Map<string, number>();
  products.forEach((product, index) => {
    map.set(product.slug, index);
  });
  return map;
}

/**
 * Find first product matching the query (case-insensitive)
 * Used for search highlight functionality
 */
export function findProductByName(products: Product[], query: string): Product | null {
  if (!query) return null;

  const normalizedQuery = query.toLowerCase();
  return products.find(product =>
    product.name.toLowerCase().includes(normalizedQuery)
  ) || null;
}

/**
 * Get a single product by its slug
 *
 * @param slug - The product slug (URL-friendly identifier)
 * @returns Product if found, null otherwise
 *
 * Future: Replace with API call to /api/products/[slug]
 * Example: const response = await fetch(`/api/products/${slug}`);
 */
export function getProductBySlug(slug: string): Product | null {
  const products = productsData as unknown as Product[];
  return products.find(product => product.slug === slug) || null;
}

/**
 * Get multiple products by their IDs
 *
 * @param ids - Array of product IDs
 * @returns Array of products (in same order as IDs, skips missing products)
 *
 * Future: Replace with API call to /api/products?ids=1,2,3
 * Example: const response = await fetch(`/api/products?ids=${ids.join(',')}`);
 */
export function getProductsByIds(ids: string[]): Product[] {
  const products = productsData as unknown as Product[];
  const productMap = new Map(products.map(p => [p.id, p]));

  return ids
    .map(id => productMap.get(id))
    .filter((p): p is Product => p !== undefined);
}

/**
 * Filters products by aircraft family
 *
 * @param products - Array of products to filter
 * @param aircraftFamilyId - The aircraft family ID to filter by (e.g., 'airbus-a32f', 'f16-viper')
 * @returns Array of products matching the family or marked as 'general'
 *
 * @example
 * // Filter for F-16 specific products
 * const f16Products = filterProductsByFamily(allProducts, 'f16-viper');
 * // Returns: products with aircraftFamily === 'f16-viper' OR aircraftFamily === 'general'
 *
 * // No family filter (show all)
 * const allProducts = filterProductsByFamily(products, null);
 * // Returns: all products unchanged
 */
export function filterProductsByFamily(
  products: Product[],
  aircraftFamilyId: string | null
): Product[] {
  // If no family specified, return all products
  if (!aircraftFamilyId || aircraftFamilyId.trim() === '') {
    return products;
  }

  // Filter by family: include products that match the family OR are general
  return products.filter(product => {
    // Products without aircraftFamily field are treated as 'general' (backward compatibility)
    if (!product.aircraftFamily) {
      return true; // Include products without family (treat as general)
    }

    // Include if product matches the selected family OR is marked as general
    return product.aircraftFamily === aircraftFamilyId || product.aircraftFamily === 'general';
  });
}
