import { useState } from "react"
import { Logo } from "@/components/auth/Logo"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export interface TripOption {
  id: string
  name: string
  dates: string
}

const TRIPS: TripOption[] = [
  { id: "portugal", name: "Portugal en familia", dates: "6–13 nov 2026" },
  { id: "menorca", name: "Un verano en Menorca", dates: "12–19 jul 2026" },
  { id: "pirineos", name: "Escapada a los Pirineos", dates: "2–5 abr 2026" },
]

interface SidebarProps {
  activeSection: string
  onSectionChange: (section: string) => void
  currentTrip?: TripOption
  onTripChange: (trip: TripOption) => void
  onNewTrip?: () => void
  onEditCurrentTrip?: () => void
  onDeleteCurrentTrip?: () => void | Promise<void>
  onSignOut?: () => void
  userName?: string
  trips?: TripOption[]
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}

export function Sidebar({
  activeSection,
  onSectionChange,
  currentTrip,
  onTripChange,
  onNewTrip,
  onEditCurrentTrip,
  onDeleteCurrentTrip,
  onSignOut,
  userName = "Clara López",
  trips = TRIPS,
  isCollapsed: propIsCollapsed,
  onToggleCollapse,
}: SidebarProps) {
  const [internalCollapsed, setInternalCollapsed] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      try {
        return localStorage.getItem("travesia_sidebar_collapsed") === "true"
      } catch {
        return false
      }
    }
    return false
  })

  const isCollapsed =
    propIsCollapsed !== undefined ? propIsCollapsed : internalCollapsed

  const toggleCollapse = () => {
    if (onToggleCollapse) {
      onToggleCollapse()
    } else {
      setInternalCollapsed((prev) => {
        const next = !prev
        try {
          localStorage.setItem("travesia_sidebar_collapsed", String(next))
        } catch {
          // ignore
        }
        return next
      })
    }
  }

  const [isTripMenuOpen, setIsTripMenuOpen] = useState(false)
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const tripName = currentTrip?.name || "Sin viajes"
  const shortTripName =
    tripName.length > 11 ? `${tripName.slice(0, 11).trimEnd()}...` : tripName
  const canDelete = trips.length >= 1

  const closeTripMenu = () => {
    setIsTripMenuOpen(false)
    setIsConfirmingDelete(false)
  }

  const handleConfirmDelete = async () => {
    if (!onDeleteCurrentTrip) return
    setIsDeleting(true)
    try {
      await onDeleteCurrentTrip()
    } finally {
      setIsDeleting(false)
      closeTripMenu()
    }
  }

  const navItems = [
    {
      id: "general",
      label: "Vista general",
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="7" height="9" rx="1" />
          <rect x="14" y="3" width="7" height="5" rx="1" />
          <rect x="14" y="12" width="7" height="9" rx="1" />
          <rect x="3" y="16" width="7" height="5" rx="1" />
        </svg>
      ),
    },
    {
      id: "itinerario",
      label: "Itinerario",
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="6" cy="19" r="3" />
          <path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" />
          <circle cx="18" cy="5" r="3" />
        </svg>
      ),
    },
    {
      id: "presupuesto",
      label: "Presupuesto",
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
          <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
        </svg>
      ),
    },
    {
      id: "tareas",
      label: "Ideas y tareas",
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m3 17 2 2 4-4" />
          <path d="m3 7 2 2 4-4" />
          <path d="M13 6h8" />
          <path d="M13 12h8" />
          <path d="M13 18h8" />
        </svg>
      ),
    },
  ]

  return (
    <aside
      aria-label="Navegación lateral de Travesía"
      className={`shrink-0 h-full min-h-screen flex flex-col justify-between border-r border-[#E6E2D8] dark:border-stone-800 bg-[#F7F5F0] dark:bg-[#141C17] transition-all duration-300 ease-in-out select-none ${
        isCollapsed
          ? "w-full lg:w-[72px] px-2.5 py-6"
          : "w-full lg:w-[248px] p-6 sm:p-7 lg:py-8 lg:px-5"
      }`}
    >
      {/* Top Part: Brand, Trip Selector & Navigation */}
      <div className="flex flex-col gap-6">
        {/* Brand & Collapse Toggle Button */}
        {isCollapsed ? (
          <div className="flex flex-col items-center gap-3">
            <div title="Travesía">
              <Logo iconSize={28} showText={false} />
            </div>
            <button
              type="button"
              onClick={toggleCollapse}
              title="Expandir barra lateral"
              aria-label="Expandir barra lateral"
              className="hidden lg:flex items-center justify-center w-8 h-8 rounded-[8px] border border-[#CCD2CA]/70 dark:border-stone-700 bg-white/80 dark:bg-stone-900/80 text-[#727B74] hover:text-[#203D34] hover:border-[#245544] dark:hover:text-stone-100 transition-all cursor-pointer shadow-2xs"
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
                <rect width="18" height="18" x="3" y="3" rx="2" />
                <path d="M9 3v18" />
                <path d="m13 15 3-3-3-3" />
              </svg>
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between pl-1">
            <Logo iconSize={30} textSize="text-[26px]" />
            <button
              type="button"
              onClick={toggleCollapse}
              title="Disminuir barra lateral"
              aria-label="Disminuir barra lateral"
              className="hidden lg:flex items-center justify-center w-8 h-8 rounded-[8px] border border-[#CCD2CA]/70 dark:border-stone-700 bg-white/80 dark:bg-stone-900/80 text-[#727B74] hover:text-[#203D34] hover:border-[#245544] dark:hover:text-stone-100 transition-all cursor-pointer shadow-2xs"
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
                <rect width="18" height="18" x="3" y="3" rx="2" />
                <path d="M9 3v18" />
                <path d="m14 9-3 3 3 3" />
              </svg>
            </button>
          </div>
        )}

        {/* Trip Selector */}
        <div className={`flex flex-col gap-2 ${isCollapsed ? "items-center" : ""}`}>
          {!isCollapsed && (
            <span className="text-[10px] font-semibold tracking-wider text-[#727B74] dark:text-stone-400 uppercase select-none">
              Tus viajes
            </span>
          )}

          <div className="relative">
            <button
              type="button"
              onClick={() =>
                isTripMenuOpen ? closeTripMenu() : setIsTripMenuOpen(true)
              }
              title={currentTrip?.name || "Tus viajes"}
              aria-label={currentTrip?.name || "Tus viajes"}
              className={`${
                isCollapsed
                  ? "w-10 h-10 rounded-[8px] flex items-center justify-center border border-[#CCD2CA] dark:border-stone-700 bg-white dark:bg-stone-900 shadow-2xs hover:border-[#245544]"
                  : "w-full flex items-center justify-between p-3 rounded-[8px] border border-[#CCD2CA] dark:border-stone-700 bg-white dark:bg-stone-900 shadow-2xs hover:border-[#245544]"
              } transition-all cursor-pointer text-left`}
            >
              <div className="flex items-center gap-2.5 overflow-hidden">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-[#245544] dark:text-emerald-400 shrink-0"
                >
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
                {!isCollapsed && (
                  <span className="text-xs font-semibold text-[#203D34] dark:text-stone-100 truncate">
                    {currentTrip?.name || "Sin viajes"}
                  </span>
                )}
              </div>

              {!isCollapsed && (
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className={`text-[#727B74] transition-transform ${
                    isTripMenuOpen ? "rotate-180" : ""
                  }`}
                >
                  <path
                    d="M3.5 5.25L7 8.75L10.5 5.25"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>

            {/* Dropdown Menu */}
            {isTripMenuOpen && (
              <div
                className={`absolute mt-1.5 p-1.5 rounded-[8px] bg-white dark:bg-stone-900 border border-[#E6E2D8] dark:border-stone-700 shadow-xl z-50 flex flex-col gap-1 animate-in fade-in zoom-in-95 duration-150 ${
                  isCollapsed
                    ? "top-0 left-full ml-3 w-64"
                    : "top-full left-0 right-0 w-full"
                }`}
              >
                {trips.map((trip) => (
                  <button
                    key={trip.id}
                    type="button"
                    onClick={() => {
                      onTripChange(trip)
                      closeTripMenu()
                    }}
                    className={`flex items-center justify-between p-2 rounded-[6px] text-left transition-colors cursor-pointer ${
                      trip.id === currentTrip?.id
                        ? "bg-[#E8EFEA] dark:bg-stone-800 text-[#245544] dark:text-[#A7F3D0]"
                        : "hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-200"
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="text-xs font-medium">{trip.name}</span>
                      <span className="text-[10px] text-[#727B74] dark:text-stone-400">
                        {trip.dates}
                      </span>
                    </div>
                    {trip.id === currentTrip?.id && (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="text-[#245544] dark:text-[#A7F3D0]"
                      >
                        <path
                          d="M3 7.5L5.5 10L11 4.5"
                          stroke="currentColor"
                          strokeWidth="1.7"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </button>
                ))}

                <div className="my-1 border-t border-[#DFE2DA] dark:border-stone-800" />

                {onEditCurrentTrip && (
                  <button
                    type="button"
                    onClick={() => {
                      closeTripMenu()
                      onEditCurrentTrip()
                    }}
                    title={currentTrip ? `Editar "${currentTrip.name}"` : "Editar viaje"}
                    className="flex items-center gap-2 p-2 rounded-[6px] text-xs font-medium text-[#203D34] hover:bg-[#E8EFEA] dark:text-stone-200 dark:hover:bg-stone-800 transition-colors cursor-pointer whitespace-nowrap overflow-hidden"
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
                      className="text-[#245544] dark:text-[#A7F3D0] shrink-0"
                    >
                      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                      <path d="m15 5 4 4" />
                    </svg>
                    <span className="truncate">
                      Editar &quot;{shortTripName}&quot;
                    </span>
                  </button>
                )}

                {onDeleteCurrentTrip &&
                  (isConfirmingDelete ? (
                    <div className="flex flex-col gap-2 p-2 rounded-[6px] bg-[#FBEDEA] dark:bg-red-950/40 border border-[#F1CFC8] dark:border-red-900/60 animate-in fade-in duration-150">
                      <span className="text-[11px] leading-snug text-[#8A2E1F] dark:text-red-200">
                        ¿Eliminar &quot;{shortTripName}&quot;? Se borrarán sus
                        ciudades, tareas y gastos.
                      </span>
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          id="confirm-delete-trip"
                          disabled={isDeleting}
                          onClick={handleConfirmDelete}
                          className="flex-1 px-2 py-1 rounded-[5px] text-[11px] font-semibold text-white bg-[#B23A26] hover:bg-[#992F1E] disabled:opacity-60 transition-colors cursor-pointer"
                        >
                          {isDeleting ? "Eliminando..." : "Eliminar"}
                        </button>
                        <button
                          type="button"
                          id="cancel-delete-trip"
                          disabled={isDeleting}
                          onClick={() => setIsConfirmingDelete(false)}
                          className="flex-1 px-2 py-1 rounded-[5px] text-[11px] font-medium text-[#4D5B54] dark:text-stone-200 bg-white dark:bg-stone-800 border border-[#E6E2D8] dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors cursor-pointer"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      id="delete-current-trip"
                      disabled={!canDelete}
                      onClick={() => setIsConfirmingDelete(true)}
                      title={
                        canDelete
                          ? currentTrip
                            ? `Eliminar "${currentTrip.name}"`
                            : "Eliminar viaje"
                          : "No hay viajes para eliminar"
                      }
                      className="flex items-center gap-2 p-2 rounded-[6px] text-xs font-medium text-[#B23A26] hover:bg-[#FBEDEA] dark:text-red-300 dark:hover:bg-red-950/40 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors cursor-pointer whitespace-nowrap overflow-hidden"
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
                        className="shrink-0"
                      >
                        <path d="M3 6h18" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                        <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        <line x1="10" y1="11" x2="10" y2="17" />
                        <line x1="14" y1="11" x2="14" y2="17" />
                      </svg>
                      <span className="truncate">
                        Eliminar &quot;{shortTripName}&quot;
                      </span>
                    </button>
                  ))}

                <div className="my-1 border-t border-[#DFE2DA] dark:border-stone-800" />

                <button
                  type="button"
                  onClick={() => {
                    closeTripMenu()
                    onNewTrip?.()
                  }}
                  className="flex items-center gap-2 p-2 rounded-[6px] text-xs font-semibold text-[#245544] hover:bg-[#E8EFEA] dark:text-emerald-400 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  <span>Crear nuevo viaje</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Sections */}
        <nav
          aria-label="Secciones del viaje"
          className={`flex flex-col gap-1.5 ${isCollapsed ? "items-center" : ""}`}
        >
          {navItems.map((item) => {
            const isActive = activeSection === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSectionChange(item.id)}
                title={item.label}
                aria-label={item.label}
                className={`flex items-center transition-all cursor-pointer ${
                  isCollapsed
                    ? "w-10 h-10 justify-center rounded-[8px]"
                    : "gap-3 px-3.5 py-2.5 rounded-[8px] text-xs font-medium"
                } ${
                  isActive
                    ? "bg-[#245544] text-white shadow-xs dark:bg-[#1f4b3c]"
                    : "text-[#4D5B54] dark:text-stone-300 hover:bg-[#EAE6DD] dark:hover:bg-stone-800"
                }`}
              >
                <span className="shrink-0">{item.icon}</span>
                {!isCollapsed && <span>{item.label}</span>}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Account & Help - Pinned to bottom with mt-auto */}
      <div
        className={`flex flex-col gap-4 pt-6 border-t border-[#E6E2D8] dark:border-stone-800 mt-auto ${
          isCollapsed ? "items-center" : ""
        }`}
      >
        <a
          href="#ayuda"
          onClick={(e) => {
            e.preventDefault()
            alert(
              "Centro de ayuda Travesía: soporte y guías de viaje familiar."
            )
          }}
          title="¿Te echamos una mano? Centro de ayuda"
          aria-label="Centro de ayuda"
          className={`flex items-center gap-2.5 text-xs text-[#4D5B54] hover:text-[#203D34] dark:text-stone-400 dark:hover:text-stone-200 transition-colors ${
            isCollapsed
              ? "w-10 h-10 justify-center rounded-[8px] hover:bg-[#EAE6DD] dark:hover:bg-stone-800"
              : "px-2"
          }`}
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
            className="shrink-0"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          {!isCollapsed && <span>¿Te echamos una mano?</span>}
        </a>

        {/* User Profile Card */}
        <div
          title={isCollapsed ? `${userName} · Tu espacio familiar` : undefined}
          className={`flex items-center justify-between rounded-[8px] hover:bg-[#EAE6DD] dark:hover:bg-stone-800 transition-colors ${
            isCollapsed ? "flex-col gap-2 p-1.5" : "p-2"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Avatar className="h-[36px] w-[36px] border-2 border-white dark:border-stone-700 shadow-2xs shrink-0">
              <AvatarFallback className="bg-[#E8EFEA] text-[#245544] font-medium text-xs">
                {userName
                  ? userName
                      .trim()
                      .split(/\s+/)
                      .map((p) => p[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()
                  : "TR"}
              </AvatarFallback>
            </Avatar>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-[#203D34] dark:text-stone-100 truncate">
                  {userName}
                </span>
                <span className="text-[10px] text-[#727B74] dark:text-stone-400">
                  Tu espacio familiar
                </span>
              </div>
            )}
          </div>

          {onSignOut && (
            <button
              type="button"
              onClick={onSignOut}
              title="Cerrar sesión"
              aria-label="Cerrar sesión"
              className="p-1.5 text-[#727B74] hover:text-[#203D34] dark:hover:text-stone-200 transition-colors cursor-pointer rounded-sm"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </aside>
  )
}
