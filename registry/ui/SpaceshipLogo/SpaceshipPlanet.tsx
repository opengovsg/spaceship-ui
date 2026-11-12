// ── Shadow filter ─────────────────────────────────────────────────────────────

function ShadowFilter({ id }: { id: string }) {
  return (
    <filter
      id={id}
      x="0"
      y="0"
      width="32"
      height="32"
      filterUnits="userSpaceOnUse"
      colorInterpolationFilters="sRGB"
    >
      <feFlood floodOpacity="0" result="BackgroundImageFix" />
      <feColorMatrix
        in="SourceAlpha"
        type="matrix"
        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
        result="hardAlpha"
      />
      <feOffset dy="2" />
      <feGaussianBlur stdDeviation="2" />
      <feComposite in2="hardAlpha" operator="out" />
      <feColorMatrix
        type="matrix"
        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.06 0"
      />
      <feBlend
        mode="normal"
        in2="BackgroundImageFix"
        result="effect1_dropShadow"
      />
      <feColorMatrix
        in="SourceAlpha"
        type="matrix"
        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
        result="hardAlpha"
      />
      <feOffset dy="1" />
      <feGaussianBlur stdDeviation="1" />
      <feComposite in2="hardAlpha" operator="out" />
      <feColorMatrix
        type="matrix"
        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.08 0"
      />
      <feBlend
        mode="normal"
        in2="effect1_dropShadow"
        result="effect2_dropShadow"
      />
      <feColorMatrix
        in="SourceAlpha"
        type="matrix"
        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
        result="hardAlpha"
      />
      <feOffset />
      <feComposite in2="hardAlpha" operator="out" />
      <feColorMatrix
        type="matrix"
        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.08 0"
      />
      <feBlend
        mode="normal"
        in2="effect2_dropShadow"
        result="effect3_dropShadow"
      />
      <feBlend
        mode="normal"
        in="SourceGraphic"
        in2="effect3_dropShadow"
        result="shape"
      />
    </filter>
  );
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SpaceshipPlanetProps {
  color: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

// ── SpaceshipPlanet ───────────────────────────────────────────────────────────

export function SpaceshipPlanet({
  color,
  size = 24,
  className,
  style,
}: SpaceshipPlanetProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
    >
      <defs>
        <ShadowFilter id="planet-shadow" />
      </defs>
      <g filter="url(#planet-shadow)">
        {/* cy=14 positions the circle higher to accommodate the downward shadow */}
        <circle cx="16" cy="14" r="12" fill={color} />
        <circle
          cx="16"
          cy="14"
          r="10"
          stroke="black"
          strokeOpacity="0.1"
          strokeWidth="4"
          fill="none"
        />
      </g>
    </svg>
  );
}
