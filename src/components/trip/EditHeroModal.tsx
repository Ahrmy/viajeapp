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
  title: string
  subtitle: string
  image: string
  locationBadge?: string
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
  const [dates, setDates] = useState(
    currentData?.dates || (mode === "create" ? "" : "6–13 nov 2026")
  )
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

  useEffect(() => {
    if (isOpen) {
      if (mode === "create") {
        setTripName(currentData?.tripName || "")
        setDates(currentData?.dates || "")
        setTitle(currentData?.title || "Una nueva historia por escribir.")
        setSubtitle(
          currentData?.subtitle ||
          "Explorando rincones y creando recuerdos juntos."
        )
        setImage("")
        setLocationBadge(currentData?.locationBadge || "")
      } else {
        setTripName(currentData?.tripName || "Portugal en familia")
        setDates(currentData?.dates || "6–13 nov 2026")
        setTitle(currentData?.title || "")
        setSubtitle(currentData?.subtitle || "")
        setImage(currentData?.image || "")
        setLocationBadge(currentData?.locationBadge || "Lisboa, Portugal")
      }
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

    await onSave({
      tripName:
        tripName.trim() ||
        (mode === "create" ? "Nuevo viaje familiar" : "Portugal en familia"),
      dates:
        dates.trim() ||
        (mode === "create" ? "Fechas por definir" : "6–13 nov 2026"),
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
            {dates && (
              <span className="px-2 py-0.5 rounded-full bg-white/90 text-[9px] font-medium text-[#203D34]">
                {dates}
              </span>
            )}
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
                    setDates("6–13 nov 2026")
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
                    setDates("12–19 jul 2026")
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

          {/* Fechas del viaje */}
          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor="trip-dates"
              className="text-xs font-semibold text-[#203D34] dark:text-stone-200 flex items-center justify-between"
            >
              <span>Fechas del viaje</span>
              <span className="text-[10px] font-normal text-[#727B74] dark:text-stone-400">
                Opcional
              </span>
            </Label>
            <Input
              id="trip-dates"
              value={dates}
              onChange={(e) => setDates(e.target.value)}
              placeholder="Ej. 12–19 jul 2026 o Verano 2026"
              className="h-10 text-xs rounded-[8px] border-[#CCD2CA] dark:border-stone-700 bg-white dark:bg-stone-800"
            />
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
