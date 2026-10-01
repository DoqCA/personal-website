// Every tunable for the polygon-ocean background lives here.
// Colors are hex strings; `base` must match `--color-ocean` in src/app/globals.css.

const deg = (d: number) => (d * Math.PI) / 180;

export const config = {
  grid: {
    /** Half the plane's width/depth in world units. Must exceed `fog.far` from the camera. */
    halfSize: 40,
    /** Cells per side on desktop. */
    segments: 100,
    /** Cells per side under `narrowBreakpoint`. */
    segmentsNarrow: 64,
    /** Cells per side on low-power devices. */
    segmentsLowPower: 56,
    narrowBreakpoint: 768,
    /** Max X/Z offset per vertex as a fraction of cell size. Keep under 0.4 so triangles never flip. */
    jitter: 0.36,
    /** Static per-vertex height noise; this is what makes the facets look crystalline. */
    heightNoise: 0.22,
    /** How much of the height noise slowly breathes over time (0 = fixed). */
    heightNoiseDrift: 0.35,
  },

  waves: {
    /** Global multiplier on all wave speeds. */
    timeScale: 1,
    /** Each wave: direction (x, z), frequency (rad/unit), speed (rad/s), amplitude (units). Max 4. */
    list: [
      { dir: [1.0, 0.35], frequency: 0.22, speed: 0.32, amplitude: 0.55 },
      { dir: [-0.45, 1.0], frequency: 0.31, speed: 0.26, amplitude: 0.38 },
      { dir: [0.8, -0.7], frequency: 0.47, speed: 0.41, amplitude: 0.2 },
      { dir: [-1.0, -0.2], frequency: 0.69, speed: 0.53, amplitude: 0.1 },
    ],
  },

  camera: {
    fovY: deg(45),
    near: 0.1,
    far: 120,
    /** Distance from the camera to the point it orbits (world origin). */
    distance: 11,
    /** Low, near-horizontal view (mouse at the bottom). */
    pitchMin: deg(20), /** Previously 25 */
    /** Bird's-eye view (mouse at the top). */
    pitchMax: deg(35), /** Previously 65 */
    /** Max roll around the view axis, either way. */
    rollMax: deg(6), /** Previously 12 */
  },

  spring: {
    stiffness: 60,
    damping: 20,
    mass: 1.4,
  },

  colors: {
    /** Page background, fog, and vignette color. */
    base: "#02060d",
    /** Facets turned fully away from the light. */
    shadow: "#03070d",
    /** Facets facing the light. Keep well below the white text. */
    highlight: "#51555c", /** Previously #3a3f47 */
    /** Color the specular glints pick up, as if reflecting the falling red particles. */
    reflection: "#c23a3a",
  },

  reflection: {
    /** How much of the specular glint is tinted by `colors.reflection` (0 = white, 1 = full red). */
    specularTint: 0.85,
    /** Peak red tint on lit facets inside the drifting "reflection" patches. */
    patchTint: 0.35,
    /** World-space scale of the patches (higher = smaller, more frequent). */
    patchScale: 0.18,
    /** How fast the patches drift across the water. */
    patchSpeed: 0.12,
  },

  particles: {
    /** Particle counts, mirroring the grid's device tiers. */
    count: 220,
    countNarrow: 120,
    countLowPower: 90,
    /** Fraction of particles that are tumbling leaves; the rest are thin falling drops. */
    leafRatio: 0.6,
    /** Spawn volume around the origin: X half-width, Z range (negative = away from the camera), top height. */
    spreadX: 16,
    zRange: [-26, 7],
    height: 9,
    /** Fall speed in units/s (leaves use the low end, drops the high end). */
    speedLeaf: [0.45, 0.9],
    speedDrop: [2.6, 4.2],
    /** World-space size (half-extent) of each sprite. */
    sizeLeaf: [0.07, 0.14],
    sizeDrop: [0.035, 0.06],
    /** Horizontal sway amplitude for leaves (units). */
    sway: 0.6,
    /** Two-stop palette each particle picks between. */
    colorA: "#e0453f",
    colorB: "#8f1d24",
    /** Peak alpha. Keep low so particles stay ambient behind the text. */
    opacity: 0.75,
    /** Height above the water where particles fade out (they "sink" into the ocean). */
    surfaceFade: 0.9,
  },

  light: {
    /** Direction *towards* the light. Low elevation exaggerates facet contrast. */
    direction: [-0.55, 0.5, -0.65],
    /** Lambert range mapped to shadow → highlight. Narrower = harsher facets. */
    shadeLow: 0.25,
    shadeHigh: 0.95,
    specularStrength: 0.35,
    specularPower: 28,
  },

  fog: {
    /** Distance from the camera where fog starts and where it fully reaches `colors.base`. */
    near: 8,
    far: 30,
  },

  vignette: {
    /** Screen-space center of the lit region (0..1, y up). */
    center: [0.5, 0.55],
    /** Radius where darkening starts and where it reaches `colors.base` (aspect-corrected). */
    inner: 0.1,
    outer: 1.1,
    /** 0 = no vignette, 1 = full fade to base at `outer`. */
    strength: 0.95,
  },

  render: {
    maxDpr: 1.5,
    /** Fixed time used for the single frame under prefers-reduced-motion. */
    staticTime: 14,
  },
} as const;

export type OceanConfig = typeof config;

export function hexToRgb(hex: string): [number, number, number] {
  const n = Number.parseInt(hex.replace("#", ""), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}
