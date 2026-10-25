import { useState } from "react"
import { Logo } from "@/components/auth/Logo"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useTheme } from "@/components/theme-provider"
import type { HeroData } from "./EditHeroModal"

interface WelcomeScreenProps {
  userName?: string
  userEmail?: string
  onCreateTrip: (templateData?: Partial<HeroData>) => void
  onSeedDemoTrip?: () => Promise<void> | void
  isSeeding?: boolean
  onSignOut?: () => void
}

interface TemplateIdea {
  id: string
  title: string
  tag: string
  description: string
  image: string
  templateData: Partial<HeroData>
}

const TEMPLATE_IDEAS: TemplateIdea[] = [
  {
    id: "portugal",
    title: "Ruta por Portugal",
    tag: "7 días · Cultura y Miradores",
    description: "Lisboa, Sintra y Oporto con tranvías, fado y pasteles de nata.",
    image: "/images/lisboa-panoramica.png",
    templateData: {
      tripName: "Ruta por Portugal",
      title: "Hay viajes que ya se sienten cerca.",
      subtitle: "Lisboa, Sintra y Oporto. Un camino para disfrutar juntos.",
      locationBadge: "Portugal",
      image: "/images/lisboa-panoramica.png",
      travelersCount: 2,
    },
  },
  {
    id: "menorca",
    title: "Un verano en Menorca",
    tag: "7 días · Calas y Atardeceres",
    description: "Aguas turquesas, senderos por la costa y pueblos de pescadores.",
    image: "/images/family-costa-brava.png",
    templateData: {
      tripName: "Un verano en Menorca",
      title: "Calas turquesas y brisa mediterránea.",
      subtitle: "Ciutadella, Fornells y senderos mágicos en familia.",
      locationBadge: "Menorca, España",
      image: "/images/family-costa-brava.png",
      travelersCount: 4,
    },
  },
  {
    id: "pirineos",
    title: "Escapada a los Pirineos",
    tag: "4 días · Montaña y Senderos",
    description: "Valles alpinos, rutas entre pinos y refugios con chimenea.",
    image: "/images/costa-brava.jpg",
    templateData: {
      tripName: "Escapada a los Pirineos",
      title: "Naturaleza viva y aire puro de montaña.",
      subtitle: "Senderos verdes, valles y refugios inolvidables.",
      locationBadge: "Pirineos, España",
      image: "/images/costa-brava.jpg",
      travelersCount: 2,
    },
  },
]

