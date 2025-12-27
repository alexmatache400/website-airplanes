# Your Role Implementation Documentation

> **Last Updated:** December 27, 2025
> **Status:** Temporarily Disabled (UI Hidden, Backend Preserved)

---

## Overview

The "Your Role" feature allows users to filter flight simulation products based on whether they are a **Pilot** or **Copilot**. This is useful when products are role-specific (e.g., pilot-side throttle quadrants vs copilot-side panels).

**Current Status:** The UI has been temporarily hidden, but all backend logic is preserved for future re-enablement when role-specific products are added to the catalog.

---

## Data Model

### Product roleType Field

Every product in `/src/data/products.json` has a `roleType` field:

```typescript
type Product = {
  // ... other fields
  roleType: 'Pilot' | 'Copilot' | 'Universal';
}
```

**Role Types:**
- **`Pilot`**: Product is specific to the pilot's side (e.g., captain's throttle quadrant)
- **`Copilot`**: Product is specific to the copilot's side (e.g., first officer's panel)
- **`Universal`**: Product works for both roles (e.g., rudder pedals, general joysticks)

**Current Data:** All 20 products currently have `"roleType": "Universal"` in the JSON.

---

## Original Implementation (Before December 27, 2025)

### Products Page

**UI Location:** Right column of 2-column filter grid

**Dropdown Options:**
```typescript
const roleOptions: DropdownOption[] = [
  {
    value: 'All',
    label: 'All Roles',
    count: allProducts.filter(categoryFilter).length
  },
  {
    value: 'Pilot',
    label: 'Pilot',
    icon: 'pilot',
    count: allProducts.filter(p =>
      categoryFilter(p) && (p.roleType === 'Pilot' || p.roleType === 'Universal')
    ).length
  },
  {
    value: 'Copilot',
    label: 'Copilot',
    icon: 'copilot',
    count: allProducts.filter(p =>
      categoryFilter(p) && (p.roleType === 'Copilot' || p.roleType === 'Universal')
    ).length
  },
];
```

**Filtering Logic:**
```typescript
const products = allProducts.filter(p => {
  const matchesCategory = selectedCategories.length === 0 ||
    selectedCategories.includes(p.category);
  const matchesRole = selectedRole === 'All' ||
    p.roleType === selectedRole ||
    p.roleType === 'Universal';

  return matchesCategory && matchesRole;
});
```

**Behavior:**
- **'All'**: Shows all products (default)
- **'Pilot'**: Shows Pilot + Universal products
- **'Copilot'**: Shows Copilot + Universal products
- Universal products **always** visible regardless of selection
- Dynamic counts update based on category selection

**Storage:** No localStorage (selection not persisted)

---

### Setups Page

**UI Location:** Right column of 2-column grid (next to "Choose Aircraft Model")

**Dropdown Options:**
```typescript
const roleOptions: DropdownOption[] = [
  { value: '', label: '-- Select a role --' },
  { value: 'Pilot', label: 'Pilot', icon: 'pilot' },
  { value: 'Copilot', label: 'Copilot', icon: 'copilot' },
];
```

**Filtering Logic:**
```typescript
const filterProductsByRole = (products: Product[]): Product[] => {
  if (selectedRole === '') {
    return []; // No role selected, show empty state
  }
  return products.filter(
    product => product.roleType === selectedRole || product.roleType === 'Universal'
  );
};
```

**Behavior:**
- **Empty string ('')**: Required selection, shows "Please select a role" empty state
- **'Pilot'**: Shows Pilot + Universal products
- **'Copilot'**: Shows Copilot + Universal products
- Universal products always included
- Role selection **required** before products display

**Storage:** localStorage with key `'setups_selectedRole'`

**Empty State UI:**
```tsx
{selectedAircraft && !selectedRole && (
  <div className="bg-slate-800/60 border border-slate-700/50 rounded-lg p-12 text-center max-w-2xl mx-auto">
    <svg className="w-16 h-16 mx-auto mb-4 text-slate-600" /* user icon */>
    <p className="text-slate-400 text-lg">
      Please select a role to view the recommended setup.
    </p>
  </div>
)}
```

---

### Complete Setup Page

**UI Location:** Step 3 in 4-step wizard (between "Choose aircraft" and "Select tier")

**Dropdown Options:**
```typescript
const roleOptions: DropdownOption[] = useMemo(() => {
  if (ownedGear.length === 0) {
    return [{ value: '', label: '-- Select a role --' }];
  }
  return [
    { value: '', label: '-- Select a role --' },
    { value: 'Pilot', label: 'Pilot', icon: 'pilot' },
    { value: 'Copilot', label: 'Copilot', icon: 'copilot' },
  ];
}, [ownedGear.length]);
```

**Auto-Selection Feature:**

When the first product is added, role is auto-selected if the product has a specific role:

```typescript
const autoRole = shouldAutoSelectRole(product);
if (autoRole) {
  setSelectedRole(autoRole);
  setIsRoleAutoSelected(true);
  localStorage.setItem('completesetup_selectedRole', autoRole);
} else {
  setIsRoleAutoSelected(false);
}
```

**Storage:** localStorage with key `'completesetup_selectedRole'`

**Wizard Flow:**
1. Step 1: Add owned gear
2. Step 2: Choose aircraft family
3. Step 3: Select role (may auto-select)
4. Step 4: Select tier

---

## Current Implementation (After December 27, 2025)

### Products Page

**Changes:**
-  Removed "Your Role" dropdown from UI
-  Changed from 2-column to single-column layout
-  `selectedRole` hardcoded to `'All'` (shows all products)
-  roleOptions preserved but unused

### Setups Page

**Changes:**
-  Removed "Your Role" dropdown from UI
-  Moved "Equipment Tier" to where "Your Role" was
-  Moved Lottie animation to header (next to "Full Setups" title)
-  `filterProductsByRole` returns all products
-  Removed "Please select a role" empty state
-  Removed localStorage role persistence

### Complete Setup Page

**Changes:**
-  Removed "3. Select your role" dropdown
-  Renumbered "4. Select tier" to "3. Select tier"
-  Auto-selection logic still runs but not displayed
-  Removed localStorage role persistence
-  Removed role filtering from search

---

## Re-Enabling the Feature

### Step 1: Update Product Data

Edit products with specific roles in `/src/data/products.json`:

```json
{
  "id": "123",
  "name": "Captain's Throttle",
  "roleType": "Pilot"  // ê Change from "Universal"
}
```

### Step 2-4: Restore UI Components

See detailed restoration instructions in the sections above for each page.

---

## Summary

All backend logic is fully preserved and ready to use. Re-enabling requires only UI restoration - no logic changes needed.
