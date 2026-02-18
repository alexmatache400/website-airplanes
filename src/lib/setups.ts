// Setups data access layer — reads from module-level cache populated by DataProvider

export interface SetupData {
  aircraft: string;
  description: string;
  family: string;
  sort_order: number;
  tiers: Record<string, string[]>;
}

// Module-level cache populated by DataProvider before any component renders
let setupsCache: SetupData[] = [];
export function setSetupsCache(data: SetupData[]) { setupsCache = data; }

export function listSetups(): SetupData[] {
  return setupsCache;
}

export function getSetupByAircraft(aircraft: string): SetupData | null {
  return setupsCache.find(s => s.aircraft === aircraft) || null;
}
