import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { tripService, DEFAULT_DESTINATION_IMAGE, DEFAULT_HOTEL_IMAGE } from "@/lib/tripService"
import type { Destination } from "./DestinationsSlider"
import type {
  Transporte,
  EstadoSeleccionTransporte,
  TipoTransporte,
  Hotel,
  EstadoSeleccionHotel,
} from "@/types/database"
import {
  CreateTransportModal,
  type TransportFormData,
} from "./CreateTransportModal"
import {
  CreateHotelModal,
  type HotelFormData,
} from "./CreateHotelModal"

function getTransportIcon(tipo: TipoTransporte, className = "w-4 h-4") {
  switch (tipo) {
    case "tren":
      return (
        <svg
          className={className}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="4" y="3" width="16" height="16" rx="2" />
          <path d="M4 11h16" />
          <path d="M12 3v8" />
          <path d="m8 19-2 3" />
          <path d="m16 19 2 3" />
          <circle cx="8" cy="15" r="1" />
          <circle cx="16" cy="15" r="1" />
        </svg>
      )
    case "bus":
      return (
        <svg
          className={className}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M8 6v6" />
          <path d="M16 6v6" />
          <rect x="4" y="3" width="16" height="15" rx="3" />
          <path d="M4 11h16" />
          <path d="m6 18-1 3" />
          <path d="m18 18 1 3" />
        </svg>
      )
    case "avion":
      return (
        <svg
          className={className}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.3c.4-.2.6-.6.5-1.1z" />
        </svg>
      )
    case "ferry":
      return (
        <svg
          className={className}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M2 20a4 4 0 0 0 4-2 4 4 0 0 1 4-2 4 4 0 0 1 4 2 4 4 0 0 0 4 2 4 4 0 0 0 4-2" />
          <path d="M4 14l1.5-6h13L20 14" />
          <path d="M12 3v5" />
          <path d="M8 8h8" />
        </svg>
      )
    case "coche":
      return (
        <svg
          className={className}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9C2.1 11.2 2 11.6 2 12v4c0 .6.4 1 1 1h2" />
          <circle cx="7" cy="17" r="2" />
          <path d="M9 17h6" />
          <circle cx="17" cy="17" r="2" />
        </svg>
      )
    default:
      return (
        <svg
          className={className}
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
      )
  }
}

interface CityDetailViewProps {
  cityId?: string
  cityName?: string
  cityData?: Destination
  tripName?: string
  travelersCount?: number
  isAdmin?: boolean
  onBack: () => void
  onBackToOverview?: () => void
  onSelectCity?: (cityId: string) => void
  onEditCity?: (city: Destination) => void
}

