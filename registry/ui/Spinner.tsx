interface SpinnerProps {
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ className = "" }) => {
  return (
    <svg
      className={`inline-block ${className}`}
      width="1.5em"
      height="1.5em"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <style>
        {`
          @keyframes radial-spinner {
            0% { opacity: 1; }
            100% { opacity: 0.15; }
          }
          .spinner-bar {
            animation: radial-spinner 0.8s linear infinite;
          }
        `}
      </style>
      {/* 8 bars with staggered animation delays */}
      <rect
        className="spinner-bar"
        x="11"
        y="2"
        width="2"
        height="6"
        rx="1"
        fill="currentColor"
        style={{ animationDelay: "-0.7s" }}
      />
      <rect
        className="spinner-bar"
        x="11"
        y="2"
        width="2"
        height="6"
        rx="1"
        fill="currentColor"
        transform="rotate(45 12 12)"
        style={{ animationDelay: "-0.6s" }}
      />
      <rect
        className="spinner-bar"
        x="11"
        y="2"
        width="2"
        height="6"
        rx="1"
        fill="currentColor"
        transform="rotate(90 12 12)"
        style={{ animationDelay: "-0.5s" }}
      />
      <rect
        className="spinner-bar"
        x="11"
        y="2"
        width="2"
        height="6"
        rx="1"
        fill="currentColor"
        transform="rotate(135 12 12)"
        style={{ animationDelay: "-0.4s" }}
      />
      <rect
        className="spinner-bar"
        x="11"
        y="2"
        width="2"
        height="6"
        rx="1"
        fill="currentColor"
        transform="rotate(180 12 12)"
        style={{ animationDelay: "-0.3s" }}
      />
      <rect
        className="spinner-bar"
        x="11"
        y="2"
        width="2"
        height="6"
        rx="1"
        fill="currentColor"
        transform="rotate(225 12 12)"
        style={{ animationDelay: "-0.2s" }}
      />
      <rect
        className="spinner-bar"
        x="11"
        y="2"
        width="2"
        height="6"
        rx="1"
        fill="currentColor"
        transform="rotate(270 12 12)"
        style={{ animationDelay: "-0.1s" }}
      />
      <rect
        className="spinner-bar"
        x="11"
        y="2"
        width="2"
        height="6"
        rx="1"
        fill="currentColor"
        transform="rotate(315 12 12)"
        style={{ animationDelay: "0s" }}
      />
    </svg>
  );
};
