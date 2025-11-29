import { filterProductsByFamily, searchProducts, Product } from '../products';

describe('filterProductsByFamily', () => {
  const mockProducts: Product[] = [
    {
      id: '1',
      brand: 'Winwing',
      name: 'WINWING Orion2 HOTAS ViperAce',
      slug: 'orion2-hotas-viperace',
      category: 'HOTAS',
      roleType: 'Universal',
      sim_support: ['MSFS2020', 'MSFS2024'],
      tier: 'First',
      aircraftFamily: 'f16-viper',
      images: [],
      affiliate_urls: {},
      description: 'F-16 HOTAS',
    },
    {
      id: '2',
      brand: 'Winwing',
      name: 'WINWING Orion2 HOTAS StrikeAce',
      slug: 'orion2-hotas-strikeace',
      category: 'HOTAS',
      roleType: 'Universal',
      sim_support: ['MSFS2020', 'MSFS2024'],
      tier: 'First',
      aircraftFamily: 'fa18-hornet',
      images: [],
      affiliate_urls: {},
      description: 'F/A-18 HOTAS',
    },
    {
      id: '3',
      brand: 'Logitech',
      name: 'Logitech G Flight Rudder Pedals',
      slug: 'logi-flight-rudder-pedals',
      category: 'Pedals',
      roleType: 'Universal',
      sim_support: ['MSFS2020', 'MSFS2024'],
      tier: 'Economy',
      aircraftFamily: 'general',
      images: [],
      affiliate_urls: {},
      description: 'Universal rudder pedals',
    },
    {
      id: '4',
      brand: 'Thrustmaster',
      name: 'Thrustmaster TCA Captain Pack - Airbus',
      slug: 'tm-tca-captain-pack-airbus',
      category: 'Bundle',
      roleType: 'Universal',
      sim_support: ['MSFS2020', 'MSFS2024'],
      tier: 'Business',
      aircraftFamily: 'airbus-a32f',
      images: [],
      affiliate_urls: {},
      description: 'Airbus bundle',
    },
    {
      id: '5',
      brand: 'Thrustmaster',
      name: 'Thrustmaster TCA Yoke Pack - Boeing',
      slug: 'tm-tca-yoke-pack-boeing',
      category: 'Bundle',
      roleType: 'Universal',
      sim_support: ['MSFS2020', 'MSFS2024'],
      tier: 'Economy',
      aircraftFamily: 'boeing-737',
      images: [],
      affiliate_urls: {},
      description: 'Boeing bundle',
    },
    {
      id: '6',
      brand: 'Winwing',
      name: 'Some Product Without Family',
      slug: 'product-without-family',
      category: 'Panel',
      roleType: 'Universal',
      sim_support: ['MSFS2020'],
      tier: 'Business',
      // No aircraftFamily field (backward compatibility test)
      images: [],
      affiliate_urls: {},
      description: 'Panel without family',
    },
  ];

  it('should filter products by aircraftFamily - returns only matching products', () => {
    const result = filterProductsByFamily(mockProducts, 'f16-viper');

    expect(result).toHaveLength(2); // ViperAce + general pedals
    expect(result.some(p => p.id === '1')).toBe(true); // ViperAce (f16-viper)
    expect(result.some(p => p.id === '3')).toBe(true); // General pedals
    expect(result.some(p => p.id === '2')).toBe(false); // StrikeAce (fa18-hornet)
    expect(result.some(p => p.id === '4')).toBe(false); // Airbus
    expect(result.some(p => p.id === '5')).toBe(false); // Boeing
  });

  it('should include general products when family is selected', () => {
    const result = filterProductsByFamily(mockProducts, 'airbus-a32f');

    expect(result).toHaveLength(2); // Airbus bundle + general pedals
    expect(result.some(p => p.id === '4')).toBe(true); // Airbus bundle
    expect(result.some(p => p.id === '3')).toBe(true); // General pedals
    expect(result.some(p => p.id === '1')).toBe(false); // F-16
    expect(result.some(p => p.id === '2')).toBe(false); // F/A-18
    expect(result.some(p => p.id === '5')).toBe(false); // Boeing
  });

  it('should return all products when no aircraft family provided (null)', () => {
    const result = filterProductsByFamily(mockProducts, null);

    expect(result).toHaveLength(mockProducts.length);
    expect(result).toEqual(mockProducts);
  });

  it('should return all products when empty string provided', () => {
    const result = filterProductsByFamily(mockProducts, '');

    expect(result).toHaveLength(mockProducts.length);
    expect(result).toEqual(mockProducts);
  });

  it('should handle products without aircraftFamily field (backward compatibility)', () => {
    const result = filterProductsByFamily(mockProducts, 'boeing-737');

    // Products without aircraftFamily should be treated as 'general'
    expect(result).toHaveLength(3); // Boeing + general pedals + product without family
    expect(result.some(p => p.id === '5')).toBe(true); // Boeing
    expect(result.some(p => p.id === '3')).toBe(true); // General pedals
    expect(result.some(p => p.id === '6')).toBe(true); // Product without family (treated as general)
  });

  it('should combine family + role filtering correctly', () => {
    const mockProductsWithRoles: Product[] = [
      {
        id: '1',
        brand: 'Winwing',
        name: 'WINWING URSA MINOR Joystick L',
        slug: 'ursa-minor-l',
        category: 'Joystick',
        roleType: 'Pilot',
        sim_support: ['MSFS2020'],
        tier: 'Economy',
        aircraftFamily: 'airbus-a32f',
        images: [],
        affiliate_urls: {},
        description: 'Pilot joystick',
      },
      {
        id: '2',
        brand: 'Winwing',
        name: 'WINWING URSA MINOR Joystick R',
        slug: 'ursa-minor-r',
        category: 'Joystick',
        roleType: 'Copilot',
        sim_support: ['MSFS2020'],
        tier: 'Economy',
        aircraftFamily: 'airbus-a32f',
        images: [],
        affiliate_urls: {},
        description: 'Copilot joystick',
      },
      {
        id: '3',
        brand: 'Logitech',
        name: 'Pedals',
        slug: 'pedals',
        category: 'Pedals',
        roleType: 'Universal',
        sim_support: ['MSFS2020'],
        tier: 'Economy',
        aircraftFamily: 'general',
        images: [],
        affiliate_urls: {},
        description: 'Universal pedals',
      },
    ];

    // First filter by family
    const familyFiltered = filterProductsByFamily(mockProductsWithRoles, 'airbus-a32f');
    expect(familyFiltered).toHaveLength(3); // Both joysticks + general pedals

    // Then filter by role (this would be done in CompleteSetup.tsx)
    const roleFiltered = familyFiltered.filter(
      p => p.roleType === 'Pilot' || p.roleType === 'Universal'
    );
    expect(roleFiltered).toHaveLength(2); // Pilot joystick + universal pedals
    expect(roleFiltered.some(p => p.id === '1')).toBe(true); // Pilot joystick
    expect(roleFiltered.some(p => p.id === '3')).toBe(true); // Universal pedals
    expect(roleFiltered.some(p => p.id === '2')).toBe(false); // Copilot joystick excluded
  });

  it('should return empty array when no products match the family', () => {
    const result = filterProductsByFamily(mockProducts, 'f16-viper');

    // Only ViperAce + general pedals match
    expect(result).toHaveLength(2);

    // But if we had a family with no products:
    const noMatchResult = filterProductsByFamily(
      mockProducts.filter(p => p.aircraftFamily === 'airbus-a32f'),
      'f16-viper'
    );
    expect(noMatchResult).toHaveLength(0);
  });
});

