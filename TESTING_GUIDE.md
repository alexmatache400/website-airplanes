# Complete Your Setup - Testing Guide

> **Quick Start:** Open http://localhost:3000/complete-setup in your browser

---

## Overview

This guide will help you manually test all features of the "Complete Your Setup" page to verify the logic works correctly.

**What to Test:**
1. ✅ Tier exception rule (owned premium products count toward selected tier)
2. ✅ preferredProducts prioritization
3. ✅ Category equivalence (HOTAS = Joystick + Throttle)
4. ✅ Family filtering (only aircraft-appropriate products)
5. ✅ Role filtering (Pilot, Copilot, Universal)
6. ✅ Owned gear display with badge
7. ✅ Lock/unlock functionality
8. ✅ Replace functionality
9. ✅ Shuffle all functionality

---

## Test Scenario 1: Clean Slate (Airbus A32F + Business Tier)

**Purpose:** Verify basic recommendation generation with no owned gear

### Steps:

1. Open http://localhost:3000/complete-setup
2. **Step 1:** Select "Airbus A32F" from aircraft dropdown
3. **Step 2:** Select "" (empty/Universal) for role
4. **Step 3:** Leave owned gear empty (don't search for anything)
5. **Step 4:** Select "Business" tier
6. Click **"Generate ideas for your current setup"**

### Expected Results:

**Summary Section:**
- Title: "Suggestions for Airbus A32F (Business class)"
- Missing components: "Panel × 1, Joystick × 1, Throttle × 1, Pedals × 1"
- No warnings

**Product Grid:**
- **4 suggestions total** (Panel, Joystick, Throttle, Pedals)
- All products should have:
  - `aircraftFamily: 'airbus-a32f'` OR `'general'`
  - `tier: 'Business'` OR no tier specified
- **Preferred products should appear** (from aircraft-presets.json):
  - Likely: Ursa Minor Joystick-L/R
  - Likely: Ursa Minor 32 Throttle
  - Likely: 32-ECAM or EFIS panels
  - Likely: Logi Flight Pedals (general)

**Each suggestion has:**
- Lock button (top center, left side)
- Replace button (top center, right side, dice icon)

### Verification:

- [ ] 4 suggestions displayed
- [ ] All products relevant to Airbus A32F or general
- [ ] Preferred products from aircraft-presets.json present
- [ ] Lock/Replace controls visible
- [ ] No owned products shown (owned gear is empty)

---

## Test Scenario 2: Tier Exception (Own Premium, Select Mid-Tier)

**Purpose:** Verify owned premium products count toward selected tier needs

### Steps:

1. **Refresh the page** to start clean
2. **Step 1:** Select "Airbus A32F"
3. **Step 2:** Select "" (Universal)
4. **Step 3:** Search for "32-ECAM" in owned gear search box
   - Type "ecam" (minimum 2 chars)
   - Click on "32-ECAM" from dropdown
   - Verify it appears as a chip below the search box
5. **Step 4:** Select "Business" tier
6. Click **"Generate ideas"**

### Expected Results:

**Summary Section:**
- Title: "Suggestions for Airbus A32F (Business class)"
- Missing components: "Joystick × 1, Throttle × 1, Pedals × 1" (NO Panel!)
- No warnings

**Product Grid:**
- **Owned product first:**
  - 32-ECAM Panel (First tier) with green **"✓ Owned"** badge at top center
  - NO Lock/Replace controls on owned product
- **3 suggestions** (Joystick, Throttle, Pedals)
  - **NO Panel suggestion** (already owned!)
- All suggestions have Lock/Replace controls

### Verification:

- [ ] Owned 32-ECAM displayed FIRST with green "✓ Owned" badge
- [ ] Only 3 suggestions (NO Panel suggestion)
- [ ] Missing components shows 3 categories (Panel satisfied by owned product)
- [ ] Owned product has NO Lock/Replace controls
- [ ] Suggested products have Lock/Replace controls

**Key Insight:** Even though 32-ECAM is **First tier** and you selected **Business tier**, the Panel need is satisfied! This is the **tier exception rule** working correctly.

---

## Test Scenario 3: HOTAS Combo Product

**Purpose:** Verify HOTAS satisfies both Joystick + Throttle needs

### Steps:

1. **Refresh the page**
2. **Step 1:** Select "F-16 Viper"
3. **Step 2:** Select "" (Universal)
4. **Step 3:** Search for "ViperAce" or "Orion2"
   - Select "WINWING Orion2 HOTAS ViperAce"
   - Verify it appears as owned gear chip
5. **Step 4:** Select "Business" tier
6. Click **"Generate ideas"**

### Expected Results:

**Summary Section:**
- Missing components: "Pedals × 1" (ONLY Pedals!)
- HOTAS need satisfied by owned product

**Product Grid:**
- **Owned:** Orion2 HOTAS ViperAce with "✓ Owned" badge
- **1 suggestion:** Pedals product
- **NO Joystick or Throttle suggestions** (HOTAS satisfies both!)

### Verification:

- [ ] Owned HOTAS displayed with badge
- [ ] Only 1 suggestion (Pedals)
- [ ] NO Joystick suggestion (satisfied by HOTAS)
- [ ] NO Throttle suggestion (satisfied by HOTAS)
- [ ] Missing components shows only "Pedals × 1"

**Key Insight:** HOTAS products satisfy **3 categories simultaneously**: Joystick, Throttle, and HOTAS.

---

## Test Scenario 4: Family Filtering

**Purpose:** Verify only family-appropriate products are suggested

### Steps:

1. **Refresh the page**
2. **Step 1:** Select "Boeing 737"
3. **Step 2:** Select "" (Universal)
4. **Step 3:** Leave owned gear empty
5. **Step 4:** Select "Business" tier
6. Click **"Generate ideas"**

### Expected Results:

**Product Grid:**
- All suggestions have:
  - `aircraftFamily: 'boeing-737'` OR `'general'`
- **Should NOT see:**
  - Airbus products (32-ECAM, EFIS-L, EFIS-R, Ursa Minor 32 Throttle)
  - F-16 products (ViperAce)
  - F/A-18 products (StrikeAce)

**Should see (Boeing or general products):**
- Boeing FMS CDU (Panel, boeing-737)
- Boeing TQ Throttle (Throttle, boeing-737)
- Logi Flight Pedals (Pedals, general)
- Other general products

### Verification:

- [ ] NO Airbus-specific products (e.g., 32-ECAM, EFIS panels)
- [ ] Only Boeing or general products displayed
- [ ] Products match Boeing 737 aircraft family

**How to Verify:**
1. Note product names in suggestions
2. Check `/src/data/products.json` for those product IDs
3. Verify `aircraftFamily` field is 'boeing-737' or 'general'

---

## Test Scenario 5: Role Filtering

**Purpose:** Verify role filtering works correctly

### Steps:

1. **Refresh the page**
2. **Step 1:** Select "Airbus A32F"
3. **Step 2:** Select **"Pilot"** (not empty!)
4. **Step 3:** Leave owned gear empty
5. **Step 4:** Select "Business" tier
6. Click **"Generate ideas"**

### Expected Results:

**Product Grid:**
- All suggestions have:
  - `roleType: 'Pilot'` OR `roleType: 'Universal'`
- **Should NOT see:**
  - Products with `roleType: 'Copilot'` (unless marked Universal)

### Verification:

- [ ] All products have roleType 'Pilot' or 'Universal'
- [ ] NO Copilot-specific products

**Note:** Currently, most products in the catalog are marked as 'Universal', so this test may show similar results to Test 1. To verify role filtering works, check if any Copilot-specific products exist in products.json and confirm they're excluded.

---

## Test Scenario 6: Lock and Shuffle

**Purpose:** Verify lock prevents products from being replaced during shuffle

### Steps:

1. **Complete Test 1** to generate suggestions
2. **Note the 4 products** suggested
3. **Click the Lock button** (left button) on the **Panel** product
   - Button should change color to accent (orange/blue)
   - Icon changes from Unlock to Lock
4. **Click "Shuffle all"** button
5. **Observe the results**

### Expected Results:

**After Shuffle:**
- **Locked Panel product:** Unchanged (same product)
- **Other 3 products:** Changed (different products OR different order)
- Locked product still has locked visual state

**Repeat:**
6. Click "Shuffle all" **5 more times**
7. Each time, verify locked Panel stays the same

### Verification:

- [ ] Locked product unchanged after shuffle
- [ ] Unlocked products changed (at least some of them)
- [ ] Lock icon persists (stays locked)
- [ ] Can unlock by clicking Lock button again

---

## Test Scenario 7: Replace Individual Product

**Purpose:** Verify replace button swaps a single product

### Steps:

1. **Complete Test 1** to generate suggestions
2. **Note the 4 products** suggested
3. **Click the Replace button** (right button, dice icon) on the **Joystick** product
4. **Observe the results**

### Expected Results:

**After Replace:**
- **Joystick product:** Changed to a different Joystick product
- **Other 3 products:** Unchanged (Panel, Throttle, Pedals same)

**Repeat:**
5. Click Replace on the **same Joystick slot** multiple times
6. Each time, a different Joystick product should appear (if multiple available)
7. If only 2 Joystick products available, it should toggle between them

### Verification:

- [ ] Only replaced product changed
- [ ] Other products unchanged
- [ ] Each replace shows different product (if available)
- [ ] If locked, Replace button is disabled (grayed out)

**Test Replace on Locked Product:**
8. Lock the Joystick product
9. Try to click Replace button
10. Verify: Button is disabled (can't click)

---

## Test Scenario 8: Insufficient Products (Warning)

**Purpose:** Verify warnings when requirements can't be fully met

### Steps:

1. **Refresh the page**
2. **Step 1:** Select "Boeing 737"
3. **Step 2:** Select "" (Universal)
4. **Step 3:** Leave owned gear empty
5. **Step 4:** Select **"First"** tier (premium tier)
6. Click **"Generate ideas"**

### Expected Results:

**Summary Section:**
- Missing components: "Panel × 2, Throttle × 1, Pedals × 1"
- **Warning box (yellow):**
  - "Only found 1 of 2 required Panel products for First class"
  - (or similar message if insufficient products)

**Product Grid:**
- 1 Panel product (instead of 2 required)
- 1 Throttle product
- 1 Pedals product
- Total: 3 suggestions (instead of 4 required)

### Verification:

- [ ] Warning displayed in yellow box
- [ ] Warning message mentions missing count
- [ ] Available products still displayed
- [ ] Summary shows needed vs available count

**Note:** This test may pass or fail depending on product inventory. If there are 2+ Boeing First tier Panels in products.json, no warning will appear. The warning logic is correctly implemented, but requires insufficient inventory to trigger.

---

## Test Scenario 9: Owned + Suggested Display Order

**Purpose:** Verify owned products appear first, then suggestions

### Steps:

1. **Refresh the page**
2. **Step 1:** Select "Airbus A32F"
3. **Step 2:** Select "" (Universal)
4. **Step 3:** Add **2 owned products:**
   - Search "32-ECAM", click to add
   - Search "Ursa Minor Joystick", click to add (either L or R)
   - Verify both appear as chips
5. **Step 4:** Select "Business" tier
6. Click **"Generate ideas"**

### Expected Results:

**Product Grid (2-column layout):**

**Row 1:**
- Column 1: 32-ECAM Panel with "✓ Owned" badge
- Column 2: Ursa Minor Joystick with "✓ Owned" badge

**Row 2:**
- Column 1: Suggested Throttle with Lock/Replace controls
- Column 2: Suggested Pedals with Lock/Replace controls

**Key Points:**
- Owned products appear **first** (top rows)
- Suggested products appear **after** owned products
- Green badge only on owned products
- Lock/Replace controls only on suggested products

### Verification:

- [ ] 2 owned products displayed first
- [ ] Green "✓ Owned" badge on owned products
- [ ] NO Lock/Replace controls on owned products
- [ ] 2 suggestions displayed after owned products
- [ ] Lock/Replace controls on suggested products
- [ ] Total visible products: 4 (2 owned + 2 suggested)

---

## Test Scenario 10: Clear Results

**Purpose:** Verify clear button resets state correctly

### Steps:

1. **Complete Test 1** to generate suggestions
2. **Lock 1 product** (click Lock button)
3. **Click "Clear results"** button
4. **Observe the results**

### Expected Results:

**After Clear:**
- Results section disappears
- Summary section disappears
- Empty state message appears: "Start by choosing an aircraft..."
- Wizard inputs remain (aircraft, role, owned gear, tier still selected)

**Re-generate:**
5. Click "Generate ideas" again
6. Verify: New suggestions generated (not same as before)
7. Verify: Locked products **NOT preserved** (locks cleared)

### Verification:

- [ ] Results cleared completely
- [ ] Empty state message shown
- [ ] Wizard inputs preserved (don't need to re-select aircraft)
- [ ] Locks cleared (regenerate shows different products)

---

## Advanced Test Scenarios

### Test 11: Change Aircraft Mid-Session

**Purpose:** Verify changing aircraft updates appropriately

**Steps:**
1. Generate suggestions for Airbus A32F + Business
2. Note the products suggested
3. **Change aircraft to Boeing 737** (dropdown in Step 1)
4. Click "Generate ideas" again
5. Verify: Different products (Boeing-specific or general, NOT Airbus-specific)

**Expected:**
- [ ] Boeing or general products only
- [ ] NO Airbus products (e.g., 32-ECAM, EFIS panels)

### Test 12: Change Tier Mid-Session

**Purpose:** Verify changing tier updates tier filtering

**Steps:**
1. Generate suggestions for Airbus A32F + Business
2. Note the products suggested
3. **Change tier to First** (dropdown in Step 4)
4. Click "Generate ideas" again
5. Verify: Different products (First tier or general, NOT Business-specific)

**Expected:**
- [ ] First tier or general products
- [ ] Premium products (higher price, better quality)

### Test 13: Owned Gear Removal

**Purpose:** Verify removing owned gear updates suggestions

**Steps:**
1. Add owned: 32-ECAM Panel
2. Generate suggestions for Airbus A32F + Business
3. Verify: NO Panel suggestion (satisfied by owned)
4. **Remove 32-ECAM** (click X on owned gear chip)
5. Click "Generate ideas" again
6. Verify: Panel suggestion NOW appears (need no longer satisfied)

**Expected:**
- [ ] Before removal: 3 suggestions (no Panel)
- [ ] After removal: 4 suggestions (includes Panel)

---

## Browser Testing

### Recommended Browsers:

Test in multiple browsers to ensure compatibility:

- [ ] **Chrome** (latest version)
- [ ] **Firefox** (latest version)
- [ ] **Safari** (macOS/iOS)
- [ ] **Edge** (latest version)

### Responsive Testing:

Test on different screen sizes:

- [ ] **Desktop** (1920×1080)
  - Verify: 2-column grid for suggestions
  - Verify: All controls visible

- [ ] **Tablet** (768×1024)
  - Verify: 1-column grid on mobile breakpoint
  - Verify: Badges don't overlap product cards

- [ ] **Mobile** (375×667)
  - Verify: Wizard inputs stack vertically
  - Verify: Product grid switches to 1 column
  - Verify: Touch interactions work (click Lock, Replace, dropdowns)

---

## Performance Testing

### Load Time:

1. Open DevTools → Network tab
2. Refresh page
3. Verify:
   - [ ] Page loads in < 2 seconds
   - [ ] No 404 errors for images or data files
   - [ ] products.json loaded successfully
   - [ ] aircraft-presets.json loaded successfully

### Algorithm Speed:

1. Open DevTools → Console
2. Generate suggestions
3. Check console for any errors
4. Verify:
   - [ ] No JavaScript errors
   - [ ] Generation completes instantly (< 100ms)
   - [ ] Shuffle completes instantly
   - [ ] Replace completes instantly

### Memory Usage:

1. Open DevTools → Performance
2. Generate suggestions 10 times
3. Shuffle 10 times
4. Replace products 10 times
5. Verify:
   - [ ] No memory leaks (heap size stable)
   - [ ] UI remains responsive

---

## Bug Checklist

### Known Issues to Verify Fixed:

- [ ] ✅ Search dropdown closes after product selection
- [ ] ✅ Owned gear persists when changing aircraft
- [ ] ✅ Family filtering works correctly
- [ ] ✅ Role filtering works correctly
- [ ] ✅ Tier exception rule works correctly
- [ ] ✅ HOTAS equivalence works correctly
- [ ] ✅ Lock persists during shuffle
- [ ] ✅ Replace only changes single product
- [ ] ✅ Clear resets all state

### Edge Cases:

- [ ] Generate with no aircraft selected (button disabled)
- [ ] Generate with empty owned gear (should work fine)
- [ ] Search with 1 character (no suggestions, min 2 chars)
- [ ] Add same product twice to owned gear (second add ignored)
- [ ] Lock all products, then shuffle (all stay locked)
- [ ] Replace when no alternatives available (button becomes no-op or disabled)

---

## Reporting Issues

If you find any bugs or unexpected behavior:

### What to Report:

1. **Test scenario** (which test from above)
2. **Steps to reproduce** (exact sequence of actions)
3. **Expected result** (what should happen)
4. **Actual result** (what actually happened)
5. **Browser** (Chrome, Firefox, Safari, etc.)
6. **Screen size** (Desktop, Tablet, Mobile)
7. **Screenshots** (if visual bug)
8. **Console errors** (if any JavaScript errors)

### Example Bug Report:

```
Test: Scenario 2 (Tier Exception)
Steps:
  1. Select Airbus A32F
  2. Add owned: 32-ECAM Panel (First tier)
  3. Select Business tier
  4. Generate ideas
Expected: NO Panel suggestion (already owned)
Actual: Panel suggestion still appears
Browser: Chrome 120.0.6099.109
Screen: Desktop 1920×1080
Console: No errors
Screenshot: [attached]
```

---

## Success Criteria

**All tests pass if:**

✅ **Tier Exception:** Owned premium products count toward selected tier needs
✅ **preferredProducts:** Preferred products appear in suggestions (shuffled)
✅ **Category Equivalence:** HOTAS satisfies Joystick + Throttle
✅ **Family Filtering:** Only aircraft-family products + general shown
✅ **Role Filtering:** Only role-matching products + Universal shown
✅ **Owned Badge:** Green "✓ Owned" badge on owned products
✅ **Lock/Unlock:** Locked products persist during shuffle
✅ **Replace:** Individual products can be swapped
✅ **Shuffle:** Unlocked products change, locked stay same
✅ **Display Order:** Owned products first, suggestions second
✅ **Clear:** Resets results, preserves wizard inputs
✅ **Warnings:** Displayed when requirements can't be met
✅ **No Bugs:** No JavaScript errors, no visual glitches

---

## Quick Reference

### Test Priority:

**High Priority (Must Pass):**
1. ✅ Scenario 1: Clean Slate
2. ✅ Scenario 2: Tier Exception
3. ✅ Scenario 3: HOTAS Combo
4. ✅ Scenario 6: Lock and Shuffle
5. ✅ Scenario 7: Replace Individual

**Medium Priority (Should Pass):**
6. ✅ Scenario 4: Family Filtering
7. ✅ Scenario 5: Role Filtering
8. ✅ Scenario 9: Owned + Suggested Display
9. ✅ Scenario 10: Clear Results

**Low Priority (Nice to Have):**
10. ✅ Scenario 8: Insufficient Products (depends on inventory)
11. ✅ Advanced Tests (change aircraft/tier mid-session)

---

## Next Steps After Testing

**If all tests pass:**
1. ✅ Mark implementation as complete
2. 📝 Document any observations or improvements
3. 🚀 Consider production deployment

**If tests fail:**
1. 🐛 Document bugs with screenshots
2. 🔍 Investigate root cause
3. 🛠️ Fix issues
4. 🔁 Re-test

---

**Happy Testing!** 🎉

Open http://localhost:3000/complete-setup and start with Test Scenario 1.
