import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  tripService,
  DEFAULT_COVER_IMAGE,
  MAX_COVER_SIZE_MB,
} from "@/lib/tripService"

export interface HeroData {
  tripName?: string
  dates?: string
  startDate?: string
  endDate?: string
  travelersCount?: number
  title: string
  subtitle: string
  image: string
  locationBadge?: string
}

export function getTodayString(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function formatDateRange(
  start?: string | null,
  end?: string | null,
  fallback = "Fechas por definir"
): string {
  if (!start) return fallback
  try {
    const sParts = start.split("-").map(Number)
    if (sParts.length !== 3 || isNaN(sParts[0])) return fallback
    const s = new Date(sParts[0], sParts[1] - 1, sParts[2])

    const months = [
      "ene", "feb", "mar", "abr", "may", "jun",
      "jul", "ago", "sep", "oct", "nov", "dic",
    ]

    if (end) {
      const eParts = end.split("-").map(Number)
      if (eParts.length === 3 && !isNaN(eParts[0])) {
        const e = new Date(eParts[0], eParts[1] - 1, eParts[2])
        if (!isNaN(e.getTime())) {
          if (s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear()) {
            return `${s.getDate()}–${e.getDate()} ${months[s.getMonth()]} ${s.getFullYear()}`
          }
          return `${s.getDate()} ${months[s.getMonth()]} – ${e.getDate()} ${months[e.getMonth()]} ${e.getFullYear()}`
        }
      }
    }
    return `${s.getDate()} ${months[s.getMonth()]} ${s.getFullYear()}`
  } catch {
    return fallback
  }
}

export function calculateNights(start: string, end: string): number {
  if (!start || !end) return 0
  const sParts = start.split("-").map(Number)
  const eParts = end.split("-").map(Number)
  if (sParts.length !== 3 || eParts.length !== 3) return 0
  const s = new Date(sParts[0], sParts[1] - 1, sParts[2])
  const e = new Date(eParts[0], eParts[1] - 1, eParts[2])
  const diffTime = e.getTime() - s.getTime()
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))
  return diffDays > 0 ? diffDays : 0
}

interface EditHeroModalProps {
  isOpen: boolean
  onClose: () => void
  currentData?: Partial<HeroData>
  onSave: (newData: HeroData) => void | Promise<void>
  mode?: "edit" | "create"
}

