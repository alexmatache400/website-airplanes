import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CompleteSetup from '../CompleteSetup';

// Mock the modules
jest.mock('../../lib/aircraft', () => ({
  listAircraft: jest.fn(() => [
    {
      id: 'airbus-a32f',
      name: 'Airbus A32F',
      slug: 'airbus-a32f',
      tiers: {
        Business: {
          needs: [{ category: 'Panel', count: 1 }],
          preferredProducts: ['32-ecam'],
        },
      },
    },
    {
      id: 'f16-viper',
      name: 'F-16 Viper',
      slug: 'f16-viper',
      tiers: {
        Business: {
          needs: [{ category: 'HOTAS', count: 1 }],
          preferredProducts: ['orion2-hotas-viperace'],
        },
      },
    },
  ]),
}));

jest.mock('../../lib/products', () => ({
  ...jest.requireActual('../../lib/products'),
  listProducts: jest.fn(() => [
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
      name: 'WINWING 32 ECAM',
      slug: '32-ecam',
      category: 'Panel',
      roleType: 'Universal',
      sim_support: ['MSFS2020'],
      tier: 'Business',
      aircraftFamily: 'airbus-a32f',
      images: [],
      affiliate_urls: {},
      description: 'Airbus ECAM panel',
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
      description: 'Universal rudder pedals',
    },
    {
      id: '4',
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
  ]),
}));

const renderCompleteSetup = () => {
  return render(
    <BrowserRouter>
      <CompleteSetup />
    </BrowserRouter>
  );
};

