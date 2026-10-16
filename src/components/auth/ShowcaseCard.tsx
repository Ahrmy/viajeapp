import { Logo } from "./Logo"

export function ShowcaseCard() {
  return (
    <aside
      aria-label="Presentación de Travesía"
      className="relative flex flex-col justify-between overflow-hidden rounded-[18px] bg-[#F0EEE6] p-6 sm:p-7 md:p-8 shadow-xs border border-[#E2DDD3] dark:bg-[#18211C] dark:border-[#24352C] transition-colors h-full"
    >
      {/* Top Brand & Hero Intro */}
      <div className="flex flex-col gap-6">
        <Logo />

        <div className="flex flex-col gap-3.5 mt-2">
          {/* Editorial accent bar + tagline */}
          <div className="flex items-center gap-2">
            <span className="w-5 h-[1.5px] bg-[#245544] dark:bg-[#6EE7B7]" />
            <p className="text-[11px] font-semibold tracking-wider text-[#245544] dark:text-[#A7F3D0] uppercase select-none">
              El viaje empieza entre todos
            </p>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-[56px] xl:text-[60px] font-normal leading-[1.05] tracking-tight text-[#203D34] dark:text-stone-100">
            El próximo viaje,
            <br />
            mejor juntos.
          </h1>

          <p className="text-sm sm:text-[15px] md:text-base leading-[1.5] text-[#4D5B54] dark:text-stone-300 max-w-[520px]">
            Reunid las ideas, compartid los planes y dejad espacio para lo que de
            verdad importa: disfrutar.
          </p>
        </div>
      </div>

      {/* Middle Photo Card (Costa Brava) */}
      <div className="relative my-6 flex-1 min-h-[300px] sm:min-h-[360px] md:min-h-[420px] rounded-[12px] overflow-hidden shadow-sm group">
        <img
          src="/images/family-costa-brava.png"
          alt="Familia junto al Mediterráneo en Costa Brava"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-102"
          loading="eager"
        />

        {/* Gradient Overlay for Typography contrast */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(180deg, rgba(23, 47, 39, 0) 45%, rgba(23, 47, 39, 0.75) 100%)",
          }}
        />

        {/* Location pill */}
        <div className="absolute top-4 right-4 z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/93 dark:bg-stone-900/85 backdrop-blur-xs shadow-xs text-[11px] font-medium text-[#203D34] dark:text-stone-100 transition-transform hover:scale-105">
            <svg
              width="13"
              height="13"
              viewBox="0 0 13 13"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-[#245544] dark:text-emerald-400 shrink-0"
            >
              <path
                d="M6.5 1.5C4.29 1.5 2.5 3.29 2.5 5.5C2.5 8.5 6.5 12 6.5 12C6.5 12 10.5 8.5 10.5 5.5C10.5 3.29 8.71 1.5 6.5 1.5ZM6.5 7C5.67 7 5 6.33 5 5.5C5 4.67 5.67 4 6.5 4C7.33 4 8 4.67 8 5.5C8 6.33 7.33 7 6.5 7Z"
                fill="currentColor"
              />
            </svg>
            <span>Costa Brava, España</span>
          </div>
        </div>

        {/* Bottom Headline & Subtitle on Image */}
        <div className="absolute bottom-5 left-5 right-5 z-10 text-white">
          <h2 className="font-serif text-xl sm:text-2xl md:text-[29px] font-normal leading-tight drop-shadow-xs">
            Más momentos juntos.
            <br />
            Más historias que contar.
          </h2>
          <p className="mt-1.5 text-xs text-white/90 font-normal">
            Para las pequeñas escapadas y las grandes aventuras.
          </p>
        </div>
      </div>

      {/* Card Footer with brand philosophy & route indicator */}
      <div className="flex items-center justify-between text-xs text-[#4D5B54] dark:text-stone-400 pt-1 select-none">
        <p className="text-[11px] font-normal">
          Un lugar para planear. Mil formas de viajar.
        </p>

        {/* Route detail graphic */}
        <div className="flex items-center gap-1.5">
          <span className="w-[5px] h-[5px] rounded-full bg-[#245544] dark:bg-[#6EE7B7]" />
          <span className="w-[38px] h-[1px] bg-[#CCD2CA] dark:bg-stone-600" />
          <svg
            width="13"
            height="13"
            viewBox="0 0 13 13"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-[#245544] dark:text-[#6EE7B7]"
          >
            <path
              d="M2.5 2V11M2.5 2.5H9.5L8 5.5L9.5 8.5H2.5"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </aside>
  )
}