export function EditHeroModal({
  isOpen,
  onClose,
  currentData,
  onSave,
  mode = "edit",
}: EditHeroModalProps) {
  const [tripName, setTripName] = useState(
    currentData?.tripName || (mode === "create" ? "" : "Portugal en familia")
  )
  const [startDate, setStartDate] = useState(currentData?.startDate || "")
  const [endDate, setEndDate] = useState(currentData?.endDate || "")
  const [dateError, setDateError] = useState<string | null>(null)
  const [travelersCount, setTravelersCount] = useState<number | string>(
    currentData?.travelersCount ?? (mode === "create" ? 2 : 4)
  )
  const [travelersError, setTravelersError] = useState<string | null>(null)
  const [title, setTitle] = useState(
    currentData?.title ||
    (mode === "create"
      ? "Una nueva historia por escribir."
      : "Hay viajes que ya se sienten cerca.")
  )
  const [subtitle, setSubtitle] = useState(
    currentData?.subtitle ||
    (mode === "create"
      ? "Explorando rincones y creando recuerdos juntos."
      : "Lisboa, Sintra y Oporto. Un camino para disfrutar juntos.")
  )
  // URL ya guardada (portada actual) — vacía = usar la portada por defecto
  const [image, setImage] = useState(currentData?.image || "")
  // Archivo elegido por el usuario, se sube al guardar
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [locationBadge, setLocationBadge] = useState(
    currentData?.locationBadge || (mode === "create" ? "" : "Lisboa, Portugal")
  )

  const today = getTodayString()

  useEffect(() => {
    if (isOpen) {
      if (mode === "create") {
        setTripName(currentData?.tripName || "")
        setStartDate(currentData?.startDate || "")
        setEndDate(currentData?.endDate || "")
        setTravelersCount(currentData?.travelersCount ?? 2)
        setTitle(currentData?.title || "Una nueva historia por escribir.")
        setSubtitle(
          currentData?.subtitle ||
          "Explorando rincones y creando recuerdos juntos."
        )
        setImage("")
        setLocationBadge(currentData?.locationBadge || "")
      } else {
        setTripName(currentData?.tripName || "Portugal en familia")
        setStartDate(currentData?.startDate || "")
        setEndDate(currentData?.endDate || "")
        setTravelersCount(currentData?.travelersCount ?? 4)
        setTitle(currentData?.title || "")
        setSubtitle(currentData?.subtitle || "")
        setImage(currentData?.image || "")
        setLocationBadge(currentData?.locationBadge || "Lisboa, Portugal")
      }
      setDateError(null)
      setTravelersError(null)
      setPendingFile(null)
      setPreviewUrl(null)
      setUploadError(null)
      setIsUploading(false)
    }
  }, [isOpen, currentData, mode])

  // Liberar la URL temporal de la vista previa
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const handleStartDateChange = (val: string) => {
    setStartDate(val)
    setDateError(null)
    if (val && val < today) {
      setDateError("La fecha de inicio no puede ser anterior a la fecha actual.")
    } else if (endDate && val && endDate < val) {
      setEndDate(val)
    }
  }

  const handleEndDateChange = (val: string) => {
    setEndDate(val)
    setDateError(null)
    if (val && val < today) {
      setDateError("La fecha de fin no puede ser anterior a la fecha actual.")
    } else if (startDate && val && val < startDate) {
      setDateError("La fecha de fin no puede ser anterior a la fecha de inicio.")
    }
  }

  if (!isOpen) return null

  const displayedImage = previewUrl || image || DEFAULT_COVER_IMAGE
  const isDefaultImage = !previewUrl && (!image || image === DEFAULT_COVER_IMAGE)

  const selectFile = (file: File | undefined) => {
    if (!file) return
    if (!file.type.startsWith("image/")) {
      setUploadError("El archivo debe ser una imagen (JPG, PNG, WEBP...).")
      return
    }
    if (file.size > MAX_COVER_SIZE_MB * 1024 * 1024) {
      setUploadError(`La imagen no puede superar ${MAX_COVER_SIZE_MB} MB.`)
      return
    }
    setUploadError(null)
    setPendingFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  const resetToDefault = () => {
    setPendingFile(null)
    setPreviewUrl(null)
    setImage("")
    setUploadError(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isUploading) return

    // Validar número de viajeros (obligatorio)
    const numTravelers =
      typeof travelersCount === "number"
        ? travelersCount
        : parseInt(String(travelersCount).trim(), 10)

    if (isNaN(numTravelers) || numTravelers < 1) {
      setTravelersError("El número de viajeros es obligatorio (mínimo 1).")
      return
    }

    // Validar que las fechas no sean anteriores a hoy
    if (startDate && startDate < today) {
      setDateError("La fecha de inicio no puede ser anterior a la fecha actual.")
      return
    }
    if (endDate && endDate < today) {
      setDateError("La fecha de fin no puede ser anterior a la fecha actual.")
      return
    }
    if (startDate && endDate && endDate < startDate) {
      setDateError("La fecha de fin no puede ser anterior a la fecha de inicio.")
      return
    }

    let finalImage = image || DEFAULT_COVER_IMAGE
    if (pendingFile) {
      setIsUploading(true)
      const res = await tripService.uploadCoverImage(pendingFile)
      setIsUploading(false)
      if (!res.url) {
        setUploadError(res.error ?? "No se pudo subir la imagen.")
        return
      }
      finalImage = res.url
    }

    const calculatedDates = startDate
      ? formatDateRange(startDate, endDate)
      : mode === "create"
        ? "Fechas por definir"
        : (currentData?.dates || "Fechas por definir")

    await onSave({
      tripName:
        tripName.trim() ||
        (mode === "create" ? "Nuevo viaje familiar" : "Portugal en familia"),
      dates: calculatedDates,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      travelersCount: numTravelers,
      title:
        title.trim() ||
        (mode === "create"
          ? "Una nueva historia por escribir."
          : "Hay viajes que ya se sienten cerca."),
      subtitle:
        subtitle.trim() ||
        (mode === "create"
          ? "Explorando rincones y creando recuerdos juntos."
          : "Un camino para disfrutar juntos."),
      image: finalImage,
      locationBadge:
        locationBadge.trim() ||
        (mode === "create" ? tripName.trim() || "Destino" : "Lisboa, Portugal"),
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-[16px] bg-white dark:bg-stone-900 border border-[#CCD2CA] dark:border-stone-700 shadow-2xl p-6 sm:p-7 flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-full bg-[#E8EFEA] text-[#245544] dark:bg-stone-800 dark:text-[#A7F3D0]">
                {mode === "create" ? (
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                ) : (
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                    <path d="m15 5 4 4" />
                  </svg>
                )}
              </span>
              <h3 className="font-serif text-xl sm:text-2xl font-normal text-[#203D34] dark:text-stone-100">
                {mode === "create"
                  ? "Crear nuevo viaje"
                  : "Editar viaje y cabecero"}
              </h3>
            </div>
            <p className="text-xs text-[#727B74] dark:text-stone-400">
              {mode === "create"
                ? "Diseña tu próxima aventura familiar con su portada, fechas y mensaje de bienvenida."
                : "Personaliza el nombre de tu viaje, la fotografía y los textos de bienvenida visibles para todo el grupo."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Live Preview Card */}
        <div className="relative h-[120px] w-full rounded-[10px] overflow-hidden border border-[#DFE2DA] dark:border-stone-800 bg-stone-100 dark:bg-stone-800 shrink-0">
          <img
            src={displayedImage}
            alt="Vista previa"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

          {/* Location badge and Dates in preview */}
          <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5 flex-wrap">
            <span className="px-2 py-0.5 rounded-full bg-white/90 text-[9px] font-medium text-[#203D34]">
              {locationBadge || (mode === "create" ? "Ubicación" : "Lisboa, Portugal")}
            </span>
            {startDate ? (
              <span className="px-2 py-0.5 rounded-full bg-white/90 text-[9px] font-medium text-[#203D34]">
                {formatDateRange(startDate, endDate)}
              </span>
            ) : currentData?.dates ? (
              <span className="px-2 py-0.5 rounded-full bg-white/90 text-[9px] font-medium text-[#203D34]">
                {currentData.dates}
              </span>
            ) : null}
          </div>

          {/* Trip name tag & Texts in preview */}
          <div className="absolute bottom-2.5 left-3 right-3 text-white">
            <span className="text-[9px] font-semibold tracking-wider text-[#A7F3D0] uppercase block">
              {tripName || (mode === "create" ? "Nuevo viaje familiar" : "Portugal en familia")}
            </span>
            <p className="font-serif text-sm font-normal truncate">
              {title || (mode === "create" ? "Título de bienvenida" : "Título del cabecero")}
            </p>
            <p className="text-[10px] text-white/80 truncate">
              {subtitle || "Subtítulo descriptivo"}
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Plantillas sugeridas en modo crear */}
          {mode === "create" && (
            <div className="flex flex-col gap-1.5 p-3 rounded-[10px] bg-[#E8EFEA]/60 dark:bg-emerald-950/30 border border-[#CCD2CA] dark:border-stone-700">
              <span className="text-[11px] font-semibold text-[#245544] dark:text-[#A7F3D0] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#245544] dark:bg-emerald-400" />
                <span>Inspiración rápida de viaje:</span>
              </span>
              <div className="flex flex-wrap items-center gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setTripName("Portugal en familia")
                    setStartDate("2026-11-06")
                    setEndDate("2026-11-13")
                    setTitle("Hay viajes que ya se sienten cerca.")
                    setSubtitle("Lisboa, Sintra y Oporto. Un camino para disfrutar juntos.")
                    setLocationBadge("Lisboa, Portugal")
                  }}
                  className="px-2.5 py-1 rounded-full text-xs font-medium border border-[#CCD2CA] dark:border-stone-700 bg-white dark:bg-stone-800 text-[#4D5B54] dark:text-stone-300 hover:border-[#245544] transition-all cursor-pointer shadow-2xs flex items-center gap-1"
                >
                  <span>🇵🇹</span>
                  <span>Portugal</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTripName("Un verano en Menorca")
                    setStartDate("2027-07-12")
                    setEndDate("2027-07-19")
                    setTitle("Calas turquesas y brisa mediterránea.")
                    setSubtitle("Ciutadella, Fornells y senderos mágicos en familia.")
                    setLocationBadge("Menorca, España")
                  }}
                  className="px-2.5 py-1 rounded-full text-xs font-medium border border-[#CCD2CA] dark:border-stone-700 bg-white dark:bg-stone-800 text-[#4D5B54] dark:text-stone-300 hover:border-[#245544] transition-all cursor-pointer shadow-2xs flex items-center gap-1"
                >
                  <span>🏖️</span>
                  <span>Menorca</span>
                </button>
              </div>
            </div>
          )}

          {/* Nombre del viaje */}
          <div className="flex flex-col gap-1.5 p-3 rounded-[10px] bg-[#F7F5F0] dark:bg-stone-800/60 border border-[#E6E2D8] dark:border-stone-700">
            <Label
              htmlFor="trip-name"
              className="text-xs font-semibold text-[#203D34] dark:text-stone-200 flex items-center justify-between"
            >
              <span>Nombre del viaje</span>
              <span className="text-[10px] font-normal text-[#245544] dark:text-[#A7F3D0]">
                {mode === "create" ? "Requerido" : "Título principal de Travesía"}
              </span>
            </Label>
            <Input
              id="trip-name"
              required
              value={tripName}
              onChange={(e) => setTripName(e.target.value)}
              placeholder={
                mode === "create"
                  ? "Ej. Menorca en verano, Aventura en los Alpes..."
                  : "Ej. Portugal en familia"
              }
              className="h-10 text-xs font-medium rounded-[8px] border-[#CCD2CA] dark:border-stone-700 bg-white dark:bg-stone-900"
              autoFocus={mode === "create"}
            />
          </div>

          {/* Número de viajeros (Obligatorio) */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="trip-travelers-count"
                className="text-xs font-semibold text-[#203D34] dark:text-stone-200 flex items-center gap-1.5"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="text-[#245544] dark:text-[#A7F3D0]"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                <span>Número de viajeros</span>
                <span className="text-[#B23A26] dark:text-red-400">*</span>
              </Label>
              <span className="text-[10px] font-semibold text-[#245544] dark:text-[#A7F3D0] bg-[#E8EFEA] dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                Obligatorio
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const current = Number(travelersCount) || 1
                  if (current > 1) {
                    setTravelersCount(current - 1)
                    setTravelersError(null)
                  }
                }}
                disabled={Number(travelersCount) <= 1}
                className="h-10 w-10 shrink-0 flex items-center justify-center rounded-[8px] border border-[#CCD2CA] dark:border-stone-700 bg-white dark:bg-stone-800 text-[#203D34] dark:text-stone-200 hover:bg-[#F2EFE9] dark:hover:bg-stone-700 disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-base transition-colors cursor-pointer"
                aria-label="Restar viajero"
              >
                −
              </button>

              <Input
                id="trip-travelers-count"
                type="number"
                min={1}
                max={99}
                required
                value={travelersCount}
                onChange={(e) => {
                  setTravelersCount(e.target.value)
                  setTravelersError(null)
                }}
                placeholder="Ej. 4"
                className={`h-10 text-xs font-semibold text-center rounded-[8px] border-[#CCD2CA] dark:border-stone-700 bg-white dark:bg-stone-900 text-[#203D34] dark:text-stone-100 ${
                  travelersError
                    ? "border-[#B23A26] focus-visible:ring-[#B23A26]"
                    : ""
                }`}
              />

              <button
                type="button"
                onClick={() => {
                  const current = Number(travelersCount) || 0
                  setTravelersCount(current + 1)
                  setTravelersError(null)
                }}
                className="h-10 w-10 shrink-0 flex items-center justify-center rounded-[8px] border border-[#CCD2CA] dark:border-stone-700 bg-white dark:bg-stone-800 text-[#203D34] dark:text-stone-200 hover:bg-[#F2EFE9] dark:hover:bg-stone-700 font-semibold text-base transition-colors cursor-pointer"
                aria-label="Añadir viajero"
              >
                +
              </button>
            </div>

            {travelersError ? (
              <p className="text-[11px] text-[#B23A26] dark:text-red-400 font-medium">
                {travelersError}
              </p>
            ) : (
              <p className="text-[11px] text-[#727B74] dark:text-stone-400">
                Total de personas que participan en este viaje familiar.
              </p>
            )}
          </div>

          {/* Fechas del viaje (Inicio y Fin con selector interactivo) */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-[#203D34] dark:text-stone-200 flex items-center gap-1.5">
                <span>Fechas del viaje</span>
              </Label>
              <div className="flex items-center gap-2">
                {(startDate || endDate) && (
                  <button
                    type="button"
                    onClick={() => {
                      setStartDate("")
                      setEndDate("")
                      setDateError(null)
                    }}
                    className="text-[11px] font-medium text-[#B23A26] dark:text-red-400 hover:underline cursor-pointer"
                  >
                    Borrar fechas
                  </button>
                )}
                <span className="text-[10px] font-normal text-[#727B74] dark:text-stone-400">
                  Opcional
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Fecha de inicio */}
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="trip-start-date"
                  className="text-[11px] font-medium text-[#4D5B54] dark:text-stone-300"
                >
                  Fecha de inicio
                </label>
                <Input
                  type="date"
                  id="trip-start-date"
                  min={today}
                  value={startDate}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                  className="h-10 text-xs rounded-[8px] border-[#CCD2CA] dark:border-stone-700 bg-white dark:bg-stone-800 text-[#203D34] dark:text-stone-100"
                />
              </div>

              {/* Fecha de fin */}
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="trip-end-date"
                  className="text-[11px] font-medium text-[#4D5B54] dark:text-stone-300"
                >
                  Fecha de fin
                </label>
                <Input
                  type="date"
                  id="trip-end-date"
                  min={startDate && startDate > today ? startDate : today}
                  value={endDate}
                  onChange={(e) => handleEndDateChange(e.target.value)}
                  className="h-10 text-xs rounded-[8px] border-[#CCD2CA] dark:border-stone-700 bg-white dark:bg-stone-800 text-[#203D34] dark:text-stone-100"
                />
              </div>
            </div>

            {/* Error de validación de fechas */}
            {dateError && (
              <p className="text-[11px] text-[#B23A26] dark:text-red-400 font-medium">
                {dateError}
              </p>
            )}

            {/* Vista previa amigable del rango */}
            {startDate && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-[8px] bg-[#E8EFEA]/80 dark:bg-emerald-950/40 text-[#245544] dark:text-[#A7F3D0] text-[11px] font-medium">
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
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <span>
                  {formatDateRange(startDate, endDate)}
                  {startDate && endDate && calculateNights(startDate, endDate) > 0
                    ? ` · ${calculateNights(startDate, endDate)} ${
                        calculateNights(startDate, endDate) === 1
                          ? "noche"
                          : "noches"
                      }`
                    : ""}
                </span>
              </div>
            )}
          </div>

          {/* Título de bienvenida */}
          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor="hero-title"
              className="text-xs font-semibold text-[#203D34] dark:text-stone-200"
            >
              Título de bienvenida sobre la foto
            </Label>
            <Input
              id="hero-title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. Hay viajes que ya se sienten cerca."
              className="h-10 text-xs rounded-[8px] border-[#CCD2CA] dark:border-stone-700 bg-white dark:bg-stone-800"
            />
          </div>

          {/* Subtítulo descriptivo */}
          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor="hero-subtitle"
              className="text-xs font-semibold text-[#203D34] dark:text-stone-200"
            >
              Subtítulo sobre la foto
            </Label>
            <Input
              id="hero-subtitle"
              required
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Ej. Un camino para disfrutar juntos de cada instante."
              className="h-10 text-xs rounded-[8px] border-[#CCD2CA] dark:border-stone-700 bg-white dark:bg-stone-800"
            />
          </div>

          {/* Ubicación / Badge */}
          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor="hero-badge"
              className="text-xs font-semibold text-[#203D34] dark:text-stone-200"
            >
              Etiqueta de ubicación
            </Label>
            <Input
              id="hero-badge"
              value={locationBadge}
              onChange={(e) => setLocationBadge(e.target.value)}
              placeholder="Ej. Menorca, España"
              className="h-10 text-xs rounded-[8px] border-[#CCD2CA] dark:border-stone-700 bg-white dark:bg-stone-800"
            />
          </div>

          {/* Fotografía de portada (subida de archivo) */}
          <div className="flex flex-col gap-2">
            <Label
              htmlFor="hero-image-file"
              className="text-xs font-semibold text-[#203D34] dark:text-stone-200 flex items-center justify-between"
            >
              <span>Fotografía de cabecero</span>
              <span className="text-[10px] font-normal text-[#727B74] dark:text-stone-400">
                Opcional · máx. {MAX_COVER_SIZE_MB} MB
              </span>
            </Label>

            <input
              ref={fileInputRef}
              id="hero-image-file"
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => selectFile(e.target.files?.[0])}
            />

            <div
              role="button"
              tabIndex={0}
              id="hero-image-dropzone"
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  fileInputRef.current?.click()
                }
              }}
              onDragOver={(e) => {
                e.preventDefault()
                setIsDragging(true)
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault()
                setIsDragging(false)
                selectFile(e.dataTransfer.files?.[0])
              }}
              className={`group flex items-center gap-3 p-3 rounded-[10px] border-2 border-dashed transition-all cursor-pointer ${
                isDragging
                  ? "border-[#245544] bg-[#E8EFEA] dark:bg-emerald-950/30"
                  : "border-[#CCD2CA] dark:border-stone-700 hover:border-[#245544] hover:bg-[#F7F5F0] dark:hover:bg-stone-800/60"
              }`}
            >
              <img
                src={displayedImage}
                alt="Portada seleccionada"
                className="w-16 h-12 rounded-[6px] object-cover shrink-0 border border-[#E6E2D8] dark:border-stone-700"
              />
              <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                <span className="text-xs font-semibold text-[#203D34] dark:text-stone-100 flex items-center gap-1.5">
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-[#245544] dark:text-[#A7F3D0] shrink-0"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  {pendingFile ? "Cambiar imagen" : "Subir imagen"}
                </span>
                <span className="text-[11px] text-[#727B74] dark:text-stone-400 truncate">
                  {pendingFile
                    ? pendingFile.name
                    : isDefaultImage
                      ? "Usando la portada por defecto · arrastra o haz clic"
                      : "Portada actual · arrastra o haz clic para cambiarla"}
                </span>
              </div>
              {!isDefaultImage && (
                <button
                  type="button"
                  id="hero-image-reset"
                  onClick={(e) => {
                    e.stopPropagation()
                    resetToDefault()
                  }}
                  title="Usar la portada por defecto"
                  className="px-2 py-1 rounded-[6px] text-[11px] font-medium text-[#4D5B54] dark:text-stone-300 hover:bg-white dark:hover:bg-stone-700 border border-transparent hover:border-[#E6E2D8] dark:hover:border-stone-600 transition-colors cursor-pointer shrink-0"
                >
                  Quitar
                </button>
              )}
            </div>

            {uploadError && (
              <p className="text-[11px] text-[#B23A26] dark:text-red-300">
                {uploadError}
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#DFE2DA] dark:border-stone-800">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-10 px-4 text-xs rounded-[8px] cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isUploading}
              className="h-10 px-4 text-xs bg-[#245544] hover:bg-[#1b4335] text-white rounded-[8px] font-semibold cursor-pointer shadow-xs disabled:opacity-70"
            >
              {isUploading
                ? "Subiendo imagen..."
                : mode === "create"
                  ? "Crear viaje"
                  : "Guardar cambios"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