export function CityDetailView({
  cityId,
  cityName = "Lisboa",
  cityData,
  tripName = "Portugal en familia",
  travelersCount = 4,
  isAdmin = true,
  onBack,
  onBackToOverview,
  onSelectCity,
  onEditCity,
}: CityDetailViewProps) {
  const cityImage = cityData?.image || DEFAULT_DESTINATION_IMAGE
  const cityDays = cityData?.nights || 2
  const cityNights = Math.max(1, cityDays - 1)
  const cityTitle =
    cityData?.title ||
    `${cityDays} ${cityDays === 1 ? "día" : "días"} al ritmo de ${cityName}.`
  const citySubtitle =
    cityData?.subtitle ||
    `Miradores, azulejos y momentos para disfrutar juntos en ${cityName}. Aquí continúa vuestra historia.`

  // Transports state and modals
  const [transportsList, setTransportsList] = useState<Transporte[]>([])
  const [isAddTransportOpen, setIsAddTransportOpen] = useState(false)
  const [editingTransport, setEditingTransport] = useState<Transporte | null>(null)

  // Hotels state and modals
  const [hotelsList, setHotelsList] = useState<Hotel[]>([])
  const [isAddHotelOpen, setIsAddHotelOpen] = useState(false)
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null)

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

  // Cargar actividades, hoteles y transportes de Supabase para esta ciudad si existen
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
      } else {
        setDay2ExtraActivities([])
      }

      if (details.transports && details.transports.length > 0) {
        setTransportsList(details.transports)
      } else {
        tripService.getTransports(cityId).then((tr) => {
          if (isMounted) setTransportsList(tr)
        })
      }

      if (details.hotels && details.hotels.length > 0) {
        setHotelsList(details.hotels)
      } else {
        tripService.getHotels(cityId).then((ht) => {
          if (isMounted) setHotelsList(ht)
        })
      }
    })
    return () => {
      isMounted = false
    }
  }, [cityId, cityName])

  const handleSaveTransport = async (data: TransportFormData) => {
    if (data.id) {
      await tripService.updateTransport(data.id, {
        tipo: data.tipo,
        nombre_linea: data.nombre_linea,
        origen: data.origen,
        destino: data.destino,
        hora_salida: data.hora_salida,
        hora_llegada: data.hora_llegada,
        duracion: data.duracion,
        costo: data.costo,
        estado_seleccion: data.estado_seleccion,
        reservado: data.estado_seleccion === "elegido",
        notas: data.notas,
        enlace_compra: data.enlace_compra,
      })

      setTransportsList((prev) =>
        prev.map((t) =>
          t.id === data.id
            ? {
                ...t,
                tipo: data.tipo,
                nombre_linea: data.nombre_linea,
                origen: data.origen,
                destino: data.destino,
                hora_salida: data.hora_salida,
                hora_llegada: data.hora_llegada,
                duracion: data.duracion,
                costo: data.costo,
                estado_seleccion: data.estado_seleccion,
                reservado: data.estado_seleccion === "elegido",
                notas: data.notas,
                enlace_compra: data.enlace_compra,
              }
            : t
        )
      )
    } else {
      if (!cityId) return
      const res = await tripService.createTransport({
        ciudad_id: cityId,
        tipo: data.tipo,
        nombre_linea: data.nombre_linea,
        origen: data.origen,
        destino: data.destino,
        hora_salida: data.hora_salida,
        hora_llegada: data.hora_llegada,
        duracion: data.duracion,
        costo: data.costo,
        estado_seleccion: data.estado_seleccion,
        reservado: data.estado_seleccion === "elegido",
        notas: data.notas,
        enlace_compra: data.enlace_compra,
      })

      if (res.data) {
        setTransportsList((prev) => [...prev, res.data!])
      }
    }
    setIsAddTransportOpen(false)
    setEditingTransport(null)
  }

  const handleDeleteTransport = async (transportId: string) => {
    setTransportsList((prev) => prev.filter((t) => t.id !== transportId))
    await tripService.deleteTransport(transportId)
  }

  const handleSelectionChange = async (
    transportId: string,
    newStatus: EstadoSeleccionTransporte
  ) => {
    setTransportsList((prev) =>
      prev.map((t) =>
        t.id === transportId
          ? {
              ...t,
              estado_seleccion: newStatus,
              reservado: newStatus === "elegido",
            }
          : newStatus === "elegido" && t.estado_seleccion === "elegido"
          ? { ...t, estado_seleccion: "sin_nada", reservado: false }
          : t
      )
    )
    if (cityId) {
      await tripService.setTransportSelection(cityId, transportId, newStatus)
    }
  }

  const handleToggleTransportHeart = async (
    transportId: string,
    currentStatus: EstadoSeleccionTransporte,
    e: React.MouseEvent
  ) => {
    e.stopPropagation()
    const nextStatus: EstadoSeleccionTransporte =
      currentStatus === "preferido" ? "sin_nada" : "preferido"
    await handleSelectionChange(transportId, nextStatus)
  }

  const handleSaveHotel = async (data: HotelFormData) => {
    if (data.id) {
      await tripService.updateHotel(data.id, {
        nombre: data.nombre,
        direccion: data.direccion,
        estrellas: data.estrellas,
        detalles: data.detalles,
        noches: data.noches,
        costo: data.costo,
        enlace_reserva: data.enlace_reserva,
        foto: data.foto,
        estado_seleccion: data.estado_seleccion,
        reservado: data.estado_seleccion === "elegido",
        notas: data.notas,
      })

      setHotelsList((prev) =>
        prev.map((h) =>
          h.id === data.id
            ? {
                ...h,
                nombre: data.nombre,
                direccion: data.direccion,
                estrellas: data.estrellas,
                detalles: data.detalles,
                noches: data.noches,
                costo: data.costo,
                enlace_reserva: data.enlace_reserva,
                foto: data.foto,
                estado_seleccion: data.estado_seleccion,
                reservado: data.estado_seleccion === "elegido",
                notas: data.notas,
              }
            : data.estado_seleccion === "elegido" && h.estado_seleccion === "elegido"
            ? { ...h, estado_seleccion: "sin_nada", reservado: false }
            : h
        )
      )
    } else {
      if (!cityId) return
      const res = await tripService.createHotel({
        ciudad_id: cityId,
        nombre: data.nombre,
        direccion: data.direccion,
        estrellas: data.estrellas,
        detalles: data.detalles,
        noches: data.noches,
        costo: data.costo,
        enlace_reserva: data.enlace_reserva,
        foto: data.foto,
        estado_seleccion: data.estado_seleccion,
        reservado: data.estado_seleccion === "elegido",
        notas: data.notas,
      })

      if (res.data) {
        setHotelsList((prev) => [...prev, res.data!])
      }
    }
    setIsAddHotelOpen(false)
    setEditingHotel(null)
  }

  const handleDeleteHotel = async (hotelId: string) => {
    setHotelsList((prev) => prev.filter((h) => h.id !== hotelId))
    await tripService.deleteHotel(hotelId)
  }

  const handleHotelSelectionChange = async (
    hotelId: string,
    newStatus: EstadoSeleccionHotel
  ) => {
    setHotelsList((prev) =>
      prev.map((h) =>
        h.id === hotelId
          ? {
              ...h,
              estado_seleccion: newStatus,
              reservado: newStatus === "elegido",
            }
          : newStatus === "elegido" && h.estado_seleccion === "elegido"
          ? { ...h, estado_seleccion: "sin_nada", reservado: false }
          : h
      )
    )
    if (cityId) {
      await tripService.setHotelSelection(cityId, hotelId, newStatus)
    }
  }

  const handleToggleHotelHeart = async (
    hotelId: string,
    currentStatus: EstadoSeleccionHotel,
    e: React.MouseEvent
  ) => {
    e.stopPropagation()
    const nextStatus: EstadoSeleccionHotel =
      currentStatus === "preferido" ? "sin_nada" : "preferido"
    await handleHotelSelectionChange(hotelId, nextStatus)
  }

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
            onClick={onBackToOverview || onBack}
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
              {cityName} · {cityData?.dates || `${cityDays} ${cityDays === 1 ? "día" : "días"}`}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#727B74] dark:text-stone-400">
            <span>
              {cityDays} {cityDays === 1 ? "día" : "días"} / {cityNights}{" "}
              {cityNights === 1 ? "noche" : "noches"}
            </span>
            <span>·</span>
            <span>
              {travelersCount} {travelersCount === 1 ? "viajero" : "viajeros"}
            </span>
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
      <div className="relative h-[220px] sm:h-[240px] w-full rounded-[14px] overflow-hidden shadow-xs group">
        <img
          src={cityImage}
          alt={`Panorámica de ${cityName}`}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-102"
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
            <span>{cityName}</span>
          </div>
        </div>

        {/* Edit Destination Button (if admin) */}
        {isAdmin && onEditCity && cityData && (
          <button
            type="button"
            onClick={() => onEditCity(cityData)}
            className="absolute top-4 right-4 z-10 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-xs text-xs font-medium text-white shadow-xs transition-colors cursor-pointer"
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
            >
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
            <span>Editar lugar</span>
          </button>
        )}

        {/* Editorial Quote */}
        <div className="absolute bottom-5 left-5 right-5 z-10 text-white max-w-[700px]">
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-[32px] font-normal leading-snug drop-shadow-xs">
            {cityTitle}
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-white/90 font-normal">
            {citySubtitle}
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
              Opciones de transporte hacia {cityName} · Compara y selecciona preferido o elegido
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setEditingTransport(null)
              setIsAddTransportOpen(true)
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#245544] text-white hover:bg-[#1b4335] text-xs font-semibold transition-all cursor-pointer shadow-xs self-start sm:self-auto"
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

        {/* Empty State */}
        {transportsList.length === 0 && (
          <div className="p-8 rounded-xl border border-dashed border-[#CCD2CA] dark:border-stone-800 bg-[#FBF9F5] dark:bg-stone-900 text-center flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#E8EFEA] dark:bg-stone-800 text-[#245544] dark:text-[#A7F3D0] flex items-center justify-center">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="4" y="3" width="16" height="16" rx="2" />
                <path d="M4 11h16" />
                <path d="M12 3v8" />
                <path d="m8 19-2 3" />
                <path d="m16 19 2 3" />
              </svg>
            </div>
            <div className="max-w-md">
              <h4 className="font-serif text-lg text-[#203D34] dark:text-stone-100">
                Aún no habéis añadido transportes para llegar a {cityName}
              </h4>
              <p className="text-xs text-[#727B74] dark:text-stone-400 mt-1">
                Añadid opciones en tren, autobús, avión, ferry o coche para comparar horarios y precios, y marcad vuestra opción preferida o elegida.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setEditingTransport(null)
                setIsAddTransportOpen(true)
              }}
              className="px-4 py-2 rounded-lg bg-[#245544] text-white text-xs font-semibold hover:bg-[#1b4335] transition-colors cursor-pointer shadow-xs"
            >
              + Añadir primera opción de transporte
            </button>
          </div>
        )}

        {/* Dynamic Transport Options Grid */}
        {transportsList.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {transportsList.map((t) => {
              const isPreferred = t.estado_seleccion === "preferido"
              const isChosen = t.estado_seleccion === "elegido"

              return (
                <div
                  key={t.id}
                  className={`p-4 sm:p-5 rounded-[12px] bg-white dark:bg-stone-900 border transition-all flex flex-col justify-between gap-4 shadow-xs relative ${
                    isChosen
                      ? "border-[#245544] ring-1 ring-[#245544] bg-[#F7FAF8] dark:bg-stone-900/90"
                      : isPreferred
                      ? "border-rose-400 ring-1 ring-rose-400/80 bg-rose-50/20 dark:bg-stone-900/90"
                      : "border-[#DFE2DA] dark:border-stone-800 hover:border-stone-400"
                  }`}
                >
                  {/* Top Bar: Icon + Service Name + Actions (Elegir, Corazón, Edit, Delete) */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                          isChosen
                            ? "bg-[#245544] text-white"
                            : isPreferred
                            ? "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
                            : "bg-[#E8EFEA] dark:bg-stone-800 text-[#245544] dark:text-[#A7F3D0]"
                        }`}
                      >
                        {getTransportIcon(t.tipo, "w-5 h-5")}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-semibold text-[#203D34] dark:text-stone-100 leading-tight truncate">
                            {t.nombre_linea || `${t.tipo.toUpperCase()} hacia ${t.destino || cityName}`}
                          </h3>

                          {/* Selector de Elegido */}
                          <button
                            type="button"
                            onClick={() =>
                              handleSelectionChange(
                                t.id,
                                isChosen ? "sin_nada" : "elegido"
                              )
                            }
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold transition-colors cursor-pointer shadow-2xs ${
                              isChosen
                                ? "bg-[#245544] text-white ring-1 ring-white/30"
                                : "bg-[#F0EEE6] text-stone-700 dark:bg-stone-800 dark:text-stone-200 hover:bg-[#E8EFEA] hover:text-[#203D34]"
                            }`}
                            title={
                              isChosen
                                ? "Transporte elegido para el viaje (haz clic para desmarcar)"
                                : "Marcar este transporte como elegido"
                            }
                          >
                            {isChosen ? (
                              <>
                                <span>✓</span>
                                <span>Transporte elegido</span>
                              </>
                            ) : (
                              <span>Elegir</span>
                            )}
                          </button>
                        </div>
                        <p className="text-[11px] text-[#727B74] dark:text-stone-400 truncate mt-0.5">
                          {t.notas || `${t.tipo.toUpperCase()} · ${t.origen || "Origen"} → ${t.destino || cityName}`}
                        </p>
                      </div>
                    </div>

                    {/* Actions: Heart + Edit + Delete */}
                    <div className="flex items-center gap-1 shrink-0">
                      {/* Heart Icon for marking Preferred / Favorite */}
                      <button
                        type="button"
                        onClick={(e) =>
                          handleToggleTransportHeart(t.id, t.estado_seleccion, e)
                        }
                        title={
                          isPreferred
                            ? "Quitar de preferidos"
                            : "Marcar como transporte preferido de la familia"
                        }
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer group ${
                          isPreferred
                            ? "bg-rose-50 text-rose-500 ring-1 ring-rose-200 dark:bg-rose-950/60 shadow-xs"
                            : "text-stone-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-stone-200 dark:border-stone-700 hover:border-rose-300"
                        }`}
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill={isPreferred ? "#f43f5e" : "none"}
                          stroke={isPreferred ? "#f43f5e" : "currentColor"}
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="transition-transform group-hover:scale-110"
                        >
                          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                        </svg>
                      </button>

                      {/* Edit & Delete Action Buttons */}
                      <button
                        type="button"
                        title="Editar transporte"
                        onClick={() => {
                          setEditingTransport(t)
                          setIsAddTransportOpen(true)
                        }}
                        className="p-1 rounded text-stone-400 hover:text-[#203D34] dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        title="Eliminar transporte"
                        onClick={() => {
                          if (confirm(`¿Eliminar la opción de transporte "${t.nombre_linea || t.tipo}"?`)) {
                            handleDeleteTransport(t.id)
                          }
                        }}
                        className="p-1 rounded text-stone-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 6h18" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Timetable Schedule Grid */}
                  <div className="grid grid-cols-3 items-center text-center py-2.5 bg-[#F9F8F5] dark:bg-stone-800/40 rounded-[8px] px-3">
                    <div className="text-left min-w-0">
                      <p className="text-base sm:text-lg font-bold text-[#203D34] dark:text-stone-100">
                        {t.hora_salida || "08:22"}
                      </p>
                      <p className="text-[11px] text-[#4D5B54] dark:text-stone-300 truncate">
                        {t.origen || "Origen"}
                      </p>
                    </div>

                    <div className="flex flex-col items-center px-1">
                      <span className="text-[10px] text-[#727B74] dark:text-stone-400">
                        {t.duracion || "Directo"}
                      </span>
                      <div className="w-full flex items-center gap-1 my-0.5">
                        <div className="flex-1 h-px bg-[#CCD2CA] dark:bg-stone-700" />
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#727B74" strokeWidth="2">
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </div>
                      <span className="text-[9px] text-[#245544] dark:text-[#A7F3D0] font-medium capitalize">
                        {t.tipo}
                      </span>
                    </div>

                    <div className="text-right min-w-0">
                      <p className="text-base sm:text-lg font-bold text-[#203D34] dark:text-stone-100">
                        {t.hora_llegada || "11:46"}
                      </p>
                      <p className="text-[11px] text-[#4D5B54] dark:text-stone-300 truncate">
                        {t.destino || cityName}
                      </p>
                    </div>
                  </div>

                  {/* Bottom: Large Total Price + Link */}
                  <div className="pt-2.5 border-t border-[#DFE2DA] dark:border-stone-800">
                    {/* Price and Purchase Link Row */}
                    <div className="flex items-end justify-between gap-3">
                      <div className="flex flex-col">
                        <div className="flex items-baseline gap-1.5 flex-wrap">
                          <span className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#203D34] dark:text-stone-100 leading-none">
                            {t.costo || 0} €
                          </span>
                          <span className="text-[11px] text-[#727B74] dark:text-stone-400 font-normal">
                            total ({travelersCount === 1 ? "1 viajero" : `todas las ${travelersCount} personas`})
                          </span>
                        </div>
                        <span className="text-[11px] text-[#727B74] dark:text-stone-400 font-normal mt-0.5">
                          {travelersCount > 0
                            ? ((t.costo || 0) / travelersCount).toFixed(2)
                            : "0"}{" "}
                          € / pers.
                        </span>
                      </div>

                      {/* Enlace hacia donde comprarlo */}
                      {t.enlace_compra ? (
                        <a
                          href={t.enlace_compra}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#245544] hover:bg-[#1b4335] text-white shadow-xs transition-colors shrink-0 group"
                          title="Ir a comprar los billetes en la web oficial"
                        >
                          <span>Comprar billetes</span>
                          <svg
                            className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                            <polyline points="15 3 21 3 21 9" />
                            <line x1="10" y1="14" x2="21" y2="3" />
                          </svg>
                        </a>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingTransport(t)
                            setIsAddTransportOpen(true)
                          }}
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-[#245544] dark:text-[#A7F3D0] hover:underline cursor-pointer shrink-0 pb-0.5"
                          title="Añadir enlace de compra"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                          </svg>
                          <span>Añadir enlace</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <p className="text-[11px] text-[#727B74] dark:text-stone-400 italic">
          ℹ Horarios y precios orientativos. Podéis marcar cada transporte como preferido para acordarlo en familia, o elegido para el plan final.
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
              {cityNights} {cityNights === 1 ? "noche" : "noches"} en {cityName} · {hotelsList.length} {hotelsList.length === 1 ? "opción guardada" : "opciones guardadas"}
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setEditingHotel(null)
              setIsAddHotelOpen(true)
            }}
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

        {/* Empty state when no hotels */}
        {hotelsList.length === 0 && (
          <div className="p-8 text-center rounded-[12px] border border-dashed border-[#CCD2CA] dark:border-stone-800 bg-[#F9F8F5] dark:bg-stone-900/50 flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#E8EFEA] dark:bg-stone-800 flex items-center justify-center text-[#245544] dark:text-[#A7F3D0]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 10V20C3 20.5523 3.44772 21 4 21H20C20.5523 21 21 20.5523 21 20V10" />
                <path d="M12 3L2 10H22L12 3Z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-[#203D34] dark:text-stone-200">
                Aún no habéis guardado alojamientos en {cityName}
              </p>
              <p className="text-xs text-[#727B74] dark:text-stone-400 mt-1 max-w-sm">
                Añadid hoteles o apartamentos, marcad los preferidos con el corazón y comparad antes de reservar.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setEditingHotel(null)
                setIsAddHotelOpen(true)
              }}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#245544] text-white hover:bg-[#1b4335] shadow-xs transition-colors cursor-pointer"
            >
              + Añadir el primer alojamiento
            </button>
          </div>
        )}

        {/* Hotels Dynamic Grid */}
        {hotelsList.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {hotelsList.map((hotel) => {
              const isChosen = hotel.estado_seleccion === "elegido"
              const isPreferred = hotel.estado_seleccion === "preferido"

              const totalStayNights = hotel.noches || cityNights
              const costPerNight =
                totalStayNights > 0
                  ? ((hotel.costo || 0) / totalStayNights).toFixed(0)
                  : "0"
              const costPerPerson =
                travelersCount > 0
                  ? ((hotel.costo || 0) / travelersCount).toFixed(0)
                  : "0"

              return (
                <div
                  key={hotel.id}
                  className={`flex flex-col justify-between rounded-[12px] bg-white dark:bg-stone-900 overflow-hidden border transition-all shadow-xs relative ${
                    isChosen
                      ? "border-[#245544] ring-1 ring-[#245544] bg-[#F7FAF8] dark:bg-stone-900/95"
                      : isPreferred
                      ? "border-rose-400 ring-1 ring-rose-400/80 bg-rose-50/20 dark:bg-stone-900/95"
                      : "border-[#DFE2DA] dark:border-stone-800 hover:border-stone-400"
                  }`}
                >
                  {/* Photo & Overlays */}
                  <div className="relative h-44 w-full bg-stone-100 dark:bg-stone-800">
                    <img
                      src={hotel.foto || DEFAULT_HOTEL_IMAGE}
                      alt={hotel.nombre}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        ;(e.target as HTMLImageElement).src = DEFAULT_HOTEL_IMAGE
                      }}
                    />

                    {/* Top Left: Selector de Elegido */}
                    <div className="absolute top-2.5 left-2.5">
                      <button
                        type="button"
                        onClick={() =>
                          handleHotelSelectionChange(
                            hotel.id,
                            isChosen ? "sin_nada" : "elegido"
                          )
                        }
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold backdrop-blur-xs transition-colors cursor-pointer shadow-xs ${
                          isChosen
                            ? "bg-[#245544] text-white ring-1 ring-white/30"
                            : "bg-white/90 text-stone-700 dark:bg-stone-900/90 dark:text-stone-200 hover:bg-white hover:text-[#203D34]"
                        }`}
                        title={
                          isChosen
                            ? "Alojamiento elegido para el viaje (haz clic para desmarcar)"
                            : "Marcar este alojamiento como elegido"
                        }
                      >
                        {isChosen ? (
                          <>
                            <span>✓</span>
                            <span>Alojamiento elegido</span>
                          </>
                        ) : (
                          <span>Elegir</span>
                        )}
                      </button>
                    </div>

                    {/* Top Right: Heart Icon for marking Preferred / Favorite */}
                    <button
                      type="button"
                      onClick={(e) =>
                        handleToggleHotelHeart(hotel.id, hotel.estado_seleccion, e)
                      }
                      title={
                        isPreferred
                          ? "Quitar de preferidos"
                          : "Marcar como preferido de la familia"
                      }
                      className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all cursor-pointer shadow-sm group ${
                        isPreferred
                          ? "bg-white text-rose-500 scale-105 shadow-md ring-1 ring-rose-200"
                          : "bg-black/35 hover:bg-black/55 text-white/90 hover:text-white"
                      }`}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill={isPreferred ? "#f43f5e" : "none"}
                        stroke={isPreferred ? "#f43f5e" : "#ffffff"}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="transition-transform group-hover:scale-110"
                      >
                        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                      </svg>
                    </button>
                  </div>

                  {/* Card Content */}
                  <div className="p-4 flex flex-col justify-between flex-1 gap-3">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-serif text-lg font-normal text-[#203D34] dark:text-stone-100 leading-snug">
                          {hotel.nombre}
                        </h3>

                        {/* Edit & Delete Action Buttons */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            title="Editar alojamiento"
                            onClick={() => {
                              setEditingHotel(hotel)
                              setIsAddHotelOpen(true)
                            }}
                            className="p-1 rounded text-stone-400 hover:text-[#203D34] dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            title="Eliminar alojamiento"
                            onClick={() => {
                              if (confirm(`¿Eliminar el alojamiento "${hotel.nombre}"?`)) {
                                handleDeleteHotel(hotel.id)
                              }
                            }}
                            className="p-1 rounded text-stone-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M3 6h18" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-[#4D5B54] dark:text-stone-300 mt-0.5">
                        {hotel.direccion || `${cityName}`}
                      </p>
                      <p className="text-[11px] text-[#727B74] dark:text-stone-400">
                        {hotel.estrellas || "Alojamiento en familia"}
                      </p>
                    </div>

                    {/* Badges / Details */}
                    {hotel.detalles && (
                      <div className="flex flex-wrap gap-1.5">
                        {hotel.detalles.split("·").map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-[4px] bg-[#F5F2E9] dark:bg-stone-800 text-[10px] text-[#4D5B54] dark:text-stone-300"
                          >
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Bottom: Large Total Price + Link */}
                    <div className="pt-2.5 border-t border-[#DFE2DA] dark:border-stone-800">
                      {/* Price & Booking Link Row */}
                      <div className="flex items-end justify-between gap-2">
                        <div className="flex flex-col">
                          <div className="flex items-baseline gap-1.5 flex-wrap">
                            <span className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#203D34] dark:text-stone-100 leading-none">
                              {hotel.costo || 0} €
                            </span>
                            <span className="text-[11px] text-[#727B74] dark:text-stone-400 font-normal">
                              total ({totalStayNights} {totalStayNights === 1 ? "noche" : "noches"} · {travelersCount} pers.)
                            </span>
                          </div>
                          <span className="text-[11px] text-[#727B74] dark:text-stone-400 font-normal mt-0.5">
                            {costPerNight} € / noche · {costPerPerson} € / pers.
                          </span>
                        </div>

                        {/* Enlace hacia donde comprarlo / reservarlo */}
                        {hotel.enlace_reserva ? (
                          <a
                            href={hotel.enlace_reserva}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#245544] hover:bg-[#1b4335] text-white shadow-xs transition-colors shrink-0 group"
                            title="Ir a reservar en la web oficial"
                          >
                            <span>Reservar</span>
                            <svg
                              className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                              <polyline points="15 3 21 3 21 9" />
                              <line x1="10" y1="14" x2="21" y2="3" />
                            </svg>
                          </a>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingHotel(hotel)
                              setIsAddHotelOpen(true)
                            }}
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-[#245544] dark:text-[#A7F3D0] hover:underline cursor-pointer shrink-0 pb-0.5"
                            title="Añadir enlace de reserva"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                            </svg>
                            <span>Añadir enlace</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <p className="text-[11px] text-[#727B74] dark:text-stone-400 italic">
          ℹ Precios y condiciones orientativos. Podéis marcar alojamientos como preferidos con el corazón ❤️ en la esquina superior derecha, o seleccionar el elegido para el viaje.
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

      {/* Modal para añadir o editar transporte */}
      <CreateTransportModal
        isOpen={isAddTransportOpen}
        cityName={cityName}
        travelersCount={travelersCount}
        initialData={editingTransport}
        onClose={() => {
          setIsAddTransportOpen(false)
          setEditingTransport(null)
        }}
        onSave={handleSaveTransport}
      />

      {/* Modal para añadir o editar alojamiento / hotel */}
      <CreateHotelModal
        isOpen={isAddHotelOpen}
        cityName={cityName}
        cityNights={cityNights}
        travelersCount={travelersCount}
        initialData={editingHotel}
        onClose={() => {
          setIsAddHotelOpen(false)
          setEditingHotel(null)
        }}
        onSave={handleSaveHotel}
      />
    </div>
  )
}
