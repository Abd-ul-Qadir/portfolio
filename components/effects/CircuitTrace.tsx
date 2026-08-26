/**
 * The signal that runs the edge of a card on hover and on keyboard focus.
 *
 * A single decorative element: the conic gradient is its own background, masked down to the
 * 1px ring by `.circuit-trace` (see `tailwind.config.ts`). All of the behaviour lives in CSS,
 * so this stays a **server component** — dropping it into a card adds no client JS, no state
 * and no listener.
 *
 * Two requirements on whatever contains it, both satisfied by `GlassCard`'s `interactive`
 * branch: the parent must carry `.circuit-card` (which supplies both the positioning context
 * and the `:hover`/`:focus-within` rule that starts the animation), and its own
 * `border-radius`, which the ring inherits so it follows the card's corners exactly.
 */
export function CircuitTrace() {
  return <span aria-hidden className="circuit-trace" />;
}
