import { useState, useEffect } from "react"
import { EditHeroModal, type HeroData } from "./EditHeroModal"

interface TripHeroProps {
  tripName?: string
  daysRemaining?: number
  departureDate?: string
  isAdmin?: boolean
  initialData?: Partial<HeroData>
  onSaveHero?: (data: HeroData) => void
  isEditModalOpen?: boolean
  onToggleEditModal?: (open: boolean) => void
}

export function TripHero({
  tripName = "Portugal en familia",
  daysRemaining = 21,
  departureDate = "6 de noviembre",
  isAdmin = true,
  initialData,
  onSaveHero,
  isEditModalOpen: externalIsEditOpen,
  onToggleEditModal,
}: TripHeroProps) {
  const [heroData, setHeroData] = useState<HeroData>({
    tripName: tripName,
    title: initialData?.title || "Hay viajes que ya se sienten cerca.",
    subtitle:
      initialData?.subtitle ||
      "Lisboa, Sintra y Oporto. Un camino para disfrutar juntos.",
    image: initialData?.image || "/images/lisboa-panoramica.png",
    locationBadge: initialData?.locationBadge || "Lisboa, Portugal",
  })

  const [internalIsEditOpen, setInternalIsEditOpen] = useState(false)

  // Sync tripName when changed from outside
  useEffect(() => {
    setHeroData((prev) => ({ ...prev, tripName }))
  }, [tripName])

  const isModalOpen =
    externalIsEditOpen !== undefined ? externalIsEditOpen : internalIsEditOpen

  const setModalOpen = (open: boolean) => {
    if (onToggleEditModal) {
      onToggleEditModal(open)
    } else {
      setInternalIsEditOpen(open)
    }
  }

  const handleSave = (newData: HeroData) => {
    setHeroData(newData)
    onSaveHero?.(newData)
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 w-full">
        {/* Left: Panoramic Inspiration Card */}
        <div className="lg:col-span-8 xl:col-span-9 relative h-[240px] sm:h-[248px] rounded-[14px] overflow-hidden shadow-xs group">
          <img
            src={heroData.image}
            alt={heroData.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-102"
          />

          {/* Gradient for legibility */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(180deg, rgba(23, 47, 39, 0) 15%, rgba(23, 47, 39, 0.82) 100%)",
            }}
          />

          {/* Top-left location badge */}
          <div className="absolute top-4 left-4 z-10">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/92 dark:bg-stone-900/85 backdrop-blur-xs shadow-xs text-[10px] font-medium text-[#203D34] dark:text-stone-100">
              <svg
                width="11"
                height="11"
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
              <span>{heroData.locationBadge}</span>
            </div>
          </div>

          {/* Top-right Edit button with pencil icon (Only visible for admin creator) */}
          {isAdmin && (
            <div className="absolute top-4 right-4 z-20">
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                title="Editar viaje, fotografía y textos del cabecero"
                aria-label="Editar cabecero del viaje"
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white/92 dark:bg-stone-900/90 hover:bg-white dark:hover:bg-stone-800 text-[#203D34] dark:text-stone-100 backdrop-blur-md shadow-xs border border-white/60 dark:border-stone-700 hover:scale-105 active:scale-95 transition-all text-xs font-medium cursor-pointer group/btn"
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-[#245544] dark:text-[#A7F3D0] group-hover/btn:rotate-12 transition-transform"
                >
                  <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                  <path d="m15 5 4 4" />
                </svg>
                <span className="hidden sm:inline text-[11px] font-semibold text-[#203D34] dark:text-stone-200">
                  Editar cabecero
                </span>
              </button>
            </div>
          )}

          {/* Editorial quote */}
          <div className="absolute bottom-5 left-5 right-5 z-10 text-white max-w-[650px]">
            <h2 className="font-serif text-2xl sm:text-3xl md:text-[34px] font-normal leading-[1.1] text-white drop-shadow-xs">
              {heroData.title}
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-white/90 font-normal">
              {heroData.subtitle}
            </p>
          </div>
        </div>

        {/* Right: Countdown Card */}
        <div className="lg:col-span-4 xl:col-span-3 flex flex-col justify-between p-6 rounded-[14px] bg-[#245544] text-white shadow-xs min-h-[220px] sm:min-h-[248px] select-none">
          {/* Top Tagline */}
          <div className="flex items-center gap-2">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#A7F3D0"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
            </svg>
            <span className="text-[10px] font-semibold tracking-wider text-[#A7F3D0] uppercase">
              Cada vez más cerca
            </span>
          </div>

          {/* Big Counter */}
          <div className="flex items-baseline gap-2.5 my-1">
            <span className="font-serif text-6xl sm:text-7xl lg:text-[80px] font-normal leading-none tracking-tight">
              {daysRemaining}
            </span>
            <span className="font-serif text-2xl sm:text-[27px] font-normal text-white/90">
              días
            </span>
          </div>

          {/* Bottom Details */}
          <div className="flex flex-col gap-2.5 pt-1">
            <p className="text-xs text-[#A7F3D0] font-normal">
              para empezar vuestra aventura.
            </p>

            <div className="w-full border-t border-white/20" />

            <div className="flex items-center justify-between text-xs text-white">
              <span>Nos vamos el {departureDate}</span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-white"
              >
                <path
                  d="M4 10L10 4M10 4H5M10 4V9"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isAdmin && (
        <EditHeroModal
          isOpen={isModalOpen}
          onClose={() => setModalOpen(false)}
          currentData={{ ...heroData, tripName }}
          onSave={handleSave}
        />
      )}
    </>
  )
}
