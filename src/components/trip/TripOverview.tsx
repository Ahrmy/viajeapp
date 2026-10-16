import { useState } from "react"
import { Sidebar, type TripOption } from "./Sidebar"
import { TripHero } from "./TripHero"
import { type HeroData } from "./EditHeroModal"
import { DestinationsSlider } from "./DestinationsSlider"
import { BudgetOverviewCard } from "./BudgetOverviewCard"
import { UpcomingTasksCard } from "./UpcomingTasksCard"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/theme-provider"

interface TripOverviewProps {
  onSignOut?: () => void
  userName?: string
  isAdmin?: boolean
}

export function TripOverview({
  onSignOut,
  userName = "Clara López",
  isAdmin = true,
}: TripOverviewProps) {
  const [activeSection, setActiveSection] = useState("general")
  const [tripsList, setTripsList] = useState<TripOption[]>([
    { id: "portugal", name: "Portugal en familia", dates: "6–13 nov 2026" },
    { id: "menorca", name: "Un verano en Menorca", dates: "12–19 jul 2026" },
    { id: "pirineos", name: "Escapada a los Pirineos", dates: "2–5 abr 2026" },
  ])
  const [currentTrip, setCurrentTrip] = useState<TripOption>(tripsList[0])
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isInviteOpen, setIsInviteOpen] = useState(false)
  const [isAddDestinationOpen, setIsAddDestinationOpen] = useState(false)
  const [isEditHeroModalOpen, setIsEditHeroModalOpen] = useState(false)
  const [isEditingTitleInline, setIsEditingTitleInline] = useState(false)
  const [inlineTitleValue, setInlineTitleValue] = useState(tripsList[0].name)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteSuccess, setInviteSuccess] = useState(false)
  const [newCityName, setNewCityName] = useState("")

  const handleSaveHero = (data: HeroData) => {
    if (data.tripName && data.tripName.trim()) {
      const newName = data.tripName.trim()
      setCurrentTrip((prev) => ({ ...prev, name: newName }))
      setInlineTitleValue(newName)
      setTripsList((prev) =>
        prev.map((t) => (t.id === currentTrip.id ? { ...t, name: newName } : t))
      )
    }
  }

  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail.trim()) return
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
        className={`${
          isMobileMenuOpen ? "block" : "hidden"
        } lg:block shrink-0 z-40 lg:sticky lg:top-0 lg:h-screen lg:self-start`}
      >
        <Sidebar
          activeSection={activeSection}
          onSectionChange={(s) => {
            setActiveSection(s)
            setIsMobileMenuOpen(false)
          }}
          currentTrip={currentTrip}
          onTripChange={(trip) => {
            setCurrentTrip(trip)
            setInlineTitleValue(trip.name)
          }}
          userName={userName}
          onSignOut={onSignOut}
          trips={tripsList}
          onEditCurrentTrip={() => setIsEditHeroModalOpen(true)}
          onNewTrip={() =>
            alert("Podrás crear nuevos viajes familiares muy pronto en Travesía.")
          }
        />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col p-4 sm:p-7 md:p-9 lg:py-8 lg:px-10 max-w-[1240px] gap-7 overflow-y-auto">
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
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#727B74] dark:text-stone-400">
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

        {/* Title & Travelers Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-semibold tracking-wider text-[#245544] dark:text-[#A7F3D0] uppercase select-none">
              Vuestra próxima historia
            </span>
            {isEditingTitleInline ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  if (inlineTitleValue.trim()) {
                    const newName = inlineTitleValue.trim()
                    setCurrentTrip((prev) => ({ ...prev, name: newName }))
                    setTripsList((prev) =>
                      prev.map((t) =>
                        t.id === currentTrip.id ? { ...t, name: newName } : t
                      )
                    )
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

        {/* Essential Trip Metadata Strip */}
        <div className="flex flex-wrap items-center justify-between gap-4 py-2 border-y border-[#E6E2D8] dark:border-stone-800/80 text-xs select-none">
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
              <span className="font-medium text-[#203D34] dark:text-stone-100">
                {currentTrip.dates}
              </span>
              <span className="text-[#727B74]">· 8 días / 7 noches</span>
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
              <span>4 viajeros</span>
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
              <span>3 destinos</span>
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
            <span>Lisboa, ahora · 21° · Soleado</span>
          </div>
        </div>

        {/* Hero Panorama & 21 Days Countdown with Admin Edit Button */}
        <TripHero
          tripName={currentTrip.name}
          daysRemaining={21}
          departureDate="6 de noviembre"
          isAdmin={isAdmin}
          isEditModalOpen={isEditHeroModalOpen}
          onToggleEditModal={setIsEditHeroModalOpen}
          onSaveHero={handleSaveHero}
        />

        {/* The Requested Destinations Slider */}
        <DestinationsSlider
          onAddDestination={() => setIsAddDestinationOpen(true)}
          onViewItinerary={() => setActiveSection("itinerario")}
        />

        {/* Budget and Tasks 2-Column Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
          <BudgetOverviewCard
            onViewBudget={() => setActiveSection("presupuesto")}
          />
          <UpcomingTasksCard
            onViewAllTasks={() => setActiveSection("tareas")}
          />
        </div>
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

      {/* Modal: Añadir Nuevo Destino */}
      {isAddDestinationOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md p-6 rounded-[16px] bg-white dark:bg-stone-900 border border-[#CCD2CA] dark:border-stone-700 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-xl font-normal text-[#203D34] dark:text-stone-100">
                Añadir nuevo lugar al viaje
              </h3>
              <button
                type="button"
                onClick={() => setIsAddDestinationOpen(false)}
                className="p-1 rounded-sm text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-[#4D5B54] dark:text-stone-400">
              Añade una nueva ciudad o parada a vuestro recorrido por {currentTrip.name}.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (!newCityName.trim()) return
                alert(`¡Destino "${newCityName}" añadido al itinerario!`)
                setNewCityName("")
                setIsAddDestinationOpen(false)
              }}
              className="space-y-4"
            >
              <div className="space-y-1.5">
                <label
                  htmlFor="new-city"
                  className="text-xs font-medium text-[#203D34] dark:text-stone-300"
                >
                  Nombre de la ciudad o destino
                </label>
                <input
                  id="new-city"
                  type="text"
                  required
                  value={newCityName}
                  onChange={(e) => setNewCityName(e.target.value)}
                  placeholder="Ej. Coímbra, Cascais, Algarve..."
                  className="w-full h-11 px-3.5 rounded-[8px] border border-[#CCD2CA] dark:border-stone-700 bg-white dark:bg-stone-800 text-sm focus:outline-hidden focus:ring-1 focus:ring-[#245544]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddDestinationOpen(false)}
                  className="h-10 text-xs rounded-[8px]"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="h-10 text-xs bg-[#245544] hover:bg-[#1b4335] text-white rounded-[8px]"
                >
                  Guardar destino
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
