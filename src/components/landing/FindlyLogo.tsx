interface FindlyLogoProps {
  className?: string;
}

export function FindlyLogo({ className = 'w-10 h-10' }: FindlyLogoProps) {
  return (
    <div className={`relative flex items-center justify-center flex-shrink-0 ${className}`}>
      <svg
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-sm"
      >
        <circle cx="20" cy="20" r="20" fill="url(#findly-logo-gradient-unique)" />
        <path
          d="M15 11h11.5a1.5 1.5 0 011.5 1.5v2.5a1.5 1.5 0 01-1.5 1.5H19.5v3.5h7a1.5 1.5 0 011.5 1.5V23a1.5 1.5 0 01-1.5 1.5h-7v6a1.5 1.5 0 01-1.5 1.5h-1a1.5 1.5 0 01-1.5-1.5V12.5a1.5 1.5 0 011.5-1.5z"
          fill="white"
        />
        <defs>
          <linearGradient
            id="findly-logo-gradient-unique"
            x1="0"
            y1="0"
            x2="40"
            y2="40"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
