import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  tripService,
  DEFAULT_DESTINATION_IMAGE,
  MAX_COVER_SIZE_MB,
} from "@/lib/tripService"

export interface DestinationFormData {
  id?: string
  name: string
  days: number
  image: string
  title: string
  subtitle: string
}

interface CreateDestinationModalProps {
  isOpen: boolean
  onClose: () => void
  tripName?: string
  initialData?: Partial<DestinationFormData>
  mode?: "create" | "edit"
  onSave: (data: DestinationFormData) => void | Promise<void>
}

export function CreateDestinationModal({
  isOpen,
  onClose,
  tripName = "Viaje familiar",
  initialData,
  mode = "create",
  onSave,
}: CreateDestinationModalProps) {
  const [cityName, setCityName] = useState(initialData?.name || "")
  const [days, setDays] = useState<number | string>(initialData?.days ?? 2)
  const [title, setTitle] = useState(initialData?.title || "")
  const [subtitle, setSubtitle] = useState(initialData?.subtitle || "")
  const [image, setImage] = useState(
    initialData?.image || DEFAULT_DESTINATION_IMAGE
  )
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [nameError, setNameError] = useState<string | null>(null)
  const [daysError, setDaysError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Reset or initialize state when opening modal
  useEffect(() => {
    if (isOpen) {
      if (mode === "create") {
        setCityName(initialData?.name || "")
        setDays(initialData?.days ?? 2)
        setTitle(initialData?.title || "")
        setSubtitle(initialData?.subtitle || "")
        setImage(initialData?.image || DEFAULT_DESTINATION_IMAGE)
      } else {
        setCityName(initialData?.name || "")
        setDays(initialData?.days ?? 2)
        setTitle(initialData?.title || "")
        setSubtitle(initialData?.subtitle || "")
        setImage(initialData?.image || DEFAULT_DESTINATION_IMAGE)
      }
      setPendingFile(null)
      setPreviewUrl(null)
      setUploadError(null)
      setNameError(null)
      setDaysError(null)
      setIsUploading(false)
    }
  }, [isOpen, initialData, mode])

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  if (!isOpen) return null

  const displayedImage = previewUrl || image || DEFAULT_DESTINATION_IMAGE
  const isDefaultImage =
    !previewUrl && (!image || image === DEFAULT_DESTINATION_IMAGE)

  const numDays =
    typeof days === "number" ? days : parseInt(String(days).trim(), 10) || 1

  const defaultTitlePlaceholder = cityName.trim()
    ? `${numDays} ${numDays === 1 ? "día" : "días"} al ritmo de ${cityName.trim()}.`
    : "Tres días al ritmo de este destino."

  const defaultSubtitlePlaceholder = cityName.trim()
    ? `Miradores, rincones auténticos y momentos para disfrutar juntos en ${cityName.trim()}.`
    : "Miradores, rincones auténticos y momentos para disfrutar juntos."

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
    setImage(DEFAULT_DESTINATION_IMAGE)
    setUploadError(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isUploading) return

    const trimmedName = cityName.trim()
    if (!trimmedName) {
      setNameError("El nombre del destino o ciudad es obligatorio.")
      return
    }

    if (isNaN(numDays) || numDays < 1) {
      setDaysError("Debes indicar al menos 1 día de estancia.")
      return
    }

    let finalImage = image || DEFAULT_DESTINATION_IMAGE
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

    const finalTitle = title.trim() || defaultTitlePlaceholder
    const finalSubtitle = subtitle.trim() || defaultSubtitlePlaceholder

    await onSave({
      id: initialData?.id,
      name: trimmedName,
      days: numDays,
      image: finalImage,
      title: finalTitle,
      subtitle: finalSubtitle,
    })

    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-[16px] bg-white dark:bg-stone-900 border border-[#CCD2CA] dark:border-stone-700 shadow-2xl p-6 sm:p-7 flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-[#E6E2D8] dark:border-stone-800 pb-3">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-full bg-[#E8EFEA] text-[#245544] dark:bg-stone-800 dark:text-[#A7F3D0]">
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
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </span>
              <h2 className="font-serif text-xl sm:text-2xl font-normal text-[#203D34] dark:text-stone-100">
                {mode === "create"
                  ? "¿Y si añadimos otro lugar?"
                  : `Editar parada: ${cityName}`}
              </h2>
            </div>
            <p className="text-xs text-[#727B74] dark:text-stone-400">
              {mode === "create"
                ? `Añade una nueva ciudad o parada a vuestro recorrido por ${tripName}.`
                : "Actualiza los días, titular y portada de esta parada."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            ✕
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Nombre de la ciudad (Obligatorio) */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="destination-name"
                className="text-xs font-semibold text-[#203D34] dark:text-stone-200 flex items-center gap-1.5"
              >
                <span>Nombre de la ciudad o destino</span>
                <span className="text-[#B23A26] dark:text-red-400">*</span>
              </Label>
              <span className="text-[10px] font-semibold text-[#245544] dark:text-[#A7F3D0] bg-[#E8EFEA] dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                Obligatorio
              </span>
            </div>
            <Input
              id="destination-name"
              required
              value={cityName}
              onChange={(e) => {
                setCityName(e.target.value)
                setNameError(null)
              }}
              placeholder="Ej. Oporto, Sintra, Fornells, Coímbra..."
              className={`h-10 text-xs font-medium rounded-[8px] border-[#CCD2CA] dark:border-stone-700 bg-white dark:bg-stone-900 ${
                nameError ? "border-[#B23A26] focus-visible:ring-[#B23A26]" : ""
              }`}
              autoFocus
            />
            {nameError && (
              <p className="text-[11px] text-[#B23A26] dark:text-red-400 font-medium">
                {nameError}
              </p>
            )}
          </div>

          {/* Días de estancia (Obligatorio con Stepper interactivo) */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="destination-days"
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
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <span>Días en esta ciudad</span>
                <span className="text-[#B23A26] dark:text-red-400">*</span>
              </Label>
              <span className="text-[11px] text-[#727B74] dark:text-stone-400 font-medium">
                {numDays} {numDays === 1 ? "día" : "días"} (
                {Math.max(1, numDays - 1)}{" "}
                {numDays - 1 === 1 ? "noche" : "noches"})
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const current = Number(days) || 1
                  if (current > 1) {
                    setDays(current - 1)
                    setDaysError(null)
                  }
                }}
                disabled={Number(days) <= 1}
                className="h-10 w-10 shrink-0 flex items-center justify-center rounded-[8px] border border-[#CCD2CA] dark:border-stone-700 bg-white dark:bg-stone-800 text-[#203D34] dark:text-stone-200 hover:bg-[#F2EFE9] dark:hover:bg-stone-700 disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-base transition-colors cursor-pointer"
                aria-label="Restar día"
              >
                −
              </button>

              <Input
                id="destination-days"
                type="number"
                min={1}
                max={60}
                required
                value={days}
                onChange={(e) => {
                  setDays(e.target.value)
                  setDaysError(null)
                }}
                className={`h-10 text-xs font-semibold text-center rounded-[8px] border-[#CCD2CA] dark:border-stone-700 bg-white dark:bg-stone-900 text-[#203D34] dark:text-stone-100 ${
                  daysError
                    ? "border-[#B23A26] focus-visible:ring-[#B23A26]"
                    : ""
                }`}
              />

              <button
                type="button"
                onClick={() => {
                  const current = Number(days) || 0
                  setDays(current + 1)
                  setDaysError(null)
                }}
                className="h-10 w-10 shrink-0 flex items-center justify-center rounded-[8px] border border-[#CCD2CA] dark:border-stone-700 bg-white dark:bg-stone-800 text-[#203D34] dark:text-stone-200 hover:bg-[#F2EFE9] dark:hover:bg-stone-700 font-semibold text-base transition-colors cursor-pointer"
                aria-label="Añadir día"
              >
                +
              </button>
            </div>

            {daysError && (
              <p className="text-[11px] text-[#B23A26] dark:text-red-400 font-medium">
                {daysError}
              </p>
            )}
          </div>

          {/* Imagen de la ciudad (Default: la ilustración adjunta) */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-[#203D34] dark:text-stone-200 flex items-center gap-1.5">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="text-[#245544] dark:text-[#A7F3D0]"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                <span>Foto o ilustración de la ciudad</span>
              </Label>
              {!isDefaultImage && (
                <button
                  type="button"
                  onClick={resetToDefault}
                  className="text-[11px] text-[#245544] dark:text-[#A7F3D0] hover:underline font-medium cursor-pointer"
                >
                  Usar ilustración por defecto
                </button>
              )}
            </div>

            {/* Vista previa en vivo con titular y subtítulo superpuestos */}
            <div className="relative h-44 w-full rounded-[12px] overflow-hidden border border-[#CCD2CA] dark:border-stone-700 shadow-xs group">
              <img
                src={displayedImage}
                alt="Vista previa de la ciudad"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
              />
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(23, 47, 39, 0.15) 0%, rgba(23, 47, 39, 0.85) 100%)",
                }}
              />

              {/* Badge de destino */}
              <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/90 dark:bg-stone-900/90 backdrop-blur-xs text-[10px] font-semibold text-[#203D34] dark:text-stone-100 shadow-2xs">
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-[#245544] dark:text-[#A7F3D0]"
                >
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span>{cityName.trim() || "Destino"}</span>
                <span>·</span>
                <span>
                  {numDays} {numDays === 1 ? "día" : "días"}
                </span>
              </div>

              {/* Titular y subtítulo superpuestos */}
              <div className="absolute bottom-3 left-3 right-3 z-10 text-white">
                <p className="font-serif text-sm sm:text-base font-normal leading-tight line-clamp-1 drop-shadow-xs">
                  {title.trim() || defaultTitlePlaceholder}
                </p>
                <p className="text-[10px] sm:text-[11px] text-white/85 line-clamp-1 mt-0.5 font-normal">
                  {subtitle.trim() || defaultSubtitlePlaceholder}
                </p>
              </div>

              {/* Botón flotante para cambiar foto */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute top-3 right-3 z-10 px-2.5 py-1 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-xs text-[10px] font-medium text-white shadow-xs transition-colors cursor-pointer flex items-center gap-1"
              >
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <span>Cambiar foto</span>
              </button>
            </div>

            {/* Zona Dropzone opcional */}
            <div
              onDragOver={(e) => {
                e.preventDefault()
                setIsDragging(true)
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault()
                setIsDragging(false)
                const file = e.dataTransfer.files?.[0]
                selectFile(file)
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`p-3 rounded-[8px] border-2 border-dashed cursor-pointer transition-colors flex items-center justify-between gap-3 text-xs ${
                isDragging
                  ? "border-[#245544] bg-[#E8EFEA]/40 dark:bg-stone-800"
                  : "border-[#CCD2CA] dark:border-stone-700 bg-stone-50/60 dark:bg-stone-800/40 hover:bg-[#E8EFEA]/20"
              }`}
            >
              <div className="flex items-center gap-2">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="text-[#727B74]"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <span className="text-[11px] text-[#4D5B54] dark:text-stone-300">
                  {pendingFile
                    ? `Seleccionada: ${pendingFile.name}`
                    : "Haz clic o arrastra para subir otra imagen (máx 5MB)"}
                </span>
              </div>
              <span className="text-[10px] font-semibold text-[#245544] dark:text-[#A7F3D0] underline">
                Examinar
              </span>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => selectFile(e.target.files?.[0])}
            />

            {uploadError && (
              <p className="text-[11px] text-[#B23A26] dark:text-red-400 font-medium">
                {uploadError}
              </p>
            )}
          </div>

          {/* Titular sobre la foto del cabecero */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="destination-title"
                className="text-xs font-semibold text-[#203D34] dark:text-stone-200"
              >
                Titular sobre la foto del cabecero
              </Label>
              <span className="text-[10px] text-[#727B74] dark:text-stone-400">
                Página de la ciudad
              </span>
            </div>
            <Input
              id="destination-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={defaultTitlePlaceholder}
              className="h-10 text-xs rounded-[8px] border-[#CCD2CA] dark:border-stone-700 bg-white dark:bg-stone-900"
            />
          </div>

          {/* Subtítulo descriptivo sobre la foto */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="destination-subtitle"
                className="text-xs font-semibold text-[#203D34] dark:text-stone-200"
              >
                Subtítulo sobre la foto del cabecero
              </Label>
              <span className="text-[10px] text-[#727B74] dark:text-stone-400">
                Página de la ciudad
              </span>
            </div>
            <Input
              id="destination-subtitle"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder={defaultSubtitlePlaceholder}
              className="h-10 text-xs rounded-[8px] border-[#CCD2CA] dark:border-stone-700 bg-white dark:bg-stone-900"
            />
          </div>

          {/* Botones de acción */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E6E2D8] dark:border-stone-800">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isUploading}
              className="h-10 px-4 text-xs rounded-[8px] border-[#CCD2CA] dark:border-stone-700 cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isUploading}
              className="h-10 px-5 text-xs bg-[#245544] hover:bg-[#1b4335] text-white rounded-[8px] font-semibold cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              {isUploading ? (
                <span>Guardando...</span>
              ) : mode === "create" ? (
                <span>Añadir al itinerario</span>
              ) : (
                <span>Guardar cambios</span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
