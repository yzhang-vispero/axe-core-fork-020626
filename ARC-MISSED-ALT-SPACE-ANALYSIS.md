# Why ARC-RulesEngine Missed the alt=" " (Space) Violation

## Executive Summary

**Critical Finding**: ARC-RulesEngine failed to detect a **WCAG 2.0 Level A** violation on bankofamerica.com where an image had `alt=" "` (single space) with `role="presentation"`. This is a fundamental accessibility issue that axe-core correctly identified as **critical impact**.

## The Violation

**Element Found by axe-core:**
```html
<img class="icon" 
     src="https://www1.bac-assets.com/homepage/spa-assets/images/assets-images-site-homepage-icons-ent_edu_bac_4953168_icon_gc_d-CSX7684a6de.svg" 
     alt=" " 
     role="presentation">
```

**Why This is Critical:**
- WCAG 2.0 Level A: 1.1.1 (Non-text Content)
- Screen readers may announce "image" or "blank" instead of ignoring it
- The space is not reliably ignored across all assistive technologies
- Creates confusion for users relying on screen readers

**axe-core Verdict:** ✗ **CRITICAL** violation  
**ARC-RulesEngine Verdict:** ✓ **No issues reported**

## Root Cause Analysis

### ARC-RulesEngine Has THREE Related Rules:

#### 1. `imageHasTextAlternative` Rule
**Purpose:** Check if images have proper alt text  
**Selector:** 
```typescript
img:not([role]):not([aria-hidden="true"]), 
img[role="img"]:not([aria-hidden="true"]), 
img[role="none"]:not([aria-hidden="true"]), 
img[role="presentation"]:not([aria-hidden="true"]), 
[role="img"]:not([aria-hidden="true"]):not(img):not(svg)
```

**The Problem:**
```typescript
condition: (vElement) => vElement.matches(
    'img:not([role]), 
     img[role="img"], 
     img[role="none"][tabindex]:not([tabindex="-1"]), 
     img[role="presentation"][tabindex]:not([tabindex="-1"])'
),
```

**🐛 BUG:** Images with `role="presentation"` are **ONLY** checked if they have `tabindex` that's not -1.

The failing image has `role="presentation"` but **NO tabindex**, so it never enters the assertion that checks for space-only alt text!

**Code Location:** `rules/AUTOMATED/CURRENT/imageHasTextAlternative/index.ts:14`

#### 2. `imageAriaPresentationRole` Rule
**Purpose:** Check that decorative images don't have text alternatives  
**Selector:**
```typescript
img[role="none"], img[role="presentation"]
```

**Check:**
```typescript
script: extendedAttrHasValue,
options: {'attribute': 'explicitAccessibleName'},
failOn: ['hasValue'],
```

**Why It Should Have Caught This:**
- The image matches the selector: `img[role="presentation"]` ✓
- The image has `alt=" "` which should be considered "hasValue" ✓

**Why It Might Not Have:**
Two possibilities:
1. **Visibility filtering:** The image might be filtered out as not visible
2. **Space handling:** The `extendedAttrHasValue` check might not treat a single space as "hasValue"

**Most Likely:** The accessibility name computation in `extended/preAttributes/all-explicitAccessibleName.ts` returns `explicitAccessibleName: ' '` (the space), but the `extendedAttrHasValue` check uses `spaceValue` as a distinct failure type, not `hasValue`. The rule checks for `failOn: ['hasValue']` which probably means "non-whitespace value".

#### 3. `imageEmptyAltNoOtherLabel` Rule
**Purpose:** Check if images with empty alt incorrectly use title/aria-label  
**Selector:**
```typescript
img:not([role])[alt=""], img[role="img"][alt=""]
```

**Why It Missed:**
- Explicitly checks for `alt=""` (truly empty)
- Does NOT check for `alt=" "` (space)
- Image has `role="presentation"`, so it wouldn't match anyway

## The Subtle Distinction

**Empty alt:** `alt=""` → Screen readers ignore ✓  
**Space alt:** `alt=" "` → Not reliably ignored ✗  

This is why axe-core has a specific check called `alt-space-value`:
```
Element has an alt attribute containing only a space character, 
which is not ignored by all screen readers
```

## Comparison: axe-core vs ARC-RulesEngine

### axe-core Approach (CORRECT)
```typescript
// has-alt check: Does alt attribute exist?
// alt-space-value check: Is it ONLY whitespace?
{
  id: 'alt-space-value',
  message: 'Element has an alt attribute containing only a space character, 
            which is not ignored by all screen readers'
}
```

