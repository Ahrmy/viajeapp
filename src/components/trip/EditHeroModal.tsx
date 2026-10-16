import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

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
  onSave: (newData: HeroData) => void
  mode?: "edit" | "create"
}

const PRESET_PHOTOS = [
  {
    id: "lisboa",
    name: "Lisboa Panorámica",
    url: "/images/lisboa-panoramica.png",
  },
  {
    id: "costa-brava",
    name: "Costa Brava",
    url: "/images/family-costa-brava.png",
  },
  {
    id: "sintra",
    name: "Sintra",
    url: "/images/destino-sintra.png",
  },
  {
    id: "oporto",
    name: "Oporto",
    url: "/images/destino-oporto.png",
  },
]

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
  const [image, setImage] = useState(
    currentData?.image ||
      (mode === "create" ? PRESET_PHOTOS[1].url : PRESET_PHOTOS[0].url)
  )
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
        setImage(currentData?.image || PRESET_PHOTOS[1].url)
        setLocationBadge(currentData?.locationBadge || "")
      } else {
        setTripName(currentData?.tripName || "Portugal en familia")
        setDates(currentData?.dates || "6–13 nov 2026")
        setTitle(currentData?.title || "")
        setSubtitle(currentData?.subtitle || "")
        setImage(currentData?.image || PRESET_PHOTOS[0].url)
        setLocationBadge(currentData?.locationBadge || "Lisboa, Portugal")
      }
    }
  }, [isOpen, currentData, mode])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
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
      image: image.trim() || PRESET_PHOTOS[0].url,
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
            src={image || "/images/lisboa-panoramica.png"}
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

          {/* Fotografía de portada */}
          <div className="flex flex-col gap-2">
            <Label className="text-xs font-semibold text-[#203D34] dark:text-stone-200">
              Fotografía de cabecero
            </Label>

            {/* Presets */}
            <div className="grid grid-cols-4 gap-2">
              {PRESET_PHOTOS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setImage(preset.url)}
                  className={`relative h-14 rounded-[8px] overflow-hidden border-2 transition-all cursor-pointer ${
                    image === preset.url
                      ? "border-[#245544] ring-2 ring-[#245544]/20 scale-102"
                      : "border-transparent opacity-75 hover:opacity-100"
                  }`}
                >
                  <img
                    src={preset.url}
                    alt={preset.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20" />
                  <span className="absolute bottom-1 left-1 right-1 text-[9px] text-white font-medium truncate drop-shadow-xs">
                    {preset.name}
                  </span>
                </button>
              ))}
            </div>

            {/* O URL personalizada */}
            <Input
              id="hero-image"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="O escribe una ruta de imagen (/images/...)"
              className="h-9 text-xs rounded-[8px] border-[#CCD2CA] dark:border-stone-700 bg-white dark:bg-stone-800 mt-1"
            />
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
              className="h-10 px-4 text-xs bg-[#245544] hover:bg-[#1b4335] text-white rounded-[8px] font-semibold cursor-pointer shadow-xs"
            >
              {mode === "create" ? "Crear viaje" : "Guardar cambios"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
