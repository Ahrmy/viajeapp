import { HugeiconsIcon } from "@hugeicons/react"
import { PinLocation01Icon, Flag01Icon } from "@hugeicons/core-free-icons"
import { Logo } from "./Logo"

export function ShowcaseCard() {
  return (
    <aside
      aria-label="Presentación de Travesía"
      className="relative flex flex-col justify-between overflow-hidden rounded-[28px] md:rounded-[36px] bg-[#EDE8E1] p-6 sm:p-8 md:p-10 lg:p-11 shadow-sm border border-[#E2DDD3] dark:bg-[#18211C] dark:border-[#24352C] transition-colors"
    >
      {/* Top Brand & Hero Intro */}
      <div>
        <Logo />

        <div className="mt-8 md:mt-10 mb-3">
          <p className="text-[11px] sm:text-xs font-semibold tracking-[0.22em] text-[#2D5A47] dark:text-[#A7F3D0] uppercase select-none">
            — El viaje empieza entre todos
          </p>
        </div>

        <h1 className="font-serif text-3xl sm:text-4xl lg:text-[44px] font-bold leading-[1.12] tracking-tight text-[#162D24] dark:text-stone-100">
          El próximo viaje,
          <br />
          mejor juntos.
        </h1>

        <p className="mt-3.5 sm:mt-4 text-xs sm:text-sm md:text-[15px] leading-relaxed text-[#455A4E] dark:text-stone-300 max-w-md">
          Reunid las ideas, compartid los planes y dejad espacio para lo que de
          verdad importa: disfrutar.
        </p>
      </div>

      {/* Middle Photo Card */}
      <div className="relative my-6 sm:my-8 flex-1 min-h-[290px] sm:min-h-[340px] md:min-h-[380px] rounded-2xl md:rounded-[26px] overflow-hidden shadow-md group">
        <img
          src="/images/costa-brava.jpg"
          alt="Familia caminando por un sendero con vistas a una cala turquesa en Costa Brava"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          loading="eager"
        />

        {/* Location pill */}
        <div className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/85 dark:bg-stone-900/80 backdrop-blur-md border border-white/60 dark:border-stone-700/60 shadow-xs text-[11px] sm:text-xs font-medium text-stone-800 dark:text-stone-100 transition-transform hover:scale-105">
            <HugeiconsIcon
              icon={PinLocation01Icon}
              className="w-3.5 h-3.5 text-[#1B4332] dark:text-emerald-400 shrink-0"
              strokeWidth={2}
            />
            <span>Costa Brava, España</span>
          </div>
        </div>

        {/* Gradient Overlay for Typography contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-950/30 to-transparent pointer-events-none" />

        {/* Bottom Headline & Subtitle on Image */}
        <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 z-10 text-white">
          <h2 className="font-serif text-lg sm:text-xl md:text-2xl font-bold leading-tight drop-shadow-xs">
            Más momentos juntos.
            <br />
            Más historias que contar.
          </h2>
          <p className="mt-1 sm:mt-1.5 text-xs sm:text-[13px] text-stone-200/90 font-light">
            Para las pequeñas escapadas y las grandes aventuras.
          </p>
        </div>
      </div>

      {/* Card Footer with brand philosophy & pagination indicators */}
      <div className="flex items-center justify-between text-xs text-[#5D6F65] dark:text-stone-400 pt-1 select-none">
        <p className="text-[11px] sm:text-xs font-normal">
          Un lugar para planear. Mil formas de viajar.
        </p>

        {/* Dots & Flag Indicator */}
        <div className="flex items-center gap-2">
          <span className="w-5 h-1.5 rounded-full bg-[#1B4332] dark:bg-[#6EE7B7] transition-all" />
          <span className="w-1.5 h-1.5 rounded-full bg-[#B8B1A4] dark:bg-stone-600" />
          <div className="h-3 w-px bg-[#B8B1A4]/60 dark:bg-stone-600" />
          <HugeiconsIcon
            icon={Flag01Icon}
            className="w-3.5 h-3.5 text-[#5D6F65] dark:text-stone-400"
            strokeWidth={1.8}
          />
        </div>
      </div>
    </aside>
  )
}
