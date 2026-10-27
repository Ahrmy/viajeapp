import { useState, useEffect } from "react"
import type {
  TipoTransporte,
  EstadoSeleccionTransporte,
  Transporte,
} from "@/types/database"

export interface TransportFormData {
  id?: string
  tipo: TipoTransporte
  nombre_linea: string
  origen: string
  destino: string
  hora_salida: string
  hora_llegada: string
  duracion: string
  costo: number
  estado_seleccion: EstadoSeleccionTransporte
  notas: string
  enlace_compra?: string | null
  fecha_hora?: string | null
  escalas?: number | null
}

export interface CreateTransportModalProps {
  isOpen: boolean
  cityName?: string
  titleBadge?: string
  modalTitle?: string
  modalSubtitle?: string
  travelersCount?: number
  initialData?: Transporte | null
  onClose: () => void
  onSave: (data: TransportFormData) => Promise<void> | void
}

const TRANSPORT_TYPES: Array<{
  id: TipoTransporte
  label: string
  icon: (className?: string) => React.ReactNode
}> = [
  {
    id: "tren",
    label: "Tren",
    icon: (cls = "w-4 h-4") => (
      <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="3" width="16" height="16" rx="2" />
        <path d="M4 11h16" />
        <path d="M12 3v8" />
        <path d="m8 19-2 3" />
        <path d="m16 19 2 3" />
        <circle cx="8" cy="15" r="1" />
        <circle cx="16" cy="15" r="1" />
      </svg>
    ),
  },
  {
    id: "bus",
    label: "Autobús",
    icon: (cls = "w-4 h-4") => (
      <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 6v6" />
        <path d="M16 6v6" />
        <rect x="4" y="3" width="16" height="15" rx="3" />
        <path d="M4 11h16" />
        <path d="m6 18-1 3" />
        <path d="m18 18 1 3" />
      </svg>
    ),
  },
  {
    id: "avion",
    label: "Avión",
    icon: (cls = "w-4 h-4") => (
      <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.3c.4-.2.6-.6.5-1.1z" />
      </svg>
    ),
  },
  {
    id: "ferry",
    label: "Ferry / Barco",
    icon: (cls = "w-4 h-4") => (
      <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 20a4 4 0 0 0 4-2 4 4 0 0 1 4-2 4 4 0 0 0 4 2 4 4 0 0 0 4 2 4 4 0 0 0 4-2" />
        <path d="M4 14l1.5-6h13L20 14" />
        <path d="M12 3v5" />
        <path d="M8 8h8" />
      </svg>
    ),
  },
  {
    id: "coche",
    label: "Coche / Coche compartido",
    icon: (cls = "w-4 h-4") => (
      <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9C2.1 11.2 2 11.6 2 12v4c0 .6.4 1 1 1h2" />
        <circle cx="7" cy="17" r="2" />
        <path d="M9 17h6" />
        <circle cx="17" cy="17" r="2" />
      </svg>
    ),
  },
  {
    id: "otro",
    label: "Otro",
    icon: (cls = "w-4 h-4") => (
      <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    ),
  },
]

export function getTransportIcon(tipo: TipoTransporte, className = "w-4 h-4") {
  const item = TRANSPORT_TYPES.find((t) => t.id === tipo)
  if (item) return item.icon(className)
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  )
}

