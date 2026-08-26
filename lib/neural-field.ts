import { palette } from "@/lib/tokens";

/**
 * The neural-field engine: the site's one canvas effect, rendering a **living neural network**
 * rather than a drifting star field.
 *
 * Framework-free on purpose — this is plain TypeScript driving a 2D `<canvas>`, and the React
 * side (`components/effects/NeuralField.tsx`) only owns mounting, sizing and teardown. Keeping
 * the simulation out of React means no re-render can ever touch the hot loop.
 *
 * **Why 2D canvas and not Three.js/R3F.** `CLAUDE.md` §2 rules the constellation is a
 * hand-rolled canvas, and nothing about a neural mesh needs a GPU scene graph: the "3D" here is
 * depth-sorted parallax and perspective scaling, which is a projection problem, not a WebGL
 * one. `three` + `@react-three/fiber` + `drei` would add several hundred KB to a page whose
 * measured weak point is main-thread time (see the Phase 13/14 Lighthouse notes in
 * `PROGRESS.md`), to draw points and lines this file draws in a few hundred bytes of maths.
 *
 * ---
 *
 * ## What makes it read as a *network* rather than a constellation
 *
 * 1. **Anchored nodes, not wandering ones.** Every node orbits a fixed anchor by a few pixels
 *    instead of drifting freely and wrapping at the edges. That is the single decision that
 *    kills the generic-galaxy look: because nodes never travel far, their connections are
 *    **permanent synapses** rather than whatever two dots happen to be near each other this
 *    frame. A field whose edges flicker in and out at random reads as noise; a field with a
 *    stable topology reads as a system.
 * 2. **Edges are built once, by k-nearest-neighbour**, with a degree cap and three node tiers
 *    (hub / relay / micro). Hubs carry more connections, so the mesh has visible structure and
 *    hierarchy instead of uniform mush.
 * 3. **Signal, not drift, carries the motion.** Ambient node motion stays slow and calm so body
 *    copy in front of it stays readable — the *speed* the eye picks up comes from data packets
 *    travelling the edges at 200–320 px/s and from activation flashes, which is what a busy
 *    network actually looks like.
 * 4. **Cascades.** A packet arriving at a node can re-emit along that node's other edges, so a
 *    single firing propagates outward through the topology for a few hops and dies out.
 *
 * ## The cursor is a processing core, not a parallax multiplier
 *
 * The previous implementation gave the pointer a 2% field-wide parallax eased at `0.05`/frame —
 * roughly twenty frames to converge on a shift too small to see. Here the pointer:
 *
 * - **pulls nearby nodes toward itself** with a squared falloff, eased at `0.35`/frame (~8
 *   frames, ≈130 ms) so the mesh visibly bulges to meet it;
 * - **activates** everything inside its radius — activation rises fast (`0.45`) and decays slow
 *   (`0.055`), an asymmetry that leaves a comet-tail of still-lit nodes behind a moving cursor,
 *   so the network looks like it *remembers* where the pointer went;
 * - **lights the edges** it is near, painting cyan over the resting violet mesh;
 * - **injects signal**: nodes it activates fire packets, so cascades genuinely radiate outward
 *   from the cursor. This is the difference between the network reacting to the cursor and the
 *   cursor merely being drawn on top of it;
 * - **wires itself in** — short tendrils connect the core to its nearest nodes, with data dots
 *   running inward along them;
 * - **leaves a velocity trail**, and moving fast sprays sparks and raises the firing rate.
 *
 * Nothing in that list is eased on the *position* itself: the influence field is sampled from
 * the raw pointer coordinate every frame, so there is zero lag between the cursor and the
 * reaction. Only the node displacement and the activation are smoothed, and both deliberately.
 *
 * ## Performance
 *
 * The hot loop is O(nodes) + O(edges) with no allocation:
 * - distances compare **squared** values; `Math.hypot` appears only where a real length is
 *   needed (it is markedly slower than the inline form),
 * - edges are built once at seed time through a uniform spatial-hash grid, not O(n²) per frame,
 * - edges draw in a handful of batched `stroke()` calls bucketed by alpha, instead of one
 *   `beginPath`/`stroke` pair per edge as before,
 * - glow uses a **cached radial-gradient sprite** blitted with `drawImage`, never
 *   `shadowBlur` — canvas shadows are among the most expensive things you can ask a 2D context
 *   to do, and the old field set one on every node every frame,
 * - packets and sparks come from **fixed pools** with an `alive` flag, so a busy cascade never
 *   allocates and never triggers GC mid-scroll,
 * - the simulation is **delta-timed and clamped**, so it runs at the same speed on a 60 Hz and
 *   a 144 Hz display (the old per-frame step ran literally twice as fast on a 120 Hz laptop).
 *
 * ## Accessibility and mobile
 *
 * `renderStatic()` paints a single frame with no loop, no pointer listeners and no packets —
 * that is the entire reduced-motion path (`CLAUDE.md` §4). Touch devices keep the mesh and the
 * ambient signal but get no pointer behaviour at all: `influenceRadius: 0` disables attraction,
 * activation, tendrils, trail and sparks in one switch.
 */

const TAU = Math.PI * 2;

type RGB = readonly [number, number, number];

function toRgb(hex: string): RGB {
  const value = hex.replace("#", "");
  return [
    parseInt(value.slice(0, 2), 16),
    parseInt(value.slice(2, 4), 16),
    parseInt(value.slice(4, 6), 16),
  ] as const;
}

const rgba = (c: RGB, a: number) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

/** The restrained three-accent palette this effect is allowed to use. */
const VIOLET = toRgb(palette["accent-violet"]);
const INDIGO = toRgb(palette["accent-indigo"]);
const CYAN = toRgb(palette["accent-cyan"]);

export interface NeuralFieldConfig {
  /** Node count at a desktop viewport. */
  nodeCount?: number;
  /** Node count below 640px. */
  mobileNodeCount?: number;
  /** Longest synapse, in px. Also the spatial-grid cell size used to build the topology. */
  linkRadius?: number;
  /** Node core radius range, in px, before depth scaling. */
  minRadius?: number;
  maxRadius?: number;
  /** How far a node orbits its anchor, in px. Small by design — see the class doc. */
  driftRadius?: number;
  /**
   * Pointer influence radius, in px. **`0` disables every pointer behaviour** — attraction,
   * activation, tendrils, trail and sparks — which is exactly what touch devices want.
   */
  influenceRadius?: number;
  /** Peak fraction of the pointer offset a node is pulled by, at the centre of the radius. */
  pullStrength?: number;
  /** Depth-parallax travel in px between the nearest and furthest layer, at the screen edge. */
  parallaxDepth?: number;
  /** Draw the cursor core, its tendrils and its velocity trail. */
  core?: boolean;
  /** Ceiling on packets in flight. `0` disables data flow entirely. */
  maxPackets?: number;
  /** Opacity multiplier for the resting mesh. Activation is unaffected. */
  intensity?: number;
  /** Cap, in px, on how far the whole field drifts as the page scrolls. `0` disables it. */
  scrollDrift?: number;
  /**
   * Ceiling on the backing-store pixel ratio.
   *
   * The field is thin lines and soft radial glows — content with no fine detail to resolve —
   * so rendering it at a full 2x device ratio doubles the fill cost for a difference nobody
   * can see. 1.5 is the right trade for a full-screen layer; a small, dense cluster can afford
   * more.
   */
  maxDpr?: number;
}