describe('CompleteSetup - Step 3: Equipment Search with Family Filtering', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  it('should show only selected family products in search results', async () => {
    renderCompleteSetup();

    // Step 1: Select aircraft family
    const aircraftSelect = screen.getByRole('combobox', { name: /select an aircraft/i });
    fireEvent.change(aircraftSelect, { target: { value: 'f16-viper' } });

    // Step 3: Type in search bar
    const searchInput = screen.getByPlaceholderText(/search for equipment/i);
    fireEvent.change(searchInput, { target: { value: 'win' } });

    // Wait for search suggestions
    await waitFor(() => {
      // Should show ViperAce (f16-viper) but NOT StrikeAce (fa18-hornet)
      expect(screen.getByText(/ViperAce/i)).toBeInTheDocument();
      expect(screen.queryByText(/StrikeAce/i)).not.toBeInTheDocument();

      // Should show ECAM panel even though it's not F-16 specific? No, it's Airbus
      expect(screen.queryByText(/ECAM/i)).not.toBeInTheDocument();
    });
  });

  it('should include general products regardless of selected family', async () => {
    renderCompleteSetup();

    // Step 1: Select Airbus
    const aircraftSelect = screen.getByRole('combobox', { name: /select an aircraft/i });
    fireEvent.change(aircraftSelect, { target: { value: 'airbus-a32f' } });

    // Step 3: Search for "logi" (Logitech pedals - general)
    const searchInput = screen.getByPlaceholderText(/search for equipment/i);
    fireEvent.change(searchInput, { target: { value: 'logi' } });

    // Wait for search suggestions
    await waitFor(() => {
      // Should show Logitech pedals (general product)
      expect(screen.getByText(/Logitech.*Rudder Pedals/i)).toBeInTheDocument();
    });
  });

  it('should reset search results when aircraft family changes', async () => {
    renderCompleteSetup();

    // Step 1: Select F-16
    const aircraftSelect = screen.getByRole('combobox', { name: /select an aircraft/i });
    fireEvent.change(aircraftSelect, { target: { value: 'f16-viper' } });

    // Step 3: Search
    const searchInput = screen.getByPlaceholderText(/search for equipment/i);
    fireEvent.change(searchInput, { target: { value: 'win' } });

    await waitFor(() => {
      expect(screen.getByText(/ViperAce/i)).toBeInTheDocument();
    });

    // Change aircraft to Airbus
    fireEvent.change(aircraftSelect, { target: { value: 'airbus-a32f' } });

    // Search again
    fireEvent.change(searchInput, { target: { value: 'win' } });

    await waitFor(() => {
      // Should now show ECAM (Airbus) but NOT ViperAce (F-16)
      expect(screen.getByText(/ECAM/i)).toBeInTheDocument();
      expect(screen.queryByText(/ViperAce/i)).not.toBeInTheDocument();
    });
  });

  it('should show "No suggestions" when no family-appropriate products match query', async () => {
    renderCompleteSetup();

    // Step 1: Select F-16
    const aircraftSelect = screen.getByRole('combobox', { name: /select an aircraft/i });
    fireEvent.change(aircraftSelect, { target: { value: 'f16-viper' } });

    // Step 3: Search for something that only exists in Airbus family
    const searchInput = screen.getByPlaceholderText(/search for equipment/i);
    fireEvent.change(searchInput, { target: { value: 'ecam' } });

    // Should not show any suggestions (ECAM is Airbus-specific)
    await waitFor(() => {
      expect(screen.queryByText(/ECAM/i)).not.toBeInTheDocument();
      // Optionally check for empty state message
      expect(screen.queryByRole('list')).toBeEmptyDOMElement();
    });
  });

  it('should combine role filter and family filter correctly', async () => {
    // Mock products with different role types
    const mockProductsWithRoles = [
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
    ];

    // Re-mock listProducts for this test
    const { listProducts } = require('../../lib/products');
    listProducts.mockReturnValue(mockProductsWithRoles);

    renderCompleteSetup();

    // Step 1: Select Airbus
    const aircraftSelect = screen.getByRole('combobox', { name: /select an aircraft/i });
    fireEvent.change(aircraftSelect, { target: { value: 'airbus-a32f' } });

    // Step 2: Select Pilot role
    const pilotRoleButton = screen.getByRole('button', { name: /pilot/i });
    fireEvent.click(pilotRoleButton);

    // Step 3: Search for "ursa"
    const searchInput = screen.getByPlaceholderText(/search for equipment/i);
    fireEvent.change(searchInput, { target: { value: 'ursa' } });

    await waitFor(() => {
      // Should show Pilot joystick (matches family AND role)
      expect(screen.getByText(/Joystick L/i)).toBeInTheDocument();

      // Should NOT show Copilot joystick (matches family but NOT role)
      expect(screen.queryByText(/Joystick R/i)).not.toBeInTheDocument();
    });
  });

  it('should work when no aircraft is selected (fallback behavior)', async () => {
    renderCompleteSetup();

    // Step 3: Search without selecting aircraft first
    const searchInput = screen.getByPlaceholderText(/search for equipment/i);
    fireEvent.change(searchInput, { target: { value: 'win' } });

    // Should show all products (no family filter applied)
    await waitFor(() => {
      expect(screen.getByText(/ViperAce/i)).toBeInTheDocument();
      expect(screen.getByText(/ECAM/i)).toBeInTheDocument();
      // Might show more products depending on mock data
    });
  });

  it('should maintain search query length requirement (min 2 chars)', async () => {
    renderCompleteSetup();

    // Step 1: Select aircraft
    const aircraftSelect = screen.getByRole('combobox', { name: /select an aircraft/i });
    fireEvent.change(aircraftSelect, { target: { value: 'f16-viper' } });

    // Step 3: Type only 1 character
    const searchInput = screen.getByPlaceholderText(/search for equipment/i);
    fireEvent.change(searchInput, { target: { value: 'w' } });

    // Should not show suggestions (query too short)
    await waitFor(() => {
      expect(screen.queryByRole('list')).toBeEmptyDOMElement();
    });

    // Type 2+ characters
    fireEvent.change(searchInput, { target: { value: 'wi' } });

    // Now suggestions should appear
    await waitFor(() => {
      expect(screen.getByText(/ViperAce/i)).toBeInTheDocument();
    });
  });
});
