/**
 * Feature flags. Toggle here, plumbed everywhere.
 *
 * Adding a flag:
 *   1. Add a key here.
 *   2. Guard the relevant JSX (`{FEATURES.MY_FLAG && <X />}`).
 *   3. (Optional) Wire to the Tweaks panel for runtime toggling.
 */

export const FEATURES = {
  /** ⭐ Show the tabs strip for multiple PDEs (system support). */
  PDE_SYSTEMS: true,

  /** 2-D problems — y derivative operator, north/south BCs, 2-D viz. */
  TWO_D: true,

  /** Even if cupy is missing, show the RKF option (will fail at solve time). */
  GPU_FORCE_VISIBLE: false,

  /** Export menu / toolbar actions. */
  EXPORT_PNG: true,
  EXPORT_CSV: true,
  EXPORT_VIDEO: false,

  /** Recent-files menu under File. */
  RECENT_FILES: false,
} as const;
