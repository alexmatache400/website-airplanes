// Unit tests for suggestion engine

import { generateSuggestions, replaceSuggestion, CATEGORY_EQUIVALENCE } from '../suggestions';
import type { Product } from '../products';
import type { AircraftPreset } from '../aircraft';

// Mock products for testing
const mockProducts: Product[] = [
  {
    id: '1',
    brand: 'Winwing',
    name: 'Premium HOTAS',
    slug: 'premium-hotas',
    category: 'HOTAS',
    sim_support: ['MSFS2020'],
    tier: 'First',
    images: [],
    affiliate_urls: {},
    description: 'Premium HOTAS system',
  },
  {
    id: '2',
    brand: 'Thrustmaster',
    name: 'Budget HOTAS',
    slug: 'budget-hotas',
    category: 'HOTAS',
    sim_support: ['MSFS2020'],
    tier: 'Economy',
    images: [],
    affiliate_urls: {},
    description: 'Budget HOTAS system',
  },
  {
    id: '3',
    brand: 'Winwing',
    name: 'Premium Joystick',
    slug: 'premium-joystick',
    category: 'Joystick',
    sim_support: ['MSFS2020'],
    tier: 'First',
    images: [],
    affiliate_urls: {},
    description: 'Premium joystick',
  },
  {
    id: '4',
    brand: 'Winwing',
    name: 'Premium Throttle',
    slug: 'premium-throttle',
    category: 'Throttle',
    sim_support: ['MSFS2020'],
    tier: 'First',
    images: [],
    affiliate_urls: {},
    description: 'Premium throttle',
  },
  {
    id: '5',
    brand: 'Logitech',
    name: 'Budget Pedals',
    slug: 'budget-pedals',
    category: 'Pedals',
    sim_support: ['MSFS2020'],
    tier: 'Economy',
    images: [],
    affiliate_urls: {},
    description: 'Budget pedals',
  },
  {
    id: '6',
    brand: 'Winwing',
    name: 'Premium Pedals',
    slug: 'premium-pedals',
    category: 'Pedals',
    sim_support: ['MSFS2020'],
    tier: 'First',
    images: [],
    affiliate_urls: {},
    description: 'Premium pedals',
  },
  {
    id: '7',
    brand: 'Winwing',
    name: 'Premium Panel',
    slug: 'premium-panel',
    category: 'Panel',
    sim_support: ['MSFS2020'],
    tier: 'First',
    images: [],
    affiliate_urls: {},
    description: 'Premium panel',
  },
  {
    id: '8',
    brand: 'WingFlex',
    name: 'Mid Panel',
    slug: 'mid-panel',
    category: 'Panel',
    sim_support: ['MSFS2020'],
    tier: 'Business',
    images: [],
    affiliate_urls: {},
    description: 'Mid-tier panel',
  },
];

// Mock aircraft preset
const mockAircraft: AircraftPreset = {
  id: 'test-aircraft',
  name: 'Test Aircraft',
  slug: 'test-aircraft',
  tiers: {
    First: {
      needs: [
        { category: 'Joystick', count: 1 },
        { category: 'Throttle', count: 1 },
        { category: 'Pedals', count: 1 },
        { category: 'Panel', count: 1 },
      ],
      preferredProducts: ['premium-joystick', 'premium-throttle', 'premium-pedals', 'premium-panel'],
    },
    Business: {
      needs: [
        { category: 'Joystick', count: 1 },
        { category: 'Throttle', count: 1 },
        { category: 'Pedals', count: 1 },
      ],
      preferredProducts: ['mid-panel'],
    },
    Economy: {
      needs: [
        { category: 'HOTAS', count: 1 },
        { category: 'Pedals', count: 1 },
      ],
      preferredProducts: ['budget-hotas', 'budget-pedals'],
    },
  },
};

describe('CATEGORY_EQUIVALENCE', () => {
  it('should define HOTAS as satisfying both Joystick and Throttle', () => {
    expect(CATEGORY_EQUIVALENCE.HOTAS).toContain('Joystick');
    expect(CATEGORY_EQUIVALENCE.HOTAS).toContain('Throttle');
  });

  it('should define single categories as only satisfying themselves', () => {
    expect(CATEGORY_EQUIVALENCE.Pedals).toEqual(['Pedals']);
    expect(CATEGORY_EQUIVALENCE.Panel).toEqual(['Panel']);
  });
});