export function CreateTransportModal({
  isOpen,
  cityName = "",
  titleBadge,
  modalTitle,
  modalSubtitle,
  travelersCount = 4,
  initialData,
  onClose,
  onSave,
}: CreateTransportModalProps) {
  const [tipo, setTipo] = useState<TipoTransporte>("tren")
  const [nombreLinea, setNombreLinea] = useState("")
  const [origen, setOrigen] = useState("")
  const [destino, setDestino] = useState(cityName)
  const [horaSalida, setHoraSalida] = useState("09:00")
  const [horaLlegada, setHoraLlegada] = useState("12:00")
  const [duracion, setDuracion] = useState("3 h")
  const [costo, setCosto] = useState<number>(80)
  const [estadoSeleccion, setEstadoSeleccion] =
    useState<EstadoSeleccionTransporte>("sin_nada")
  const [notas, setNotas] = useState("")
  const [enlaceCompra, setEnlaceCompra] = useState("")
  const [fechaHora, setFechaHora] = useState("")
  const [tieneEscalas, setTieneEscalas] = useState(false)
  const [numEscalas, setNumEscalas] = useState<number>(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Populate data when editing or opening
  useEffect(() => {
    if (initialData) {
      setTipo(initialData.tipo || "tren")
      setNombreLinea(initialData.nombre_linea || "")
      setOrigen(initialData.origen || "")
      setDestino(initialData.destino || cityName)
      setHoraSalida(initialData.hora_salida || "09:00")
      setHoraLlegada(initialData.hora_llegada || "12:00")
      setDuracion(initialData.duracion || "3 h")
      setCosto(Number(initialData.costo) || 80)
      setEstadoSeleccion(initialData.estado_seleccion || "sin_nada")
      setNotas(initialData.notas || "")
      setEnlaceCompra(initialData.enlace_compra || "")
      setFechaHora(initialData.fecha_hora || "")
      const esc = Number(initialData.escalas) || 0
      setTieneEscalas(esc > 0)
      setNumEscalas(esc > 0 ? esc : 1)
    } else {
      setTipo("tren")
      setNombreLinea("")
      setOrigen("")
      setDestino(cityName)
      setHoraSalida("09:00")
      setHoraLlegada("12:00")
      setDuracion("3 h")
      setCosto(80)
      setEstadoSeleccion("sin_nada")
      setNotas("")
      setEnlaceCompra("")
      setFechaHora("")
      setTieneEscalas(false)
      setNumEscalas(1)
    }
  }, [initialData, cityName, isOpen])

  if (!isOpen) return null

  const costPerPerson =
    travelersCount > 0 && costo > 0 ? (costo / travelersCount).toFixed(2) : "0.00"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await onSave({
        id: initialData?.id,
        tipo,
        nombre_linea: nombreLinea.trim() || `${tipo.toUpperCase()} hacia ${destino || cityName || "Destino"}`,
        origen: origen.trim() || "Origen",
        destino: destino.trim() || cityName || "Destino",
        hora_salida: horaSalida,
        hora_llegada: horaLlegada,
        duracion: duracion.trim() || "Duración variable",
        costo: Number(costo) || 0,
        estado_seleccion: estadoSeleccion,
        notas: notas.trim(),
        enlace_compra: enlaceCompra.trim() || null,
        fecha_hora: fechaHora.trim() || null,
        escalas: tieneEscalas ? numEscalas : 0,
      })
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-stone-900 border border-[#CCD2CA] dark:border-stone-700 shadow-2xl p-6 sm:p-7 space-y-6">
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 border-b border-[#E6E2D8] dark:border-stone-800 pb-4">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#245544] dark:text-emerald-400">
              {titleBadge || (cityName ? `Transporte hacia ${cityName}` : "Transportes principales")}
            </span>
            <h3 className="font-serif text-2xl text-[#203D34] dark:text-stone-100">
              {modalTitle || (initialData ? "Editar transporte" : "Añadir transporte")}
            </h3>
            <p className="text-xs text-[#727B74] dark:text-stone-400">
              {modalSubtitle || "Compara opciones de llegada (tren, bus, avión, ferry) y define su prioridad."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 1. Selector de Tipo de Transporte */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#203D34] dark:text-stone-200 block">
              Tipo de transporte *
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {TRANSPORT_TYPES.map((t) => {
                const isSelected = tipo === t.id
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTipo(t.id)}
                    className={`flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#245544] text-white border-[#245544] shadow-xs"
                        : "bg-[#F7F5F0] dark:bg-stone-800 border-[#DFE2DA] dark:border-stone-700 text-[#4D5B54] dark:text-stone-300 hover:border-[#245544]/50"
                    }`}
                  >
                    {t.icon("w-5 h-5")}
                    <span className="text-[11px] font-medium leading-tight">
                      {t.label.split(" ")[0]}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* 2. Nombre del Servicio / Compañía */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#203D34] dark:text-stone-200 block">
              Compañía o nombre de la línea *
            </label>
            <input
              type="text"
              required
              value={nombreLinea}
              onChange={(e) => setNombreLinea(e.target.value)}
              placeholder="Ej: Comboios de Portugal · Intercidades, Iberia, Rede Expressos, Ferry..."
              className="w-full px-3.5 py-2 text-xs rounded-lg border border-[#CCD2CA] dark:border-stone-700 bg-white dark:bg-stone-800 text-[#203D34] dark:text-stone-100 placeholder:text-stone-400 focus:outline-hidden focus:ring-1 focus:ring-[#245544]"
            />
          </div>

          {/* 3. Origen y Destino */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#203D34] dark:text-stone-200 block">
                Origen
              </label>
              <input
                type="text"
                value={origen}
                onChange={(e) => setOrigen(e.target.value)}
                placeholder="Ej: Faro, Madrid, Lisboa Rossio..."
                className="w-full px-3.5 py-2 text-xs rounded-lg border border-[#CCD2CA] dark:border-stone-700 bg-white dark:bg-stone-800 text-[#203D34] dark:text-stone-100 placeholder:text-stone-400 focus:outline-hidden focus:ring-1 focus:ring-[#245544]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#203D34] dark:text-stone-200 block">
                Destino
              </label>
              <input
                type="text"
                value={destino}
                onChange={(e) => setDestino(e.target.value)}
                placeholder={cityName || "Ej: Lisboa, Oporto..."}
                className="w-full px-3.5 py-2 text-xs rounded-lg border border-[#CCD2CA] dark:border-stone-700 bg-white dark:bg-stone-800 text-[#203D34] dark:text-stone-100 placeholder:text-stone-400 focus:outline-hidden focus:ring-1 focus:ring-[#245544]"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-semibold text-[#203D34] dark:text-stone-200 flex items-center justify-between">
                <span>Fecha o tipo de trayecto</span>
                <span className="text-[10px] font-normal text-[#727B74] dark:text-stone-400">Opcional</span>
              </label>
              <input
                type="text"
                value={fechaHora}
                onChange={(e) => setFechaHora(e.target.value)}
                placeholder="Ej: Ida · 6 nov, Vuelta · 13 nov 2026..."
                className="w-full px-3.5 py-2 text-xs rounded-lg border border-[#CCD2CA] dark:border-stone-700 bg-white dark:bg-stone-800 text-[#203D34] dark:text-stone-100 placeholder:text-stone-400 focus:outline-hidden focus:ring-1 focus:ring-[#245544]"
              />
            </div>
          </div>

          {/* 4. Horarios y Duración */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#203D34] dark:text-stone-200 block">
                Salida
              </label>
              <input
                type="text"
                value={horaSalida}
                onChange={(e) => setHoraSalida(e.target.value)}
                placeholder="08:22"
                className="w-full px-3 py-2 text-xs rounded-lg border border-[#CCD2CA] dark:border-stone-700 bg-white dark:bg-stone-800 text-[#203D34] dark:text-stone-100 placeholder:text-stone-400 focus:outline-hidden focus:ring-1 focus:ring-[#245544]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#203D34] dark:text-stone-200 block">
                Llegada
              </label>
              <input
                type="text"
                value={horaLlegada}
                onChange={(e) => setHoraLlegada(e.target.value)}
                placeholder="11:46"
                className="w-full px-3 py-2 text-xs rounded-lg border border-[#CCD2CA] dark:border-stone-700 bg-white dark:bg-stone-800 text-[#203D34] dark:text-stone-100 placeholder:text-stone-400 focus:outline-hidden focus:ring-1 focus:ring-[#245544]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#203D34] dark:text-stone-200 block">
                Duración
              </label>
              <input
                type="text"
                value={duracion}
                onChange={(e) => setDuracion(e.target.value)}
                placeholder="3 h 24 min"
                className="w-full px-3 py-2 text-xs rounded-lg border border-[#CCD2CA] dark:border-stone-700 bg-white dark:bg-stone-800 text-[#203D34] dark:text-stone-100 placeholder:text-stone-400 focus:outline-hidden focus:ring-1 focus:ring-[#245544]"
              />
            </div>
          </div>

          {/* Escalas */}
          <div className="space-y-2.5 p-3.5 rounded-xl bg-[#F9F8F5] dark:bg-stone-800/40 border border-[#DFE2DA] dark:border-stone-700">
            <div className="flex items-center justify-between gap-3">
              <div>
                <label className="text-xs font-semibold text-[#203D34] dark:text-stone-200 block">
                  ¿Tiene escalas?
                </label>
                <span className="text-[10px] text-[#727B74] dark:text-stone-400">
                  Indica si el trayecto es directo o con paradas
                </span>
              </div>
              <div className="flex items-center gap-1 bg-white dark:bg-stone-900 p-1 rounded-lg border border-[#DFE2DA] dark:border-stone-700">
                <button
                  type="button"
                  onClick={() => setTieneEscalas(false)}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    !tieneEscalas
                      ? "bg-[#245544] text-white shadow-2xs"
                      : "text-stone-600 dark:text-stone-300 hover:text-[#203D34]"
                  }`}
                >
                  Directo
                </button>
                <button
                  type="button"
                  onClick={() => setTieneEscalas(true)}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    tieneEscalas
                      ? "bg-[#245544] text-white shadow-2xs"
                      : "text-stone-600 dark:text-stone-300 hover:text-[#203D34]"
                  }`}
                >
                  Con escalas
                </button>
              </div>
            </div>

            {tieneEscalas && (
              <div className="pt-2.5 border-t border-[#DFE2DA] dark:border-stone-700 flex items-center justify-between gap-3 animate-in fade-in duration-150">
                <span className="text-xs text-[#203D34] dark:text-stone-200 font-medium">
                  ¿Cuántas escalas tiene?
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={numEscalas}
                    onChange={(e) =>
                      setNumEscalas(Math.max(1, parseInt(e.target.value) || 1))
                    }
                    className="w-16 px-2.5 py-1 text-center font-bold text-xs rounded-lg border border-[#CCD2CA] dark:border-stone-700 bg-white dark:bg-stone-800 text-[#203D34] dark:text-stone-100 focus:outline-hidden focus:ring-1 focus:ring-[#245544]"
                  />
                  <span className="text-xs text-[#4D5B54] dark:text-stone-300">
                    {numEscalas === 1 ? "escala" : "escalas"}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* 5. Coste y Desglose */}
          <div className="space-y-2 p-3.5 rounded-xl bg-[#F9F8F5] dark:bg-stone-800/60 border border-[#DFE2DA] dark:border-stone-700">
            <div className="flex items-center justify-between gap-3">
              <label className="text-xs font-semibold text-[#203D34] dark:text-stone-200">
                Coste total para el grupo (€)
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={costo}
                onChange={(e) => setCosto(Number(e.target.value))}
                className="w-28 px-3 py-1.5 text-right font-bold text-sm rounded-lg border border-[#CCD2CA] dark:border-stone-700 bg-white dark:bg-stone-800 text-[#203D34] dark:text-stone-100 focus:outline-hidden focus:ring-1 focus:ring-[#245544]"
              />
            </div>
            <div className="flex items-center justify-between text-xs text-[#727B74] dark:text-stone-400 pt-1 border-t border-[#DFE2DA] dark:border-stone-700">
              <span>{travelersCount} viajeros</span>
              <span className="font-semibold text-[#245544] dark:text-[#A7F3D0]">
                {costPerPerson} € / persona
              </span>
            </div>
          </div>

          {/* 6. Selección de Prioridad (Preferido, Elegido o Sin nada) */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#203D34] dark:text-stone-200 block">
              Estado de la opción *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {/* Sin nada */}
              <button
                type="button"
                onClick={() => setEstadoSeleccion("sin_nada")}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                  estadoSeleccion === "sin_nada"
                    ? "border-[#203D34] bg-stone-100 dark:bg-stone-800 dark:border-stone-500 shadow-xs ring-1 ring-[#203D34]"
                    : "border-[#DFE2DA] dark:border-stone-800 hover:border-stone-400 bg-white dark:bg-stone-900"
                }`}
              >
                <div className="flex items-center gap-1.5 font-semibold text-xs text-[#4D5B54] dark:text-stone-300">
                  <span className="w-2.5 h-2.5 rounded-full border border-stone-400 flex items-center justify-center">
                    {estadoSeleccion === "sin_nada" && (
                      <span className="w-1.5 h-1.5 rounded-full bg-stone-600 dark:bg-stone-300" />
                    )}
                  </span>
                  <span>Sin nada</span>
                </div>
                <p className="text-[10px] text-[#727B74] dark:text-stone-400 leading-tight">
                  Opción en estudio, sin selección fija.
                </p>
              </button>

              {/* Preferido */}
              <button
                type="button"
                onClick={() => setEstadoSeleccion("preferido")}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                  estadoSeleccion === "preferido"
                    ? "border-amber-500 bg-amber-50/60 dark:bg-amber-950/40 dark:border-amber-400 shadow-xs ring-1 ring-amber-500"
                    : "border-[#DFE2DA] dark:border-stone-800 hover:border-stone-400 bg-white dark:bg-stone-900"
                }`}
              >
                <div className="flex items-center gap-1.5 font-semibold text-xs text-amber-800 dark:text-amber-300">
                  <span>⭐</span>
                  <span>Preferido</span>
                </div>
                <p className="text-[10px] text-amber-900/70 dark:text-amber-300/70 leading-tight">
                  La opción favorita para la familia.
                </p>
              </button>

              {/* Elegido */}
              <button
                type="button"
                onClick={() => setEstadoSeleccion("elegido")}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                  estadoSeleccion === "elegido"
                    ? "border-[#245544] bg-[#E8EFEA] dark:bg-emerald-950/50 dark:border-emerald-400 shadow-xs ring-1 ring-[#245544]"
                    : "border-[#DFE2DA] dark:border-stone-800 hover:border-stone-400 bg-white dark:bg-stone-900"
                }`}
              >
                <div className="flex items-center gap-1.5 font-semibold text-xs text-[#245544] dark:text-[#A7F3D0]">
                  <span>✅</span>
                  <span>Elegido</span>
                </div>
                <p className="text-[10px] text-[#245544]/80 dark:text-[#A7F3D0]/80 leading-tight">
                  Opción definitiva o confirmada.
                </p>
              </button>
            </div>
          </div>

          {/* 7. Enlace hacia donde comprarlo */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#203D34] dark:text-stone-200 flex items-center justify-between">
              <span>Enlace hacia donde comprarlo (URL)</span>
              <span className="text-[10px] font-normal text-[#727B74] dark:text-stone-400">Opcional</span>
            </label>
            <div className="relative">
              <input
                type="url"
                value={enlaceCompra}
                onChange={(e) => setEnlaceCompra(e.target.value)}
                placeholder="Ej: https://www.cp.pt, https://www.renfe.com, https://..."
                className="w-full pl-9 pr-3.5 py-2 text-xs rounded-lg border border-[#CCD2CA] dark:border-stone-700 bg-white dark:bg-stone-800 text-[#203D34] dark:text-stone-100 placeholder:text-stone-400 focus:outline-hidden focus:ring-1 focus:ring-[#245544]"
              />
              <div className="absolute left-3 top-2.5 text-[#727B74] dark:text-stone-400 pointer-events-none">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
              </div>
            </div>
          </div>

          {/* 8. Notas Adicionales */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#203D34] dark:text-stone-200 block">
              Notas o detalles (opcional)
            </label>
            <input
              type="text"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Ej: 2.ª clase, asientos juntos, equipaje incluido, comprar online con antelación..."
              className="w-full px-3.5 py-2 text-xs rounded-lg border border-[#CCD2CA] dark:border-stone-700 bg-white dark:bg-stone-800 text-[#203D34] dark:text-stone-100 placeholder:text-stone-400 focus:outline-hidden focus:ring-1 focus:ring-[#245544]"
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E6E2D8] dark:border-stone-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-medium rounded-lg text-[#4D5B54] dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-semibold rounded-lg bg-[#245544] text-white hover:bg-[#1b4335] disabled:opacity-60 shadow-xs transition-colors cursor-pointer"
            >
              {isSubmitting ? "Guardando..." : initialData ? "Actualizar transporte" : "Guardar transporte"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
