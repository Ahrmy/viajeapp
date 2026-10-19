import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { tripService } from "@/lib/tripService"

interface CityDetailViewProps {
  cityId?: string
  cityName?: string
  tripName?: string
  onBack: () => void
  onSelectCity?: (cityId: string) => void
}

export function CityDetailView({
  cityId,
  cityName = "Lisboa",
  tripName = "Portugal en familia",
  onBack,
  onSelectCity,
}: CityDetailViewProps) {
  // Selected transport (train vs bus)
  const [selectedTransport, setSelectedTransport] = useState<"train" | "bus">(
    "train"
  )

  // Selected hotel (pessoa, mystory, jam)
  const [selectedHotel, setSelectedHotel] = useState<string>("pessoa")

  // Draft activity form state
  const [isActivityFormOpen, setIsActivityFormOpen] = useState(true)
  const [newActivityTime, setNewActivityTime] = useState("17:00")
  const [newActivityTitle, setNewActivityTitle] = useState(
    "Atardecer junto al Tajo"
  )
  const [newActivityLocation, setNewActivityLocation] = useState(
    "Doca de Santo Amaro, Alcântara · 1 h"
  )

  // Extra activities added dynamically
  const [day2ExtraActivities, setDay2ExtraActivities] = useState<
    Array<{ time: string; title: string; location: string }>
  >([])

  // Cargar actividades de Supabase para esta ciudad si existen
  useEffect(() => {
    if (!cityId) return
    let isMounted = true
    tripService.getCityDetails(cityId).then((details) => {
      if (!isMounted) return
      if (details.activities && details.activities.length > 0) {
        const extra = details.activities.map((a, idx) => ({
          time: a.fecha ? `${10 + (idx % 8)}:00` : "17:00",
          title: a.titulo,
          location: `${cityName} · Plan en familia`,
        }))
        setDay2ExtraActivities(extra)
      }
    })
    return () => {
      isMounted = false
    }
  }, [cityId, cityName])

  const handleSaveActivity = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newActivityTitle.trim()) return
    const title = newActivityTitle.trim()
    const loc = newActivityLocation.trim() || `${cityName} · 1 h`

    setDay2ExtraActivities((prev) => [
      ...prev,
      {
        time: newActivityTime,
        title,
        location: loc,
      },
    ])

    if (cityId) {
      await tripService.createActivity({
        ciudad_id: cityId,
        titulo: title,
      })
    }

    setNewActivityTitle("")
    setNewActivityLocation("")
    setIsActivityFormOpen(false)
  }

  return (
    <div className="flex flex-col gap-8 w-full max-w-[1140px] pb-16 animate-in fade-in duration-300">
      {/* Context & Breadcrumbs Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#727B74] dark:text-stone-400 select-none border-b border-[#E6E2D8] dark:border-stone-800 pb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={onBack}
            className="hover:text-[#203D34] dark:hover:text-stone-200 transition-colors cursor-pointer"
          >
            {tripName}
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
          <button
            type="button"
            onClick={onBack}
            className="hover:text-[#203D34] dark:hover:text-stone-200 transition-colors cursor-pointer"
          >
            Itinerario
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
            {cityName}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs text-[#727B74] dark:text-stone-400">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#245544"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="dark:stroke-emerald-400"
            >
              <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
              <path d="m9 13 2 2 4-4" />
            </svg>
            <span>Todo guardado</span>
          </div>
        </div>
      </div>

      {/* Main City Title & Back Action */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] sm:text-[11px] font-semibold tracking-wider text-[#245544] dark:text-[#A7F3D0] uppercase select-none">
            {tripName.toUpperCase()} · PRIMERA PARADA
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-[58px] font-normal leading-[1.05] text-[#203D34] dark:text-stone-100">
            {cityName}
          </h1>
          <div className="flex items-center gap-2 text-xs sm:text-sm text-[#4D5B54] dark:text-stone-300 mt-1">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="text-[#727B74]"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span className="font-medium text-[#203D34] dark:text-stone-100">
              Del 6 al 9 de noviembre de 2026
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#727B74] dark:text-stone-400">
            <span>4 días / 3 noches</span>
            <span>·</span>
            <span>4 viajeros</span>
          </div>
        </div>

        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3">
          <span className="inline-flex items-center px-3 py-1 rounded-[6px] bg-[#E8EFEA] dark:bg-stone-800 text-xs font-semibold text-[#245544] dark:text-[#A7F3D0]">
            ✓ Todo listo
          </span>

          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#245544] dark:text-emerald-400 hover:underline transition-all cursor-pointer"
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
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            <span>Volver al viaje</span>
          </button>
        </div>
      </div>

      {/* Editorial Panorama Banner */}
      <div className="relative h-[220px] sm:h-[240px] w-full rounded-[14px] overflow-hidden shadow-xs">
        <img
          src="/images/lisboa-editorial.png"
          alt="Panorámica de Lisboa"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(180deg, rgba(23, 47, 39, 0.1) 0%, rgba(23, 47, 39, 0.82) 100%)",
          }}
        />

        {/* Location Badge */}
        <div className="absolute top-4 left-4 z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/92 dark:bg-stone-900/90 backdrop-blur-xs text-[11px] font-medium text-[#203D34] dark:text-stone-100 shadow-xs">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-[#245544] dark:text-emerald-400 shrink-0"
            >
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span>Lisboa, Portugal</span>
          </div>
        </div>

        {/* Editorial Quote */}
        <div className="absolute bottom-5 left-5 right-5 z-10 text-white max-w-[700px]">
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-[32px] font-normal leading-snug drop-shadow-xs">
            Cuatro días al ritmo de Lisboa.
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-white/90 font-normal">
            Miradores, azulejos y tiempo para disfrutar juntos. Aquí empieza
            vuestra historia.
          </p>
        </div>
      </div>

      {/* SECTION 1: CÓMO LLEGAR */}
      <section className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-[#E6E2D8] dark:border-stone-800 pb-2.5">
          <div>
            <span className="text-[10px] font-semibold tracking-wider text-[#245544] dark:text-[#A7F3D0] uppercase block">
              EL CAMINO TAMBIÉN ES VIAJE
            </span>
            <h2 className="font-serif text-xl sm:text-2xl font-normal text-[#203D34] dark:text-stone-100">
              Cómo llegar
            </h2>
            <p className="text-xs text-[#727B74] dark:text-stone-400 mt-0.5">
              Faro → Lisboa · Viernes, 6 de noviembre
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              alert("Podrás añadir opciones personalizadas de transporte muy pronto.")
            }
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#245544] dark:text-emerald-400 hover:underline cursor-pointer self-start sm:self-auto"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Añadir transporte</span>
          </button>
        </div>

        {/* Transport Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Option 1: Tren */}
          <div
            onClick={() => setSelectedTransport("train")}
            className={`p-4 sm:p-5 rounded-[12px] bg-white dark:bg-stone-900 border transition-all cursor-pointer flex flex-col justify-between gap-4 ${selectedTransport === "train"
                ? "border-[#245544] ring-1 ring-[#245544] shadow-sm"
                : "border-[#DFE2DA] dark:border-stone-800 hover:border-stone-400"
              }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#E8EFEA] dark:bg-stone-800 text-[#245544] dark:text-[#A7F3D0] flex items-center justify-center">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <rect x="4" y="3" width="16" height="16" rx="2" />
                    <path d="M4 11h16" />
                    <path d="M12 3v8" />
                    <path d="m8 19-2 3" />
                    <path d="m16 19 2 3" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#203D34] dark:text-stone-100">
                    Tren · Intercidades
                  </h3>
                  <p className="text-[11px] text-[#727B74] dark:text-stone-400">
                    Comboios de Portugal · 2.ª clase
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <span
                  className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedTransport === "train"
                      ? "border-[#245544] bg-[#245544]"
                      : "border-stone-300 dark:border-stone-600"
                    }`}
                >
                  {selectedTransport === "train" && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  )}
                </span>
                <span
                  className={`text-xs font-semibold ${selectedTransport === "train"
                      ? "text-[#245544] dark:text-[#A7F3D0]"
                      : "text-stone-500"
                    }`}
                >
                  {selectedTransport === "train" ? "Preferido" : "Elegir"}
                </span>
              </div>
            </div>

            {/* Timetable schedule */}
            <div className="grid grid-cols-3 items-center text-center py-2 bg-[#F9F8F5] dark:bg-stone-800/40 rounded-[8px] px-3">
              <div className="text-left">
                <p className="text-base sm:text-lg font-bold text-[#203D34] dark:text-stone-100">
                  08:22
                </p>
                <p className="text-[11px] text-[#4D5B54] dark:text-stone-300">
                  Faro
                </p>
              </div>

              <div className="flex flex-col items-center">
                <span className="text-[10px] text-[#727B74] dark:text-stone-400">
                  3 h 24 min
                </span>
                <div className="w-full flex items-center gap-1 my-0.5">
                  <div className="flex-1 h-px bg-[#CCD2CA] dark:bg-stone-700" />
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#727B74"
                    strokeWidth="2"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
                <span className="text-[9px] text-[#245544] dark:text-[#A7F3D0] font-medium">
                  Directo
                </span>
              </div>

              <div className="text-right">
                <p className="text-base sm:text-lg font-bold text-[#203D34] dark:text-stone-100">
                  11:46
                </p>
                <p className="text-[11px] text-[#4D5B54] dark:text-stone-300">
                  Lisboa Oriente
                </p>
              </div>
            </div>

            {/* Price Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-[#DFE2DA] dark:border-stone-800">
              <span className="text-xs text-[#203D34] dark:text-stone-200">
                <strong>94 €</strong> para los 4 viajeros
              </span>
              <span className="text-xs font-semibold text-[#245544] dark:text-[#A7F3D0]">
                23,50 € / pers.
              </span>
            </div>
          </div>

          {/* Option 2: Bus */}
          <div
            onClick={() => setSelectedTransport("bus")}
            className={`p-4 sm:p-5 rounded-[12px] bg-white dark:bg-stone-900 border transition-all cursor-pointer flex flex-col justify-between gap-4 ${selectedTransport === "bus"
                ? "border-[#245544] ring-1 ring-[#245544] shadow-sm"
                : "border-[#DFE2DA] dark:border-stone-800 hover:border-stone-400"
              }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#E8EFEA] dark:bg-stone-800 text-[#245544] dark:text-[#A7F3D0] flex items-center justify-center">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path d="M8 6v6" />
                    <path d="M16 6v6" />
                    <path d="M4 6h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z" />
                    <circle cx="7" cy="18" r="2" />
                    <circle cx="17" cy="18" r="2" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#203D34] dark:text-stone-100">
                    Bus · Directo
                  </h3>
                  <p className="text-[11px] text-[#727B74] dark:text-stone-400">
                    Rede Expressos · Estándar
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <span
                  className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedTransport === "bus"
                      ? "border-[#245544] bg-[#245544]"
                      : "border-stone-300 dark:border-stone-600"
                    }`}
                >
                  {selectedTransport === "bus" && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  )}
                </span>
                <span
                  className={`text-xs font-semibold ${selectedTransport === "bus"
                      ? "text-[#245544] dark:text-[#A7F3D0]"
                      : "text-stone-500"
                    }`}
                >
                  {selectedTransport === "bus" ? "Preferido" : "Elegir"}
                </span>
              </div>
            </div>

            {/* Timetable schedule */}
            <div className="grid grid-cols-3 items-center text-center py-2 bg-[#F9F8F5] dark:bg-stone-800/40 rounded-[8px] px-3">
              <div className="text-left">
                <p className="text-base sm:text-lg font-bold text-[#203D34] dark:text-stone-100">
                  08:00
                </p>
                <p className="text-[11px] text-[#4D5B54] dark:text-stone-300">
                  Faro
                </p>
              </div>

              <div className="flex flex-col items-center">
                <span className="text-[10px] text-[#727B74] dark:text-stone-400">
                  3 h 30 min
                </span>
                <div className="w-full flex items-center gap-1 my-0.5">
                  <div className="flex-1 h-px bg-[#CCD2CA] dark:bg-stone-700" />
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#727B74"
                    strokeWidth="2"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
                <span className="text-[9px] text-[#245544] dark:text-[#A7F3D0] font-medium">
                  Directo
                </span>
              </div>

              <div className="text-right">
                <p className="text-base sm:text-lg font-bold text-[#203D34] dark:text-stone-100">
                  11:30
                </p>
                <p className="text-[11px] text-[#4D5B54] dark:text-stone-300">
                  Lisboa Sete Rios
                </p>
              </div>
            </div>

            {/* Price Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-[#DFE2DA] dark:border-stone-800">
              <span className="text-xs text-[#203D34] dark:text-stone-200">
                <strong>48 €</strong> para los 4 viajeros
              </span>
              <span className="text-xs font-semibold text-[#245544] dark:text-[#A7F3D0]">
                12 € / pers.
              </span>
            </div>
          </div>
        </div>

        <p className="text-[11px] text-[#727B74] dark:text-stone-400 italic">
          ℹ Horarios y precios de ejemplo, orientativos y sin consulta en directo.
          Hora local de Portugal. Preferido no significa reservado.
        </p>
      </section>

      {/* SECTION 2: DÓNDE DORMIR */}
      <section className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-[#E6E2D8] dark:border-stone-800 pb-2.5">
          <div>
            <span className="text-[10px] font-semibold tracking-wider text-[#245544] dark:text-[#A7F3D0] uppercase block">
              VUESTRO REFUGIO EN LA CIUDAD
            </span>
            <h2 className="font-serif text-xl sm:text-2xl font-normal text-[#203D34] dark:text-stone-100">
              Dónde dormir
            </h2>
            <p className="text-xs text-[#727B74] dark:text-stone-400 mt-0.5">
              Entrada: 6 nov · Salida: 9 nov · 3 noches
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              alert("Podrás añadir más opciones de hoteles próximamente.")
            }
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#245544] dark:text-emerald-400 hover:underline cursor-pointer self-start sm:self-auto"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Añadir hotel</span>
          </button>
        </div>

        {/* Hotels 3-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Hotel 1: Lisboa Pessoa Hotel (Selected) */}
          <div
            onClick={() => setSelectedHotel("pessoa")}
            className={`flex flex-col justify-between rounded-[12px] bg-white dark:bg-stone-900 overflow-hidden border transition-all cursor-pointer ${selectedHotel === "pessoa"
                ? "border-[#245544] ring-1 ring-[#245544] shadow-sm"
                : "border-[#DFE2DA] dark:border-stone-800 hover:border-stone-400"
              }`}
          >
            <div className="relative h-44 w-full bg-stone-100 dark:bg-stone-800">
              <img
                src="/images/hotel-pessoa.png"
                alt="Lisboa Pessoa Hotel"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2.5 left-2.5">
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold backdrop-blur-xs ${selectedHotel === "pessoa"
                      ? "bg-[#245544] text-white"
                      : "bg-white/90 text-stone-700"
                    }`}
                >
                  {selectedHotel === "pessoa"
                    ? "✓ Alojamiento seleccionado"
                    : "Seleccionar"}
                </span>
              </div>
            </div>

            <div className="p-4 flex flex-col justify-between flex-1 gap-3">
              <div>
                <h3 className="font-serif text-lg font-normal text-[#203D34] dark:text-stone-100">
                  Lisboa Pessoa Hotel
                </h3>
                <p className="text-xs text-[#4D5B54] dark:text-stone-300">
                  Chiado · A 6 min de Rossio
                </p>
                <p className="text-[11px] text-[#727B74] dark:text-stone-400">
                  4 estrellas · Piscina interior
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5">
                <span className="px-2 py-0.5 rounded-[4px] bg-[#F5F2E9] dark:bg-stone-800 text-[10px] text-[#4D5B54] dark:text-stone-300">
                  2 hab. dobles
                </span>
                <span className="px-2 py-0.5 rounded-[4px] bg-[#F5F2E9] dark:bg-stone-800 text-[10px] text-[#4D5B54] dark:text-stone-300">
                  Desayuno incluido
                </span>
              </div>

              <div className="pt-2 border-t border-[#DFE2DA] dark:border-stone-800 flex items-end justify-between">
                <div>
                  <span className="text-xs text-[#727B74] dark:text-stone-400 block">
                    Total 3 noches
                  </span>
                  <span className="text-base font-bold text-[#203D34] dark:text-stone-100">
                    810 €
                  </span>
                </div>
                <span className="text-xs font-semibold text-[#245544] dark:text-[#A7F3D0]">
                  270 € / noche
                </span>
              </div>
            </div>
          </div>

          {/* Hotel 2: My Story Hotel Rossio */}
          <div
            onClick={() => setSelectedHotel("mystory")}
            className={`flex flex-col justify-between rounded-[12px] bg-white dark:bg-stone-900 overflow-hidden border transition-all cursor-pointer ${selectedHotel === "mystory"
                ? "border-[#245544] ring-1 ring-[#245544] shadow-sm"
                : "border-[#DFE2DA] dark:border-stone-800 hover:border-stone-400"
              }`}
          >
            <div className="relative h-44 w-full bg-stone-100 dark:bg-stone-800">
              <img
                src="/images/hotel-mystory.png"
                alt="My Story Hotel Rossio"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2.5 left-2.5">
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold backdrop-blur-xs ${selectedHotel === "mystory"
                      ? "bg-[#245544] text-white"
                      : "bg-white/90 text-stone-700"
                    }`}
                >
                  {selectedHotel === "mystory"
                    ? "✓ Alojamiento seleccionado"
                    : "Seleccionar"}
                </span>
              </div>
            </div>

            <div className="p-4 flex flex-col justify-between flex-1 gap-3">
              <div>
                <h3 className="font-serif text-lg font-normal text-[#203D34] dark:text-stone-100">
                  My Story Hotel Rossio
                </h3>
                <p className="text-xs text-[#4D5B54] dark:text-stone-300">
                  Baixa · Frente a la plaza de Rossio
                </p>
                <p className="text-[11px] text-[#727B74] dark:text-stone-400">
                  3 estrellas · Ubicación céntrica
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5">
                <span className="px-2 py-0.5 rounded-[4px] bg-[#F5F2E9] dark:bg-stone-800 text-[10px] text-[#4D5B54] dark:text-stone-300">
                  2 hab. dobles
                </span>
                <span className="px-2 py-0.5 rounded-[4px] bg-[#F5F2E9] dark:bg-stone-800 text-[10px] text-[#4D5B54] dark:text-stone-300">
                  Recepción 24 h
                </span>
              </div>

              <div className="pt-2 border-t border-[#DFE2DA] dark:border-stone-800 flex items-end justify-between">
                <div>
                  <span className="text-xs text-[#727B74] dark:text-stone-400 block">
                    Total 3 noches
                  </span>
                  <span className="text-base font-bold text-[#203D34] dark:text-stone-100">
                    660 €
                  </span>
                </div>
                <span className="text-xs font-semibold text-[#245544] dark:text-[#A7F3D0]">
                  220 € / noche
                </span>
              </div>
            </div>
          </div>

          {/* Hotel 3: JAM Lisbon */}
          <div
            onClick={() => setSelectedHotel("jam")}
            className={`flex flex-col justify-between rounded-[12px] bg-white dark:bg-stone-900 overflow-hidden border transition-all cursor-pointer ${selectedHotel === "jam"
                ? "border-[#245544] ring-1 ring-[#245544] shadow-sm"
                : "border-[#DFE2DA] dark:border-stone-800 hover:border-stone-400"
              }`}
          >
            <div className="relative h-44 w-full bg-stone-100 dark:bg-stone-800">
              <img
                src="/images/hotel-jam.png"
                alt="JAM Lisbon"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2.5 left-2.5">
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold backdrop-blur-xs ${selectedHotel === "jam"
                      ? "bg-[#245544] text-white"
                      : "bg-white/90 text-stone-700"
                    }`}
                >
                  {selectedHotel === "jam"
                    ? "✓ Alojamiento seleccionado"
                    : "Seleccionar"}
                </span>
              </div>
            </div>

            <div className="p-4 flex flex-col justify-between flex-1 gap-3">
              <div>
                <h3 className="font-serif text-lg font-normal text-[#203D34] dark:text-stone-100">
                  JAM Lisbon
                </h3>
                <p className="text-xs text-[#4D5B54] dark:text-stone-300">
                  Santos · Junto al Museo de Arte Antiguo
                </p>
                <p className="text-[11px] text-[#727B74] dark:text-stone-400">
                  3 estrellas · Terraza y piscina
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5">
                <span className="px-2 py-0.5 rounded-[4px] bg-[#F5F2E9] dark:bg-stone-800 text-[10px] text-[#4D5B54] dark:text-stone-300">
                  Habitaciones familiares
                </span>
                <span className="px-2 py-0.5 rounded-[4px] bg-[#F5F2E9] dark:bg-stone-800 text-[10px] text-[#4D5B54] dark:text-stone-300">
                  Parking de pago
                </span>
              </div>

              <div className="pt-2 border-t border-[#DFE2DA] dark:border-stone-800 flex items-end justify-between">
                <div>
                  <span className="text-xs text-[#727B74] dark:text-stone-400 block">
                    Total 3 noches
                  </span>
                  <span className="text-base font-bold text-[#203D34] dark:text-stone-100">
                    570 €
                  </span>
                </div>
                <span className="text-xs font-semibold text-[#245544] dark:text-[#A7F3D0]">
                  190 € / noche
                </span>
              </div>
            </div>
          </div>
        </div>

        <p className="text-[11px] text-[#727B74] dark:text-stone-400 italic">
          Precios, servicios y condiciones de ejemplo; no verificados en directo.
          Tasas turísticas no incluidas. Fotografías de inspiración.
        </p>
      </section>

      {/* SECTION 3: AGENDA DE LISBOA (LÍNEA DE TIEMPO) */}
      <section className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-[#E6E2D8] dark:border-stone-800 pb-2.5">
          <div>
            <span className="text-[10px] font-semibold tracking-wider text-[#245544] dark:text-[#A7F3D0] uppercase block">
              POCO A POCO, DÍA A DÍA
            </span>
            <h2 className="font-serif text-xl sm:text-2xl font-normal text-[#203D34] dark:text-stone-100">
              Vuestros días en Lisboa
            </h2>
            <p className="text-xs text-[#727B74] dark:text-stone-400 mt-0.5">
              4 días · 16 actividades planificadas
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              alert("Podrás añadir un nuevo día completo al itinerario.")
            }
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#245544] dark:text-emerald-400 hover:underline cursor-pointer self-start sm:self-auto"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Añadir día</span>
          </button>
        </div>

        {/* Timeline Container */}
        <div className="flex flex-col gap-8 relative pl-2 sm:pl-0">
          {/* DÍA 1 */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 relative">
            {/* Timeline Left Date Indicator */}
            <div className="sm:w-24 shrink-0 flex sm:flex-col items-center sm:items-start gap-2 relative">
              <span className="text-[10px] font-bold tracking-widest text-[#727B74] uppercase">
                VIE
              </span>
              <span className="px-2.5 py-1 rounded-full bg-[#E8EFEA] dark:bg-stone-800 text-[11px] font-bold text-[#245544] dark:text-[#A7F3D0]">
                06 NOV
              </span>
            </div>

            {/* Timeline Content Card */}
            <div className="flex-1 p-5 rounded-[14px] bg-white dark:bg-stone-900 border border-[#DFE2DA] dark:border-stone-800 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#DFE2DA] dark:border-stone-800 pb-3">
                <div>
                  <h3 className="font-serif text-lg font-normal text-[#203D34] dark:text-stone-100">
                    Día 1 · Viernes, 6 de noviembre
                  </h3>
                  <p className="text-xs text-[#727B74] dark:text-stone-400">
                    Olá, Lisboa. La ciudad nos espera.
                  </p>
                </div>
              </div>

              <div className="flex flex-col divide-y divide-[#DFE2DA] dark:divide-stone-800/80">
                <div className="py-2.5 flex items-start gap-4">
                  <span className="w-12 text-xs font-semibold text-[#245544] dark:text-[#A7F3D0] shrink-0 pt-0.5">
                    11:46
                  </span>
                  <div>
                    <h4 className="text-xs sm:text-sm font-medium text-[#203D34] dark:text-stone-200">
                      Llegada a Lisboa y traslado al centro
                    </h4>
                    <p className="text-[11px] text-[#727B74] dark:text-stone-400">
                      Estação do Oriente · Av. Dom João II · 45 min
                    </p>
                  </div>
                </div>

                <div className="py-2.5 flex items-start gap-4">
                  <span className="w-12 text-xs font-semibold text-[#245544] dark:text-[#A7F3D0] shrink-0 pt-0.5">
                    12:45
                  </span>
                  <div>
                    <h4 className="text-xs sm:text-sm font-medium text-[#203D34] dark:text-stone-200">
                      Primera comida en el Mercado da Ribeira
                    </h4>
                    <p className="text-[11px] text-[#727B74] dark:text-stone-400">
                      Av. 24 de Julho, 49 · 1 h
                    </p>
                  </div>
                </div>

                <div className="py-2.5 flex items-start gap-4">
                  <span className="w-12 text-xs font-semibold text-[#245544] dark:text-[#A7F3D0] shrink-0 pt-0.5">
                    14:00
                  </span>
                  <div>
                    <h4 className="text-xs sm:text-sm font-medium text-[#203D34] dark:text-stone-200">
                      Dejar las maletas y hacer el check-in
                    </h4>
                    <p className="text-[11px] text-[#727B74] dark:text-stone-400">
                      Lisboa Pessoa Hotel · Rua da Oliveira ao Carmo, 8 · 1 h
                    </p>
                  </div>
                </div>

                <div className="py-2.5 flex items-start gap-4">
                  <span className="w-12 text-xs font-semibold text-[#245544] dark:text-[#A7F3D0] shrink-0 pt-0.5">
                    16:00
                  </span>
                  <div>
                    <h4 className="text-xs sm:text-sm font-medium text-[#203D34] dark:text-stone-200">
                      Paseo por Baixa y la Praça do Comércio
                    </h4>
                    <p className="text-[11px] text-[#727B74] dark:text-stone-400">
                      Praça do Comércio · 1 h 30 min · A pie, sin prisas
                    </p>
                  </div>
                </div>

                <div className="py-2.5 flex items-start gap-4">
                  <span className="w-12 text-xs font-semibold text-[#245544] dark:text-[#A7F3D0] shrink-0 pt-0.5">
                    19:00
                  </span>
                  <div>
                    <h4 className="text-xs sm:text-sm font-medium text-[#203D34] dark:text-stone-200">
                      Cena en familia por Chiado
                    </h4>
                    <p className="text-[11px] text-[#727B74] dark:text-stone-400">
                      Largo do Chiado · 1 h 30 min
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* DÍA 2 (con formulario de borrador de actividad según Figma) */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 relative">
            <div className="sm:w-24 shrink-0 flex sm:flex-col items-center sm:items-start gap-2 relative">
              <span className="text-[10px] font-bold tracking-widest text-[#727B74] uppercase">
                SÁB
              </span>
              <span className="px-2.5 py-1 rounded-full bg-[#E8EFEA] dark:bg-stone-800 text-[11px] font-bold text-[#245544] dark:text-[#A7F3D0]">
                07 NOV
              </span>
            </div>

            <div className="flex-1 p-5 rounded-[14px] bg-white dark:bg-stone-900 border border-[#DFE2DA] dark:border-stone-800 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#DFE2DA] dark:border-stone-800 pb-3">
                <div>
                  <h3 className="font-serif text-lg font-normal text-[#203D34] dark:text-stone-100">
                    Día 2 · Sábado, 7 de noviembre
                  </h3>
                  <p className="text-xs text-[#727B74] dark:text-stone-400">
                    Belém, entre descubrimientos y pasteles.
                  </p>
                </div>
                {!isActivityFormOpen && (
                  <button
                    type="button"
                    onClick={() => setIsActivityFormOpen(true)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#245544] dark:text-[#A7F3D0] hover:underline cursor-pointer"
                  >
                    + Añadir actividad
                  </button>
                )}
              </div>

              <div className="flex flex-col divide-y divide-[#DFE2DA] dark:divide-stone-800/80">
                <div className="py-2.5 flex items-start gap-4">
                  <span className="w-12 text-xs font-semibold text-[#245544] dark:text-[#A7F3D0] shrink-0 pt-0.5">
                    09:00
                  </span>
                  <div>
                    <h4 className="text-xs sm:text-sm font-medium text-[#203D34] dark:text-stone-200">
                      Desayuno y tranvía hacia Belém
                    </h4>
                    <p className="text-[11px] text-[#727B74] dark:text-stone-400">
                      Praça da Figueira · Tranvía 15E · 1 h
                    </p>
                  </div>
                </div>

                <div className="py-2.5 flex items-start gap-4">
                  <span className="w-12 text-xs font-semibold text-[#245544] dark:text-[#A7F3D0] shrink-0 pt-0.5">
                    10:00
                  </span>
                  <div>
                    <h4 className="text-xs sm:text-sm font-medium text-[#203D34] dark:text-stone-200">
                      Visitar el Monasterio de los Jerónimos
                    </h4>
                    <p className="text-[11px] text-[#727B74] dark:text-stone-400">
                      Praça do Império, 1400-206 · 1 h 30 min
                    </p>
                  </div>
                </div>

                <div className="py-2.5 flex items-start gap-4">
                  <span className="w-12 text-xs font-semibold text-[#245544] dark:text-[#A7F3D0] shrink-0 pt-0.5">
                    12:00
                  </span>
                  <div>
                    <h4 className="text-xs sm:text-sm font-medium text-[#203D34] dark:text-stone-200">
                      Una parada dulce en Pastéis de Belém
                    </h4>
                    <p className="text-[11px] text-[#727B74] dark:text-stone-400">
                      Rua de Belém, 84–92 · 45 min
                    </p>
                  </div>
                </div>

                <div className="py-2.5 flex items-start gap-4">
                  <span className="w-12 text-xs font-semibold text-[#245544] dark:text-[#A7F3D0] shrink-0 pt-0.5">
                    14:00
                  </span>
                  <div>
                    <h4 className="text-xs sm:text-sm font-medium text-[#203D34] dark:text-stone-200">
                      Jardines, río y Torre de Belém por fuera
                    </h4>
                    <p className="text-[11px] text-[#727B74] dark:text-stone-400">
                      Av. Brasília · 2 h · Paseo y tiempo libre
                    </p>
                  </div>
                </div>

                {/* Dynamic user added activities */}
                {day2ExtraActivities.map((act, index) => (
                  <div key={index} className="py-2.5 flex items-start gap-4">
                    <span className="w-12 text-xs font-semibold text-[#245544] dark:text-[#A7F3D0] shrink-0 pt-0.5">
                      {act.time}
                    </span>
                    <div>
                      <h4 className="text-xs sm:text-sm font-medium text-[#203D34] dark:text-stone-200">
                        {act.title}
                      </h4>
                      <p className="text-[11px] text-[#727B74] dark:text-stone-400">
                        {act.location}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Collapsible New Activity Draft Form directly from Figma */}
              {isActivityFormOpen && (
                <form
                  onSubmit={handleSaveActivity}
                  className="p-4 rounded-[10px] bg-[#FAF9F5] dark:bg-stone-800/60 border border-[#CCD2CA] dark:border-stone-700 space-y-3.5 mt-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#203D34] dark:text-stone-100">
                      Nueva actividad
                    </span>
                    <span className="text-[9px] font-semibold tracking-wider text-[#727B74] uppercase">
                      BORRADOR · SIN GUARDAR
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="sm:col-span-1 space-y-1">
                      <label className="text-[11px] font-medium text-[#4D5B54] dark:text-stone-300">
                        Hora
                      </label>
                      <input
                        type="text"
                        value={newActivityTime}
                        onChange={(e) => setNewActivityTime(e.target.value)}
                        placeholder="17:00"
                        className="w-full h-9 px-3 rounded-[6px] border border-[#CCD2CA] dark:border-stone-700 bg-white dark:bg-stone-900 text-xs"
                      />
                    </div>
                    <div className="sm:col-span-3 space-y-1">
                      <label className="text-[11px] font-medium text-[#4D5B54] dark:text-stone-300">
                        Título
                      </label>
                      <input
                        type="text"
                        required
                        value={newActivityTitle}
                        onChange={(e) => setNewActivityTitle(e.target.value)}
                        placeholder="Ej. Atardecer junto al Tajo"
                        className="w-full h-9 px-3 rounded-[6px] border border-[#CCD2CA] dark:border-stone-700 bg-white dark:bg-stone-900 text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-[#4D5B54] dark:text-stone-300">
                      Dirección y duración
                    </label>
                    <input
                      type="text"
                      value={newActivityLocation}
                      onChange={(e) => setNewActivityLocation(e.target.value)}
                      placeholder="Ej. Doca de Santo Amaro, Alcântara · 1 h"
                      className="w-full h-9 px-3 rounded-[6px] border border-[#CCD2CA] dark:border-stone-700 bg-white dark:bg-stone-900 text-xs"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsActivityFormOpen(false)}
                      className="h-8 px-3 text-xs rounded-[6px] cursor-pointer"
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      className="h-8 px-3 text-xs bg-[#245544] hover:bg-[#1b4335] text-white rounded-[6px] cursor-pointer font-medium"
                    >
                      Guardar actividad
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* DÍA 3 */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 relative">
            <div className="sm:w-24 shrink-0 flex sm:flex-col items-center sm:items-start gap-2 relative">
              <span className="text-[10px] font-bold tracking-widest text-[#727B74] uppercase">
                DOM
              </span>
              <span className="px-2.5 py-1 rounded-full bg-[#E8EFEA] dark:bg-stone-800 text-[11px] font-bold text-[#245544] dark:text-[#A7F3D0]">
                08 NOV
              </span>
            </div>

            <div className="flex-1 p-5 rounded-[14px] bg-white dark:bg-stone-900 border border-[#DFE2DA] dark:border-stone-800 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#DFE2DA] dark:border-stone-800 pb-3">
                <div>
                  <h3 className="font-serif text-lg font-normal text-[#203D34] dark:text-stone-100">
                    Día 3 · Domingo, 8 de noviembre
                  </h3>
                  <p className="text-xs text-[#727B74] dark:text-stone-400">
                    Del fondo del mar a los tejados de Alfama.
                  </p>
                </div>
              </div>

              <div className="flex flex-col divide-y divide-[#DFE2DA] dark:divide-stone-800/80">
                <div className="py-2.5 flex items-start gap-4">
                  <span className="w-12 text-xs font-semibold text-[#245544] dark:text-[#A7F3D0] shrink-0 pt-0.5">
                    09:30
                  </span>
                  <div>
                    <h4 className="text-xs sm:text-sm font-medium text-[#203D34] dark:text-stone-200">
                      Descubrir el Oceanário de Lisboa
                    </h4>
                    <p className="text-[11px] text-[#727B74] dark:text-stone-400">
                      Esplanada Dom Carlos I · Parque das Nações · 2 h 30 min
                    </p>
                  </div>
                </div>

                <div className="py-2.5 flex items-start gap-4">
                  <span className="w-12 text-xs font-semibold text-[#245544] dark:text-[#A7F3D0] shrink-0 pt-0.5">
                    12:30
                  </span>
                  <div>
                    <h4 className="text-xs sm:text-sm font-medium text-[#203D34] dark:text-stone-200">
                      Comida junto al río y vuelta al centro
                    </h4>
                    <p className="text-[11px] text-[#727B74] dark:text-stone-400">
                      Alameda dos Oceanos · 1 h 30 min
                    </p>
                  </div>
                </div>

                <div className="py-2.5 flex items-start gap-4">
                  <span className="w-12 text-xs font-semibold text-[#245544] dark:text-[#A7F3D0] shrink-0 pt-0.5">
                    15:00
                  </span>
                  <div>
                    <h4 className="text-xs sm:text-sm font-medium text-[#203D34] dark:text-stone-200">
                      Perderse por las calles de Alfama
                    </h4>
                    <p className="text-[11px] text-[#727B74] dark:text-stone-400">
                      Largo de São Miguel · 1 h 30 min · Paseo a pie
                    </p>
                  </div>
                </div>

                <div className="py-2.5 flex items-start gap-4">
                  <span className="w-12 text-xs font-semibold text-[#245544] dark:text-[#A7F3D0] shrink-0 pt-0.5">
                    16:30
                  </span>
                  <div>
                    <h4 className="text-xs sm:text-sm font-medium text-[#203D34] dark:text-stone-200">
                      La luz de la tarde en Santa Luzia
                    </h4>
                    <p className="text-[11px] text-[#727B74] dark:text-stone-400">
                      Miradouro de Santa Luzia · Largo de Santa Luzia · 45 min
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* DÍA 4 */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 relative">
            <div className="sm:w-24 shrink-0 flex sm:flex-col items-center sm:items-start gap-2 relative">
              <span className="text-[10px] font-bold tracking-widest text-[#727B74] uppercase">
                LUN
              </span>
              <span className="px-2.5 py-1 rounded-full bg-[#E8EFEA] dark:bg-stone-800 text-[11px] font-bold text-[#245544] dark:text-[#A7F3D0]">
                09 NOV
              </span>
            </div>

            <div className="flex-1 p-5 rounded-[14px] bg-white dark:bg-stone-900 border border-[#DFE2DA] dark:border-stone-800 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#DFE2DA] dark:border-stone-800 pb-3">
                <div>
                  <h3 className="font-serif text-lg font-normal text-[#203D34] dark:text-stone-100">
                    Día 4 · Lunes, 9 de noviembre
                  </h3>
                  <p className="text-xs text-[#727B74] dark:text-stone-400">
                    Un último café. Próxima parada: Sintra.
                  </p>
                </div>
              </div>

              <div className="flex flex-col divide-y divide-[#DFE2DA] dark:divide-stone-800/80">
                <div className="py-2.5 flex items-start gap-4">
                  <span className="w-12 text-xs font-semibold text-[#245544] dark:text-[#A7F3D0] shrink-0 pt-0.5">
                    08:30
                  </span>
                  <div>
                    <h4 className="text-xs sm:text-sm font-medium text-[#203D34] dark:text-stone-200">
                      Desayunar y despedirse de Lisboa
                    </h4>
                    <p className="text-[11px] text-[#727B74] dark:text-stone-400">
                      Lisboa Pessoa Hotel · Rua da Oliveira ao Carmo, 8 · 45 min
                    </p>
                  </div>
                </div>

                <div className="py-2.5 flex items-start gap-4">
                  <span className="w-12 text-xs font-semibold text-[#245544] dark:text-[#A7F3D0] shrink-0 pt-0.5">
                    09:30
                  </span>
                  <div>
                    <h4 className="text-xs sm:text-sm font-medium text-[#203D34] dark:text-stone-200">
                      Check-out y paseo hasta la estación
                    </h4>
                    <p className="text-[11px] text-[#727B74] dark:text-stone-400">
                      Hotel → Estação do Rossio · Rua 1º de Dezembro · 45 min
                    </p>
                  </div>
                </div>

                <div className="py-2.5 flex items-start gap-4">
                  <span className="w-12 text-xs font-semibold text-[#245544] dark:text-[#A7F3D0] shrink-0 pt-0.5">
                    10:41
                  </span>
                  <div>
                    <h4 className="text-xs sm:text-sm font-medium text-[#203D34] dark:text-stone-200">
                      Tren a Sintra · Continuamos el viaje
                    </h4>
                    <p className="text-[11px] text-[#727B74] dark:text-stone-400">
                      Estação do Rossio → Estação de Sintra · 40 min · Llegada 11:21
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER: CONTINUACIÓN DEL VIAJE (SINTRA) */}
      <div className="p-5 sm:p-6 rounded-[14px] bg-[#F5F2E9] dark:bg-stone-800/60 border border-[#DFE2DA] dark:border-stone-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-semibold tracking-wider text-[#727B74] dark:text-stone-400 uppercase block">
            LA HISTORIA CONTINÚA
          </span>
          <h3 className="font-serif text-xl sm:text-2xl font-normal text-[#203D34] dark:text-stone-100">
            Sintra · 9–10 nov · 1 noche
          </h3>
        </div>

        <button
          type="button"
          onClick={() => onSelectCity?.("sintra")}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-[8px] bg-[#245544] hover:bg-[#1b4335] text-white text-xs font-semibold transition-all cursor-pointer shadow-2xs"
        >
          <span>Ver Sintra</span>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
      </div>
    </div>
  )
}
