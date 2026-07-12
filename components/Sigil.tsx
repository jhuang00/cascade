// Orbital sigils — the heraldic device (design-refs/cascade-visual.md §5).
// One tilted orbital ellipse per mission; geometry encodes the event.
// Amber-soft strokes, amber nodes; sage when cleared, cascade red for M06.
// The six are the complete set — do not add more.

type SigilState = 'default' | 'cleared' | 'cascade';

interface Props {
  level: number;          // 1-based mission id
  state?: SigilState;
  width?: number;         // rendered width; viewBox is 60×42
}

export default function Sigil({ level, state = 'default', width = 60 }: Props) {
  const stroke = state === 'cleared' ? 'var(--cleared)'
    : state === 'cascade' ? 'var(--cascade)'
    : 'var(--amber-soft)';
  const node = state === 'cleared' ? 'var(--cleared)'
    : state === 'cascade' ? 'var(--cascade)'
    : 'var(--amber)';

  return (
    <svg
      viewBox="0 0 60 42"
      width={width}
      height={(width * 42) / 60}
      fill="none"
      stroke={stroke}
      strokeWidth="1"
      aria-hidden="true"
    >
      {level === 1 && (
        // Nearly equatorial ellipse, single tracked object — the calm era
        <>
          <ellipse cx="30" cy="21" rx="26" ry="4" />
          <circle cx="48" cy="21" r="2" fill={node} stroke="none" />
        </>
      )}
      {level === 2 && (
        // Tilted ellipse with stray fragment dots — the breakup era
        <>
          <ellipse cx="30" cy="21" rx="26" ry="7" transform="rotate(-10 30 21)" />
          <circle cx="10" cy="15" r="0.8" fill={stroke} stroke="none" />
          <circle cx="48" cy="27" r="0.8" fill={stroke} stroke="none" />
          <circle cx="36" cy="12" r="0.8" fill={stroke} stroke="none" />
          <circle cx="44" cy="15" r="2" fill={node} stroke="none" />
        </>
      )}
      {level === 3 && (
        // Polar (vertical) ellipse, debris radiating from the impact node
        <>
          <ellipse cx="30" cy="21" rx="4" ry="17" />
          <line x1="30" y1="8" x2="24" y2="2" />
          <line x1="30" y1="8" x2="36" y2="3" />
          <line x1="30" y1="8" x2="38" y2="8" />
          <line x1="30" y1="8" x2="22" y2="8" />
          <circle cx="30" cy="8" r="2" fill={node} stroke="none" />
        </>
      )}
      {level === 4 && (
        // Two crossed ellipses, bright node at the intersection
        <>
          <ellipse cx="30" cy="21" rx="24" ry="7" transform="rotate(-28 30 21)" />
          <ellipse cx="30" cy="21" rx="24" ry="7" transform="rotate(28 30 21)" />
          <circle cx="30" cy="21" r="2.5" fill={node} stroke="none" />
        </>
      )}
      {level === 5 && (
        // Parallel constellation shells, many small nodes
        <>
          <ellipse cx="30" cy="14" rx="24" ry="4.5" transform="rotate(-8 30 14)" />
          <ellipse cx="30" cy="21" rx="24" ry="4.5" transform="rotate(-8 30 21)" />
          <ellipse cx="30" cy="28" rx="24" ry="4.5" transform="rotate(-8 30 28)" />
          <circle cx="46" cy="12" r="1.2" fill={node} stroke="none" />
          <circle cx="14" cy="22" r="1.2" fill={node} stroke="none" />
          <circle cx="40" cy="26" r="1.2" fill={node} stroke="none" />
          <circle cx="22" cy="14" r="1.2" fill={node} stroke="none" />
        </>
      )}
      {level === 6 && (
        // Chaotic overlapping ellipses, multiple nodes — the tangled field
        <>
          <ellipse cx="30" cy="21" rx="24" ry="9" transform="rotate(-35 30 21)" />
          <ellipse cx="30" cy="21" rx="26" ry="6" transform="rotate(15 30 21)" />
          <ellipse cx="30" cy="21" rx="17" ry="11" transform="rotate(70 30 21)" />
          <circle cx="42" cy="14" r="1.6" fill={node} stroke="none" />
          <circle cx="18" cy="26" r="1.6" fill={node} stroke="none" />
          <circle cx="33" cy="31" r="1.6" fill={node} stroke="none" />
          <circle cx="25" cy="10" r="1.2" fill={node} stroke="none" />
        </>
      )}
    </svg>
  );
}