const DEFAULTS: Required<NeuralFieldConfig> = {
  nodeCount: 150,
  mobileNodeCount: 54,
  linkRadius: 132,
  minRadius: 1,
  maxRadius: 2.6,
  driftRadius: 11,
  influenceRadius: 250,
  pullStrength: 0.34,
  parallaxDepth: 18,
  core: true,
  maxPackets: 90,
  intensity: 1,
  scrollDrift: 60,
  maxDpr: 2,
};

/**
 * The scroll story: one layout per section, in **page order**.
 *
 * The field does not play an animation at each boundary and stop. Every node holds a target
 * position for each of these stages, precomputed once at seed time, and the scroll position
 * interpolates continuously between the two it currently sits between — so there is no moment
 * where the scene is "between animations", and scrubbing back up retraces exactly.
 *
 * Note the order follows `app/page.tsx`, where **Experience precedes Projects**.
 *
 * | stage      | section    | reads as                                              |
 * |------------|------------|-------------------------------------------------------|
 * | `ambient`  | Hero       | a loose neural environment, the system at rest         |
 * | `lattice`  | About      | it reorganises — structure and interconnection emerge  |
 * | `clusters` | Skills     | nodes gather into technology clusters                  |
 * | `hub`      | Services   | clusters resolve into hub-and-spoke capabilities       |
 * | `timeline` | Experience | the network straightens into a connected path          |
 * | `pipeline` | Projects   | feed-forward layers: input → hidden → hidden → output  |
 * | `converge` | Contact    | everything settles into concentric order               |
 */
export const STORY_SECTIONS = [
  "hero",
  "about",
  "skills",
  "services",
  "experience",
  "projects",
  "contact",
] as const;

const STAGE_COUNT = STORY_SECTIONS.length;

/**
 * Per-stage character, interpolated alongside the geometry.
 *
 * - `drift` scales each node's orbit radius, so the field is restless at the top of the page
 *   and progressively stiller as it resolves — motion calming down *is* the narrative.
 * - `rate` scales ambient firing, peaking at `pipeline` where the section is about throughput.
 * - `flow` biases packet direction left→right. At 0 signal spreads in every direction; at 1 it
 *   marches forward, which is what turns the `pipeline` layout from "a diagram of a network"
 *   into "a network actually processing something".
 */
const STAGE_PROFILE: readonly { drift: number; rate: number; flow: number }[] = [
  { drift: 1.0, rate: 1.0, flow: 0 }, // ambient
  { drift: 0.86, rate: 1.15, flow: 0.15 }, // lattice
  { drift: 0.72, rate: 1.25, flow: 0.2 }, // clusters
  { drift: 0.64, rate: 1.3, flow: 0.35 }, // hub
  { drift: 0.58, rate: 1.25, flow: 0.75 }, // timeline
  { drift: 0.5, rate: 1.75, flow: 1 }, // pipeline
  { drift: 0.42, rate: 0.7, flow: 0.2 }, // converge
];

/** Smoothstep — takes the linear scroll mapping off the geometry so morphs ease in and out. */
const smoothstep = (t: number) => t * t * (3 - 2 * t);

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** 0 = micro (the fabric), 1 = relay, 2 = hub. Drives degree, size and glow. */
type Tier = 0 | 1 | 2;

interface Node {
  /**
   * Base anchor — the `ambient` layout, fixed for the node's life and the position the
   * topology was built against. Every other stage layout is a deformation of this.
   */
  ax: number;
  ay: number;
  /** Anchor for *this frame*: the morph between the two stages scroll currently sits between. */
  cx: number;
  cy: number;
  /** Two stable per-node hashes in [0,1), so every layout can vary a node deterministically. */
  k: number;
  k2: number;
  /** Resolved screen position for this frame (anchor + orbit + pull + parallax + scroll). */
  x: number;
  y: number;
  /** Depth, 0 = nearest, 1 = furthest. Drives scale, brightness and parallax travel. */
  z: number;
  r: number;
  tier: Tier;
  /** Orbit parameters — two out-of-phase sinusoids, so the path is a slow Lissajous curve. */
  ph: number;
  sa: number;
  sb: number;
  ra: number;
  rb: number;
  /** Eased pointer displacement. */
  dx: number;
  dy: number;
  /** 0..1. Rises fast under the pointer or on a packet arrival, decays slowly. */
  act: number;
  /** Seconds until this node may fire again. */
  cool: number;
}

interface Edge {
  a: number;
  b: number;
  /** Resting length at seed time, used to normalise packet speed to px/s. */
  len: number;
  /** Resting alpha bucket, assigned once from the edge's length at seed time. */
  bucket: number;
  /** Activation alpha for this frame, 0..1. */
  aa: number;
  /**
   * How much this edge is drawn this frame, 0..1. Stage layouts compress the field in
   * different directions, so a synapse that is short in `ambient` can be stretched several
   * times its resting length in `pipeline` or `converge`. Rather than draw a screen-crossing
   * line, an over-stretched edge fades out — which also reads correctly: a connection that no
   * longer makes sense in the current arrangement should not be asserted.
   */
  fade: number;
  /** `bucket` scaled by `fade`, or -1 to skip. Keeps the batched draw a single pass. */
  drawBucket: number;
}

interface Packet {
  alive: boolean;
  e: number;
  /** 0 = travelling a->b, 1 = travelling b->a. */
  dir: 0 | 1;
  t: number;
  /** Progress per second, already normalised by edge length. */
  sp: number;
  hop: number;
}

interface Spark {
  alive: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
}

/** Resting-mesh alpha buckets. Batching edges into a few strokes is the main draw-cost win. */
const EDGE_BUCKETS = 5;
/** Activation alpha buckets, drawn as a cyan pass over the resting mesh. */
const ACTIVE_BUCKETS = 3;
/** How many trail samples the cursor keeps. */
const TRAIL_LENGTH = 20;
/** How many nodes the core wires itself into. */
const MAX_TENDRILS = 6;

export class NeuralField {
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private cfg: Required<NeuralFieldConfig>;

  private width = 0;
  private height = 0;
  private dpr = 1;

