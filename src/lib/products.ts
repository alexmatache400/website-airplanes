// Future-proof data access layer
// Currently reads from static JSON, can be swapped for API/DB calls later

import productsData from '../data/products.json';

export type Tier = 'First' | 'Business' | 'Economy';

export type Product = {
  id: string;
  brand: 'Winwing' | 'Thrustmaster' | 'Honeycomb' | 'Logitech' | 'WingFlex' | 'Other';
  name: string;
  slug: string;
  category: 'HOTAS' | 'Throttle' | 'Joystick' | 'Pedals' | 'Panel' | 'Mount' | 'Accessory' | 'Bundle';
  sim_support: Array<'MSFS2020' | 'MSFS2024' | 'XPL11' | 'XPL12'>;
  tier?: Tier;
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