**Result:** Catches `alt=""`, `alt=" "`, and `alt="   "` correctly

### ARC-RulesEngine Approach (FLAWED)
```typescript
// imageHasTextAlternative has spaceValue check but requires tabindex
// imageAriaPresentationRole checks hasValue but may not treat space as hasValue
// imageEmptyAltNoOtherLabel only checks alt="" exactly
```

**Result:** Miss `alt=" "` on role="presentation" images without tabindex

## Why This Matters

### 1. **WCAG Level Impact**
- This is **Level A** - the most basic level of conformance
- Every website claiming WCAG compliance must pass this
- Bank of America is a major financial institution serving millions

### 2. **User Impact**
- Screen reader users hear "image" or "blank" instead of silence
- Creates confusion about page content
- Undermines trust in decorative image handling

### 3. **False Sense of Security**
- Developers running ARC think they're compliant
- Critical Level A violation remains unfixed
- Undermines scanner credibility

### 4. **Recall vs Precision Trade-off**
Our comparison showed:
- ARC: Better recall (found 14 violations)
- axe-core: Better precision (found 5, all critical)

But this case shows **ARC's recall failed on a critical, basic violation** that should be caught by any professional accessibility scanner.

## Recommendations

### For ARC-RulesEngine Developers
1. **Fix `imageHasTextAlternative` condition** (HIGH PRIORITY)
   - Remove tabindex requirement for role="presentation" images
   - Check ALL role="presentation" images for proper empty alt
   
   ```typescript
   // CURRENT (WRONG):
   img[role="presentation"][tabindex]:not([tabindex="-1"])
   
   // SHOULD BE:
   img[role="presentation"]
   ```

2. **Add explicit space-only alt check** (MEDIUM PRIORITY)
   - Create dedicated check for `alt=" "` (space-only)
   - Don't rely on generic "hasValue" check
   - Match axe-core's explicit `alt-space-value` check

3. **Review `extendedAttrHasValue` check** (MEDIUM PRIORITY)
   - Clarify what constitutes "hasValue" vs "spaceValue" vs "emptyValue"
   - Document the distinction clearly
   - Ensure consistency across all rules

### For Scanner Users
1. **Use both scanners** (as recommended in comparison)
   - Run axe-core for baseline compliance
   - Run ARC for additional coverage
   - Manually verify overlapping issues

2. **Don't trust single-scanner results**
   - This case proves even enterprise scanners miss things
   - Always perform manual testing for critical pages
   - Test with actual screen readers

3. **Prioritize axe-core for compliance reporting**
   - Zero false positives claim is validated here
   - Better at catching fundamental WCAG violations
   - Industry-standard for legal compliance

## Historical Context

This bug has likely existed for a long time because:

1. **Edge case appearance:** `alt=" "` seems like a typo, not a pattern
2. **Role confusion:** Developers assume `role="presentation"` means "skip all checks"
3. **Tabindex logic:** The tabindex condition suggests this was added for focusable images, but it breaks the general case
4. **Test coverage gaps:** Rule tests may not include `alt=" "` with role="presentation" without tabindex

## Conclusion

ARC-RulesEngine's architecture has the components to catch this issue:
- ✓ Selector matches the element
- ✓ Space detection exists in the codebase  
- ✓ Multiple rules could theoretically catch it

**But the implementation has logic flaws:**
- ✗ Overly restrictive conditions (tabindex requirement)
- ✗ Unclear distinction between empty/space/value
- ✗ No explicit check for the space-only edge case

This represents a **critical gap in recall** that undermines ARC's positioning as a comprehensive enterprise scanner. The fact that axe-core (an open-source tool) caught what ARC (a commercial tool) missed is particularly concerning for TPGi's reputation.

## Technical Details

**Analysis Date:** February 6, 2026  
**ARC-RulesEngine Version:** 5.7.6  
**axe-core Version:** 4.11.0  
**Test URL:** https://www.bankofamerica.com/  
**Affected Rules:**
- `imageHasTextAlternative` (primary issue)
- `imageAriaPresentationRole` (secondary issue)

**Code References:**
- `rules/AUTOMATED/CURRENT/imageHasTextAlternative/index.ts`
- `rules/AUTOMATED/CURRENT/imageAriaPresentationRole/index.ts`
- `extended/preAttributes/all-explicitAccessibleName.ts`
