import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { setProductsCache, type Product } from './products';
import { setAircraftCache, type AircraftPreset, type CategoryNeed } from './aircraft';
import { setSetupsCache, type SetupData } from './setups';
import { setCategoryEquivalenceCache } from './suggestions';

// --- Reference table types ---

export interface TierRef {
  name: string;
  label: string;
  sort_order: number;
}

export interface CategoryRef {
  name: string;
  sort_order: number;
}

export interface BrandRef {
  name: string;
  sort_order: number;
}

export interface AircraftFamilyRef {
  name: string;
  label: string;
  sort_order: number;
}

export interface AffiliateProgramRef {
  name: string;
  label: string;
  sort_order: number;
  regions: { key: string; flag: string }[];
}

export interface RoleTypeRef {
  name: string;
  sort_order: number;
}

// --- Context ---

interface DataContextType {
  products: Product[];
  aircraftPresets: AircraftPreset[];
  setups: SetupData[];
  tiers: TierRef[];
  categories: CategoryRef[];
  brands: BrandRef[];
  aircraftFamilies: AircraftFamilyRef[];
  affiliatePrograms: AffiliateProgramRef[];
  roleTypes: RoleTypeRef[];
  isLoading: boolean;
}

const DataContext = createContext<DataContextType | null>(null);

export function useData(): DataContextType {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within <DataProvider>');
  return ctx;
}

