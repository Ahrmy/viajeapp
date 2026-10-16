interface LogoProps {
  className?: string
  iconSize?: number
  textSize?: string
}

export function Logo({
  className = "",
  iconSize = 34,
  textSize = "text-[30px]",
}: LogoProps) {
  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <div className="relative flex items-center justify-center shrink-0">
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-[#245544] dark:text-[#6EE7B7] transition-colors"
        >
          <path
            d="M0.908164 31.2605L14.0623 3.63674C15.8162 0.128962 18.0086 0.128962 20.6394 3.63674L35.109 31.2605M7.48524 19.4217H18.0086M18.0086 19.4217H28.5319M18.0086 19.4217C8.80066 24.6834 28.5319 24.6834 18.0086 35.2067"
            strokeWidth="2.01"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <span
        className={`font-serif font-normal tracking-tight text-[#203D34] dark:text-stone-100 ${textSize}`}
      >
        Travesía
      </span>
    </div>
  )
}