export function WelcomeScreen({
  userName = "Viajero",
  userEmail,
  onCreateTrip,
  onSeedDemoTrip,
  isSeeding = false,
  onSignOut,
}: WelcomeScreenProps) {
  const { theme, setTheme } = useTheme()
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  const userInitials = userName
    ? userName
        .trim()
        .split(/\s+/)
        .map((p) => p[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "TR"

  return (
    <div className="min-h-screen w-full bg-[#FAF9F5] dark:bg-[#111713] text-[#203D34] dark:text-stone-100 flex flex-col transition-colors selection:bg-[#245544]/15">
      {/* Top Navigation Bar */}
      <header className="w-full border-b border-[#E6E2D8] dark:border-stone-800 bg-[#F7F5F0]/80 dark:bg-[#141C17]/80 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between transition-colors">
        <div className="flex items-center gap-3">
          <Logo iconSize={30} textSize="text-2xl" />
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            title={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
            className="p-2 rounded-full border border-[#DFE2DA] dark:border-stone-700 bg-white/80 dark:bg-stone-900/80 text-[#4D5B54] dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
          >
            {theme === "dark" ? (
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
            ) : (
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
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>

          {/* User Profile Pill */}
          <div
            title={userEmail ? `Sesión iniciada como ${userEmail}` : undefined}
            className="hidden sm:flex items-center gap-2 pl-2 pr-3 py-1 rounded-full border border-[#E6E2D8] dark:border-stone-800 bg-white/70 dark:bg-stone-900/60"
          >
            <Avatar className="h-7 w-7 border border-[#DFE2DA] dark:border-stone-700">
              <AvatarFallback className="bg-[#E8EFEA] text-[#245544] dark:bg-emerald-950 dark:text-emerald-300 font-semibold text-[11px]">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs font-medium text-[#203D34] dark:text-stone-200 max-w-[140px] truncate">
              {userName}
            </span>
          </div>

          {/* Sign Out Button */}
          {onSignOut && (
            <button
              type="button"
              onClick={onSignOut}
              title="Cerrar sesión"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#727B74] hover:text-[#203D34] dark:text-stone-400 dark:hover:text-stone-200 border border-[#E6E2D8] dark:border-stone-800 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
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
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span className="hidden sm:inline">Cerrar sesión</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-10 sm:py-16 max-w-5xl mx-auto w-full">
        {/* Hero Section with Ambient Glow */}
        <div className="relative w-full text-center flex flex-col items-center">
          {/* Subtle Ambient Backlight */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 sm:w-[480px] sm:h-[480px] bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* Welcome Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EAE6DD]/70 dark:bg-stone-800/80 border border-[#DFE2DA] dark:border-stone-700/80 text-xs font-medium text-[#245544] dark:text-emerald-300 shadow-2xs mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Bienvenido a tu cuaderno de viajes</span>
          </div>

          {/* Headline */}
          <h1 className="font-serif text-3xl sm:text-5xl lg:text-[52px] leading-tight font-normal text-[#203D34] dark:text-stone-100 tracking-tight max-w-2xl">
            ¡Hola, {userName.split(" ")[0]}!
            <br />
            <span className="italic font-serif text-[#245544] dark:text-emerald-400">
              ¿Hacia dónde te llevará tu próxima aventura?
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-4 text-base sm:text-lg text-[#5C6760] dark:text-stone-300 max-w-xl font-normal leading-relaxed">
            Todavía no tienes ningún viaje planificado. Diseña tu ruta día a día,
            añade paradas inolvidables y mantén cada reserva bajo control.
          </p>

          {/* Primary & Secondary Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto">
            <Button
              type="button"
              onClick={() => onCreateTrip()}
              className="w-full sm:w-auto bg-[#245544] hover:bg-[#1C4537] text-[#F4F1EA] px-7 py-6 text-base font-medium rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer flex items-center justify-center gap-2.5"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>Crear mi primer viaje</span>
            </Button>

            {onSeedDemoTrip && (
              <Button
                type="button"
                variant="outline"
                disabled={isSeeding}
                onClick={() => onSeedDemoTrip()}
                className="w-full sm:w-auto bg-white/70 dark:bg-stone-900/60 border-[#D2D8CF] dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-[#203D34] dark:text-stone-200 px-6 py-6 text-sm font-medium rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {isSeeding ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#245544] dark:border-emerald-400 border-t-transparent rounded-full animate-spin" />
                    <span>Preparando ejemplo...</span>
                  </>
                ) : (
                  <>
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-amber-600 dark:text-amber-400"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    <span>Cargar viaje de ejemplo</span>
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Section: Plantillas rápidas de inspiración */}
        <div className="mt-16 w-full">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-semibold tracking-wide uppercase text-[#4D5B54] dark:text-stone-400">
                O inspírate con una plantilla rápida
              </h2>
              <p className="text-xs text-[#727B74] dark:text-stone-400 mt-0.5">
                Haz clic en cualquier propuesta para personalizarla de inmediato
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {TEMPLATE_IDEAS.map((idea) => {
              const isHovered = hoveredCard === idea.id
              return (
                <div
                  key={idea.id}
                  onMouseEnter={() => setHoveredCard(idea.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  onClick={() => onCreateTrip(idea.templateData)}
                  className={`group relative rounded-2xl overflow-hidden border border-[#E6E2D8] dark:border-stone-800 bg-white/70 dark:bg-stone-900/60 shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between hover:-translate-y-1.5`}
                >
                  {/* Card Image Banner */}
                  <div className="relative h-44 w-full overflow-hidden bg-stone-200 dark:bg-stone-800">
                    <img
                      src={idea.image}
                      alt={idea.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 text-[11px] font-medium rounded-full bg-black/40 backdrop-blur-md text-white border border-white/20">
                        {idea.tag}
                      </span>
                    </div>
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <h3 className="font-serif text-lg font-medium leading-snug drop-shadow-xs">
                        {idea.title}
                      </h3>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                    <p className="text-xs text-[#5C6760] dark:text-stone-300 leading-relaxed">
                      {idea.description}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-[#EAE6DD] dark:border-stone-800/80 text-xs font-medium text-[#245544] dark:text-emerald-400">
                      <span>Usar esta idea</span>
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={`transition-transform duration-200 ${
                          isHovered ? "translate-x-1" : ""
                        }`}
                      >
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Section: Características clave de Travesía */}
        <div className="mt-16 w-full pt-10 border-t border-[#E6E2D8] dark:border-stone-800">
          <div className="text-center max-w-lg mx-auto mb-8">
            <h3 className="font-serif text-xl sm:text-2xl font-normal text-[#203D34] dark:text-stone-100">
              Todo lo que necesitas para viajar en calma
            </h3>
            <p className="text-xs sm:text-sm text-[#727B74] dark:text-stone-400 mt-1">
              Sin hojas de cálculo complejas ni información dispersa en chats.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-5 rounded-2xl bg-[#F7F5F0]/60 dark:bg-stone-900/40 border border-[#EAE6DD] dark:border-stone-800/80 flex flex-col gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#E8EFEA] dark:bg-emerald-950/60 text-[#245544] dark:text-emerald-400 flex items-center justify-center shrink-0">
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
                  <circle cx="12" cy="12" r="10" />
                  <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-[#203D34] dark:text-stone-100">
                  Itinerario día a día
                </h4>
                <p className="text-xs text-[#5C6760] dark:text-stone-300 mt-1 leading-relaxed">
                  Distribuye los días por ciudades, selecciona visitas
                  imprescindibles y visualiza tu ruta con claridad.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="p-5 rounded-2xl bg-[#F7F5F0]/60 dark:bg-stone-900/40 border border-[#EAE6DD] dark:border-stone-800/80 flex flex-col gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#E8EFEA] dark:bg-emerald-950/60 text-[#245544] dark:text-emerald-400 flex items-center justify-center shrink-0">
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
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-[#203D34] dark:text-stone-100">
                  Viaja en compañía
                </h4>
                <p className="text-xs text-[#5C6760] dark:text-stone-300 mt-1 leading-relaxed">
                  Invita a familiares o amigos, reparte tareas previas al viaje y
                  decidid juntos el plan perfecto.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="p-5 rounded-2xl bg-[#F7F5F0]/60 dark:bg-stone-900/40 border border-[#EAE6DD] dark:border-stone-800/80 flex flex-col gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#E8EFEA] dark:bg-emerald-950/60 text-[#245544] dark:text-emerald-400 flex items-center justify-center shrink-0">
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
                  <rect x="2" y="5" width="20" height="14" rx="2" />
                  <line x1="2" y1="10" x2="22" y2="10" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-[#203D34] dark:text-stone-100">
                  Presupuesto y Alojamientos
                </h4>
                <p className="text-xs text-[#5C6760] dark:text-stone-300 mt-1 leading-relaxed">
                  Controla gastos previstos frente a reales, guarda tus hoteles
                  elegidos y mantén el transporte ordenado.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Subtle Footer */}
      <footer className="w-full py-6 text-center text-xs text-[#727B74] dark:text-stone-400 border-t border-[#E6E2D8] dark:border-stone-800">
        Travesía · Planificación tranquila para viajar mejor
      </footer>
    </div>
  )
}