  private nodes: Node[] = [];
  private edges: Edge[] = [];
  /** CSR adjacency: `adjEdge.slice(adjStart[i], adjStart[i + 1])` are node `i`'s edge indices. */
  private adjStart = new Int32Array(0);
  private adjEdge = new Int32Array(0);

  private packets: Packet[] = [];
  private sparks: Spark[] = [];

  /** Pointer in canvas-local px. `active` is false when the pointer has left the document. */
  private px = 0;
  private py = 0;
  private pActive = false;
  /** Smoothed pointer speed in px/s — feeds trail length, core size and firing rate. */
  private pSpeed = 0;
  private lastPx = 0;
  private lastPy = 0;

  private trail = new Float32Array(TRAIL_LENGTH * 2);
  private trailCount = 0;

  /** Nearest nodes to the pointer, refreshed each frame for the core's tendrils. */
  private tendril: number[] = [];
  private tendrilD2: number[] = [];

  private scrollY = 0;
  private fieldOffsetY = 0;

  /**
   * All stage layouts, flat: node `i`'s stage `s` is at `[(i * STAGE_COUNT + s) * 2]`.
   * 150 nodes x 7 stages x 2 floats is ~8KB, computed once — cheap enough that the per-frame
   * cost of the whole story is a single lerp per node.
   */
  private layouts = new Float32Array(0);
  /** Where scroll wants the story to be, in [0, STAGE_COUNT - 1]. */
  private storyTarget = 0;
  /** Where it actually is — eased toward the target, which adds a little cinematic inertia. */
  private storyPos = 0;
  /** This frame's interpolated stage character. */
  private profile = { ...STAGE_PROFILE[0] };

  private time = 0;
  private lastFrame = 0;
  private raf = 0;
  private running = false;
  private ambientTimer = 0;

  /** Rolling accumulator for the opt-in `__neuralDebug` frame-cost readout. */
  private frameAcc = 0;
  private frameN = 0;

  private glowViolet: HTMLCanvasElement | null = null;
  private glowCyan: HTMLCanvasElement | null = null;