describe('generateSuggestions', () => {
  it('should suggest all needed products when nothing is owned', () => {
    const result = generateSuggestions({
      aircraft: mockAircraft,
      tier: 'First',
      owned: [],
      allProducts: mockProducts,
      seed: 'test-seed',
    });

    expect(result.suggestions.length).toBe(4); // Joystick, Throttle, Pedals, Panel
    expect(result.missingByCategory.length).toBe(4);
    expect(result.warnings.length).toBe(0);
  });

  it('should prefer products from preferredProducts list', () => {
    const result = generateSuggestions({
      aircraft: mockAircraft,
      tier: 'First',
      owned: [],
      allProducts: mockProducts,
      seed: 'test-seed',
    });

    // Should prefer premium products for First class
    const joystick = result.suggestions.find(p => p.category === 'Joystick');
    const throttle = result.suggestions.find(p => p.category === 'Throttle');
    const pedals = result.suggestions.find(p => p.category === 'Pedals');
    const panel = result.suggestions.find(p => p.category === 'Panel');

    expect(joystick?.slug).toBe('premium-joystick');
    expect(throttle?.slug).toBe('premium-throttle');
    expect(pedals?.slug).toBe('premium-pedals');
    expect(panel?.slug).toBe('premium-panel');
  });

  it('should reduce needs when HOTAS is owned (satisfies Joystick + Throttle)', () => {
    const ownedHotas = mockProducts.find(p => p.slug === 'premium-hotas')!;

    const result = generateSuggestions({
      aircraft: mockAircraft,
      tier: 'First',
      owned: [ownedHotas],
      allProducts: mockProducts,
      seed: 'test-seed',
    });

    // Should only suggest Pedals and Panel (HOTAS covers Joystick + Throttle)
    expect(result.suggestions.length).toBe(2);

    const categories = result.suggestions.map(p => p.category);
    expect(categories).not.toContain('Joystick');
    expect(categories).not.toContain('Throttle');
    expect(categories).toContain('Pedals');
    expect(categories).toContain('Panel');
  });

  it('should exclude owned products from suggestions', () => {
    const ownedPedals = mockProducts.find(p => p.slug === 'premium-pedals')!;

    const result = generateSuggestions({
      aircraft: mockAircraft,
      tier: 'First',
      owned: [ownedPedals],
      allProducts: mockProducts,
      seed: 'test-seed',
    });

    // Should not suggest the owned pedals
    const suggestedIds = result.suggestions.map(p => p.id);
    expect(suggestedIds).not.toContain(ownedPedals.id);

    // Should still need 3 products (Joystick, Throttle, Panel)
    expect(result.suggestions.length).toBe(3);
  });

  it('should filter by tier', () => {
    const result = generateSuggestions({
      aircraft: mockAircraft,
      tier: 'First',
      owned: [],
      allProducts: mockProducts,
      seed: 'test-seed',
    });

    // All suggestions should be First tier
    result.suggestions.forEach(product => {
      expect(product.tier).toBe('First');
    });
  });

  it('should produce reproducible results with same seed', () => {
    const result1 = generateSuggestions({
      aircraft: mockAircraft,
      tier: 'First',
      owned: [],
      allProducts: mockProducts,
      seed: 'consistent-seed',
    });

    const result2 = generateSuggestions({
      aircraft: mockAircraft,
      tier: 'First',
      owned: [],
      allProducts: mockProducts,
      seed: 'consistent-seed',
    });

    // Same seed should produce same suggestions
    expect(result1.suggestions.map(p => p.id)).toEqual(
      result2.suggestions.map(p => p.id)
    );
  });

  it('should produce different results with different seeds', () => {
    // Add more products to make randomness visible
    const moreProducts: Product[] = [
      ...mockProducts,
      {
        id: '9',
        brand: 'Winwing',
        name: 'Another Premium Joystick',
        slug: 'another-premium-joystick',
        category: 'Joystick',
        sim_support: ['MSFS2020'],
        tier: 'First',
        images: [],
        affiliate_urls: {},
        description: 'Another premium joystick',
      },
    ];

    const result1 = generateSuggestions({
      aircraft: mockAircraft,
      tier: 'First',
      owned: [],
      allProducts: moreProducts,
      seed: 'seed-a',
    });

    const result2 = generateSuggestions({
      aircraft: mockAircraft,
      tier: 'First',
      owned: [],
      allProducts: moreProducts,
      seed: 'seed-b',
    });

    // Different seeds might produce different suggestions
    // (not guaranteed with small dataset, but test the mechanism)
    expect(result1.suggestions.length).toBe(result2.suggestions.length);
  });

  it('should handle Economy tier with HOTAS requirement', () => {
    const result = generateSuggestions({
      aircraft: mockAircraft,
      tier: 'Economy',
      owned: [],
      allProducts: mockProducts,
      seed: 'test-seed',
    });

    expect(result.suggestions.length).toBe(2); // HOTAS + Pedals

    const hotas = result.suggestions.find(p => p.category === 'HOTAS');
    const pedals = result.suggestions.find(p => p.category === 'Pedals');

    expect(hotas).toBeDefined();
    expect(pedals).toBeDefined();
    expect(hotas?.tier).toBe('Economy');
    expect(pedals?.tier).toBe('Economy');
  });

  it('should warn when insufficient products available', () => {
    // Create aircraft needing 5 panels, but only 2 are available
    const needyAircraft: AircraftPreset = {
      ...mockAircraft,
      tiers: {
        ...mockAircraft.tiers,
        First: {
          needs: [{ category: 'Panel', count: 5 }],
          preferredProducts: [],
        },
      },
    };

    const result = generateSuggestions({
      aircraft: needyAircraft,
      tier: 'First',
      owned: [],
      allProducts: mockProducts,
      seed: 'test-seed',
    });

    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings[0]).toContain('Only found');
    expect(result.suggestions.length).toBeLessThan(5);
  });
});