describe('searchProducts with family filtering', () => {
  const mockProducts: Product[] = [
    {
      id: '1',
      brand: 'Winwing',
      name: 'WINWING Orion2 HOTAS ViperAce',
      slug: 'orion2-hotas-viperace',
      category: 'HOTAS',
      roleType: 'Universal',
      sim_support: ['MSFS2020'],
      tier: 'First',
      aircraftFamily: 'f16-viper',
      images: [],
      affiliate_urls: {},
      description: 'F-16 HOTAS',
    },
    {
      id: '2',
      brand: 'Winwing',
      name: 'WINWING Orion2 HOTAS StrikeAce',
      slug: 'orion2-hotas-strikeace',
      category: 'HOTAS',
      roleType: 'Universal',
      sim_support: ['MSFS2020'],
      tier: 'First',
      aircraftFamily: 'fa18-hornet',
      images: [],
      affiliate_urls: {},
      description: 'F/A-18 HOTAS',
    },
    {
      id: '3',
      brand: 'Logitech',
      name: 'Logitech G Flight Rudder Pedals',
      slug: 'logi-flight-rudder-pedals',
      category: 'Pedals',
      roleType: 'Universal',
      sim_support: ['MSFS2020'],
      tier: 'Economy',
      aircraftFamily: 'general',
      images: [],
      affiliate_urls: {},
      description: 'Universal pedals',
    },
  ];

  it('should respect pre-filtered product list (family filter applied before search)', () => {
    // Filter by family first (simulating Step 3 behavior)
    const familyFiltered = filterProductsByFamily(mockProducts, 'f16-viper');

    // Then search within filtered results
    const result = searchProducts(familyFiltered, 'win');

    // Should only find ViperAce (not StrikeAce)
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1'); // ViperAce
  });

  it('should return max 10 results even with family filter applied', () => {
    // Create 15 products all matching the same family
    const manyProducts: Product[] = Array.from({ length: 15 }, (_, i) => ({
      id: `${i + 1}`,
      brand: 'Winwing',
      name: `WINWING Product ${i + 1}`,
      slug: `winwing-product-${i + 1}`,
      category: 'Panel',
      roleType: 'Universal',
      sim_support: ['MSFS2020'],
      tier: 'Business',
      aircraftFamily: 'airbus-a32f',
      images: [],
      affiliate_urls: {},
      description: 'Airbus panel',
    }));

    const familyFiltered = filterProductsByFamily(manyProducts, 'airbus-a32f');
    const result = searchProducts(familyFiltered, 'win');

    expect(result.length).toBeLessThanOrEqual(10);
    expect(result).toHaveLength(10); // Hard limit of 10
  });

  it('should prioritize prefix matches within family-filtered results', () => {
    const mixedProducts: Product[] = [
      {
        id: '1',
        brand: 'Winwing',
        name: 'Orion Panel', // Contains "ori" but not as prefix
        slug: 'orion-panel',
        category: 'Panel',
        roleType: 'Universal',
        sim_support: ['MSFS2020'],
        tier: 'Business',
        aircraftFamily: 'airbus-a32f',
        images: [],
        affiliate_urls: {},
        description: 'Panel',
      },
      {
        id: '2',
        brand: 'Other',
        name: 'Orientation Sensor', // Starts with "Ori"
        slug: 'orientation-sensor',
        category: 'Accessories',
        roleType: 'Universal',
        sim_support: ['MSFS2020'],
        tier: 'Economy',
        aircraftFamily: 'airbus-a32f',
        images: [],
        affiliate_urls: {},
        description: 'Sensor',
      },
    ];

    const familyFiltered = filterProductsByFamily(mixedProducts, 'airbus-a32f');
    const result = searchProducts(familyFiltered, 'ori');

    // "Orientation" should come first (word prefix)
    expect(result[0].id).toBe('2');
    expect(result[1].id).toBe('1');
  });
});
