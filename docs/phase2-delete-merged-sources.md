# Phase 2: Delete Merged Source Routes & Clean Up Gallery

## Project Location
`D:\RIA\RIA-marketing-page` — Next.js 14 App Router, TypeScript, Tailwind CSS

## Context
Phase 1 is complete. The consolidated `/upgrade-your-advice` page is live and contains all the merged content from the old upgrade variant pages. Now we need to clean up the source files that were merged into it, and update the gallery to reflect the new reality.

**CRITICAL RULE: When in doubt, KEEP IT.** If something isn't explicitly listed for deletion below, don't touch it.

---

## TASK 1: Delete Merged Source Routes

These directories contained content that has already been merged into `/upgrade-your-advice`. Delete them entirely:

```
src/app/upgrade3/
src/app/upgrade5/
src/app/upgrade6/
src/app/upgrade7/
src/app/upgrade8/
src/app/upgrade-your-advice-v0-cgpt/
```

### Before deleting, verify:
1. Confirm `/upgrade-your-advice/page.tsx` exists and contains the consolidated content
2. Check that none of these directories export shared components imported by OTHER pages outside the upgrade pillar. If any do, do NOT delete that directory — flag it instead.

### Do NOT delete:
- `src/app/upgrade-your-advice/` — this is the consolidated production page
- `src/app/upgrade-your-advice-v0-gemini/` — marked Workshop, still in use
- `src/app/upgrade9/` — Task vs Purpose pillar, not part of this cleanup
- `src/app/upgrade10/` — Task vs Purpose pillar, not part of this cleanup
- `src/app/meaning/` or `src/app/meaning1/` — separate pillar
- Anything in `src/components/` — shared components stay

---

## TASK 2: Update Gallery Data

The gallery page is at `src/app/gallery/page.tsx`. It contains a `SECTIONS` array.

### In the "upgrade-your-advice" section:

**Remove these routes from the gallery data** (since the directories are now deleted):
- `/upgrade3`
- `/upgrade5`
- `/upgrade6`
- `/upgrade7`
- `/upgrade8`
- `/upgrade-your-advice-v0-cgpt`

Also remove any routes that were already deleted in Phase 1 if they're still listed:
- `/upgrade1`
- `/upgrade2`
- `/upgrade4`
- `/upgrade-your-advice-v0`
- `/quarterfinal-1`
- `/upgrade` (the old compact page, not `/upgrade-your-advice`)
- `/upgrade-summary-1-10`

**Keep these in the gallery:**
- `/upgrade-your-advice` — update description to: "✅ PRODUCTION — Consolidated upgrade page (Personal Story, Credentials, Independence)"
- `/upgrade-your-advice-v0-gemini` — keep as-is (Workshop)

**Simplify the subgroups:** Since the Upgrade section now has only 1-2 entries, collapse the subgroups (Personal Story, Credential Education, Independence & Custodian, Production & Meta) into a flat list. Remove empty subgroups entirely.

### Update `src/config/gallery-statuses.json`:

Remove entries for all deleted routes. The file should only contain entries for routes that still exist. Set:
- `/upgrade-your-advice` → `"★"` (Winner)
- `/upgrade-your-advice-v0-gemini` → `"W"` (Workshop)

Remove all other `/upgrade*` entries from this file.

---

## TASK 3: Clean Up Standalone HTML Files (if present)

Check if these files exist in `src/app/` and delete them if they do — they were reference files for the now-deleted variants:

```
src/app/upgrade-your-advice-v0-cgpt.html
src/app/upgrade-your-advice-v0.html
```

**Keep** `src/app/upgrade-your-advice-v0-gemini.html` if it exists (Workshop variant).

---

## TASK 4: Verify Build

After all deletions and edits:
1. Run `npm run build` (or `npx next build`)
2. Check for any import errors referencing deleted files
3. If there are broken imports, fix them (likely in gallery page or layout)
4. Confirm the build succeeds

---

## Important Constraints

0. **When in doubt, KEEP IT.** Only delete what's explicitly listed above.
1. Do NOT touch any non-upgrade pages (improve*, save*, meaning*, how-it-works, home, etc.)
2. Do NOT delete shared components in `src/components/`
3. Do NOT modify `/upgrade-your-advice/page.tsx` — it's already done
4. Work incrementally: verify before deleting, update gallery after deleting, build-check last
