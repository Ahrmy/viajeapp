import { useState, useEffect } from "react"
import type { Destination } from "./DestinationsSlider"
import type { TripOption } from "./Sidebar"
import type { HeroData } from "./EditHeroModal"
import { tripService } from "@/lib/tripService"
import type { Transporte } from "@/types/database"

interface ItineraryViewProps {
  trip: TripOption
  heroData?: HeroData
  destinations: Destination[]
  travelersCount?: number
  onBackToOverview: () => void
  onSelectCity: (cityId: string) => void
  onAddDestination: () => void
  onEditCity?: (destination: Destination) => void
  onUpdateDays: (cityId: string, days: number) => void
  onDeleteCity?: (cityId: string) => void
  onInvite?: () => void
}

const MONTH_NAMES = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic",
]

function formatSegmentDates(
  startDateStr: string | undefined,
  startOffsetDays: number,
  durationNights: number
): string {
  if (!startDateStr) {
    const startDay = startOffsetDays + 1
    const endDay = startOffsetDays + durationNights + 1
    return `Día ${startDay}–${endDay} · ${durationNights} ${durationNights === 1 ? "noche" : "noches"}`
  }

  try {
    const parts = startDateStr.split("-").map(Number)
    if (parts.length !== 3) {
      return `${durationNights} ${durationNights === 1 ? "noche" : "noches"}`
    }

    const start = new Date(parts[0], parts[1] - 1, parts[2])
    start.setDate(start.getDate() + startOffsetDays)

    const end = new Date(start)
    end.setDate(end.getDate() + durationNights)

    const startDay = start.getDate()
    const endDay = end.getDate()
    const startMonth = MONTH_NAMES[start.getMonth()]
    const endMonth = MONTH_NAMES[end.getMonth()]
    const year = end.getFullYear()

    const nightStr = `${durationNights} ${durationNights === 1 ? "noche" : "noches"}`

    if (startMonth === endMonth) {
      return `${startDay}–${endDay} ${startMonth} ${year} · ${nightStr}`
    }
    return `${startDay} ${startMonth} – ${endDay} ${endMonth} ${year} · ${nightStr}`
  } catch {
    return `${durationNights} ${durationNights === 1 ? "noche" : "noches"}`
  }
}

