import { useState, useEffect, useCallback } from "react"
import { Sidebar, type TripOption } from "./Sidebar"
import { TripHero } from "./TripHero"
import {
  EditHeroModal,
  type HeroData,
  formatDateRange,
  calculateNights,
} from "./EditHeroModal"
import {
  CreateDestinationModal,
  type DestinationFormData,
} from "./CreateDestinationModal"
import { DestinationsSlider, type Destination } from "./DestinationsSlider"
import { CityDetailView } from "./CityDetailView"
import { ItineraryView } from "./ItineraryView"
import { BudgetView } from "./BudgetView"
import { BudgetOverviewCard } from "./BudgetOverviewCard"
import { UpcomingTasksCard, type TaskItem } from "./UpcomingTasksCard"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/theme-provider"
import {
  tripService,
  DEMO_CITIES,
  DEMO_TASKS,
  DEFAULT_COVER_IMAGE,
  DEFAULT_DESTINATION_IMAGE,
} from "@/lib/tripService"
import { isSupabaseConfigured } from "@/supabaseClient"
import type { User } from "@supabase/supabase-js"
import type { Ciudad, Tarea } from "@/types/database"

interface TripOverviewProps {
  user?: User | null
  userName?: string
  isAdmin?: boolean
  onSignOut?: () => void
  onNavigateToAuth?: () => void
}

function calculateDaysRemaining(startDate?: string | null): number {
  if (!startDate) return 21
  try {
    const parts = startDate.split("-").map(Number)
    if (parts.length !== 3) return 21
    const target = new Date(parts[0], parts[1] - 1, parts[2])
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const diffTime = target.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  } catch {
    return 21
  }
}

function formatDepartureDay(startDate?: string | null, fallback = "6 de noviembre"): string {
  if (!startDate) return fallback
  try {
    const parts = startDate.split("-").map(Number)
    if (parts.length !== 3) return fallback
    const target = new Date(parts[0], parts[1] - 1, parts[2])
    const monthsFull = [
      "enero", "febrero", "marzo", "abril", "mayo", "junio",
      "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
    ]
    return `${target.getDate()} de ${monthsFull[target.getMonth()]}`
  } catch {
    return fallback
  }
}

function getTripDurationBadge(
  startDate?: string | null,
  endDate?: string | null,
  destinations?: Destination[]
): string {
  if (startDate && endDate) {
    const nights = calculateNights(startDate, endDate)
    if (nights > 0) {
      const days = nights + 1
      return `· ${days} ${days === 1 ? "día" : "días"} / ${nights} ${nights === 1 ? "noche" : "noches"}`
    } else if (startDate === endDate) {
      return "· 1 día"
    }
  }

  if (destinations && destinations.length > 0) {
    const totalNights = destinations.reduce((acc, d) => acc + (d.nights || 1), 0)
    const days = totalNights + 1
    return `· ${days} ${days === 1 ? "día" : "días"} / ${totalNights} ${totalNights === 1 ? "noche" : "noches"}`
  }

  return ""
}

function mapCityToDestination(c: Ciudad): Destination {
  let img = c.foto || ""
  if (!img) {
    const lower = c.nombre.toLowerCase()
    if (lower.includes("sintra")) img = "/images/destino-sintra.png"
    else if (lower.includes("oporto") || lower.includes("porto")) img = "/images/destino-oporto.png"
    else if (lower.includes("lisboa")) img = "/images/destino-lisboa.png"
    else if (lower.includes("menorca") || lower.includes("ciutadella") || lower.includes("fornells")) img = "/images/family-costa-brava.png"
    else if (lower.includes("pirineos") || lower.includes("benasque") || lower.includes("torla")) img = "/images/costa-brava.jpg"
    else img = DEFAULT_DESTINATION_IMAGE
  }

  return {
    id: c.id,
    name: c.nombre,
    dates: `${c.dias} ${c.dias === 1 ? "día" : "días"}`,
    nights: Math.max(1, c.dias),
    image: img,
    title: c.titulo_cabecero || undefined,
    subtitle: c.subtitulo_cabecero || undefined,
    isReady: c.orden === 0,
    statusText: c.orden === 0 ? "Todo listo" : "En progreso",
    isFavorite: true,
  }
}

function mapDbTaskToTaskItem(t: Tarea, cityNameMap: Record<string, string>): TaskItem {
  const cityName = t.ciudad_id && cityNameMap[t.ciudad_id] ? cityNameMap[t.ciudad_id] : "General"
  const dueDateStr = t.vencimiento ? `Antes del ${t.vencimiento}` : "Plan familiar"

  return {
    id: t.id,
    title: t.titulo,
    subtitle: `${cityName} · ${dueDateStr}`,
    assignee: "CL",
    completed: t.estado === "hecha",
  }
}

