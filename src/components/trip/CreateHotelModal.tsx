import { useState, useEffect, useRef } from "react"
import type { EstadoSeleccionHotel, Hotel } from "@/types/database"
import { DEFAULT_HOTEL_IMAGE, MAX_COVER_SIZE_MB, tripService } from "@/lib/tripService"

export interface HotelFormData {
  id?: string
  nombre: string
  direccion: string
  estrellas: string
  detalles: string
  noches: number
  costo: number
  enlace_reserva: string
  foto: string
  estado_seleccion: EstadoSeleccionHotel
  notas: string
}

interface CreateHotelModalProps {
  isOpen: boolean
  cityName: string
  cityNights?: number
  travelersCount?: number
  initialData?: Hotel | null
  onClose: () => void
  onSave: (data: HotelFormData) => Promise<void> | void
}

export function CreateHotelModal({
  isOpen,
  cityName,
  cityNights = 3,
  travelersCount = 4,
  initialData,
  onClose,
  onSave,
}: CreateHotelModalProps) {
  const [nombre, setNombre] = useState("")
  const [direccion, setDireccion] = useState("")
  const [estrellas, setEstrellas] = useState("4 estrellas · Céntrico")
  const [detalles, setDetalles] = useState("Habitaciones familiares · Desayuno incluido")
  const [noches, setNoches] = useState(cityNights)
  const [costo, setCosto] = useState<number>(600)
  const [enlaceReserva, setEnlaceReserva] = useState("")
  const [foto, setFoto] = useState(DEFAULT_HOTEL_IMAGE)
  const [estadoSeleccion, setEstadoSeleccion] =
    useState<EstadoSeleccionHotel>("sin_nada")
  const [notas, setNotas] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // File upload state
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    if (initialData) {
      setNombre(initialData.nombre || "")
      setDireccion(initialData.direccion || "")
      setEstrellas(initialData.estrellas || "4 estrellas")
      setDetalles(initialData.detalles || "")
      setNoches(initialData.noches || cityNights)
      setCosto(Number(initialData.costo) || 600)
      setEnlaceReserva(initialData.enlace_reserva || "")
      setFoto(initialData.foto || DEFAULT_HOTEL_IMAGE)
      setEstadoSeleccion(initialData.estado_seleccion || "sin_nada")
      setNotas(initialData.notas || "")
    } else {
      setNombre("")
      setDireccion(`Centro de ${cityName}`)
      setEstrellas("4 estrellas · Excelente ubicación")
      setDetalles("Habitaciones familiares · Desayuno incluido")
      setNoches(cityNights)
      setCosto(600)
      setEnlaceReserva("")
      setFoto(DEFAULT_HOTEL_IMAGE)
      setEstadoSeleccion("sin_nada")
      setNotas("")
    }
    setUploadError(null)
  }, [initialData, cityName, cityNights, isOpen])

  if (!isOpen) return null

  const costPerNight = noches > 0 ? (costo / noches).toFixed(2) : "0.00"
  const costPerPerson =
    travelersCount > 0 ? (costo / travelersCount).toFixed(2) : "0.00"

  const handleSelectFile = async (file?: File) => {
    if (!file) return
    setUploadError(null)

    if (!file.type.startsWith("image/")) {
      setUploadError("Por favor selecciona un archivo de imagen válido.")
      return
    }

    const maxBytes = MAX_COVER_SIZE_MB * 1024 * 1024
    if (file.size > maxBytes) {
      setUploadError(`La imagen no debe superar los ${MAX_COVER_SIZE_MB} MB.`)
      return
    }

    setIsUploading(true)
    try {
      // Intentar subir a Supabase Storage si está configurado
      const res = await tripService.uploadCoverImage(file)
      if (res.url) {
        setFoto(res.url)
      } else {
        // Fallback local instantáneo con base64 Data URL
        const reader = new FileReader()
        reader.onload = (e) => {
          if (typeof e.target?.result === "string") {
            setFoto(e.target.result)
          }
        }
        reader.readAsDataURL(file)
      }
    } catch {
      // Fallback local en caso de error
      const reader = new FileReader()
      reader.onload = (e) => {
        if (typeof e.target?.result === "string") {
          setFoto(e.target.result)
        }
      }
      reader.readAsDataURL(file)
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await onSave({
        id: initialData?.id,
        nombre: nombre.trim() || `Alojamiento en ${cityName}`,
        direccion: direccion.trim() || `${cityName}`,
        estrellas: estrellas.trim() || "Alojamiento",
        detalles: detalles.trim() || "Habitación familiar",
        noches: Number(noches) || 1,
        costo: Number(costo) || 0,
        enlace_reserva: enlaceReserva.trim(),
        foto: foto.trim() || DEFAULT_HOTEL_IMAGE,
        estado_seleccion: estadoSeleccion,
        notas: notas.trim(),
      })
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-stone-900 border border-[#CCD2CA] dark:border-stone-700 shadow-2xl p-6 sm:p-7 space-y-5">
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 border-b border-[#E6E2D8] dark:border-stone-800 pb-4">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#245544] dark:text-emerald-400">
              Alojamiento en {cityName}
            </span>
            <h3 className="font-serif text-2xl text-[#203D34] dark:text-stone-100">
              {initialData ? "Editar alojamiento" : "Añadir alojamiento"}
            </h3>
            <p className="text-xs text-[#727B74] dark:text-stone-400">
              Guarda hoteles, apartamentos o villas y sube la foto del lugar.
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
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 1. Nombre del Hotel */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#203D34] dark:text-stone-200 block">
              Nombre del hotel o alojamiento *
            </label>
            <input
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Lisboa Pessoa Hotel, My Story Hotel, Apartamento Baixa..."
              className="w-full px-3.5 py-2 text-xs rounded-lg border border-[#CCD2CA] dark:border-stone-700 bg-white dark:bg-stone-800 text-[#203D34] dark:text-stone-100 placeholder:text-stone-400 focus:outline-hidden focus:ring-1 focus:ring-[#245544]"
            />
          </div>

          {/* 2. Dirección y Categoría */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#203D34] dark:text-stone-200 block">
                Zona / Ubicación
              </label>
              <input
                type="text"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                placeholder="Ej: Chiado · A 6 min de Rossio"
                className="w-full px-3.5 py-2 text-xs rounded-lg border border-[#CCD2CA] dark:border-stone-700 bg-white dark:bg-stone-800 text-[#203D34] dark:text-stone-100 placeholder:text-stone-400 focus:outline-hidden focus:ring-1 focus:ring-[#245544]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#203D34] dark:text-stone-200 block">
                Categoría / Atributo clave
              </label>
              <input
                type="text"
                value={estrellas}
                onChange={(e) => setEstrellas(e.target.value)}
                placeholder="Ej: 4 estrellas · Piscina interior"
                className="w-full px-3.5 py-2 text-xs rounded-lg border border-[#CCD2CA] dark:border-stone-700 bg-white dark:bg-stone-800 text-[#203D34] dark:text-stone-100 placeholder:text-stone-400 focus:outline-hidden focus:ring-1 focus:ring-[#245544]"
              />
            </div>
          </div>

          {/* 3. Servicios y Detalles */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#203D34] dark:text-stone-200 block">
              Servicios o habitaciones (etiquetas)
            </label>
            <input
              type="text"
              value={detalles}
              onChange={(e) => setDetalles(e.target.value)}
              placeholder="Ej: 2 hab. dobles · Desayuno incluido · Wi-Fi gratis"
              className="w-full px-3.5 py-2 text-xs rounded-lg border border-[#CCD2CA] dark:border-stone-700 bg-white dark:bg-stone-800 text-[#203D34] dark:text-stone-100 placeholder:text-stone-400 focus:outline-hidden focus:ring-1 focus:ring-[#245544]"
            />
          </div>

          {/* 4. Subir foto del alojamiento */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#203D34] dark:text-stone-200">
                Foto del alojamiento
              </label>
              {foto !== DEFAULT_HOTEL_IMAGE && (
                <button
                  type="button"
                  onClick={() => {
                    setFoto(DEFAULT_HOTEL_IMAGE)
                    setUploadError(null)
                  }}
                  className="text-[10px] text-[#245544] dark:text-[#A7F3D0] hover:underline cursor-pointer"
                >
                  Restaurar por defecto
                </button>
              )}
            </div>

            {/* Input oculto para archivo */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleSelectFile(e.target.files?.[0])}
            />

            {/* Dropzone estilo viajedetail/cabecero */}
            <div
              role="button"
              tabIndex={0}
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
                handleSelectFile(e.dataTransfer.files?.[0])
              }}
              className={`flex items-center gap-3.5 p-3 rounded-xl border-2 border-dashed transition-all cursor-pointer ${
                isDragging
                  ? "border-[#245544] bg-[#E8EFEA] dark:bg-emerald-950/30"
                  : "border-[#CCD2CA] dark:border-stone-700 hover:border-[#245544] hover:bg-[#F9F8F5] dark:hover:bg-stone-800/60 bg-white dark:bg-stone-800/30"
              }`}
            >
              <img
                src={foto || DEFAULT_HOTEL_IMAGE}
                alt="Vista previa alojamiento"
                className="w-16 h-12 rounded-lg object-cover shrink-0 border border-[#E6E2D8] dark:border-stone-700 shadow-2xs"
                onError={(e) => {
                  ;(e.target as HTMLImageElement).src = DEFAULT_HOTEL_IMAGE
                }}
              />
              <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                <span className="text-xs font-semibold text-[#203D34] dark:text-stone-100 flex items-center gap-1.5">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-[#245544] dark:text-emerald-400"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  {isUploading ? "Subiendo foto..." : "Subir foto del alojamiento"}
                </span>
                <span className="text-[11px] text-[#727B74] dark:text-stone-400 truncate">
                  Haz clic aquí o arrastra un archivo (PNG, JPG, máx. 5 MB)
                </span>
              </div>
              <span className="text-[11px] font-semibold text-[#245544] dark:text-[#A7F3D0] underline shrink-0 px-2 py-1 rounded bg-[#E8EFEA] dark:bg-emerald-950/50">
                Examinar
              </span>
            </div>

            {uploadError && (
              <p className="text-[11px] text-[#B23A26] dark:text-red-400 font-medium">
                {uploadError}
              </p>
            )}
          </div>

          {/* 5. Noches y Coste Total */}
          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-[#F9F8F5] dark:bg-stone-800/60 border border-[#DFE2DA] dark:border-stone-700">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#203D34] dark:text-stone-200 block">
                Noches de estancia
              </label>
              <input
                type="number"
                min="1"
                value={noches}
                onChange={(e) => setNoches(Math.max(1, Number(e.target.value)))}
                className="w-full px-3 py-1.5 font-bold text-sm rounded-lg border border-[#CCD2CA] dark:border-stone-700 bg-white dark:bg-stone-800 text-[#203D34] dark:text-stone-100 focus:outline-hidden focus:ring-1 focus:ring-[#245544]"
              />
              <span className="text-[10px] text-[#727B74] dark:text-stone-400">
                {costPerNight} € / noche
              </span>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#203D34] dark:text-stone-200 block">
                Coste total grupo (€) *
              </label>
              <input
                type="number"
                min="0"
                step="1"
                required
                value={costo}
                onChange={(e) => setCosto(Number(e.target.value))}
                className="w-full px-3 py-1.5 text-right font-bold text-sm rounded-lg border border-[#CCD2CA] dark:border-stone-700 bg-white dark:bg-stone-800 text-[#203D34] dark:text-stone-100 focus:outline-hidden focus:ring-1 focus:ring-[#245544]"
              />
              <span className="text-[10px] text-[#727B74] dark:text-stone-400 block text-right">
                {costPerPerson} € / persona
              </span>
            </div>
          </div>

          {/* 6. Enlace de Reserva */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#203D34] dark:text-stone-200 flex items-center justify-between">
              <span>Enlace hacia donde comprarlo / reservarlo (URL)</span>
              <span className="text-[10px] font-normal text-[#727B74] dark:text-stone-400">Opcional</span>
            </label>
            <div className="relative">
              <input
                type="url"
                value={enlaceReserva}
                onChange={(e) => setEnlaceReserva(e.target.value)}
                placeholder="Ej: https://www.booking.com/..., https://www.lisboapessoahotel.com/..."
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

          {/* 7. Prioridad / Selección */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#203D34] dark:text-stone-200 block">
              Estado de la opción *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {/* Sin nada */}
              <button
                type="button"
                onClick={() => setEstadoSeleccion("sin_nada")}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                  estadoSeleccion === "sin_nada"
                    ? "border-[#203D34] bg-stone-100 dark:bg-stone-800 dark:border-stone-500 shadow-xs ring-1 ring-[#203D34]"
                    : "border-[#DFE2DA] dark:border-stone-800 hover:border-stone-400 bg-white dark:bg-stone-900"
                }`}
              >
                <div className="flex items-center gap-1.5 font-semibold text-xs text-[#4D5B54] dark:text-stone-300">
                  <span>Sin nada</span>
                </div>
                <p className="text-[10px] text-[#727B74] dark:text-stone-400 leading-tight">
                  En estudio.
                </p>
              </button>

              {/* Preferido (Corazón) */}
              <button
                type="button"
                onClick={() => setEstadoSeleccion("preferido")}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                  estadoSeleccion === "preferido"
                    ? "border-rose-500 bg-rose-50/70 dark:bg-rose-950/40 dark:border-rose-400 shadow-xs ring-1 ring-rose-500"
                    : "border-[#DFE2DA] dark:border-stone-800 hover:border-stone-400 bg-white dark:bg-stone-900"
                }`}
              >
                <div className="flex items-center gap-1.5 font-semibold text-xs text-rose-700 dark:text-rose-300">
                  <svg className="w-3.5 h-3.5 fill-rose-500" viewBox="0 0 24 24">
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                  </svg>
                  <span>Preferido</span>
                </div>
                <p className="text-[10px] text-rose-800/70 dark:text-rose-300/70 leading-tight">
                  Favorito.
                </p>
              </button>

              {/* Elegido */}
              <button
                type="button"
                onClick={() => setEstadoSeleccion("elegido")}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
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
                  Confirmado.
                </p>
              </button>
            </div>
          </div>

          {/* 8. Notas */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#203D34] dark:text-stone-200 block">
              Notas adicionales (opcional)
            </label>
            <input
              type="text"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Ej: Cancelación gratuita hasta 48 h antes, check-in a las 15:00..."
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
              {isSubmitting ? "Guardando..." : initialData ? "Actualizar alojamiento" : "Guardar alojamiento"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
