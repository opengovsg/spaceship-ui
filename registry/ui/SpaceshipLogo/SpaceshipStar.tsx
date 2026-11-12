// ── SVG path data ─────────────────────────────────────────────────────────────

// Paths extracted from the smaller (top-right) star in Stars.svg
const PATHS = {
  starFill:
    "M36.8008 11.9848C38.0631 11.0336 38.064 8.97487 36.8021 8.02312C34.9292 6.6105 33.262 4.94275 31.8497 3.06835C30.8985 1.80595 28.8398 1.80596 27.8885 3.06832C26.477 4.94155 24.8109 6.60804 22.9392 8.01882C21.6766 8.97044 21.6763 11.0301 22.9389 11.9817C24.8121 13.3934 26.4786 15.0598 27.8893 16.9317C28.8405 18.194 30.8992 18.1948 31.851 16.9329C33.2627 15.0612 34.929 13.3953 36.8008 11.9848Z",
  starOutline:
    "M29.8691 4.12109C30.0847 4.1211 30.2059 4.21067 30.252 4.27148C31.7764 6.29465 33.5761 8.09539 35.5977 9.62012C35.6584 9.66598 35.7481 9.78764 35.748 10.0039C35.7478 10.2198 35.6586 10.3416 35.5977 10.3877C33.577 11.9103 31.7776 13.7082 30.2539 15.7285C30.2081 15.7892 30.087 15.8789 29.8711 15.8789C29.6547 15.8788 29.5324 15.7886 29.4863 15.7275C27.9635 13.7068 26.1644 11.9085 24.1426 10.3848C24.0818 10.3389 23.9922 10.2166 23.9922 10C23.9923 9.78411 24.0816 9.66243 24.1426 9.61621C26.1632 8.09316 27.9617 6.29348 29.4854 4.27148C29.5312 4.21062 29.6531 4.12109 29.8691 4.12109Z",
};

// ── Shadow filter ─────────────────────────────────────────────────────────────

function ShadowFilter({ id }: { id: string }) {
  return (
    <filter
      id={id}
      x="17.9922"
      y="0.121094"
      width="23.7559"
      height="23.7578"
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

export interface SpaceshipStarProps {
  color?: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

// ── SpaceshipStar ─────────────────────────────────────────────────────────────

export function SpaceshipStar({
  color = "#FFE156",
  size = 24,
  className,
  style,
}: SpaceshipStarProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="17.99 0.12 23.76 23.76"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
    >
      <defs>
        <ShadowFilter id="star-shadow" />
      </defs>
      <g filter="url(#star-shadow)">
        <path d={PATHS.starFill} fill={color} />
        <path
          d={PATHS.starOutline}
          stroke="black"
          strokeOpacity="0.1"
          strokeWidth="4"
          fill="none"
        />
      </g>
    </svg>
  );
}