  constructor(canvas: HTMLCanvasElement, config: NeuralFieldConfig = {}) {
    this.canvas = canvas;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) throw new Error("NeuralField: 2D context unavailable");
    this.ctx = ctx;
    this.cfg = { ...DEFAULTS, ...config };
    this.glowViolet = makeGlowSprite(VIOLET);
    this.glowCyan = makeGlowSprite(CYAN);
  }

  /** Swap config without re-seeding, for props that change on resize/breakpoint. */
  configure(config: NeuralFieldConfig) {
    this.cfg = { ...DEFAULTS, ...config };
  }

  /* ---------------------------------------------------------------- layout */

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) return false;

    this.dpr = Math.min(window.devicePixelRatio || 1, this.cfg.maxDpr);
    this.width = rect.width;
    this.height = rect.height;
    this.canvas.width = Math.round(rect.width * this.dpr);
    this.canvas.height = Math.round(rect.height * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.seed();
    return true;
  }

  /* ------------------------------------------------------------ simulation */

  private resolveCount() {
    const base =
      window.innerWidth < 640 ? this.cfg.mobileNodeCount : this.cfg.nodeCount;
    return Math.max(12, base);
  }

  /**
   * Lay out anchors on a **jittered grid** rather than at pure random.
   *
   * Uniform random placement clumps — it leaves bald patches next to knots of five nodes, and
   * a k-nearest topology over that produces a lopsided mesh. One node per cell with bounded
   * jitter gives even coverage that still looks organic, and it makes every node's neighbour
   * distance land in a predictable range, which is what keeps edge lengths consistent.
   */
  private seed() {
    const count = this.resolveCount();
    const aspect = this.width / Math.max(this.height, 1);
    const cols = Math.max(1, Math.round(Math.sqrt(count * aspect)));
    const rows = Math.max(1, Math.ceil(count / cols));
    const cw = this.width / cols;
    const ch = this.height / rows;

    this.nodes = [];
    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        if (this.nodes.length >= count) break;
        const roll = Math.random();
        // Hubs are rare and relays uncommon, so the mesh has a few obvious focal points
        // instead of reading as one uniform texture.
        const tier: Tier = roll < 0.09 ? 2 : roll < 0.33 ? 1 : 0;
        const z = Math.random();
        const tierScale = tier === 2 ? 1.7 : tier === 1 ? 1.2 : 1;

        const ax = (col + 0.5) * cw + (Math.random() - 0.5) * cw * 0.78;
        const ay = (row + 0.5) * ch + (Math.random() - 0.5) * ch * 0.78;

        this.nodes.push({
          ax,
          ay,
          cx: ax,
          cy: ay,
          k: Math.random(),
          k2: Math.random(),
          x: 0,
          y: 0,
          z,
          r:
            (this.cfg.minRadius +
              Math.random() * (this.cfg.maxRadius - this.cfg.minRadius)) *
            tierScale,
          tier,
          ph: Math.random() * TAU,
          sa: 0.3 + Math.random() * 0.6,
          sb: 0.3 + Math.random() * 0.6,
          ra: this.cfg.driftRadius * (0.5 + Math.random() * 0.5),
          rb: this.cfg.driftRadius * (0.5 + Math.random() * 0.5),
          dx: 0,
          dy: 0,
          act: 0,
          cool: Math.random() * 3,
        });
      }
    }

    this.buildEdges();
    this.buildLayouts();

    this.packets = Array.from({ length: this.cfg.maxPackets }, () => ({
      alive: false,
      e: 0,
      dir: 0 as const,
      t: 0,
      sp: 0,
      hop: 0,
    }));
    this.sparks = Array.from({ length: 64 }, () => ({
      alive: false,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      life: 0,
      max: 1,
    }));

    this.trailCount = 0;
    // Exposed for assertions from outside — "node count scales down on small viewports" is a
    // stated requirement and this is the only way to check it without counting pixels.
    this.canvas.dataset.nodes = String(this.nodes.length);
    this.canvas.dataset.edges = String(this.edges.length);
  }

  /**
   * Build the topology once, via a uniform spatial-hash grid: each node links to its nearest
   * few neighbours inside `linkRadius`, subject to a degree cap.
   *
   * Doing this once — rather than testing every pair every frame as the old constellation
   * did — is both the performance win and the *aesthetic* one. Permanent edges are what turn
   * a cloud of dots into a network with a shape.
   */
  private buildEdges() {
    const n = this.nodes.length;
    const radius = this.cfg.linkRadius;
    const r2 = radius * radius;
    const cell = Math.max(radius, 1);
    const cols = Math.max(1, Math.ceil(this.width / cell));
    const rows = Math.max(1, Math.ceil(this.height / cell));

    const buckets: number[][] = Array.from({ length: cols * rows }, () => []);
    const cellOf = (node: Node) => {
      const cx = Math.min(cols - 1, Math.max(0, Math.floor(node.ax / cell)));
      const cy = Math.min(rows - 1, Math.max(0, Math.floor(node.ay / cell)));
      return cy * cols + cx;
    };
    for (let i = 0; i < n; i += 1) buckets[cellOf(this.nodes[i])].push(i);

    const degree = new Int32Array(n);
    const seen = new Set<number>();
    const edges: Edge[] = [];
    // Hubs reach further into the mesh than the fabric does — that difference is the visible
    // hierarchy.
    const wanted = (tier: Tier) => (tier === 2 ? 4 : tier === 1 ? 3 : 2);
    const MAX_DEGREE = 6;

    const candidates: { j: number; d2: number }[] = [];

    for (let i = 0; i < n; i += 1) {
      const a = this.nodes[i];
      if (degree[i] >= MAX_DEGREE) continue;

      candidates.length = 0;
      const cx = Math.min(cols - 1, Math.max(0, Math.floor(a.ax / cell)));
      const cy = Math.min(rows - 1, Math.max(0, Math.floor(a.ay / cell)));

      for (let oy = -1; oy <= 1; oy += 1) {
        for (let ox = -1; ox <= 1; ox += 1) {
          const gx = cx + ox;
          const gy = cy + oy;
          if (gx < 0 || gy < 0 || gx >= cols || gy >= rows) continue;
          for (const j of buckets[gy * cols + gx]) {
            if (j === i) continue;
            const ddx = this.nodes[j].ax - a.ax;
            const ddy = this.nodes[j].ay - a.ay;
            const d2 = ddx * ddx + ddy * ddy;
            if (d2 <= r2) candidates.push({ j, d2 });
          }
        }
      }

      candidates.sort((p, q) => p.d2 - q.d2);
      let added = 0;
      const target = wanted(a.tier);

      for (const candidate of candidates) {
        if (added >= target || degree[i] >= MAX_DEGREE) break;
        const j = candidate.j;
        if (degree[j] >= MAX_DEGREE) continue;
        const key = i < j ? i * n + j : j * n + i;
        if (seen.has(key)) continue;
        seen.add(key);
        const len = Math.sqrt(candidate.d2);
        edges.push({
          a: i,
          b: j,
          len,
          // Shorter synapses sit brighter, so the mesh has tonal depth at rest.
          bucket: Math.min(
            EDGE_BUCKETS - 1,
            Math.floor((1 - len / radius) * EDGE_BUCKETS),
          ),
          aa: 0,
          fade: 1,
          drawBucket: 0,
        });
        degree[i] += 1;
        degree[j] += 1;
        added += 1;
      }
    }

    this.edges = edges;

    // CSR adjacency, so a cascade can walk a node's other edges without scanning all of them.
    const starts = new Int32Array(n + 1);
    for (const edge of edges) {
      starts[edge.a + 1] += 1;
      starts[edge.b + 1] += 1;
    }
    for (let i = 0; i < n; i += 1) starts[i + 1] += starts[i];
    const cursor = Int32Array.from(starts);
    const flat = new Int32Array(edges.length * 2);
    for (let e = 0; e < edges.length; e += 1) {
      flat[cursor[edges[e].a]] = e;
      cursor[edges[e].a] += 1;
      flat[cursor[edges[e].b]] = e;
      cursor[edges[e].b] += 1;
    }
    this.adjStart = starts;
    this.adjEdge = flat;
  }

  /* ----------------------------------------------------------------- story */

  /**
   * Precompute every stage layout.
   *
   * **Every layout is a continuous deformation of the base positions, never a reshuffle.**
   * That constraint is what makes the whole story possible with one topology: because a node's
   * target in each stage is derived from where it already *is* — nearest cluster, column from
   * its base x, ring angle from its base angle — neighbours stay neighbours, so the edges built
   * once against the ambient layout stay short and meaningful in all seven. Assigning nodes to
   * clusters or columns at random would look identical at rest and tear the mesh into a cat's
   * cradle of screen-length lines the moment it morphed.
   */
  private buildLayouts() {
    const n = this.nodes.length;
    const W = this.width;
    const H = this.height;
    const minSide = Math.min(W, H);
    this.layouts = new Float32Array(n * STAGE_COUNT * 2);

    const cxCentre = W / 2;
    const cyCentre = H / 2;

    // Skills: five technology clusters, spread so they read as distinct groups.
    const clusters = [
      [0.14, 0.32],
      [0.33, 0.66],
      [0.52, 0.27],
      [0.71, 0.63],
      [0.88, 0.35],
    ].map(([u, v]) => [u * W, v * H] as const);
    const clusterR = minSide * 0.115;

    // Services: three hubs, each with radiating spokes.
    const hubs = [
      [0.22, 0.4],
      [0.52, 0.6],
      [0.8, 0.36],
    ].map(([u, v]) => [u * W, v * H] as const);
    const SPOKES = 7;
    const hubR = minSide * 0.16;

    // Projects: a four-layer feed-forward net — input, two hidden, output.
    const columns = [0.14, 0.38, 0.62, 0.86];

    const nearest = (points: readonly (readonly [number, number])[], x: number, y: number) => {
      let best = 0;
      let bestD = Infinity;
      for (let p = 0; p < points.length; p += 1) {
        const dx = points[p][0] - x;
        const dy = points[p][1] - y;
        const d = dx * dx + dy * dy;
        if (d < bestD) {
          bestD = d;
          best = p;
        }
      }
      return best;
    };

    for (let i = 0; i < n; i += 1) {
      const node = this.nodes[i];
      const bx = node.ax;
      const by = node.ay;
      const u = W > 0 ? bx / W : 0.5;
      const v = H > 0 ? by / H : 0.5;
      const k = node.k;
      const k2 = node.k2;
      let o = i * STAGE_COUNT * 2;

      const put = (x: number, y: number) => {
        this.layouts[o] = x;
        this.layouts[o + 1] = y;
        o += 2;
      };

      /* 0 — ambient: the field as seeded. */
      put(bx, by);

      /* 1 — lattice: pulled most of the way onto a coarse grid, so the same field reads as
         deliberate and structured rather than scattered. */
      const gx = (Math.round(u * 9) / 9) * W;
      const gy = (Math.round(v * 6) / 6) * H;
      put(lerp(bx, gx, 0.6), lerp(by, gy, 0.6));

      /* 2 — clusters: gathered onto the nearest of five attractors, on a ring around it. */
      const ci = nearest(clusters, bx, by);
      const cAngle = k * TAU;
      const cRad = clusterR * (0.3 + 0.7 * k2);
      put(clusters[ci][0] + Math.cos(cAngle) * cRad, clusters[ci][1] + Math.sin(cAngle) * cRad);

      /* 3 — hub: nearest of three hubs, angle quantised to a spoke so the result radiates
         instead of blobbing — hub-and-spoke, the shape of a service topology. */
      const hi = nearest(hubs, bx, by);
      const rawAngle = Math.atan2(by - hubs[hi][1], bx - hubs[hi][0]);
      const step = TAU / SPOKES;
      const spoke = Math.round(rawAngle / step) * step;
      const hRad = hubR * (0.22 + 0.9 * k);
      put(hubs[hi][0] + Math.cos(spoke) * hRad, hubs[hi][1] + Math.sin(spoke) * hRad);

      /* 4 — timeline: a shallow serpentine spine crossing the viewport, nodes branching off
         it — a path with events hanging from it. */
      const spineX = W * (0.1 + 0.8 * u);
      const spineY = H * (0.5 + 0.2 * Math.sin(u * Math.PI * 1.7));
      put(spineX, spineY + (k - 0.5) * H * 0.26);

      /* 5 — pipeline: four vertical layers. Column comes from the node's own x, so the mesh
         folds into layers rather than being redealt. */
      const col = Math.min(columns.length - 1, Math.max(0, Math.floor(u * columns.length)));
      put(
        W * columns[col] + (k - 0.5) * minSide * 0.035,
        H * (0.12 + 0.76 * v) + (k2 - 0.5) * minSide * 0.02,
      );

      /* 6 — converge: concentric rings. The angle is the node's own bearing from centre, so
         the field contracts inward rather than scrambling on the way to its final state. */
      const bearing = Math.atan2(by - cyCentre, bx - cxCentre);
      const ring = Math.floor(k * 3);
      const rRad = minSide * (0.15 + ring * 0.105);
      put(cxCentre + Math.cos(bearing) * rRad, cyCentre + Math.sin(bearing) * rRad);
    }
  }

  /**
   * Set the story position, in `[0, STAGE_COUNT - 1]`. Fractional values are the whole point:
   * `2.4` means "40% of the way from Skills to Services".
   */
  setStory(position: number) {
    this.storyTarget = Math.max(0, Math.min(STAGE_COUNT - 1, position));
  }

  /** Resolve `storyPos` into this frame's anchors and stage character. */
  private applyStory(dt: number) {
    // Eased toward the scroll target rather than snapped to it: scroll already drives this
    // directly, and the small lag reads as the scene having mass.
    this.storyPos += (this.storyTarget - this.storyPos) * Math.min(1, dt * 6);

    const maxStage = STAGE_COUNT - 1;
    const clamped = Math.max(0, Math.min(maxStage, this.storyPos));
    const from = Math.min(maxStage, Math.floor(clamped));
    const to = Math.min(maxStage, from + 1);
    const t = smoothstep(clamped - from);

    const a = STAGE_PROFILE[from];
    const b = STAGE_PROFILE[to];
    this.profile.drift = lerp(a.drift, b.drift, t);
    this.profile.rate = lerp(a.rate, b.rate, t);
    this.profile.flow = lerp(a.flow, b.flow, t);

    if (this.layouts.length === 0) return;

    for (let i = 0; i < this.nodes.length; i += 1) {
      const node = this.nodes[i];
      const base = i * STAGE_COUNT * 2;
      const fi = base + from * 2;
      const ti = base + to * 2;
      node.cx = lerp(this.layouts[fi], this.layouts[ti], t);
      node.cy = lerp(this.layouts[fi + 1], this.layouts[ti + 1], t);
    }
  }

  /* ---------------------------------------------------------------- pointer */

  setPointer(x: number, y: number, dt: number) {
    if (dt > 0) {
      const vx = (x - this.lastPx) / dt;
      const vy = (y - this.lastPy) / dt;
      const speed = Math.sqrt(vx * vx + vy * vy);
      // Smoothed, or the trail and core would strobe on every jittery mouse sample.
      this.pSpeed += (speed - this.pSpeed) * 0.25;
    }
    this.lastPx = x;
    this.lastPy = y;
    this.px = x;
    this.py = y;
    this.pActive = true;
  }

  clearPointer() {
    this.pActive = false;
    this.pSpeed = 0;
    this.trailCount = 0;
  }

  setScroll(y: number) {
    this.scrollY = y;
  }

  /* ------------------------------------------------------------------ spawn */

  private spawnPacket(edgeIndex: number, dir: 0 | 1, hop: number) {
    if (this.cfg.maxPackets <= 0) return;
    const edge = this.edges[edgeIndex];
    if (!edge) return;
    for (const packet of this.packets) {
      if (packet.alive) continue;
      packet.alive = true;
      packet.e = edgeIndex;
      packet.dir = dir;
      packet.t = 0;
      // Normalised so every packet travels at the same px/s regardless of edge length —
      // otherwise short synapses look frantic and long ones look broken.
      packet.sp = (200 + Math.random() * 120) / Math.max(edge.len, 12);
      packet.hop = hop;
      return;
    }
  }

  /** Fire a node: light it, and push signal outward along up to two of its edges. */
  private fire(nodeIndex: number, hop: number, fanout: number) {
    const node = this.nodes[nodeIndex];
    node.act = Math.max(node.act, 0.9);
    node.cool = 0.32 + Math.random() * 0.5;

    const start = this.adjStart[nodeIndex];
    const end = this.adjStart[nodeIndex + 1];
    const degree = end - start;
    if (degree === 0) return;

    let sent = 0;
    const offset = Math.floor(Math.random() * degree);
    const flow = this.profile.flow;

    for (let k = 0; k < degree && sent < fanout; k += 1) {
      const edgeIndex = this.adjEdge[start + ((offset + k) % degree)];
      const edge = this.edges[edgeIndex];
      let dir: 0 | 1 = edge.a === nodeIndex ? 0 : 1;

      // Directional bias. At `flow: 1` (the Projects pipeline) the packet is launched from
      // whichever end is further left regardless of which node fired, so signal marches
      // input → output across the layers instead of diffusing. That is the difference between
      // a picture of a feed-forward network and one that is visibly running.
      if (flow > 0 && Math.random() < flow) {
        dir = this.nodes[edge.a].cx <= this.nodes[edge.b].cx ? 0 : 1;
      }

      this.spawnPacket(edgeIndex, dir, hop);
      sent += 1;
    }
  }

  private spawnSpark(x: number, y: number, speed: number) {
    for (const spark of this.sparks) {
      if (spark.alive) continue;
      const angle = Math.random() * TAU;
      const power = 20 + Math.min(speed, 2200) * 0.05;
      spark.alive = true;
      spark.x = x;
      spark.y = y;
      spark.vx = Math.cos(angle) * power;
      spark.vy = Math.sin(angle) * power;
      spark.max = 0.35 + Math.random() * 0.4;
      spark.life = spark.max;
      return;
    }
  }

  /* ------------------------------------------------------------------- step */

  private step(dt: number) {
    this.time += dt;
    this.applyStory(dt);
    const cfg = this.cfg;
    const pointerOn = cfg.influenceRadius > 0 && this.pActive;
    const R = cfg.influenceRadius;
    const R2 = R * R;

    // One uniform translate for the whole field, capped, so scroll gives the layer a sense of
    // its own presence without ever stretching an edge (every node shares the same offset).
    if (cfg.scrollDrift > 0) {
      const target = -Math.min(this.scrollY * 0.035, cfg.scrollDrift);
      this.fieldOffsetY += (target - this.fieldOffsetY) * Math.min(1, dt * 4);
    }

    // Perspective: the near layer swings further with the pointer than the far one, which is
    // what sells depth without a 3D renderer.
    const halfW = this.width / 2;
    const halfH = this.height / 2;
    const parX = pointerOn ? ((this.px - halfW) / Math.max(halfW, 1)) * cfg.parallaxDepth : 0;
    const parY = pointerOn ? ((this.py - halfH) / Math.max(halfH, 1)) * cfg.parallaxDepth : 0;

    this.tendril.length = 0;
    this.tendrilD2.length = 0;

    // Pointer speed is only *sampled* in `setPointer`, which fires on pointer events. A
    // stationary mouse emits none, so without this decay the last measured speed would persist
    // indefinitely — leaving the core permanently enlarged and the trail permanently extended
    // after a fast flick that has long since stopped. While the pointer is genuinely moving,
    // `setPointer` runs about once per frame and easily outpaces this.
    this.pSpeed -= this.pSpeed * Math.min(1, dt * 5);

    const fireBoost = pointerOn ? 1 + Math.min(this.pSpeed / 900, 2.2) : 0;

    for (let i = 0; i < this.nodes.length; i += 1) {
      const node = this.nodes[i];

      // Orbit: two out-of-phase sinusoids around the node's current anchor. Bounded by
      // construction, so the topology built at seed time stays valid in every stage. The
      // amplitude is scaled by the stage profile, so the field visibly settles as the story
      // resolves.
      const ox = Math.sin(this.time * node.sa + node.ph) * node.ra * this.profile.drift;
      const oy = Math.cos(this.time * node.sb + node.ph * 1.7) * node.rb * this.profile.drift;

      const depthPar = 1 - node.z * 0.72;
      let tx = 0;
      let ty = 0;

      if (pointerOn) {
        const bx = node.cx + ox;
        const by = node.cy + oy;
        const ddx = this.px - bx;
        const ddy = this.py - by;
        const d2 = ddx * ddx + ddy * ddy;

        if (d2 < R2) {
          const d = Math.sqrt(d2);
          // Squared falloff: a sharp, local reaction rather than a mushy field-wide one.
          const f = 1 - d / R;
          const f2 = f * f;
          tx = ddx * f2 * cfg.pullStrength;
          ty = ddy * f2 * cfg.pullStrength;

          // Activation rises fast, decays slow — the asymmetry is what leaves a lit trail
          // behind the cursor instead of a hard-edged circle that moves with it.
          if (f2 > node.act) node.act += (f2 - node.act) * Math.min(1, dt * 27);

          // Nodes under the pointer are the network's input layer: they fire, and the
          // cascade carries that signal outward through the topology.
          node.cool -= dt * fireBoost;
          if (node.cool <= 0 && f2 > 0.3 && Math.random() < f2 * dt * 9) {
            this.fire(i, 0, node.tier === 2 ? 2 : 1);
          }

          if (cfg.core) {
            // Keep the nearest few for the core's tendrils, by insertion into a tiny list.
            if (this.tendril.length < MAX_TENDRILS) {
              this.tendril.push(i);
              this.tendrilD2.push(d2);
            } else {
              let worst = 0;
              for (let k = 1; k < this.tendrilD2.length; k += 1) {
                if (this.tendrilD2[k] > this.tendrilD2[worst]) worst = k;
              }
              if (d2 < this.tendrilD2[worst]) {
                this.tendril[worst] = i;
                this.tendrilD2[worst] = d2;
              }
            }
          }
        }
      }

      node.dx += (tx - node.dx) * Math.min(1, dt * 21);
      node.dy += (ty - node.dy) * Math.min(1, dt * 21);
      node.act -= node.act * Math.min(1, dt * 4.2);
      if (node.cool > 0) node.cool -= dt;

      node.x = node.cx + ox + node.dx + parX * depthPar;
      node.y = node.cy + oy + node.dy + parY * depthPar + this.fieldOffsetY;
    }

    // Ambient signal, so the network is alive before the cursor ever arrives.
    if (cfg.maxPackets > 0) {
      this.ambientTimer -= dt;
      if (this.ambientTimer <= 0) {
        this.ambientTimer = (0.28 + Math.random() * 0.4) / Math.max(this.profile.rate, 0.05);
        const i = Math.floor(Math.random() * this.nodes.length);
        if (this.nodes[i] && this.nodes[i].cool <= 0) this.fire(i, 1, 1);
      }
    }

    this.stepPackets(dt);
    this.stepSparks(dt);
    this.stepTrail();
  }

  private stepPackets(dt: number) {
    for (const packet of this.packets) {
      if (!packet.alive) continue;
      packet.t += packet.sp * dt;
      if (packet.t < 1) continue;

      packet.alive = false;
      const edge = this.edges[packet.e];
      if (!edge) continue;
      const target = packet.dir === 0 ? edge.b : edge.a;
      const node = this.nodes[target];
      if (!node) continue;

      // Arrival lights the node, and may propagate — a cascade with a hop limit, so a single
      // firing ripples a short way through the mesh and dies rather than running forever.
      node.act = Math.max(node.act, 0.85);
      if (packet.hop < 3 && Math.random() < 0.55) {
        this.fire(target, packet.hop + 1, node.tier === 2 ? 2 : 1);
      }
    }
  }

  private stepSparks(dt: number) {
    for (const spark of this.sparks) {
      if (!spark.alive) continue;
      spark.life -= dt;
      if (spark.life <= 0) {
        spark.alive = false;
        continue;
      }
      spark.x += spark.vx * dt;
      spark.y += spark.vy * dt;
      spark.vx *= 0.94;
      spark.vy *= 0.94;
    }
  }

  private stepTrail() {
    if (!this.cfg.core || !this.pActive) {
      this.trailCount = 0;
      return;
    }
    // Shift the ring buffer down by one sample and append the current point.
    const limit = Math.min(this.trailCount + 1, TRAIL_LENGTH);
    for (let i = limit - 1; i > 0; i -= 1) {
      this.trail[i * 2] = this.trail[(i - 1) * 2];
      this.trail[i * 2 + 1] = this.trail[(i - 1) * 2 + 1];
    }
    this.trail[0] = this.px;
    this.trail[1] = this.py;
    this.trailCount = limit;

    if (this.pSpeed > 420 && Math.random() < 0.55) {
      this.spawnSpark(this.px, this.py, this.pSpeed);
    }
  }

  /* ------------------------------------------------------------------- draw */

  private draw(animated: boolean) {
    const ctx = this.ctx;
    const cfg = this.cfg;
    ctx.clearRect(0, 0, this.width, this.height);

    const pointerOn = animated && cfg.influenceRadius > 0 && this.pActive;
    const R = cfg.influenceRadius;

    /* -- edges: resting mesh, batched into a few strokes ------------------- */
    // Squared-ratio thresholds, so no square root is needed in a per-edge loop: an edge is
    // drawn in full up to ~1.3x its resting length and gone by ~2.8x.
    const FADE_FULL = 1.69;
    const FADE_GONE = 7.84;

    for (const edge of this.edges) {
      const a = this.nodes[edge.a];
      const b = this.nodes[edge.b];

      const ex = a.x - b.x;
      const ey = a.y - b.y;
      const stretch = (ex * ex + ey * ey) / Math.max(edge.len * edge.len, 1);
      edge.fade =
        stretch <= FADE_FULL
          ? 1
          : Math.max(0, (FADE_GONE - stretch) / (FADE_GONE - FADE_FULL));
      edge.drawBucket = edge.fade <= 0.02 ? -1 : Math.round(edge.bucket * edge.fade);

      let activation = Math.max(a.act, b.act);

      if (pointerOn) {
        // Edges near the pointer light up even when their endpoints have not fired, so the
        // cursor visibly energises the *connections*, not only the nodes.
        const mx = (a.x + b.x) * 0.5;
        const my = (a.y + b.y) * 0.5;
        const d = Math.sqrt((this.px - mx) ** 2 + (this.py - my) ** 2);
        if (d < R) {
          // Cubed rather than squared: a tight pool of lit connections right at the cursor
          // reads as processing. A broader falloff washes a quarter of the screen cyan and
          // starts competing with the body copy in front of it.
          const f = 1 - d / R;
          activation = Math.max(activation, f * f * f * 0.8);
        }
      }
      edge.aa = activation * edge.fade;
    }

    ctx.lineWidth = 1;
    for (let bucket = 0; bucket < EDGE_BUCKETS; bucket += 1) {
      const alpha = (0.05 + (bucket / (EDGE_BUCKETS - 1)) * 0.15) * cfg.intensity;
      if (alpha <= 0.004) continue;
      ctx.beginPath();
      let any = false;
      for (const edge of this.edges) {
        if (edge.drawBucket !== bucket) continue;
        const a = this.nodes[edge.a];
        const b = this.nodes[edge.b];
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        any = true;
      }
      if (!any) continue;
      ctx.strokeStyle = rgba(INDIGO, alpha);
      ctx.stroke();
    }

    /* -- edges: activation pass, cyan over the resting violet -------------- */
    for (let bucket = 0; bucket < ACTIVE_BUCKETS; bucket += 1) {
      const lo = (bucket + 1) / (ACTIVE_BUCKETS + 1);
      ctx.beginPath();
      let any = false;
      for (const edge of this.edges) {
        if (edge.aa < lo || edge.aa >= lo + 1 / (ACTIVE_BUCKETS + 1) + 0.001) continue;
        const a = this.nodes[edge.a];
        const b = this.nodes[edge.b];
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        any = true;
      }
      if (!any) continue;
      ctx.lineWidth = 1 + bucket * 0.25;
      ctx.strokeStyle = rgba(CYAN, 0.12 + lo * 0.5);
      ctx.stroke();
    }
    ctx.lineWidth = 1;

    /* -- packets ----------------------------------------------------------- */
    if (animated) {
      for (const packet of this.packets) {
        if (!packet.alive) continue;
        const edge = this.edges[packet.e];
        const from = packet.dir === 0 ? this.nodes[edge.a] : this.nodes[edge.b];
        const to = packet.dir === 0 ? this.nodes[edge.b] : this.nodes[edge.a];
        const t = packet.t;
        const x = from.x + (to.x - from.x) * t;
        const y = from.y + (to.y - from.y) * t;
        // A short streak behind the head reads as travel rather than a blinking dot.
        const tailT = Math.max(0, t - 0.16);
        // A packet is only as visible as the connection carrying it.
        ctx.globalAlpha = edge.fade;
        ctx.strokeStyle = rgba(CYAN, 0.5);
        ctx.beginPath();
        ctx.moveTo(from.x + (to.x - from.x) * tailT, from.y + (to.y - from.y) * tailT);
        ctx.lineTo(x, y);
        ctx.stroke();
        this.blit(this.glowCyan, x, y, 7, 0.5);
        ctx.fillStyle = rgba(CYAN, 0.95);
        ctx.beginPath();
        ctx.arc(x, y, 1.5, 0, TAU);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }

    /* -- nodes -------------------------------------------------------------- */
    for (const node of this.nodes) {
      // Perspective scale and aerial-perspective fade: near nodes bigger and brighter.
      const scale = 1.12 - node.z * 0.5;
      const radius = node.r * scale;
      const depthAlpha = (0.9 - node.z * 0.45) * cfg.intensity;
      const act = node.act;

      if (act > 0.05) {
        this.blit(this.glowCyan, node.x, node.y, radius * 9 + act * 12, act * 0.55);
      } else if (node.tier === 2) {
        // Hubs keep a permanent, faint violet halo — the mesh's focal points.
        this.blit(this.glowViolet, node.x, node.y, radius * 8, 0.16 * cfg.intensity);
      }

      const colour = act > 0.05 ? CYAN : node.tier === 2 ? VIOLET : INDIGO;
      ctx.fillStyle = rgba(colour, Math.min(1, depthAlpha * (0.55 + act * 0.9)));
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius * (1 + act * 0.55), 0, TAU);
      ctx.fill();
    }

    /* -- sparks -------------------------------------------------------------- */
    if (animated) {
      for (const spark of this.sparks) {
        if (!spark.alive) continue;
        const life = spark.life / spark.max;
        ctx.fillStyle = rgba(CYAN, life * 0.7);
        ctx.beginPath();
        ctx.arc(spark.x, spark.y, 1.2 * life + 0.4, 0, TAU);
        ctx.fill();
      }
    }

    if (pointerOn && cfg.core) this.drawCore();
  }

  /**
   * The cursor as an AI processing core: a velocity trail, tendrils wiring it into the nearest
   * nodes, counter-rotating arcs, and a bright centre. Deliberately sized to sit *behind* and
   * slightly larger than the DOM cursor ring (`components/effects/Cursor.tsx`), so the two
   * compose into one object rather than competing.
   */
  private drawCore() {
    const ctx = this.ctx;
    const speed = this.pSpeed;

    /* -- velocity trail ---------------------------------------------------- */
    // Drawn as tapering segments: a single path cannot vary its width, and 20 short strokes
    // are cheap.
    for (let i = 1; i < this.trailCount; i += 1) {
      const t = 1 - i / this.trailCount;
      const reach = Math.min(1, speed / 700);
      const alpha = t * 0.36 * reach;
      if (alpha < 0.01) continue;
      ctx.lineWidth = 0.4 + t * 2;
      ctx.strokeStyle = rgba(CYAN, alpha);
      ctx.beginPath();
      ctx.moveTo(this.trail[(i - 1) * 2], this.trail[(i - 1) * 2 + 1]);
      ctx.lineTo(this.trail[i * 2], this.trail[i * 2 + 1]);
      ctx.stroke();
    }
    ctx.lineWidth = 1;

    /* -- tendrils into the nearest nodes ----------------------------------- */
    const R = this.cfg.influenceRadius;
    for (let k = 0; k < this.tendril.length; k += 1) {
      const node = this.nodes[this.tendril[k]];
      const d = Math.sqrt(this.tendrilD2[k]);
      const f = 1 - d / R;
      if (f <= 0) continue;
      ctx.strokeStyle = rgba(CYAN, f * f * 0.5);
      ctx.beginPath();
      ctx.moveTo(this.px, this.py);
      ctx.lineTo(node.x, node.y);
      ctx.stroke();

      // A dot running inward along the tendril: the core reading the node.
      const phase = (this.time * 0.9 + k * 0.37) % 1;
      const dx = node.x + (this.px - node.x) * phase;
      const dy = node.y + (this.py - node.y) * phase;
      ctx.fillStyle = rgba(CYAN, f * (1 - phase) * 0.9);
      ctx.beginPath();
      ctx.arc(dx, dy, 1.4, 0, TAU);
      ctx.fill();
    }

    /* -- the core's glow, and only its glow --------------------------------- */
    //
    // **The core's rings, arcs and centre point are NOT drawn here any more.** This canvas is
    // the site background at `-z-20`, so everything it paints is occluded by content — and the
    // processing core is the one thing on it that must never be: it belongs to the cursor, and
    // a cursor that vanishes over a card or an image is just broken. It is rendered as DOM in
    // `Cursor.tsx` instead, on the top layer, where it is visible over anything.
    //
    // What stays here is the soft glow, which reads as the field responding *around* the
    // cursor rather than as part of the cursor itself, together with the tendrils and trail
    // above — all three are only meaningful where the field is visible anyway.
    const boost = Math.min(speed / 1600, 0.5);
    const ring = 30 + boost * 14;
    this.blit(this.glowCyan, this.px, this.py, ring * 2.6, 0.2 + boost * 0.2);
  }

  private blit(
    sprite: HTMLCanvasElement | null,
    x: number,
    y: number,
    size: number,
    alpha: number,
  ) {
    if (!sprite || alpha <= 0.004 || size <= 0) return;
    const ctx = this.ctx;
    ctx.globalAlpha = Math.min(1, alpha);
    ctx.drawImage(sprite, x - size / 2, y - size / 2, size, size);
    ctx.globalAlpha = 1;
  }

  /* ------------------------------------------------------------------ loop */

  private frame = (now: number) => {
    if (!this.running) return;
    // Clamped: a tab that was backgrounded, or a long GC pause, must not teleport the
    // simulation forward by a whole second.
    const dt = this.lastFrame ? Math.min((now - this.lastFrame) / 1000, 0.05) : 0.016;
    this.lastFrame = now;

    // Opt-in instrumentation: set `window.__neuralDebug = true` and the canvas publishes a
    // rolling mean of its own step+draw cost as `data-frame-ms`. Costs one property lookup per
    // frame when off.
    //
    // It measures **JavaScript and command-recording time only** — canvas rasterisation happens
    // later, off this call stack. That separation is the point: it is the only way to tell "the
    // simulation is too expensive" from "this machine is rasterising in software", which a
    // plain `requestAnimationFrame` interval cannot distinguish.
    const debug = (window as unknown as { __neuralDebug?: boolean }).__neuralDebug === true;
    const t0 = debug ? performance.now() : 0;

    this.step(dt);
    this.draw(true);

    if (debug) {
      this.frameAcc += performance.now() - t0;
      this.frameN += 1;
      if (this.frameN >= 30) {
        this.canvas.dataset.frameMs = (this.frameAcc / this.frameN).toFixed(2);
        this.frameAcc = 0;
        this.frameN = 0;
      }
    }

    this.raf = window.requestAnimationFrame(this.frame);
  };

  start() {
    if (this.running) return;
    this.running = true;
    this.lastFrame = 0;
    this.raf = window.requestAnimationFrame(this.frame);
  }

  stop() {
    this.running = false;
    window.cancelAnimationFrame(this.raf);
  }

  get isRunning() {
    return this.running;
  }

  /**
   * A single frame with no loop, no packets and no cursor core — the whole reduced-motion
   * path. The mesh is still drawn, because a network of nodes and lines is *content*; what
   * reduced motion removes is the motion.
   */
  renderStatic() {
    this.pActive = false;
    // The `ambient` layout, not whatever the story last resolved to: under reduced motion no
    // scroll triggers are created at all, so the field simply is its resting arrangement.
    this.storyPos = 0;
    this.storyTarget = 0;
    this.profile = { ...STAGE_PROFILE[0] };
    for (const node of this.nodes) {
      node.cx = node.ax;
      node.cy = node.ay;
      node.x = node.ax;
      node.y = node.ay;
      node.act = 0;
      node.dx = 0;
      node.dy = 0;
    }
    this.draw(false);
  }

  destroy() {
    this.stop();
    this.nodes = [];
    this.edges = [];
    this.packets = [];
    this.sparks = [];
  }
}

/**
 * A cached radial-gradient sprite, blitted with `drawImage` wherever glow is wanted.
 *
 * This exists specifically to avoid `ctx.shadowBlur`, which the previous constellation set on
 * every node on every frame. Canvas shadows re-blur on each draw call and are one of the most
 * expensive operations a 2D context offers; a pre-rendered sprite is a plain textured quad.
 */
function makeGlowSprite(colour: RGB): HTMLCanvasElement | null {
  if (typeof document === "undefined") return null;
  const size = 64;
  const sprite = document.createElement("canvas");
  sprite.width = size;
  sprite.height = size;
  const ctx = sprite.getContext("2d");
  if (!ctx) return null;
  const half = size / 2;
  const gradient = ctx.createRadialGradient(half, half, 0, half, half, half);
  gradient.addColorStop(0, rgba(colour, 0.85));
  gradient.addColorStop(0.35, rgba(colour, 0.28));
  gradient.addColorStop(1, rgba(colour, 0));
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  return sprite;
}