export function TripOverview({
  user,
  userName = "Clara López",
  isAdmin = true,
  onSignOut,
  onNavigateToAuth,
}: TripOverviewProps) {
  const [activeSection, setActiveSection] = useState("general")
  const [tripsList, setTripsList] = useState<TripOption[]>([
    { id: "portugal", name: "Portugal en familia", dates: "6–13 nov 2026" },
    { id: "menorca", name: "Un verano en Menorca", dates: "12–19 jul 2027" },
    { id: "pirineos", name: "Escapada a los Pirineos", dates: "2–5 dic 2026" },
  ])
  const [currentTrip, setCurrentTrip] = useState<TripOption>(tripsList[0])
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isInviteOpen, setIsInviteOpen] = useState(false)
  const [isAddDestinationOpen, setIsAddDestinationOpen] = useState(false)
  const [isEditHeroModalOpen, setIsEditHeroModalOpen] = useState(false)
  const [isCreateTripModalOpen, setIsCreateTripModalOpen] = useState(false)
  const [isEditingTitleInline, setIsEditingTitleInline] = useState(false)
  const [inlineTitleValue, setInlineTitleValue] = useState(tripsList[0].name)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteSuccess, setInviteSuccess] = useState(false)
  const [editingCityData, setEditingCityData] = useState<Destination | null>(null)
  const [selectedCityId, setSelectedCityId] = useState<string | null>(null)
  const [selectedCityName, setSelectedCityName] = useState<string>("Lisboa")

  // Database synced state
  const [destinationsList, setDestinationsList] = useState<Destination[]>(() =>
    DEMO_CITIES.filter((c) => c.viaje_id === tripsList[0]?.id).map(
      mapCityToDestination
    )
  )
  const [tasksList, setTasksList] = useState<TaskItem[]>(() => {
    const initialTripId = tripsList[0]?.id
    const cityMap: Record<string, string> = {}
    DEMO_CITIES.filter((c) => c.viaje_id === initialTripId).forEach((c) => {
      cityMap[c.id] = c.nombre
    })
    return DEMO_TASKS.filter((t) => t.viaje_id === initialTripId).map((t) =>
      mapDbTaskToTaskItem(t, cityMap)
    )
  })
  const [budgetTotal, setBudgetTotal] = useState<number>(3200)
  const [budgetSpent, setBudgetSpent] = useState<number>(1840)
  const [showSeedBanner, setShowSeedBanner] = useState(false)
  const [isSeeding, setIsSeeding] = useState(false)

  const [tripHeroes, setTripHeroes] = useState<Record<string, HeroData>>({
    portugal: {
      tripName: "Portugal en familia",
      dates: "6–13 nov 2026",
      startDate: "2026-11-06",
      endDate: "2026-11-13",
      travelersCount: 4,
      title: "Hay viajes que ya se sienten cerca.",
      subtitle: "Lisboa, Sintra y Oporto. Un camino para disfrutar juntos.",
      image: "/images/lisboa-panoramica.png",
      locationBadge: "Lisboa, Portugal",
    },
    menorca: {
      tripName: "Un verano en Menorca",
      dates: "12–19 jul 2027",
      startDate: "2027-07-12",
      endDate: "2027-07-19",
      travelersCount: 4,
      title: "Calas turquesas y brisa mediterránea.",
      subtitle: "Ciutadella, Fornells y senderos mágicos en familia.",
      image: "/images/family-costa-brava.png",
      locationBadge: "Menorca, España",
    },
    pirineos: {
      tripName: "Escapada a los Pirineos",
      dates: "2–5 dic 2026",
      startDate: "2026-12-02",
      endDate: "2026-12-05",
      travelersCount: 2,
      title: "Naturaleza viva y aire puro de montaña.",
      subtitle: "Senderos verdes, valles y refugios inolvidables.",
      image: "/images/costa-brava.jpg",
      locationBadge: "Pirineos, España",
    },
  })

  // 1. Cargar viajes desde Supabase si el usuario está autenticado
  const loadTrips = useCallback(async () => {
    const res = await tripService.getTrips(user?.id)

    if (user && res.data.length === 0) {
      setShowSeedBanner(true)
    } else {
      setShowSeedBanner(false)
    }

    if (res.data && res.data.length > 0) {
      const options: TripOption[] = res.data.map((v) => ({
        id: v.id,
        name: v.nombre,
        dates: formatDateRange(v.fecha_inicio, v.fecha_fin),
      }))

      const heroesMap: Record<string, HeroData> = {}
      res.data.forEach((v) => {
        heroesMap[v.id] = {
          tripName: v.nombre,
          dates: formatDateRange(v.fecha_inicio, v.fecha_fin),
          startDate: v.fecha_inicio || undefined,
          endDate: v.fecha_fin || undefined,
          travelersCount: v.num_viajeros || 4,
          title: v.titulo_cabecero || "Hay viajes que ya se sienten cerca.",
          subtitle: v.subtitulo_cabecero || "Un camino para disfrutar juntos.",
          image: v.foto_portada || DEFAULT_COVER_IMAGE,
          locationBadge: v.etiqueta_ubicacion || v.nombre,
        }
      })

      setTripsList(options)
      setTripHeroes((prev) => ({ ...prev, ...heroesMap }))
      setCurrentTrip(options[0])
      setInlineTitleValue(options[0].name)
      if (res.data[0].presupuesto_total) {
        setBudgetTotal(Number(res.data[0].presupuesto_total))
      }
    }
  }, [user])

  useEffect(() => {
    loadTrips()
  }, [loadTrips])

  // 2. Cargar ciudades, tareas y gastos para el viaje activo
  useEffect(() => {
    if (!currentTrip?.id) return
    let isMounted = true

    // Cargar ciudades del viaje activo
    tripService.getCities(currentTrip.id).then((cities) => {
      if (!isMounted) return
      const loadedCities = cities || []
      const dests = loadedCities.map(mapCityToDestination)
      setDestinationsList(dests)

      if (loadedCities.length > 0) {
        setSelectedCityId(loadedCities[0].id)
        setSelectedCityName(loadedCities[0].nombre)
      } else {
        setSelectedCityId(null)
        setSelectedCityName("")
      }

      // Cargar tareas con mapeo de nombres de ciudades para este viaje
      const cityMap: Record<string, string> = {}
      loadedCities.forEach((c) => {
        cityMap[c.id] = c.nombre
      })

      tripService.getTasks(currentTrip.id).then((tasks) => {
        if (!isMounted) return
        if (tasks) {
          setTasksList(tasks.map((t) => mapDbTaskToTaskItem(t, cityMap)))
        } else {
          setTasksList([])
        }
      })
    })

    // Cargar presupuesto y gastos del viaje activo
    tripService.getExpenses(currentTrip.id).then((expenses) => {
      if (!isMounted) return
      if (expenses) {
        const approvedSum = expenses
          .filter((g) => g.estado === "aprobado")
          .reduce((sum, g) => sum + Number(g.monto), 0)
        setBudgetSpent(approvedSum)
      } else {
        setBudgetSpent(0)
      }
    })

    return () => {
      isMounted = false
    }
  }, [currentTrip.id])

  // Sembrar datos de ejemplo en Supabase con 1 clic
  const handleSeedInitialTrip = async () => {
    if (!user) {
      onNavigateToAuth?.()
      return
    }
    setIsSeeding(true)
    const result = await tripService.seedInitialTrip(user.id)
    setIsSeeding(false)
    if (result.data) {
      await loadTrips()
      setShowSeedBanner(false)
    }
  }

  const handleSaveHero = async (data: HeroData) => {
    if (data.tripName && data.tripName.trim()) {
      const newName = data.tripName.trim()
      const newDates = data.dates?.trim() || currentTrip.dates
      setCurrentTrip((prev) => ({ ...prev, name: newName, dates: newDates }))
      setInlineTitleValue(newName)
      setTripsList((prev) =>
        prev.map((t) =>
          t.id === currentTrip.id ? { ...t, name: newName, dates: newDates } : t
        )
      )
      setTripHeroes((prev) => ({
        ...prev,
        [currentTrip.id]: {
          ...data,
          tripName: newName,
          dates: newDates,
          travelersCount: data.travelersCount || 1,
        },
      }))

      // Persistir en Supabase
      await tripService.updateTrip(currentTrip.id, {
        nombre: newName,
        fecha_inicio: data.startDate || null,
        fecha_fin: data.endDate || null,
        num_viajeros: data.travelersCount || 1,
        titulo_cabecero: data.title,
        subtitulo_cabecero: data.subtitle,
        foto_portada: data.image,
        etiqueta_ubicacion: data.locationBadge,
      })
    }
  }

  const handleCreateTrip = async (data: HeroData) => {
    const newName = data.tripName?.trim() || "Nuevo viaje familiar"
    const newDates = data.dates?.trim() || "Fechas por definir"

    // Sin sesión no se puede guardar en Supabase (RLS exige auth.uid())
    if (isSupabaseConfigured && !user?.id) {
      setIsCreateTripModalOpen(false)
      onNavigateToAuth?.()
      return
    }

    let createdId = `trip-${Date.now()}`

    if (user?.id) {
      const res = await tripService.createTrip({
        nombre: newName,
        creado_por: user.id,
        fecha_inicio: data.startDate || null,
        fecha_fin: data.endDate || null,
        num_viajeros: data.travelersCount || 1,
        titulo_cabecero: data.title || "Una nueva historia por escribir.",
        subtitulo_cabecero: data.subtitle || "Explorando juntos nuevos rincones.",
        foto_portada: data.image || DEFAULT_COVER_IMAGE,
        etiqueta_ubicacion: data.locationBadge || newName,
        presupuesto_total: 2500,
      })
      if (res.error || !res.data?.id) {
        console.error("No se pudo guardar el viaje en Supabase:", res.error)
        alert(`No se pudo guardar el viaje: ${res.error ?? "error desconocido"}`)
        return
      }
      createdId = res.data.id
    }

    const newTrip: TripOption = {
      id: createdId,
      name: newName,
      dates: newDates,
    }

    setTripHeroes((prev) => ({
      ...prev,
      [createdId]: {
        ...data,
        tripName: newName,
        dates: newDates,
        startDate: data.startDate,
        endDate: data.endDate,
        travelersCount: data.travelersCount || 1,
        title: data.title || "Una nueva historia por escribir.",
        subtitle: data.subtitle || "Explorando juntos nuevos rincones.",
        image: data.image || DEFAULT_COVER_IMAGE,
        locationBadge: data.locationBadge || newName,
      },
    }))

    setTripsList((prev) => [newTrip, ...prev])
    setCurrentTrip(newTrip)
    setInlineTitleValue(newName)
    setIsCreateTripModalOpen(false)
  }

  const handleDeleteTrip = async () => {
    const tripId = currentTrip.id
    const res = await tripService.deleteTrip(tripId)
    if (!res.success) {
      console.error("No se pudo eliminar el viaje en Supabase:", res.error)
      alert(`No se pudo eliminar el viaje: ${res.error ?? "error desconocido"}`)
      return
    }

    const remaining = tripsList.filter((t) => t.id !== tripId)
    setTripsList(remaining)
    setTripHeroes((prev) => {
      const next = { ...prev }
      delete next[tripId]
      return next
    })

    const nextTrip = remaining[0]
    if (nextTrip) {
      setCurrentTrip(nextTrip)
      setInlineTitleValue(nextTrip.name)
    }
    setSelectedCityId(null)
  }

  const handleToggleTask = async (id: string) => {
    const target = tasksList.find((t) => t.id === id)
    if (!target) return
    const nextCompleted = !target.completed
    setTasksList((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: nextCompleted } : t))
    )

    // Persistir en Supabase
    await tripService.updateTask(id, {
      estado: nextCompleted ? "hecha" : "pendiente",
    })
  }

  const handleSaveDestination = async (data: DestinationFormData) => {
    if (editingCityData) {
      // Editar destino existente
      await tripService.updateCity(editingCityData.id, {
        nombre: data.name,
        dias: data.days,
        foto: data.image,
        titulo_cabecero: data.title,
        subtitulo_cabecero: data.subtitle,
      })

      setDestinationsList((prev) =>
        prev.map((d) =>
          d.id === editingCityData.id
            ? {
                ...d,
                name: data.name,
                nights: data.days,
                dates: `${data.days} ${data.days === 1 ? "día" : "días"}`,
                image: data.image,
                title: data.title,
                subtitle: data.subtitle,
              }
            : d
        )
      )

      if (selectedCityId === editingCityData.id) {
        setSelectedCityName(data.name)
      }

      setEditingCityData(null)
      setIsAddDestinationOpen(false)
    } else {
      // Crear nuevo destino
      const res = await tripService.createCity({
        viaje_id: currentTrip.id,
        nombre: data.name,
        dias: data.days,
        foto: data.image,
        titulo_cabecero: data.title,
        subtitulo_cabecero: data.subtitle,
        orden: destinationsList.length,
      })

      if (res.data) {
        const newDest = mapCityToDestination(res.data)
        setDestinationsList((prev) => [...prev, newDest])
      }

      setIsAddDestinationOpen(false)
    }
  }

  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail.trim()) return

    if (user?.id && !currentTrip.id.startsWith("demo-")) {
      await tripService.inviteMember(currentTrip.id, user.id, "viewer")
    }

    setInviteSuccess(true)
    setTimeout(() => {
      setInviteSuccess(false)
      setIsInviteOpen(false)
      setInviteEmail("")
    }, 1800)
  }

  return (
    <div className="min-h-screen w-full bg-[#FAF9F5] dark:bg-[#111713] text-[#203D34] dark:text-stone-100 flex flex-col lg:flex-row transition-colors">
      {/* Mobile Top Bar */}
      <header className="lg:hidden flex items-center justify-between p-4 bg-[#F7F5F0] dark:bg-[#141C17] border-b border-[#E6E2D8] dark:border-stone-800">
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-md hover:bg-stone-200 dark:hover:bg-stone-800 text-[#203D34] dark:text-stone-100"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        <span className="font-serif text-lg font-normal text-[#203D34] dark:text-stone-100">
          Travesía
        </span>

        <button
          type="button"
          onClick={toggleTheme}
          className="p-2 rounded-full border border-[#DFE2DA] dark:border-stone-700 bg-white/70 dark:bg-stone-900/60 text-[#4D5B54] dark:text-stone-300"
        >
          {theme === "dark" ? (
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
            </svg>
          ) : (
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>
      </header>

      {/* Sidebar Navigation */}
      <div
        className={`${isMobileMenuOpen ? "block" : "hidden"
          } lg:block shrink-0 z-40 lg:sticky lg:top-0 lg:h-screen lg:self-start`}
      >
        <Sidebar
          activeSection={selectedCityId ? "itinerario" : activeSection}
          onSectionChange={(s) => {
            setActiveSection(s)
            setSelectedCityId(null)
            setIsMobileMenuOpen(false)
          }}
          currentTrip={currentTrip}
          onTripChange={(trip) => {
            setCurrentTrip(trip)
            setInlineTitleValue(trip.name)
            setSelectedCityId(null)
          }}
          userName={userName}
          onSignOut={onSignOut}
          trips={tripsList}
          onEditCurrentTrip={() => setIsEditHeroModalOpen(true)}
          onNewTrip={() => setIsCreateTripModalOpen(true)}
          onDeleteCurrentTrip={handleDeleteTrip}
        />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col p-4 sm:p-7 md:p-9 lg:py-8 lg:px-10 max-w-[1240px] gap-7 overflow-y-auto">
        {selectedCityId ? (
          <CityDetailView
            cityId={selectedCityId}
            cityName={selectedCityName}
            cityData={destinationsList.find((d) => d.id === selectedCityId)}
            tripName={currentTrip.name}
            travelersCount={tripHeroes[currentTrip.id]?.travelersCount || 4}
            isAdmin={isAdmin}
            onBack={() => {
              setSelectedCityId(null)
              setActiveSection("itinerario")
            }}
            onBackToOverview={() => {
              setSelectedCityId(null)
              setActiveSection("general")
            }}
            onSelectCity={(id) => {
              const target = destinationsList.find((d) => d.id === id)
              if (target) {
                setSelectedCityId(target.id)
                setSelectedCityName(target.name)
              } else {
                setSelectedCityId(id)
                setSelectedCityName(id)
              }
            }}
            onEditCity={(dest) => {
              setEditingCityData(dest)
              setIsAddDestinationOpen(true)
            }}
          />
        ) : activeSection === "itinerario" ? (
          <ItineraryView
            trip={currentTrip}
            heroData={tripHeroes[currentTrip.id]}
            destinations={destinationsList}
            travelersCount={tripHeroes[currentTrip.id]?.travelersCount || 4}
            onBackToOverview={() => setActiveSection("general")}
            onSelectCity={(id) => {
              const target = destinationsList.find((d) => d.id === id)
              if (target) {
                setSelectedCityId(target.id)
                setSelectedCityName(target.name)
              } else {
                setSelectedCityId(id)
                setSelectedCityName(id)
              }
            }}
            onAddDestination={() => {
              setEditingCityData(null)
              setIsAddDestinationOpen(true)
            }}
            onEditCity={(dest) => {
              setEditingCityData(dest)
              setIsAddDestinationOpen(true)
            }}
            onUpdateDays={async (cityId, days) => {
              setDestinationsList((prev) =>
                prev.map((d) =>
                  d.id === cityId
                    ? {
                        ...d,
                        nights: days,
                        dates: `${days} ${days === 1 ? "día" : "días"}`,
                      }
                    : d
                )
              )
              await tripService.updateCity(cityId, { dias: days })
            }}
            onDeleteCity={async (cityId) => {
              setDestinationsList((prev) => prev.filter((d) => d.id !== cityId))
              await tripService.deleteCity(cityId)
            }}
            onInvite={() => setIsInviteOpen(true)}
          />
        ) : activeSection === "presupuesto" ? (
          <BudgetView
            tripId={currentTrip.id}
            tripName={currentTrip.name}
            tripDates={`${currentTrip.dates} · ${currentTrip.name}`}
            initialLimit={budgetTotal}
            onBack={() => setActiveSection("general")}
            onUpdateLimit={(newLimit) => setBudgetTotal(newLimit)}
          />
        ) : (
          <>
            {/* Context Bar */}
            <div className="flex items-center justify-between text-xs text-[#727B74] dark:text-stone-400 select-none">
              {/* Breadcrumb */}
              <div className="flex items-center gap-2">
                <span>Mis viajes</span>
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
                <span className="text-[#203D34] dark:text-stone-200 font-medium">
                  Vista general
                </span>
              </div>

              {/* Collaboration Status & Theme Toggle */}
              <div className="flex items-center gap-3 sm:gap-4">
                {user ? (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#E8EFEA] dark:bg-emerald-950/60 text-[#245544] dark:text-[#A7F3D0] text-[11px] font-medium shadow-2xs">
                    <span className="w-2 h-2 rounded-full bg-[#245544] dark:bg-emerald-400 animate-pulse" />
                    <span>Supabase conectado</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={onNavigateToAuth}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-[11px] font-medium hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-colors cursor-pointer"
                  >
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span>Modo demo · Iniciar sesión</span>
                  </button>
                )}

                <button
                  type="button"
                  title="Notificaciones"
                  aria-label="Ver notificaciones del viaje"
                  onClick={() =>
                    alert("Tienes 1 nueva tarea asignada en Sintra: Reservar entradas al Palacio da Pena.")
                  }
                  className="relative p-1.5 rounded-full hover:bg-[#EAE6DD] dark:hover:bg-stone-800 transition-colors text-[#4D5B54] dark:text-stone-300 cursor-pointer"
                >
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
                    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                  </svg>
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#245544] dark:bg-emerald-400" />
                </button>

                {/* Desktop Theme toggle */}
                <button
                  type="button"
                  onClick={toggleTheme}
                  title={
                    theme === "dark"
                      ? "Cambiar a modo claro"
                      : "Cambiar a modo oscuro"
                  }
                  aria-label="Cambiar tema visual"
                  className="hidden lg:flex p-1.5 rounded-full border border-[#DFE2DA] dark:border-stone-700 bg-white/70 dark:bg-stone-900/60 hover:bg-[#F0EEE6] dark:hover:bg-stone-800 text-[#4D5B54] dark:text-stone-300 transition-colors cursor-pointer shadow-2xs"
                >
                  {theme === "dark" ? (
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="5" />
                      <line x1="12" y1="1" x2="12" y2="3" />
                      <line x1="12" y1="21" x2="12" y2="23" />
                    </svg>
                  ) : (
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Banner de Bienvenida / Sembrado en Supabase */}
            {showSeedBanner && (
              <div className="p-4 sm:p-5 rounded-[12px] bg-gradient-to-r from-[#245544]/12 via-[#245544]/6 to-transparent dark:from-emerald-950/40 dark:via-emerald-900/20 border border-[#245544]/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#245544] dark:bg-emerald-400" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#245544] dark:text-[#A7F3D0]">
                      Base de datos conectada
                    </span>
                  </div>
                  <h4 className="font-serif text-base sm:text-lg font-normal text-[#203D34] dark:text-stone-100">
                    Tu cuenta aún no tiene viajes guardados en Supabase
                  </h4>
                  <p className="text-xs text-[#4D5B54] dark:text-stone-300">
                    Pulsa en el botón para sembrar automáticamente el viaje completo (ciudades, actividades, hoteles, presupuesto y tareas) en tu cuenta.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    type="button"
                    onClick={handleSeedInitialTrip}
                    disabled={isSeeding}
                    className="bg-[#245544] hover:bg-[#1b4335] text-white text-xs h-9 px-3.5 rounded-[8px] cursor-pointer shadow-xs"
                  >
                    {isSeeding ? "Poblando base de datos..." : "Poblar viaje de ejemplo"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateTripModalOpen(true)}
                    className="text-xs h-9 px-3.5 rounded-[8px] border-[#CCD2CA] dark:border-stone-700 cursor-pointer"
                  >
                    Crear viaje nuevo
                  </Button>
                </div>
              </div>
            )}

            {/* Title & Travelers Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] font-semibold tracking-wider text-[#245544] dark:text-[#A7F3D0] uppercase select-none">
                  Vuestra próxima historia
                </span>
                {isEditingTitleInline ? (
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault()
                      if (inlineTitleValue.trim()) {
                        const newName = inlineTitleValue.trim()
                        setCurrentTrip((prev) => ({ ...prev, name: newName }))
                        setTripsList((prev) =>
                          prev.map((t) =>
                            t.id === currentTrip.id ? { ...t, name: newName } : t
                          )
                        )
                        await tripService.updateTrip(currentTrip.id, { nombre: newName })
                      }
                      setIsEditingTitleInline(false)
                    }}
                    className="flex flex-wrap items-center gap-2 pt-1"
                  >
                    <input
                      type="text"
                      value={inlineTitleValue}
                      onChange={(e) => setInlineTitleValue(e.target.value)}
                      className="font-serif text-2xl sm:text-3xl lg:text-[38px] font-normal px-3 py-1 rounded-[8px] border-2 border-[#245544] bg-white dark:bg-stone-900 text-[#203D34] dark:text-stone-100 focus:outline-hidden shadow-xs min-w-[260px]"
                      autoFocus
                    />
                    <Button
                      type="submit"
                      className="h-9 px-3 rounded-[8px] bg-[#245544] hover:bg-[#1b4335] text-white text-xs font-semibold cursor-pointer"
                    >
                      Guardar
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setInlineTitleValue(currentTrip.name)
                        setIsEditingTitleInline(false)
                      }}
                      className="h-9 px-3 rounded-[8px] text-xs cursor-pointer"
                    >
                      Cancelar
                    </Button>
                  </form>
                ) : (
                  <div className="flex items-center gap-2.5 sm:gap-3 group">
                    <h1 className="font-serif text-3xl sm:text-4xl lg:text-[42px] font-normal leading-[1.12] tracking-tight text-[#203D34] dark:text-stone-100">
                      {currentTrip.name}
                    </h1>
                    {isAdmin && (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setInlineTitleValue(currentTrip.name)
                            setIsEditingTitleInline(true)
                          }}
                          title="Cambiar nombre de este viaje rápidamente"
                          aria-label="Editar nombre del viaje"
                          className="p-1.5 rounded-full hover:bg-[#EAE6DD] dark:hover:bg-stone-800 text-[#727B74] hover:text-[#203D34] dark:hover:text-stone-100 transition-colors cursor-pointer"
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
                            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                            <path d="m15 5 4 4" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsEditHeroModalOpen(true)}
                          title="Editar foto de portada, textos y detalles"
                          className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-[#245544] dark:text-[#A7F3D0] hover:underline cursor-pointer"
                        >
                          <span>Editar cabecero</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Travelers Avatars & Invite button */}
              <div className="flex items-center gap-3">
                <div className="flex items-center -space-x-2">
                  <Avatar className="h-[34px] w-[34px] border-2 border-[#FAF9F5] dark:border-stone-900 shadow-2xs">
                    <AvatarFallback className="bg-[#DDEAE2] text-[#245544] text-[11px] font-semibold">
                      CL
                    </AvatarFallback>
                  </Avatar>
                  <Avatar className="h-[34px] w-[34px] border-2 border-[#FAF9F5] dark:border-stone-900 shadow-2xs">
                    <AvatarFallback className="bg-[#EFE9DF] text-[#7A6242] text-[11px] font-semibold">
                      PM
                    </AvatarFallback>
                  </Avatar>
                  <Avatar className="h-[34px] w-[34px] border-2 border-[#FAF9F5] dark:border-stone-900 shadow-2xs">
                    <AvatarFallback className="bg-[#DDEAE2] text-[#245544] text-[11px] font-semibold">
                      LM
                    </AvatarFallback>
                  </Avatar>
                  <Avatar className="h-[34px] w-[34px] border-2 border-[#FAF9F5] dark:border-stone-900 shadow-2xs">
                    <AvatarFallback className="bg-[#EFE9DF] text-[#7A6242] text-[11px] font-semibold">
                      NM
                    </AvatarFallback>
                  </Avatar>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsInviteOpen(true)}
                  className="h-9 px-3.5 rounded-[8px] border-[#CCD2CA] dark:border-stone-700 bg-white dark:bg-stone-900 text-[#245544] dark:text-[#A7F3D0] hover:bg-[#E8EFEA] dark:hover:bg-stone-800 text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer"
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
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <line x1="19" y1="8" x2="19" y2="14" />
                    <line x1="22" y1="11" x2="16" y2="11" />
                  </svg>
                  <span>Invitar</span>
                </Button>
              </div>
            </div>

            {/* Hero Panorama & 21 Days Countdown with Admin Edit Button */}
            <TripHero
              tripName={currentTrip.name}
              initialData={tripHeroes[currentTrip.id]}
              daysRemaining={calculateDaysRemaining(tripHeroes[currentTrip.id]?.startDate)}
              departureDate={formatDepartureDay(tripHeroes[currentTrip.id]?.startDate, currentTrip.dates)}
              isAdmin={isAdmin}
              isEditModalOpen={isEditHeroModalOpen}
              onToggleEditModal={setIsEditHeroModalOpen}
              onSaveHero={handleSaveHero}
            />

            {/* Essential Trip Metadata Strip (Debajo del cabecero) */}
            <div className="flex flex-wrap items-center justify-between gap-4 py-2.5 border-y border-[#E6E2D8] dark:border-stone-800/80 text-xs select-none">
              <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                <div className="flex items-center gap-2 text-[#4D5B54] dark:text-stone-300">
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
                  <span className="font-semibold text-[#203D34] dark:text-stone-100">
                    {tripHeroes[currentTrip.id]?.dates || currentTrip.dates}
                  </span>
                  {getTripDurationBadge(
                    tripHeroes[currentTrip.id]?.startDate,
                    tripHeroes[currentTrip.id]?.endDate,
                    destinationsList
                  ) && (
                    <span className="text-[#727B74] font-medium">
                      {getTripDurationBadge(
                        tripHeroes[currentTrip.id]?.startDate,
                        tripHeroes[currentTrip.id]?.endDate,
                        destinationsList
                      )}
                    </span>
                  )}
                </div>

                <div className="hidden sm:block w-px h-4 bg-[#CCD2CA] dark:bg-stone-700" />

                <div className="flex items-center gap-2 text-[#4D5B54] dark:text-stone-300">
                  <svg
                    width="14"
                    height="14"
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
                    {tripHeroes[currentTrip.id]?.travelersCount || 4}{" "}
                    {(tripHeroes[currentTrip.id]?.travelersCount || 4) === 1
                      ? "viajero"
                      : "viajeros"}
                  </span>
                </div>

                <div className="hidden sm:block w-px h-4 bg-[#CCD2CA] dark:bg-stone-700" />

                <div className="flex items-center gap-2 text-[#4D5B54] dark:text-stone-300">
                  <svg
                    width="14"
                    height="14"
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
                    {destinationsList.length}{" "}
                    {destinationsList.length === 1 ? "destino" : "destinos"}
                  </span>
                </div>
              </div>

              {/* Current Weather Widget */}
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
                <span>
                  {destinationsList[0]?.name || "Lisboa"}, ahora · 21° · Soleado
                </span>
              </div>
            </div>

            {/* The Requested Destinations Slider */}
            <DestinationsSlider
              destinations={destinationsList}
              onAddDestination={() => setIsAddDestinationOpen(true)}
              onViewItinerary={() => {
                setSelectedCityId(null)
                setActiveSection("itinerario")
              }}
              onSelectDestination={(dest) => {
                setSelectedCityId(dest.id)
                setSelectedCityName(dest.name)
                setActiveSection("itinerario")
              }}
            />

            {/* Budget and Tasks 2-Column Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
              <BudgetOverviewCard
                spent={budgetSpent}
                total={budgetTotal}
                onViewBudget={() => setActiveSection("presupuesto")}
              />
              <UpcomingTasksCard
                tasks={tasksList}
                onToggleTask={handleToggleTask}
                onViewAllTasks={() => setActiveSection("tareas")}
              />
            </div>
          </>
        )}
      </main>

      {/* Modal: Invitar Viajeros */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md p-6 rounded-[16px] bg-white dark:bg-stone-900 border border-[#CCD2CA] dark:border-stone-700 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-xl font-normal text-[#203D34] dark:text-stone-100">
                Invitar a viajar juntos
              </h3>
              <button
                type="button"
                onClick={() => setIsInviteOpen(false)}
                className="p-1 rounded-sm text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-[#4D5B54] dark:text-stone-400">
              Envía una invitación a familiares o amigos para que se unan a planear{" "}
              <strong>{currentTrip.name}</strong>.
            </p>

            {inviteSuccess ? (
              <div className="p-3 bg-emerald-50 text-emerald-800 rounded-md text-xs font-medium border border-emerald-200">
                ¡Invitación enviada con éxito!
              </div>
            ) : (
              <form onSubmit={handleSendInvite} className="space-y-4">
                <div className="space-y-1.5">
                  <label
                    htmlFor="invite-email"
                    className="text-xs font-medium text-[#203D34] dark:text-stone-300"
                  >
                    Correo electrónico
                  </label>
                  <input
                    id="invite-email"
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="familiar@correo.com"
                    className="w-full h-11 px-3.5 rounded-[8px] border border-[#CCD2CA] dark:border-stone-700 bg-white dark:bg-stone-800 text-sm focus:outline-hidden focus:ring-1 focus:ring-[#245544]"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsInviteOpen(false)}
                    className="h-10 text-xs rounded-[8px]"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="h-10 text-xs bg-[#245544] hover:bg-[#1b4335] text-white rounded-[8px]"
                  >
                    Enviar invitación
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal: Crear / Editar Destino del Itinerario */}
      <CreateDestinationModal
        isOpen={isAddDestinationOpen}
        onClose={() => {
          setIsAddDestinationOpen(false)
          setEditingCityData(null)
        }}
        mode={editingCityData ? "edit" : "create"}
        tripName={currentTrip.name}
        initialData={
          editingCityData
            ? {
                id: editingCityData.id,
                name: editingCityData.name,
                days: editingCityData.nights,
                image: editingCityData.image,
                title: editingCityData.title,
                subtitle: editingCityData.subtitle,
              }
            : undefined
        }
        onSave={handleSaveDestination}
      />

      {/* Modal: Crear Nuevo Viaje usando EditHeroModal */}
      <EditHeroModal
        mode="create"
        isOpen={isCreateTripModalOpen}
        onClose={() => setIsCreateTripModalOpen(false)}
        onSave={handleCreateTrip}
      />
    </div>
  )
}
