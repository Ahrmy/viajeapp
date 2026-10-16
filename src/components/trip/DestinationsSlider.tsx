import { useState } from "react"

export interface Destination {
  id: string
  name: string
  dates: string
  nights: number
  image: string
  isReady: boolean
  statusText: string
  isFavorite: boolean
}

const INITIAL_DESTINATIONS: Destination[] = [
  {
    id: "lisboa",
    name: "Lisboa",
    dates: "6–9 nov",
    nights: 3,
    image: "/images/destino-lisboa.png",
    isReady: true,
    statusText: "Todo listo",
    isFavorite: true,
  },
  {
    id: "sintra",
    name: "Sintra",
    dates: "9–10 nov",
    nights: 1,
    image: "/images/destino-sintra.png",
    isReady: false,
    statusText: "En progreso",
    isFavorite: false,
  },
  {
    id: "oporto",
    name: "Oporto",
    dates: "10–13 nov",
    nights: 3,
    image: "/images/destino-oporto.png",
    isReady: false,
    statusText: "En progreso",
    isFavorite: true,
  },
]

interface DestinationsSliderProps {
  onAddDestination?: () => void
  onViewItinerary?: () => void
}

export function DestinationsSlider({
  onAddDestination,
  onViewItinerary,
}: DestinationsSliderProps) {
  const [destinations, setDestinations] =
    useState<Destination[]>(INITIAL_DESTINATIONS)

  const toggleFavorite = (id: string) => {
    setDestinations((prev) =>
      prev.map((dest) =>
        dest.id === id ? { ...dest, isFavorite: !dest.isFavorite } : dest
      )
    )
  }

  return (
    <section
      aria-label="Destinos del viaje"
      className="flex flex-col gap-4 w-full select-none"
    >
      {/* Header with Title & Action */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <h2 className="font-serif text-xl sm:text-2xl font-normal text-[#203D34] dark:text-stone-100">
            Un viaje, muchos lugares
          </h2>
          <span className="text-xs text-[#727B74] dark:text-stone-400">
            {destinations.length} destinos
          </span>
        </div>

        <button
          type="button"
          onClick={onViewItinerary}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#245544] dark:text-emerald-400 hover:underline transition-colors cursor-pointer"
        >
          <span>Ver itinerario</span>
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3 7H11M11 7L7.5 3.5M11 7L7.5 10.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {/* Responsive Grid: 4 columns on desktop (lg:grid-cols-4), 2 columns on mobile (grid-cols-2) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full items-stretch">
        {destinations.map((dest) => (
          <div
            key={dest.id}
            className="flex flex-col justify-between w-full rounded-[14px] bg-white dark:bg-stone-900 border border-[#DFE2DA] dark:border-stone-800 overflow-hidden shadow-2xs hover:shadow-md transition-all group"
          >
            {/* Destination Picture */}
            <div className="relative h-[125px] sm:h-[150px] lg:h-[160px] w-full overflow-hidden bg-stone-100 dark:bg-stone-800 shrink-0">
              <img
                src={dest.image}
                alt={dest.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />

              {/* Gradient for subtle bottom contrast */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 pointer-events-none" />

              {/* Favorite Heart Button */}
              <button
                type="button"
                onClick={() => toggleFavorite(dest.id)}
                title={
                  dest.isFavorite
                    ? "Eliminar de favoritos"
                    : "Marcar como favorito"
                }
                aria-label={`Favorito ${dest.name}`}
                className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 p-1.5 sm:p-2 rounded-full bg-white/90 dark:bg-stone-900/90 backdrop-blur-xs text-stone-600 dark:text-stone-300 hover:scale-110 active:scale-95 transition-all shadow-xs cursor-pointer"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill={dest.isFavorite ? "#E11D48" : "none"}
                  stroke={dest.isFavorite ? "#E11D48" : "currentColor"}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                </svg>
              </button>
            </div>

            {/* Destination Details */}
            <div className="p-3 sm:p-4 flex flex-col justify-between flex-1 gap-2.5">
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                <h3 className="font-serif text-base sm:text-lg font-normal text-[#203D34] dark:text-stone-100 leading-tight">
                  {dest.name}
                </h3>
                <span className="text-[10px] sm:text-[11px] text-[#727B74] dark:text-stone-400">
                  {dest.dates} · {dest.nights}{" "}
                  {dest.nights === 1 ? "noche" : "noches"}
                </span>
              </div>

              {/* Planning Status Badge */}
              <div
                className={`flex items-center justify-between px-2.5 py-1.5 rounded-[8px] text-[10px] sm:text-[11px] font-medium transition-colors ${
                  dest.isReady
                    ? "bg-[#E8EFEA] text-[#245544] dark:bg-stone-800 dark:text-[#A7F3D0]"
                    : "bg-[#F5F2E9] text-[#727B74] dark:bg-stone-800/60 dark:text-stone-400"
                }`}
              >
                <div className="flex items-center gap-1.5 overflow-hidden">
                  {dest.isReady ? (
                    <svg
                      width="11"
                      height="11"
                      viewBox="0 0 12 12"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="shrink-0 text-[#245544] dark:text-[#A7F3D0]"
                    >
                      <path
                        d="M2.5 6L5 8.5L9.5 3.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    <svg
                      width="11"
                      height="11"
                      viewBox="0 0 12 12"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="shrink-0 text-[#727B74] dark:text-stone-400"
                    >
                      <circle
                        cx="6"
                        cy="6"
                        r="4.5"
                        stroke="currentColor"
                        strokeWidth="1.2"
                      />
                      <path
                        d="M6 3.5V6L7.5 7"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                      />
                    </svg>
                  )}
                  <span className="truncate">{dest.statusText}</span>
                </div>

                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 12 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="shrink-0 text-[#727B74] dark:text-stone-400"
                >
                  <path
                    d="M4.5 2.5L8 6L4.5 9.5"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>
        ))}

        {/* Card 4: Add New Destination (Card con borde dashed y fondo #F5F2E9 de Figma) */}
        <div
          onClick={onAddDestination}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault()
              onAddDestination?.()
            }
          }}
          className="flex flex-col justify-center items-center gap-2.5 sm:gap-3.5 w-full p-4 sm:p-6 rounded-[14px] bg-[#F5F2E9] dark:bg-[#1A221E] border-2 border-dashed border-[#CCD2CA] dark:border-stone-700 hover:border-[#245544] dark:hover:border-emerald-500 hover:bg-[#EFEAE0] dark:hover:bg-[#1F2A25] transition-all cursor-pointer group text-center min-h-[200px] sm:min-h-[240px]"
        >
          <div className="w-9 h-9 sm:w-[42px] sm:h-[42px] rounded-full bg-[#E8EFEA] dark:bg-stone-800 text-[#245544] dark:text-[#A7F3D0] flex items-center justify-center transition-transform group-hover:scale-110 shadow-2xs">
            <svg
              width="18"
              height="18"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10 4.5V15.5M4.5 10H15.5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div className="space-y-1">
            <h3 className="font-serif text-sm sm:text-base lg:text-[18px] xl:text-[20px] font-normal text-[#203D34] dark:text-stone-100 leading-snug">
              ¿Y si añadimos otro lugar?
            </h3>
            <p className="text-[10px] sm:text-[11px] text-[#4D5B54] dark:text-stone-400 leading-relaxed">
              Siempre hay sitio para una idea más.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