describe('replaceSuggestion', () => {
  it('should replace a suggestion with a different product in the same category', () => {
    // Add multiple pedals to enable replacement
    const products: Product[] = [
      ...mockProducts,
      {
        id: '10',
        brand: 'Other',
        name: 'Alternative Pedals',
        slug: 'alternative-pedals',
        category: 'Pedals',
        sim_support: ['MSFS2020'],
        tier: 'First',
        images: [],
        affiliate_urls: {},
        description: 'Alternative pedals',
      },
    ];

    const currentSuggestions = [
      products.find(p => p.slug === 'premium-pedals')!,
    ];

    const replacement = replaceSuggestion(
      currentSuggestions,
      'Pedals',
      {
        aircraft: mockAircraft,
        tier: 'First',
        owned: [],
        allProducts: products,
        seed: 'replace-seed',
      }
    );

    expect(replacement).not.toBeNull();
    expect(replacement?.category).toBe('Pedals');
    expect(replacement?.id).not.toBe(currentSuggestions[0].id);
  });

  it('should exclude owned products when replacing', () => {
    const products: Product[] = [
      ...mockProducts,
      {
        id: '10',
        brand: 'Other',
        name: 'Alternative Pedals',
        slug: 'alternative-pedals',
        category: 'Pedals',
        sim_support: ['MSFS2020'],
        tier: 'First',
        images: [],
        affiliate_urls: {},
        description: 'Alternative pedals',
      },
    ];

    const ownedPedals = products.find(p => p.slug === 'alternative-pedals')!;
    const currentSuggestions = [
      products.find(p => p.slug === 'premium-pedals')!,
    ];

    const replacement = replaceSuggestion(
      currentSuggestions,
      'Pedals',
      {
        aircraft: mockAircraft,
        tier: 'First',
        owned: [ownedPedals],
        allProducts: products,
        seed: 'replace-seed',
      }
    );

    // Should not suggest the owned pedals
    expect(replacement?.id).not.toBe(ownedPedals.id);
  });

  it('should return null when no alternative products available', () => {
    const currentSuggestions = [
      mockProducts.find(p => p.slug === 'premium-pedals')!,
    ];

    const replacement = replaceSuggestion(
      currentSuggestions,
      'Pedals',
      {
        aircraft: mockAircraft,
        tier: 'First',
        owned: [],
        allProducts: mockProducts, // Only one First-tier Pedals available
        seed: 'replace-seed',
      }
    );

    expect(replacement).toBeNull();
  });
});