// --- DataProvider component ---

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<DataContextType | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchAll() {
      try {
        const [
          { data: productsRaw, error: e1 },
          { data: aircraftPresetsRaw, error: e2 },
          { data: tierNeedsRaw, error: e3 },
          { data: preferredProductsRaw, error: e4 },
          { data: setupsRaw, error: e5 },
          { data: setupProductsRaw, error: e6 },
          { data: tiersRaw, error: e7 },
          { data: categoriesRaw, error: e8 },
          { data: brandsRaw, error: e9 },
          { data: aircraftFamiliesRaw, error: e10 },
          { data: affiliateProgramsRaw, error: e11 },
          { data: categoryEquivalencesRaw, error: e12 },
          { data: roleTypesRaw, error: e13 },
        ] = await Promise.all([
          supabase.from('products').select('*'),
          supabase.from('aircraft_presets').select('id, name, slug, notes'),
          supabase.from('aircraft_tier_needs').select('aircraft_id, tier, category, count'),
          supabase.from('aircraft_preferred_products').select('aircraft_id, tier, product_slug, sort_order'),
          supabase.from('setups').select('id, aircraft, description, family, sort_order'),
          supabase.from('setup_products').select('setup_id, tier, product_id, sort_order'),
          supabase.from('tiers').select('name, label, sort_order').order('sort_order'),
          supabase.from('categories').select('name, sort_order').order('sort_order'),
          supabase.from('brands').select('name, sort_order').order('sort_order'),
          supabase.from('aircraft_families').select('name, label, sort_order').order('sort_order'),
          supabase.from('affiliate_programs').select('name, label, sort_order, regions').order('sort_order'),
          supabase.from('category_equivalences').select('source_category, satisfies_category'),
          supabase.from('role_types').select('name, sort_order').order('sort_order'),
        ]);

        // Check for errors
        const errors = [e1, e2, e3, e4, e5, e6, e7, e8, e9, e10, e11, e12, e13].filter(Boolean);
        if (errors.length > 0) {
          throw new Error(`Supabase fetch errors: ${errors.map(e => e!.message).join(', ')}`);
        }

        if (cancelled) return;

        // 1. Map products: snake_case → camelCase
        const products: Product[] = (productsRaw || []).map((row: any) => ({
          id: row.id,
          brand: row.brand,
          name: row.name,
          slug: row.slug,
          category: row.category,
          sim_support: row.sim_support || [],
          tier: row.tier,
          aircraftFamily: row.aircraft_family,
          roleType: row.role_type,
          price_label: row.price_label,
          images: row.images || [],
          affiliate_urls: row.affiliate_urls || {},
          description: row.description || '',
          key_specs: row.key_specs || {},
          source_url: row.source_url,
        }));

        // 2. Reconstruct aircraft presets from 3 flat tables
        const aircraftPresets: AircraftPreset[] = (aircraftPresetsRaw || []).map((preset: any) => {
          const tiers: Record<string, { needs: CategoryNeed[]; preferredProducts?: string[] }> = {};

          // Get all tier names from tiers table
          (tiersRaw || []).forEach((t: any) => {
            tiers[t.name] = { needs: [], preferredProducts: [] };
          });

          // Populate needs
          (tierNeedsRaw || [])
            .filter((tn: any) => tn.aircraft_id === preset.id)
            .forEach((tn: any) => {
              if (tiers[tn.tier]) {
                tiers[tn.tier].needs.push({ category: tn.category, count: tn.count });
              }
            });

          // Populate preferred products (sorted by sort_order)
          (preferredProductsRaw || [])
            .filter((pp: any) => pp.aircraft_id === preset.id)
            .sort((a: any, b: any) => a.sort_order - b.sort_order)
            .forEach((pp: any) => {
              if (tiers[pp.tier]) {
                tiers[pp.tier].preferredProducts!.push(pp.product_slug);
              }
            });

          return {
            id: preset.id,
            name: preset.name,
            slug: preset.slug,
            notes: preset.notes,
            tiers,
          } as AircraftPreset;
        });

        // 3. Reconstruct setups from 2 flat tables
        const setups: SetupData[] = (setupsRaw || []).map((setup: any) => {
          const tiers: Record<string, string[]> = {};

          // Initialize all tiers
          (tiersRaw || []).forEach((t: any) => {
            tiers[t.name] = [];
          });

          // Populate product IDs (sorted by sort_order)
          (setupProductsRaw || [])
            .filter((sp: any) => sp.setup_id === setup.id)
            .sort((a: any, b: any) => a.sort_order - b.sort_order)
            .forEach((sp: any) => {
              if (tiers[sp.tier]) {
                tiers[sp.tier].push(sp.product_id);
              }
            });

          return {
            aircraft: setup.aircraft,
            description: setup.description || '',
            family: setup.family,
            sort_order: setup.sort_order ?? 0,
            tiers,
          };
        });

        // 4. Reference tables
        const tiers: TierRef[] = (tiersRaw || []).map((t: any) => ({
          name: t.name,
          label: t.label,
          sort_order: t.sort_order,
        }));

        const categories: CategoryRef[] = (categoriesRaw || []).map((c: any) => ({
          name: c.name,
          sort_order: c.sort_order,
        }));

        const brands: BrandRef[] = (brandsRaw || []).map((b: any) => ({
          name: b.name,
          sort_order: b.sort_order,
        }));

        const aircraftFamilies: AircraftFamilyRef[] = (aircraftFamiliesRaw || []).map((af: any) => ({
          name: af.name,
          label: af.label,
          sort_order: af.sort_order,
        }));

        const affiliatePrograms: AffiliateProgramRef[] = (affiliateProgramsRaw || []).map((ap: any) => ({
          name: ap.name,
          label: ap.label,
          sort_order: ap.sort_order,
          regions: ap.regions || [],
        }));

        const roleTypes: RoleTypeRef[] = (roleTypesRaw || []).map((rt: any) => ({
          name: rt.name,
          sort_order: rt.sort_order,
        }));

        // Group category equivalences by source_category
        const categoryEquivalences: Record<string, string[]> = {};
        (categoryEquivalencesRaw || []).forEach((row: any) => {
          if (!categoryEquivalences[row.source_category]) {
            categoryEquivalences[row.source_category] = [];
          }
          categoryEquivalences[row.source_category].push(row.satisfies_category);
        });

        // Populate module-level caches before rendering children
        setProductsCache(products);
        setAircraftCache(aircraftPresets);
        setSetupsCache(setups);
        setCategoryEquivalenceCache(categoryEquivalences);

        console.log(
          `[DataProvider] Loaded: ${products.length} products, ${aircraftPresets.length} aircraft presets, ${setups.length} setups, ${tiers.length} tiers, ${categories.length} categories, ${brands.length} brands, ${affiliatePrograms.length} affiliate programs, ${roleTypes.length} role types`
        );

        setData({
          products,
          aircraftPresets,
          setups,
          tiers,
          categories,
          brands,
          aircraftFamilies,
          affiliatePrograms,
          roleTypes,
          isLoading: false,
        });
      } catch (err) {
        console.error('[DataProvider] Failed to fetch data:', err);
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unknown error');
        }
      }
    }

    fetchAll();
    return () => { cancelled = true; };
  }, []);

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-950">
        <div className="text-center">
          <p className="text-red-400 text-lg mb-2">Failed to load data</p>
          <p className="text-slate-500 text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-accent-500 text-white rounded hover:bg-accent-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-accent-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Loading flight sim data...</p>
        </div>
      </div>
    );
  }

  return (
    <DataContext.Provider value={data}>
      {children}
    </DataContext.Provider>
  );
};