export function ItineraryView({
  trip,
  heroData,
  destinations,
  travelersCount = 4,
  onBackToOverview,
  onSelectCity,
  onAddDestination,
  onEditCity,
  onUpdateDays,
  onDeleteCity,
  onInvite,
}: ItineraryViewProps) {
  const [activeMenuCityId, setActiveMenuCityId] = useState<string | null>(null)
  const [cityToDelete, setCityToDelete] = useState<Destination | null>(null)
  const [showAddTransportNotice, setShowAddTransportNotice] = useState(false)
  const [cityTransports, setCityTransports] = useState<Record<string, Transporte[]>>({})

  useEffect(() => {
    let isMounted = true
    Promise.all(
      destinations.map(async (d) => {
        const trs = await tripService.getTransports(d.id)
        return { cityId: d.id, trs }
      })
    ).then((results) => {
      if (!isMounted) return
      const map: Record<string, Transporte[]> = {}
      results.forEach((r) => {
        map[r.cityId] = r.trs
      })
      setCityTransports(map)
    })
    return () => {
      isMounted = false
    }
  }, [destinations])

  // Calculate total nights and days
  const totalNights = destinations.reduce((acc, d) => acc + (d.nights || 1), 0)
  const totalDays = totalNights + 1

  // Format cities joined string for editorial banner
  const citiesNames = destinations.map((d) => d.name)
  let citiesJoined = citiesNames.join(", ")
  if (citiesNames.length > 1) {
    citiesJoined = `${citiesNames.slice(0, -1).join(", ")} y ${citiesNames[citiesNames.length - 1]}`
  }

  // Calculate cumulative offsets for date segments
  let cumulativeNights = 0
  const citySegments = destinations.map((dest) => {
    const nights = Math.max(1, (dest.nights || 1) > 1 ? (dest.nights || 1) - 1 : 1)
    const offset = cumulativeNights
    cumulativeNights += nights
    const formattedDates = formatSegmentDates(heroData?.startDate, offset, nights)
    return {
      ...dest,
      computedNights: nights,
      formattedDates,
    }
  })

  const firstCityName = destinations[0]?.name || "Lisboa"
  const lastCityName = destinations[destinations.length - 1]?.name || "Oporto"

  return (
    <div className="flex flex-col gap-8 w-full animate-in fade-in duration-200">
      {/* 1. Context / Breadcrumb Bar */}
      <div className="flex items-center justify-between text-xs text-[#727B74] dark:text-stone-400 select-none">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBackToOverview}
            className="hover:text-[#203D34] dark:hover:text-stone-200 transition-colors cursor-pointer flex items-center gap-1.5 font-medium"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
            <span>Travesía</span>
          </button>
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
          <span className="text-[#203D34] dark:text-stone-100 font-semibold">
            Itinerario
          </span>
        </div>

        <div className="flex items-center gap-2.5 px-3 py-1 rounded-full bg-[#E8EFEA] dark:bg-emerald-950/60 text-[#245544] dark:text-[#A7F3D0] text-[11px] font-medium shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-[#245544] dark:bg-emerald-400 animate-pulse" />
          <span>Guardado en la nube</span>
        </div>
      </div>

      {/* 2. Trip Title & Travelers Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] font-semibold tracking-wider text-[#245544] dark:text-emerald-400 uppercase">
            Vuestra próxima historia
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-[42px] leading-tight text-[#203D34] dark:text-stone-100">
            {trip.name}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center -space-x-2">
            <div className="w-[34px] h-[34px] rounded-full bg-[#DDEAE2] text-[#245544] border-2 border-[#FAF9F5] dark:border-stone-900 flex items-center justify-center text-[11px] font-semibold shadow-2xs">
              CL
            </div>
            <div className="w-[34px] h-[34px] rounded-full bg-[#EFE9DF] text-[#7A6242] border-2 border-[#FAF9F5] dark:border-stone-900 flex items-center justify-center text-[11px] font-semibold shadow-2xs">
              DL
            </div>
            <div className="w-[34px] h-[34px] rounded-full bg-[#DDEAE2] text-[#245544] border-2 border-[#FAF9F5] dark:border-stone-900 flex items-center justify-center text-[11px] font-semibold shadow-2xs">
              LM
            </div>
            <div className="w-[34px] h-[34px] rounded-full bg-[#EFE9DF] text-[#7A6242] border-2 border-[#FAF9F5] dark:border-stone-900 flex items-center justify-center text-[11px] font-semibold shadow-2xs">
              NM
            </div>
          </div>

          <button
            type="button"
            onClick={onInvite}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-white dark:bg-stone-800 border border-[#CCD2CA] dark:border-stone-700 text-[#245544] dark:text-[#A7F3D0] text-xs font-semibold hover:bg-stone-50 dark:hover:bg-stone-700/60 transition-colors shadow-2xs cursor-pointer"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Invitar</span>
          </button>
        </div>
      </div>

      {/* 3. Essential Data Bar */}
      <div className="flex items-center justify-between flex-wrap gap-4 py-2 border-y border-[#CCD2CA]/60 dark:border-stone-800 text-xs">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 text-[#203D34] dark:text-stone-200 font-medium">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#245544"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span>{trip.dates}</span>
            <span className="text-[#727B74] dark:text-stone-400 font-normal">
              · {totalDays} {totalDays === 1 ? "día" : "días"} / {totalNights}{" "}
              {totalNights === 1 ? "noche" : "noches"}
            </span>
          </div>

          <div className="hidden sm:block w-px h-4 bg-[#CCD2CA] dark:bg-stone-700" />

          <div className="flex items-center gap-2 text-[#4D5B54] dark:text-stone-300">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="text-[#727B74]"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <span>
              {travelersCount} {travelersCount === 1 ? "viajero" : "viajeros"}
            </span>
          </div>

          <div className="hidden sm:block w-px h-4 bg-[#CCD2CA] dark:bg-stone-700" />

          <div className="flex items-center gap-2 text-[#4D5B54] dark:text-stone-300">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="text-[#727B74]"
            >
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span>
              {destinations.length}{" "}
              {destinations.length === 1 ? "destino" : "destinos"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-[#4D5B54] dark:text-stone-300">
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#D97706"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
          <span>{firstCityName}, ahora · 21° · Soleado</span>
        </div>
      </div>

      {/* 4. Panoramic Editorial Banner */}
      <div className="relative w-full h-[240px] sm:h-[260px] rounded-2xl overflow-hidden shadow-sm group">
        <img
          src={heroData?.image || "/images/lisboa-panoramica.png"}
          alt={trip.name}
          className="w-full h-full object-cover object-center group-hover:scale-[1.02] transition-transform duration-700 ease-out"
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(180deg, rgba(23, 47, 39, 0) 15%, rgba(23, 47, 39, 0.85) 100%)",
          }}
        />

        {/* Location Badge */}
        <div className="absolute top-5 left-5 px-3 py-1.5 rounded-full bg-white/95 dark:bg-stone-900/90 backdrop-blur-xs flex items-center gap-1.5 text-[11px] font-semibold text-[#203D34] dark:text-stone-100 shadow-xs">
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#245544"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span>{heroData?.locationBadge || `${firstCityName}, Portugal`}</span>
        </div>

        {/* Editorial Text */}
        <div className="absolute bottom-6 left-6 right-6 text-white max-w-3xl">
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-[34px] leading-tight mb-2 drop-shadow-xs">
            {heroData?.title || "Hay viajes que ya se sienten cerca."}
          </h2>
          <p className="text-white/90 text-xs sm:text-sm font-normal drop-shadow-xs">
            {citiesJoined}. Un camino para disfrutar juntos.
          </p>
        </div>
      </div>

      {/* 5. Main Transports Section (Ida y Vuelta) */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h3 className="font-serif text-xl sm:text-2xl text-[#203D34] dark:text-stone-100">
              Transportes principales
            </h3>
            <p className="text-xs text-[#727B74] dark:text-stone-400">
              Trayectos internacionales de ida y vuelta. Los traslados entre ciudades van en cada destino.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAddTransportNotice(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-[8px] bg-white dark:bg-stone-800 border border-[#CCD2CA] dark:border-stone-700 text-[#245544] dark:text-[#A7F3D0] text-xs font-semibold hover:bg-stone-50 dark:hover:bg-stone-700/60 transition-colors shadow-2xs cursor-pointer"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Añadir transporte</span>
          </button>
        </div>

        {showAddTransportNotice && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between animate-in fade-in">
            <span>
              Configuración de vuelos y trenes principales sincronizada para {travelersCount} viajeros.
            </span>
            <button
              type="button"
              onClick={() => setShowAddTransportNotice(false)}
              className="font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Card Ida */}
          <div className="p-5 sm:p-6 rounded-xl bg-white dark:bg-stone-900 border border-[#DFE2DA] dark:border-stone-800 flex flex-col gap-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#E8EFEA] dark:bg-emerald-950/60 flex items-center justify-center text-[#245544] dark:text-[#A7F3D0]">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.3c.4-.2.6-.6.5-1.1z" />
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-[#203D34] dark:text-stone-100">
                    Vuelo · Directo
                  </span>
                  <span className="text-[11px] text-[#727B74] dark:text-stone-400">
                    Iberia · Turista
                  </span>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-md bg-[#E8EFEA] dark:bg-emerald-950/60 text-[#245544] dark:text-[#A7F3D0] text-[11px] font-medium">
                Ida · {trip.dates.split("–")[0]?.trim() || "6 nov"}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <div className="flex flex-col">
                <span className="text-xl font-bold text-[#203D34] dark:text-stone-100">
                  09:00
                </span>
                <span className="text-xs font-medium text-[#727B74] dark:text-stone-300">
                  Madrid · MAD
                </span>
                <span className="text-[10px] text-[#727B74] dark:text-stone-400">
                  {trip.dates.split("–")[0]?.trim() || "6 nov"}
                </span>
              </div>

              <div className="flex-1 flex flex-col items-center gap-1 px-2">
                <span className="text-[11px] text-[#727B74] dark:text-stone-400 font-medium">
                  1 h 25 min
                </span>
                <div className="w-full flex items-center gap-1">
                  <div className="h-[1.5px] flex-1 bg-[#CCD2CA] dark:bg-stone-700" />
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="text-[#245544] dark:text-[#A7F3D0] rotate-90"
                  >
                    <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.3c.4-.2.6-.6.5-1.1z" />
                  </svg>
                  <div className="h-[1.5px] flex-1 bg-[#CCD2CA] dark:bg-stone-700" />
                </div>
                <span className="text-[10px] text-[#727B74] dark:text-stone-400">
                  Sin escalas
                </span>
              </div>

              <div className="flex flex-col items-end">
                <span className="text-xl font-bold text-[#203D34] dark:text-stone-100">
                  09:25
                </span>
                <span className="text-xs font-medium text-[#727B74] dark:text-stone-300">
                  {firstCityName} · LIS
                </span>
                <span className="text-[10px] text-[#727B74] dark:text-stone-400">
                  {trip.dates.split("–")[0]?.trim() || "6 nov"}
                </span>
              </div>
            </div>

            <div className="border-t border-[#DFE2DA] dark:border-stone-800 pt-3 flex items-center justify-between text-xs">
              <div className="flex flex-col">
                <span className="font-semibold text-[#203D34] dark:text-stone-200">
                  {85 * travelersCount} € para los {travelersCount} viajeros
                </span>
                <span className="text-[11px] text-[#727B74] dark:text-stone-400">
                  Equipaje de mano · Solo ida
                </span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-lg font-bold text-[#203D34] dark:text-stone-100">
                  85 €
                </span>
                <span className="text-[10px] text-[#727B74] dark:text-stone-400">
                  por persona
                </span>
              </div>
            </div>
          </div>

          {/* Card Vuelta */}
          <div className="p-5 sm:p-6 rounded-xl bg-white dark:bg-stone-900 border border-[#DFE2DA] dark:border-stone-800 flex flex-col gap-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#E8EFEA] dark:bg-emerald-950/60 flex items-center justify-center text-[#245544] dark:text-[#A7F3D0]">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.3c.4-.2.6-.6.5-1.1z" />
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-[#203D34] dark:text-stone-100">
                    Vuelo · Directo
                  </span>
                  <span className="text-[11px] text-[#727B74] dark:text-stone-400">
                    Iberia · Turista
                  </span>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-md bg-[#E8EFEA] dark:bg-emerald-950/60 text-[#245544] dark:text-[#A7F3D0] text-[11px] font-medium">
                Vuelta · {trip.dates.split("–")[1]?.trim() || "13 nov"}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <div className="flex flex-col">
                <span className="text-xl font-bold text-[#203D34] dark:text-stone-100">
                  18:30
                </span>
                <span className="text-xs font-medium text-[#727B74] dark:text-stone-300">
                  {lastCityName} · OPO
                </span>
                <span className="text-[10px] text-[#727B74] dark:text-stone-400">
                  {trip.dates.split("–")[1]?.trim() || "13 nov"}
                </span>
              </div>

              <div className="flex-1 flex flex-col items-center gap-1 px-2">
                <span className="text-[11px] text-[#727B74] dark:text-stone-400 font-medium">
                  1 h 10 min
                </span>
                <div className="w-full flex items-center gap-1">
                  <div className="h-[1.5px] flex-1 bg-[#CCD2CA] dark:bg-stone-700" />
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="text-[#245544] dark:text-[#A7F3D0] rotate-90"
                  >
                    <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.3c.4-.2.6-.6.5-1.1z" />
                  </svg>
                  <div className="h-[1.5px] flex-1 bg-[#CCD2CA] dark:bg-stone-700" />
                </div>
                <span className="text-[10px] text-[#727B74] dark:text-stone-400">
                  Sin escalas
                </span>
              </div>

              <div className="flex flex-col items-end">
                <span className="text-xl font-bold text-[#203D34] dark:text-stone-100">
                  20:40
                </span>
                <span className="text-xs font-medium text-[#727B74] dark:text-stone-300">
                  Madrid · MAD
                </span>
                <span className="text-[10px] text-[#727B74] dark:text-stone-400">
                  {trip.dates.split("–")[1]?.trim() || "13 nov"}
                </span>
              </div>
            </div>

            <div className="border-t border-[#DFE2DA] dark:border-stone-800 pt-3 flex items-center justify-between text-xs">
              <div className="flex flex-col">
                <span className="font-semibold text-[#203D34] dark:text-stone-200">
                  {79 * travelersCount} € para los {travelersCount} viajeros
                </span>
                <span className="text-[11px] text-[#727B74] dark:text-stone-400">
                  Equipaje de mano · Solo ida
                </span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-lg font-bold text-[#203D34] dark:text-stone-100">
                  79 €
                </span>
                <span className="text-[10px] text-[#727B74] dark:text-stone-400">
                  por persona
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-[#727B74] dark:text-stone-400 pt-1">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <span>
            Horarios y tarifas ilustrativos, no verificados. Horas locales de cada aeropuerto (Portugal: −1 h respecto a Madrid). Sin reserva.
          </span>
        </div>
      </section>

      {/* 6. Destinos del Itinerario (Timeline) */}
      <section className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h3 className="font-serif text-xl sm:text-2xl text-[#203D34] dark:text-stone-100">
              Vuestro itinerario, parada a parada
            </h3>
            <p className="text-xs text-[#727B74] dark:text-stone-400">
              {destinations.length} {destinations.length === 1 ? "ciudad" : "ciudades"}, un mismo viaje. Organizad la estancia en cada destino.
            </p>
          </div>

          <button
            type="button"
            onClick={onAddDestination}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-[8px] bg-white dark:bg-stone-800 border border-[#CCD2CA] dark:border-stone-700 text-[#245544] dark:text-[#A7F3D0] text-xs font-semibold hover:bg-stone-50 dark:hover:bg-stone-700/60 transition-colors shadow-2xs cursor-pointer"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Añadir destino</span>
          </button>
        </div>

        {/* Timeline List */}
        <div className="flex flex-col">
          {citySegments.map((city, idx) => {
            const isLast = idx === citySegments.length - 1
            const prevCityName = idx > 0 ? citySegments[idx - 1].name : null

            return (
              <div key={city.id} className="flex gap-4 sm:gap-6 relative">
                {/* Left Timeline Track */}
                <div className="flex flex-col items-center shrink-0 w-20 sm:w-24 pt-4 select-none">
                  {/* Pin Dot */}
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center border-2 z-10 transition-colors shadow-2xs ${
                      city.isReady || idx === 0
                        ? "bg-[#245544] border-white dark:border-stone-900 text-white"
                        : "bg-white dark:bg-stone-800 border-[#CCD2CA] dark:border-stone-600 text-[#727B74] dark:text-stone-300"
                    }`}
                  >
                    {city.isReady || idx === 0 ? (
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      <span className="text-xs font-bold">{idx + 1}</span>
                    )}
                  </div>

                  {/* Days / Nights label under the pin */}
                  <div className="flex flex-col items-center mt-2 text-center">
                    <span className="text-xs font-bold text-[#203D34] dark:text-stone-100">
                      {city.nights} {city.nights === 1 ? "día" : "días"}
                    </span>
                    <span className="text-[11px] text-[#727B74] dark:text-stone-400">
                      {city.computedNights}{" "}
                      {city.computedNights === 1 ? "noche" : "noches"}
                    </span>
                  </div>

                  {/* Connecting Line to next city */}
                  {!isLast && (
                    <div className="w-0.5 flex-1 min-h-[40px] my-3 bg-[#DFE2DA] dark:bg-stone-700" />
                  )}
                </div>

                {/* Right Card */}
                <div className="flex-1 pb-6 sm:pb-8">
                  <div className="bg-white dark:bg-stone-900 border border-[#CCD2CA] dark:border-stone-800 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row group">
                    {/* City Thumbnail */}
                    <div
                      onClick={() => onSelectCity(city.id)}
                      className="w-full md:w-44 lg:w-48 h-40 md:h-auto shrink-0 relative overflow-hidden cursor-pointer"
                    >
                      <img
                        src={city.image}
                        alt={city.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      />
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                    </div>

                    {/* Card Content */}
                    <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between gap-4">
                      {/* Top: City Name, Status Badge, Dates */}
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-3">
                            <h4
                              onClick={() => onSelectCity(city.id)}
                              className="font-serif text-xl sm:text-2xl text-[#203D34] dark:text-stone-100 hover:text-[#245544] dark:hover:text-[#A7F3D0] transition-colors cursor-pointer"
                            >
                              {city.name}
                            </h4>

                            {city.isReady || idx === 0 ? (
                              <span className="px-2.5 py-0.5 rounded-md bg-[#E8EFEA] dark:bg-emerald-950/60 text-[#245544] dark:text-[#A7F3D0] text-[11px] font-medium flex items-center gap-1">
                                <svg
                                  width="11"
                                  height="11"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                                <span>Todo listo</span>
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-md bg-[#F2EFE9] dark:bg-stone-800 text-[#727B74] dark:text-stone-300 text-[11px] font-medium flex items-center gap-1">
                                <svg
                                  width="11"
                                  height="11"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <circle cx="12" cy="12" r="10" />
                                  <polyline points="12 6 12 12 16 14" />
                                </svg>
                                <span>Por planificar</span>
                              </span>
                            )}
                          </div>

                          {/* Options dropdown button */}
                          <div className="relative">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                setActiveMenuCityId(
                                  activeMenuCityId === city.id ? null : city.id
                                )
                              }}
                              className="p-1.5 rounded-md text-[#727B74] hover:text-[#203D34] dark:text-stone-400 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                              title="Opciones del destino"
                            >
                              <svg
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <circle cx="12" cy="12" r="1" />
                                <circle cx="19" cy="12" r="1" />
                                <circle cx="5" cy="12" r="1" />
                              </svg>
                            </button>

                            {/* Dropdown Menu */}
                            {activeMenuCityId === city.id && (
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className="absolute right-0 top-full mt-1 w-44 rounded-lg bg-white dark:bg-stone-900 border border-[#DFE2DA] dark:border-stone-800 shadow-lg py-1 z-30 animate-in fade-in zoom-in-95"
                              >
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveMenuCityId(null)
                                    onSelectCity(city.id)
                                  }}
                                  className="w-full px-3 py-2 text-left text-xs text-[#203D34] dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800 flex items-center gap-2 cursor-pointer"
                                >
                                  <svg
                                    width="13"
                                    height="13"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                  >
                                    <polyline points="9 18 15 12 9 6" />
                                  </svg>
                                  <span>Acceder al destino</span>
                                </button>

                                {onEditCity && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveMenuCityId(null)
                                      onEditCity(city)
                                    }}
                                    className="w-full px-3 py-2 text-left text-xs text-[#203D34] dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800 flex items-center gap-2 cursor-pointer"
                                  >
                                    <svg
                                      width="13"
                                      height="13"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                    >
                                      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                                    </svg>
                                    <span>Editar destino</span>
                                  </button>
                                )}

                                {onDeleteCity && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveMenuCityId(null)
                                      setCityToDelete(city)
                                    }}
                                    className="w-full px-3 py-2 text-left text-xs text-[#A34B3D] hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center gap-2 cursor-pointer"
                                  >
                                    <svg
                                      width="13"
                                      height="13"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                    >
                                      <path d="M3 6h18" />
                                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                                    </svg>
                                    <span>Eliminar destino</span>
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        <span className="text-xs text-[#727B74] dark:text-stone-400 font-medium">
                          {city.formattedDates}
                        </span>
                      </div>

                      {/* Middle: Transport & Lodging Highlights */}
                      <div className="flex flex-col gap-2 text-xs py-1">
                        {/* Transport highlight */}
                        <div className="flex items-center gap-2 text-[#4D5B54] dark:text-stone-300">
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#245544"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="shrink-0 text-[#245544] dark:text-[#A7F3D0]"
                          >
                            <rect x="4" y="3" width="16" height="16" rx="2" />
                            <path d="M4 11h16" />
                            <path d="M12 3v8" />
                            <path d="m8 19-2 3" />
                            <path d="m18 22-2-3" />
                            <circle cx="8" cy="15" r="1" />
                            <circle cx="16" cy="15" r="1" />
                          </svg>
                          <span className="truncate">
                            {(() => {
                              const transports = cityTransports[city.id] || []
                              const chosen = transports.find((t) => t.estado_seleccion === "elegido")
                              if (chosen) {
                                return `Elegido: ${chosen.nombre_linea || chosen.tipo.toUpperCase()}`
                              }
                              const preferred = transports.find((t) => t.estado_seleccion === "preferido")
                              if (preferred) {
                                return `Preferido: ${preferred.nombre_linea || preferred.tipo.toUpperCase()}`
                              }
                              if (transports.length > 0) {
                                return `${transports.length} ${transports.length === 1 ? "opción" : "opciones"} de transporte`
                              }
                              return idx === 0
                                ? "Preferido: Tren Intercidades · Comboios de Portugal"
                                : `Traslado ${prevCityName ? `${prevCityName} → ` : ""}${city.name} pendiente`
                            })()}
                          </span>
                        </div>

                        {/* Lodging highlight */}
                        <div className="flex items-center gap-2 text-[#4D5B54] dark:text-stone-300">
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#245544"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="shrink-0 text-[#245544] dark:text-[#A7F3D0]"
                          >
                            <path d="M2 4v16" />
                            <path d="M2 8h18a2 2 0 0 1 2 2v10" />
                            <path d="M2 17h20" />
                            <path d="M6 8v9" />
                          </svg>
                          <span className="truncate">
                            {idx === 0
                              ? `Seleccionado: ${city.name} Pessoa Hotel · 2 habitaciones`
                              : "Alojamiento pendiente de seleccionar"}
                          </span>
                        </div>
                      </div>

                      {/* Bottom Controls: Days Stepper & Go to City CTA */}
                      <div className="flex items-center justify-between flex-wrap gap-3 pt-2 border-t border-[#DFE2DA]/60 dark:border-stone-800">
                        {/* Stepper */}
                        <div className="flex items-center gap-2.5">
                          <span className="text-xs text-[#727B74] dark:text-stone-400 font-medium">
                            Días:
                          </span>
                          <div className="flex items-center border border-[#CCD2CA] dark:border-stone-700 rounded-lg overflow-hidden bg-white dark:bg-stone-800 shadow-2xs">
                            <button
                              type="button"
                              onClick={() =>
                                onUpdateDays(city.id, Math.max(1, city.nights - 1))
                              }
                              disabled={city.nights <= 1}
                              className="px-2.5 py-1 text-xs font-bold text-[#4D5B54] hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-700 disabled:opacity-30 transition-colors cursor-pointer"
                              title="Reducir 1 día"
                            >
                              −
                            </button>
                            <span className="px-2.5 py-1 text-xs font-bold text-[#203D34] dark:text-stone-100 min-w-7 text-center">
                              {city.nights}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                onUpdateDays(city.id, city.nights + 1)
                              }
                              className="px-2.5 py-1 text-xs font-bold text-[#4D5B54] hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-700 transition-colors cursor-pointer"
                              title="Añadir 1 día"
                            >
                              +
                            </button>
                          </div>
                          <span className="text-[11px] text-[#727B74] dark:text-stone-400">
                            {city.computedNights}{" "}
                            {city.computedNights === 1 ? "noche" : "noches"}
                          </span>
                        </div>

                        {/* CTA button to enter the city */}
                        <button
                          type="button"
                          onClick={() => onSelectCity(city.id)}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#245544] text-white hover:bg-[#1b4335] text-xs font-medium shadow-xs transition-colors cursor-pointer ml-auto"
                        >
                          <span>Acceder al destino</span>
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="9 18 15 12 9 6" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* 7. Bottom Duration Notes Banner */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-[#F0EEE6] dark:bg-stone-900 border border-[#DFE2DA] dark:border-stone-800 text-xs text-[#727B74] dark:text-stone-400">
          <div className="w-5 h-5 rounded-full bg-white dark:bg-stone-800 flex items-center justify-center shrink-0 mt-0.5 text-[#245544] dark:text-[#A7F3D0]">
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          </div>
          <div className="flex flex-col gap-1 leading-relaxed">
            <p>
              Los días de traslado se comparten entre ciudades. El viaje sigue siendo de {totalDays} días / {totalNights} noches.
            </p>
            <p>
              Las selecciones se mantienen sincronizadas. Seleccionado o preferido no significa reservado.
            </p>
          </div>
        </div>
      </section>

      {/* Delete Confirmation Modal */}
      {cityToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-sm p-6 rounded-2xl bg-white dark:bg-stone-900 border border-[#CCD2CA] dark:border-stone-700 shadow-xl space-y-4">
            <div className="flex items-center gap-3 text-[#A34B3D]">
              <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-950/40 flex items-center justify-center">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M3 6h18" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                </svg>
              </div>
              <div>
                <h4 className="font-serif text-lg font-normal text-[#203D34] dark:text-stone-100">
                  ¿Eliminar {cityToDelete.name}?
                </h4>
                <p className="text-xs text-[#727B74] dark:text-stone-400">
                  Se quitará de este itinerario.
                </p>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCityToDelete(null)}
                className="flex-1 py-2 px-3 rounded-lg border border-[#CCD2CA] text-xs font-medium text-[#4D5B54] dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  if (cityToDelete && onDeleteCity) {
                    onDeleteCity(cityToDelete.id)
                  }
                  setCityToDelete(null)
                }}
                className="flex-1 py-2 px-3 rounded-lg bg-[#A34B3D] text-white text-xs font-semibold hover:bg-red-700 transition-colors cursor-pointer shadow-xs"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
