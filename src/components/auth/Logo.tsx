interface LogoProps {
  className?: string
  iconSize?: number
  textSize?: string
}

export function Logo({
  className = "",
  iconSize = 28,
  textSize = "text-2xl",
}: LogoProps) {
  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <div className="relative flex items-center justify-center">
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 32 32"
          className="text-[#162D24] dark:text-[#6EE7B7] transition-colors"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Mountain / Tent arch forming the 'A' */}
          <path d="M6.5 25.5L15.2 6.8C15.5 6.1 16.5 6.1 16.8 6.8L25.5 25.5" />
          {/* Horizontal crossbar */}
          <path d="M10 19.5H22" />
          {/* Winding trail journey stroke */}
          <path d="M16 19.5C16 22 13.5 23 14.5 25.5" />
        </svg>
      </div>
      <span
        className={`font-serif font-bold tracking-tight text-[#162D24] dark:text-stone-100 ${textSize}`}
      >
        Travesía
      </span>
    </div>
  )
}
