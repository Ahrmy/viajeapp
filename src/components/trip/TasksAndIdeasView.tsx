import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { tripService } from "@/lib/tripService"
import type { TripMember, IdeaViaje, EstadoTarea, TipoIconoIdea } from "@/types/database"

interface TasksAndIdeasViewProps {
  tripId?: string
  tripName?: string
  tripDates?: string
  destinations?: Array<{ id: string; name: string }>
  members?: TripMember[]
  currentUser?: { id?: string; name?: string; email?: string } | null
  travelersCount?: number
  onBack: () => void
  onInvite?: () => void
}

function getInitials(name?: string, email?: string): string {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return parts[0].substring(0, 2).toUpperCase()
  }
  return email ? email.substring(0, 2).toUpperCase() : "VI"
}

// Iconografía para ideas compartidas (5 opciones: cuaderno predeterminado, caminata, playa, montaña, monumento)
export function renderIdeaIconBox(
  icono?: string | null,
  size: "normal" | "sm" = "normal"
) {
  const iconKey = (icono || "cuaderno").toLowerCase()
  const boxClasses =
    size === "sm"
      ? "w-8 h-8 rounded-[6px]"
      : "w-[60px] h-[68px] rounded-[8px]"
  const svgSize = size === "sm" ? "18" : "24"

  switch (iconKey) {
    case "caminata":
      return (
        <div
          title="Caminata"
          className={`${boxClasses} bg-[#FBF3E6] dark:bg-stone-800 text-[#92400E] dark:text-amber-300 flex items-center justify-center shrink-0 shadow-2xs border border-[#F6E3C5] dark:border-stone-700`}
        >
          <svg
            width={svgSize}
            height={svgSize}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="13" cy="4" r="2" />
            <path d="m9 20 2-7-1.5-2 3-3 2.5 2 2 1" />
            <path d="m6 16 3-3" />
            <path d="m14 13 2 7" />
            <path d="M18 10v10" />
          </svg>
        </div>
      )

    case "playa":
      return (
        <div
          title="Playa"
          className={`${boxClasses} bg-[#E0F2FE] dark:bg-stone-800 text-[#0369A1] dark:text-sky-300 flex items-center justify-center shrink-0 shadow-2xs border border-[#BAE6FD] dark:border-stone-700`}
        >
          <svg
            width={svgSize}
            height={svgSize}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 3a8 8 0 0 0-8 8h16a8 8 0 0 0-8-8Z" />
            <path d="M12 3v16" />
            <path d="M12 19a2 2 0 1 0 2-2" />
            <path d="M2 21c2-1 4-1 6 0s4 1 6 0 4-1 6 0" />
          </svg>
        </div>
      )

    case "montana":
      return (
        <div
          title="Montaña"
          className={`${boxClasses} bg-[#DCFCE7] dark:bg-stone-800 text-[#15803D] dark:text-emerald-300 flex items-center justify-center shrink-0 shadow-2xs border border-[#BBF7D0] dark:border-stone-700`}
        >
          <svg
            width={svgSize}
            height={svgSize}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m2 20 7-13 4 7 3-4 6 10H2Z" />
            <path d="m6 13 3 2 4-2" />
            <path d="m14 14 2 2 3-2" />
          </svg>
        </div>
      )

    case "monumento":
      return (
        <div
          title="Monumento"
          className={`${boxClasses} bg-[#FEE2E2] dark:bg-stone-800 text-[#BE123C] dark:text-rose-300 flex items-center justify-center shrink-0 shadow-2xs border border-[#FECDD3] dark:border-stone-700`}
        >
          <svg
            width={svgSize}
            height={svgSize}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m3 8 9-5 9 5H3Z" />
            <path d="M4 8h16" />
            <path d="M6 11v8" />
            <path d="M10 11v8" />
            <path d="M14 11v8" />
            <path d="M18 11v8" />
            <path d="M3 19h18" />
            <path d="M2 22h20" />
          </svg>
        </div>
      )

    case "cuaderno":
    default:
      return (
        <div
          title="Cuaderno / Bloc de notas"
          className={`${boxClasses} bg-[#E6EDE5] dark:bg-stone-800 text-[#245544] dark:text-[#A7F3D0] flex items-center justify-center shrink-0 shadow-2xs border border-[#DFE2DA] dark:border-stone-700`}
        >
          <svg
            width={svgSize}
            height={svgSize}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M2 6h4" />
            <path d="M2 10h4" />
            <path d="M2 14h4" />
            <path d="M2 18h4" />
            <rect width="16" height="20" x="4" y="2" rx="2" />
            <path d="M16 2v20" />
          </svg>
        </div>
      )
  }
}

interface LocalTaskItem {
  id: string
  viaje_id: string
  ciudad_id: string | null
  titulo: string
  asignado_a: string | null
  asignado_a_nombre: string
  creado_por_nombre: string
  ambito: string
  estado: EstadoTarea
  vencimiento: string | null
  creado_en: string
}

export function TasksAndIdeasView({
  tripId = "demo-portugal-2026",
  tripName = "Portugal en familia",
  tripDates = "6–13 noviembre 2026",
  destinations = [],
  members = [],
  currentUser,
  travelersCount = 4,
  onBack,
  onInvite,
}: TasksAndIdeasViewProps) {
  // Miembros efectivos
  const effectiveMembers = useMemo<TripMember[]>(() => {
    if (members && members.length > 0) return members
    return [
      {
        id: "m-1",
        viaje_id: tripId,
        nombre: "Clara López",
        email: "clara@ejemplo.com",
        rol: "owner",
        estado: "activo",
        invitado_en: new Date().toISOString(),
      },
      {
        id: "m-2",
        viaje_id: tripId,
        nombre: "Daniel López",
        email: "daniel@ejemplo.com",
        rol: "editor",
        estado: "activo",
        invitado_en: new Date().toISOString(),
      },
      {
        id: "m-3",
        viaje_id: tripId,
        nombre: "Lucía Martín",
        email: "lucia@ejemplo.com",
        rol: "viewer",
        estado: "activo",
        invitado_en: new Date().toISOString(),
      },
      {
        id: "m-4",
        viaje_id: tripId,
        nombre: "Nicolás Martín",
        email: "nicolas@ejemplo.com",
        rol: "viewer",
        estado: "activo",
        invitado_en: new Date().toISOString(),
      },
    ]
  }, [members, tripId])

  const effectiveTravelersCount = Math.max(
    effectiveMembers.length,
    travelersCount || 1
  )

  const currentUserName = currentUser?.name || effectiveMembers[0]?.nombre || "Clara López"

  // Opciones de ámbito basadas en el viaje y sus ciudades
  const availableScopes = useMemo(() => {
    const list = ["Todo el viaje", "Viaje general"]
    if (destinations && destinations.length > 0) {
      destinations.forEach((d) => {
        if (!list.includes(d.name)) list.push(d.name)
      })
    } else {
      list.push("Lisboa", "Sintra", "Oporto")
    }
    return list
  }, [destinations])

  // Estado de tareas
  const [tasks, setTasks] = useState<LocalTaskItem[]>([])
  const [ideas, setIdeas] = useState<IdeaViaje[]>([])
  const [selectedScope, setSelectedScope] = useState<string>("Todo el viaje")
  const [statusFilter, setStatusFilter] = useState<"por_hacer" | "todas" | "pendiente" | "en_curso" | "hecha">("por_hacer")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<"vencimiento" | "estado" | "titulo">("vencimiento")
  const [isCompletedExpanded, setIsCompletedExpanded] = useState(false)

  // Modales
  const [isAddIdeaOpen, setIsAddIdeaOpen] = useState(false)
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)
  const [activeMenuTaskId, setActiveMenuTaskId] = useState<string | null>(null)
  const [activeMenuIdeaId, setActiveMenuIdeaId] = useState<string | null>(null)

  // Formulario rápido inferior "Una cosa menos que olvidar"
  const [quickTitle, setQuickTitle] = useState("")
  const [quickScope, setQuickScope] = useState("Viaje general")
  const [quickAssignee, setQuickAssignee] = useState(currentUserName)
  const [quickDueDate, setQuickDueDate] = useState("")

  // Formulario modal de idea
  const [ideaTitle, setIdeaTitle] = useState("")
  const [ideaDesc, setIdeaDesc] = useState("")
  const [ideaScope, setIdeaScope] = useState("Lisboa")
  const [ideaIcon, setIdeaIcon] = useState<TipoIconoIdea>("cuaderno")

  // Formulario modal de tarea
  const [modalTaskTitle, setModalTaskTitle] = useState("")
  const [modalTaskScope, setModalTaskScope] = useState("Viaje general")
  const [modalTaskAssignee, setModalTaskAssignee] = useState(currentUserName)
  const [modalTaskDueDate, setModalTaskDueDate] = useState("")
  const [modalTaskStatus, setModalTaskStatus] = useState<EstadoTarea>("pendiente")

  // Notificación breve tras convertir o guardar
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  // Cargar tareas e ideas de Supabase / local
  useEffect(() => {
    let isMounted = true

    // Cargar tareas
    tripService.getTasks(tripId).then((dbTasks) => {
      if (!isMounted) return
      if (dbTasks && dbTasks.length > 0) {
        const mapped: LocalTaskItem[] = dbTasks.map((t, idx) => {
          // Resolver ciudad o ámbito
          let scopeName = "Viaje general"
          if (t.ciudad_id) {
            const matchedCity = destinations.find((d) => d.id === t.ciudad_id)
            if (matchedCity) scopeName = matchedCity.name
            else if (t.ciudad_id.includes("sintra")) scopeName = "Sintra"
            else if (t.ciudad_id.includes("lisboa")) scopeName = "Lisboa"
            else if (t.ciudad_id.includes("oporto")) scopeName = "Oporto"
          }

          // Asignado y creador
          const assigneeMember = effectiveMembers.find((m) => m.user_id === t.asignado_a || m.id === t.asignado_a)
          const assigneeName = assigneeMember?.nombre || (idx % 2 === 0 ? "Clara López" : "Daniel López")
          const creatorName = idx % 2 === 0 ? "Nicolás Martín" : "Lucía Martín"

          return {
            id: t.id,
            viaje_id: t.viaje_id,
            ciudad_id: t.ciudad_id,
            titulo: t.titulo,
            asignado_a: t.asignado_a,
            asignado_a_nombre: assigneeName,
            creado_por_nombre: creatorName,
            ambito: scopeName,
            estado: t.estado,
            vencimiento: t.vencimiento,
            creado_en: t.creado_en,
          }
        })
        setTasks(mapped)
      } else {
        setTasks([])
      }
    })

    // Cargar ideas
    tripService.getIdeas(tripId).then((dbIdeas) => {
      if (!isMounted) return
      if (dbIdeas && dbIdeas.length > 0) {
        setIdeas(dbIdeas)
      } else {
        setIdeas([])
      }
    })

    return () => {
      isMounted = false
    }
  }, [tripId, destinations, effectiveMembers])

  // Métricas del resumen
  const openTasks = useMemo(() => tasks.filter((t) => t.estado !== "hecha"), [tasks])
  const doneTasks = useMemo(() => tasks.filter((t) => t.estado === "hecha"), [tasks])
  const pendingCount = useMemo(() => tasks.filter((t) => t.estado === "pendiente").length, [tasks])
  const inProgressCount = useMemo(() => tasks.filter((t) => t.estado === "en_curso").length, [tasks])

  // Próximo vencimiento
  const nextDueTask = useMemo(() => {
    const withDueDate = openTasks
      .filter((t) => t.vencimiento)
      .sort((a, b) => (a.vencimiento! > b.vencimiento! ? 1 : -1))
    return withDueDate[0] || null
  }, [openTasks])

  // Filtrado y orden de tareas
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((t) => {
        // Ámbito
        if (selectedScope !== "Todo el viaje" && t.ambito.toLowerCase() !== selectedScope.toLowerCase()) {
          return false
        }
        // Estado
        if (statusFilter === "por_hacer" && t.estado === "hecha") return false
        if (statusFilter === "pendiente" && t.estado !== "pendiente") return false
        if (statusFilter === "en_curso" && t.estado !== "en_curso") return false
        if (statusFilter === "hecha" && t.estado !== "hecha") return false
        // Búsqueda
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase()
          return (
            t.titulo.toLowerCase().includes(q) ||
            t.ambito.toLowerCase().includes(q) ||
            t.asignado_a_nombre.toLowerCase().includes(q) ||
            t.creado_por_nombre.toLowerCase().includes(q)
          )
        }
        return true
      })
      .sort((a, b) => {
        if (sortBy === "vencimiento") {
          if (!a.vencimiento && !b.vencimiento) return 0
          if (!a.vencimiento) return 1
          if (!b.vencimiento) return -1
          return a.vencimiento.localeCompare(b.vencimiento)
        }
        if (sortBy === "estado") {
          return a.estado.localeCompare(b.estado)
        }
        return a.titulo.localeCompare(b.titulo)
      })
  }, [tasks, selectedScope, statusFilter, searchQuery, sortBy])

  // Ideas activas (no convertidas en tarea)
  const activeIdeas = useMemo(() => {
    return ideas.filter((i) => !i.convertida_en_tarea)
  }, [ideas])

  // Filtrado de ideas
  const filteredIdeas = useMemo(() => {
    return ideas.filter((idea) => {
      if (idea.convertida_en_tarea) return false
      if (selectedScope !== "Todo el viaje" && idea.ambito?.toLowerCase() !== selectedScope.toLowerCase()) {
        return false
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        return (
          idea.titulo.toLowerCase().includes(q) ||
          (idea.descripcion && idea.descripcion.toLowerCase().includes(q)) ||
          (idea.ambito && idea.ambito.toLowerCase().includes(q))
        )
      }
      return true
    })
  }, [ideas, selectedScope, searchQuery])

  // Toggle checkbox de tarea
  const handleToggleTask = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId)
    if (!task) return
    const newStatus: EstadoTarea = task.estado === "hecha" ? "pendiente" : "hecha"

    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, estado: newStatus } : t))
    )

    await tripService.updateTask(taskId, { estado: newStatus })
    showToast(newStatus === "hecha" ? "✓ Tarea completada" : "Tarea marcada como pendiente")
  }

  // Eliminar tarea
  const handleDeleteTask = async (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId))
    setActiveMenuTaskId(null)
    await tripService.deleteTask(taskId)
    showToast("Tarea eliminada")
  }

  // Convertir idea en tarea (desaparece de ideas y se añade a tareas)
  const handleConvertIdeaToTask = async (idea: IdeaViaje) => {
    const city = destinations.find((d) => d.name.toLowerCase() === idea.ambito?.toLowerCase())

    const newTask: LocalTaskItem = {
      id: `task-from-idea-${Date.now()}`,
      viaje_id: tripId,
      ciudad_id: city?.id || null,
      titulo: idea.titulo,
      asignado_a: null,
      asignado_a_nombre: currentUserName,
      creado_por_nombre: idea.creado_por_nombre || currentUserName,
      ambito: idea.ambito || "Viaje general",
      estado: "pendiente",
      vencimiento: null,
      creado_en: new Date().toISOString(),
    }

    // Añadir a tareas y quitar inmediatamente de ideas
    setTasks((prev) => [newTask, ...prev])
    setIdeas((prev) => prev.filter((i) => i.id !== idea.id))

    await tripService.createTask({
      viaje_id: tripId,
      ciudad_id: newTask.ciudad_id,
      titulo: newTask.titulo,
      estado: "pendiente",
    })

    await tripService.updateIdea(idea.id, { convertida_en_tarea: true })
    showToast(`✓ "${idea.titulo}" convertida en tarea`)
  }

  // Eliminar idea
  const handleDeleteIdea = async (ideaId: string) => {
    setIdeas((prev) => prev.filter((i) => i.id !== ideaId))
    setActiveMenuIdeaId(null)
    await tripService.deleteIdea(ideaId)
    showToast("Idea eliminada")
  }

  // Crear tarea rápida
  const handleCreateQuickTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!quickTitle.trim()) return

    const city = destinations.find((d) => d.name.toLowerCase() === quickScope.toLowerCase())

    const newTask: LocalTaskItem = {
      id: `task-${Date.now()}`,
      viaje_id: tripId,
      ciudad_id: city?.id || null,
      titulo: quickTitle.trim(),
      asignado_a: null,
      asignado_a_nombre: quickAssignee,
      creado_por_nombre: currentUserName,
      ambito: quickScope,
      estado: "pendiente",
      vencimiento: quickDueDate || null,
      creado_en: new Date().toISOString(),
    }

    setTasks((prev) => [newTask, ...prev])
    setQuickTitle("")
    setQuickDueDate("")

    await tripService.createTask({
      viaje_id: tripId,
      ciudad_id: newTask.ciudad_id,
      titulo: newTask.titulo,
      estado: "pendiente",
      vencimiento: newTask.vencimiento,
    })

    showToast("✓ Tarea creada con éxito")
  }

  // Crear idea modal
  const handleCreateIdeaModal = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!ideaTitle.trim()) return

    const newIdea: IdeaViaje = {
      id: `idea-${Date.now()}`,
      viaje_id: tripId,
      ambito: ideaScope,
      titulo: ideaTitle.trim(),
      descripcion: ideaDesc.trim(),
      icono: ideaIcon,
      foto_url: null,
      creado_por_nombre: currentUserName,
      convertida_en_tarea: false,
      creado_en: new Date().toISOString(),
    }

    setIdeas((prev) => [newIdea, ...prev])
    setIsAddIdeaOpen(false)
    setIdeaTitle("")
    setIdeaDesc("")
    setIdeaIcon("cuaderno")

    await tripService.createIdea(newIdea)
    showToast("✓ Idea compartida con el grupo")
  }

  // Crear tarea modal
  const handleCreateTaskModal = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!modalTaskTitle.trim()) return

    const city = destinations.find((d) => d.name.toLowerCase() === modalTaskScope.toLowerCase())

    const newTask: LocalTaskItem = {
      id: `task-${Date.now()}`,
      viaje_id: tripId,
      ciudad_id: city?.id || null,
      titulo: modalTaskTitle.trim(),
      asignado_a: null,
      asignado_a_nombre: modalTaskAssignee,
      creado_por_nombre: currentUserName,
      ambito: modalTaskScope,
      estado: modalTaskStatus,
      vencimiento: modalTaskDueDate || null,
      creado_en: new Date().toISOString(),
    }

    setTasks((prev) => [newTask, ...prev])
    setIsAddTaskOpen(false)
    setModalTaskTitle("")
    setModalTaskDueDate("")

    await tripService.createTask({
      viaje_id: tripId,
      ciudad_id: newTask.ciudad_id,
      titulo: newTask.titulo,
      estado: newTask.estado,
      vencimiento: newTask.vencimiento,
    })

    showToast("✓ Tarea creada con éxito")
  }

  // Formato de fechas
  const formatDueDate = (dateStr: string | null) => {
    if (!dateStr) return "Sin vencimiento"
    try {
      const parts = dateStr.split("-")
      if (parts.length === 3) {
        const months = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"]
        const day = parseInt(parts[2], 10)
        const month = months[parseInt(parts[1], 10) - 1]
        return `Antes del ${day} ${month}`
      }
      return `Antes del ${dateStr}`
    } catch {
      return dateStr
    }
  }

  const formatShortDate = (dateStr: string | null) => {
    if (!dateStr) return ""
    try {
      const parts = dateStr.split("-")
      if (parts.length === 3) {
        const months = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"]
        const day = parseInt(parts[2], 10)
        const month = months[parseInt(parts[1], 10) - 1]
        return `${day} ${month}`
      }
      return dateStr
    } catch {
      return dateStr
    }
  }

  const todayFormatted = new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date())

  return (
    <div className="flex-1 flex flex-col gap-7 select-none animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-[8px] bg-[#245544] text-white text-xs font-semibold shadow-lg flex items-center gap-2 animate-in slide-in-from-bottom-2">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Context Bar & Breadcrumb */}
      <div className="flex items-center justify-between text-xs text-[#727B74] dark:text-stone-400">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className="hover:text-[#203D34] dark:hover:text-stone-200 hover:underline transition-colors cursor-pointer"
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
          <span className="font-semibold text-[#203D34] dark:text-stone-100">
            Ideas y tareas
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-[11px] text-[#727B74] dark:text-stone-400">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-[#245544] dark:text-emerald-400"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>Todo guardado</span>
          </div>

          <button
            type="button"
            title="Sincronizado con Supabase"
            className="p-1 rounded-full text-[#245544] dark:text-emerald-400 hover:bg-[#E8EFEA] dark:hover:bg-stone-800 transition-colors"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
            </svg>
          </button>
        </div>
      </div>

      {/* 2. Hero Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="max-w-[650px] space-y-2">
          <span className="text-[10px] font-semibold text-[#245544] dark:text-[#A7F3D0] tracking-wider uppercase block">
            LOS BUENOS VIAJES SE IMAGINAN JUNTOS
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-normal text-[#203D34] dark:text-stone-100 leading-tight">
            Ideas y tareas
          </h1>
          <p className="text-xs sm:text-sm text-[#4D5B54] dark:text-stone-400 leading-relaxed">
            Lo que os ilusiona y lo que falta por hacer, en un mismo lugar.
          </p>
        </div>

        <div className="flex flex-col sm:items-end gap-3.5 shrink-0">
          {/* Travelers Group */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onInvite}
              className="flex items-center -space-x-1.5 cursor-pointer group"
              title="Ver y gestionar viajeros"
            >
              {effectiveMembers.slice(0, 4).map((m, idx) => (
                <div
                  key={m.id || idx}
                  title={`${m.nombre || m.email} (${m.rol === "owner" ? "Organizador" : m.rol === "editor" ? "Editor" : "Lector"})`}
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold border-2 border-[#FAF9F5] dark:border-stone-900 shadow-2xs transition-transform group-hover:scale-105 ${
                    idx % 2 === 0
                      ? "bg-[#DDEAE2] text-[#245544] dark:bg-stone-800 dark:text-[#A7F3D0]"
                      : "bg-[#EFE9DF] text-[#7A6242] dark:bg-stone-700 dark:text-amber-200"
                  }`}
                >
                  {getInitials(m.nombre, m.email)}
                </div>
              ))}
              {effectiveMembers.length > 4 && (
                <div
                  className="w-7 h-7 rounded-full bg-[#E8EFEA] text-[#245544] dark:bg-stone-800 dark:text-emerald-300 flex items-center justify-center text-[10px] font-bold border-2 border-[#FAF9F5] dark:border-stone-900 shadow-2xs group-hover:scale-105 transition-transform"
                  title={`+${effectiveMembers.length - 4} viajeros más`}
                >
                  +{effectiveMembers.length - 4}
                </div>
              )}
            </button>
            <span className="text-xs text-[#4D5B54] dark:text-stone-300 font-medium">
              {effectiveTravelersCount} {effectiveTravelersCount === 1 ? "viajero" : "viajeros"}
            </span>

            {onInvite && (
              <button
                type="button"
                onClick={onInvite}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] bg-white dark:bg-stone-800 border border-[#CCD2CA] dark:border-stone-700 text-[#245544] dark:text-[#A7F3D0] text-xs font-semibold hover:bg-[#E8EFEA] dark:hover:bg-stone-700/60 transition-colors shadow-2xs cursor-pointer ml-1"
                title="Invitar a un nuevo viajero"
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
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span>Invitar</span>
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddIdeaOpen(true)}
              className="h-10 px-4 rounded-[8px] border-[#CCD2CA] dark:border-stone-700 bg-white dark:bg-stone-900 text-[#245544] dark:text-[#A7F3D0] hover:bg-[#E8EFEA] dark:hover:bg-stone-800 text-xs font-semibold flex items-center gap-2 shadow-2xs cursor-pointer transition-colors"
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
                <path d="M9 18h6" />
                <path d="M10 22h4" />
              </svg>
              <span>Añadir idea</span>
            </Button>

            <Button
              type="button"
              onClick={() => setIsAddTaskOpen(true)}
              className="h-10 px-4 rounded-[8px] bg-[#245544] hover:bg-[#1b4335] text-white text-xs font-semibold flex items-center gap-2 shadow-xs cursor-pointer transition-colors"
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
              >
                <path d="M5 12h14" />
                <path d="M12 5v14" />
              </svg>
              <span>Añadir tarea</span>
            </Button>
          </div>
        </div>
      </div>

      {/* 3. Dates & Context Sub-strip */}
      <div className="flex flex-wrap items-center justify-between gap-2 py-2 border-y border-[#E6E2D8] dark:border-stone-800 text-xs text-[#4D5B54] dark:text-stone-300">
        <div className="flex items-center gap-2">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="text-[#245544] dark:text-emerald-400"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span className="font-semibold text-[#203D34] dark:text-stone-100">
            {tripDates}
          </span>
          <span className="text-[#727B74]">
            · {destinations.length > 0 ? destinations.map((d) => d.name).join(", ") : "Lisboa, Sintra y Oporto"}
          </span>
        </div>

        <div className="text-[11px] text-[#727B74] dark:text-stone-400">
          Hoy, {todayFormatted}
        </div>
      </div>

      {/* 4. Global Summary Strip ("Resumen de la planificación") */}
      <div className="p-4 sm:p-5 rounded-[12px] bg-[#E6EDE5] dark:bg-stone-800/60 border border-[#CCD2CA] dark:border-stone-700 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
        <div className="flex flex-wrap items-center gap-6 sm:gap-8">
          {/* Tareas abiertas */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[8px] bg-white/80 dark:bg-stone-800 text-[#245544] dark:text-[#A7F3D0] flex items-center justify-center shrink-0 shadow-2xs">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="m3 17 2 2 4-4" />
                <path d="m3 7 2 2 4-4" />
                <path d="M13 6h8" />
                <path d="M13 12h8" />
                <path d="M13 18h8" />
              </svg>
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-serif text-2xl font-bold text-[#203D34] dark:text-stone-100 leading-none">
                  {openTasks.length}
                </span>
                <span className="text-xs font-semibold text-[#203D34] dark:text-stone-200">
                  tareas por hacer
                </span>
              </div>
              <span className="text-[10px] text-[#4D5B54] dark:text-stone-400">
                {pendingCount} pendientes · {inProgressCount} en curso
              </span>
            </div>
          </div>

          <div className="hidden sm:block w-px h-9 bg-[#CCD2CA] dark:bg-stone-700" />

          {/* Ideas compartidas */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[8px] bg-white/80 dark:bg-stone-800 text-[#245544] dark:text-[#A7F3D0] flex items-center justify-center shrink-0 shadow-2xs">
              <svg
                width="19"
                height="19"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
                <path d="M9 18h6" />
                <path d="M10 22h4" />
              </svg>
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-serif text-2xl font-bold text-[#203D34] dark:text-stone-100 leading-none">
                  {activeIdeas.length}
                </span>
                <span className="text-xs text-[#4D5B54] dark:text-stone-300">
                  ideas para el viaje
                </span>
              </div>
            </div>
          </div>

          <div className="hidden sm:block w-px h-9 bg-[#CCD2CA] dark:bg-stone-700" />

          {/* Progreso */}
          <div className="flex items-center gap-2.5 text-xs text-[#4D5B54] dark:text-stone-300">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-[#245544] dark:text-emerald-400"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <span>
              {doneTasks.length} {doneTasks.length === 1 ? "tarea hecha" : "tareas hechas"}
            </span>
          </div>
        </div>

        {/* Próximo vencimiento */}
        {nextDueTask && (
          <div className="text-left md:text-right shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#CCD2CA] dark:border-stone-700">
            <span className="text-[10px] font-semibold tracking-wider text-[#727B74] dark:text-stone-400 uppercase block">
              PRÓXIMO VENCIMIENTO
            </span>
            <span className="text-xs font-semibold text-[#245544] dark:text-[#A7F3D0]">
              {nextDueTask.titulo} · {formatShortDate(nextDueTask.vencimiento)}
            </span>
          </div>
        )}
      </div>

      {/* 5. Scope & Search Filter Bar ("Filtro por ámbito") */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Scope Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <span className="text-xs text-[#727B74] dark:text-stone-400 mr-1 shrink-0">
            Ámbito
          </span>
          {availableScopes.map((scope) => {
            const isActive = selectedScope === scope
            return (
              <button
                key={scope}
                type="button"
                onClick={() => setSelectedScope(scope)}
                className={`px-3 py-1.5 rounded-[8px] text-xs font-medium shrink-0 transition-colors cursor-pointer ${
                  isActive
                    ? "bg-[#245544] text-white shadow-2xs"
                    : "bg-white dark:bg-stone-900 border border-[#DFE2DA] dark:border-stone-800 text-[#4D5B54] dark:text-stone-300 hover:bg-[#F5F2E9] dark:hover:bg-stone-800"
                }`}
              >
                {scope}
              </button>
            )
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-60 shrink-0">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#727B74]"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Buscar ideas o tareas…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-[8px] border border-[#CCD2CA] dark:border-stone-700 bg-white dark:bg-stone-900 text-xs text-[#203D34] dark:text-stone-100 placeholder:text-[#727B74] focus:outline-none focus:ring-1 focus:ring-[#245544]"
          />
        </div>
      </div>

      {/* 6. Main 2-Column Section ("Pendientes e inspiración") */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Tareas del viaje (7/12 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* Header of Tasks */}
          <div className="flex items-baseline justify-between gap-4">
            <div>
              <h2 className="font-serif text-2xl font-normal text-[#203D34] dark:text-stone-100">
                Lo próximo por hacer
              </h2>
              <p className="text-xs text-[#4D5B54] dark:text-stone-400">
                Pequeños pasos para tenerlo todo listo.
              </p>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 text-xs text-[#727B74] dark:text-stone-400">
              <span className="text-[11px]">Orden:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent border-0 text-[#203D34] dark:text-stone-200 text-xs font-semibold cursor-pointer focus:outline-none"
              >
                <option value="vencimiento">Por vencimiento</option>
                <option value="estado">Por estado</option>
                <option value="titulo">Por título</option>
              </select>
            </div>
          </div>

          {/* Status Filter Tabs (Soft pill bar) */}
          <div className="flex items-center gap-1 p-1 rounded-[8px] bg-[#F0EEE6] dark:bg-stone-800/80 overflow-x-auto text-[11px] font-semibold">
            <button
              type="button"
              onClick={() => setStatusFilter("por_hacer")}
              className={`px-3 py-1.5 rounded-[6px] transition-colors cursor-pointer shrink-0 ${
                statusFilter === "por_hacer"
                  ? "bg-[#245544] text-white shadow-2xs"
                  : "text-[#4D5B54] dark:text-stone-400 hover:text-[#203D34]"
              }`}
            >
              Por hacer · {openTasks.length}
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("todas")}
              className={`px-3 py-1.5 rounded-[6px] transition-colors cursor-pointer shrink-0 ${
                statusFilter === "todas"
                  ? "bg-[#245544] text-white shadow-2xs"
                  : "text-[#4D5B54] dark:text-stone-400 hover:text-[#203D34]"
              }`}
            >
              Todas · {tasks.length}
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("pendiente")}
              className={`px-3 py-1.5 rounded-[6px] transition-colors cursor-pointer shrink-0 ${
                statusFilter === "pendiente"
                  ? "bg-[#245544] text-white shadow-2xs"
                  : "text-[#4D5B54] dark:text-stone-400 hover:text-[#203D34]"
              }`}
            >
              Pendiente · {pendingCount}
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("en_curso")}
              className={`px-3 py-1.5 rounded-[6px] transition-colors cursor-pointer shrink-0 ${
                statusFilter === "en_curso"
                  ? "bg-[#245544] text-white shadow-2xs"
                  : "text-[#4D5B54] dark:text-stone-400 hover:text-[#203D34]"
              }`}
            >
              En curso · {inProgressCount}
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("hecha")}
              className={`px-3 py-1.5 rounded-[6px] transition-colors cursor-pointer shrink-0 ${
                statusFilter === "hecha"
                  ? "bg-[#245544] text-white shadow-2xs"
                  : "text-[#4D5B54] dark:text-stone-400 hover:text-[#203D34]"
              }`}
            >
              Hecha · {doneTasks.length}
            </button>
          </div>

          {/* List of Tasks */}
          <div className="bg-white dark:bg-stone-900 border border-[#DFE2DA] dark:border-stone-800 rounded-[12px] divide-y divide-[#DFE2DA] dark:divide-stone-800 shadow-2xs overflow-hidden">
            {filteredTasks.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#727B74] dark:text-stone-400">
                No hay tareas que coincidan con los filtros seleccionados.
              </div>
            ) : (
              filteredTasks.map((task) => {
                const isDone = task.estado === "hecha"
                const isPending = task.estado === "pendiente"
                const isInProgress = task.estado === "en_curso"

                return (
                  <div
                    key={task.id}
                    className={`p-4 sm:p-5 flex items-start gap-3.5 transition-colors ${
                      isDone ? "bg-[#FAF9F5]/60 dark:bg-stone-900/60" : "hover:bg-[#FAF9F5] dark:hover:bg-stone-800/40"
                    }`}
                  >
                    {/* Checkbox */}
                    <button
                      type="button"
                      onClick={() => handleToggleTask(task.id)}
                      className={`w-5 h-5 rounded-[4px] mt-0.5 border flex items-center justify-center shrink-0 cursor-pointer transition-all ${
                        isDone
                          ? "bg-[#245544] border-[#245544] text-white"
                          : "border-[#CCD2CA] hover:border-[#245544] bg-white dark:bg-stone-800"
                      }`}
                      title={isDone ? "Marcar como pendiente" : "Marcar como hecha"}
                    >
                      {isDone && (
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </button>

                    {/* Task Content */}
                    <div className="flex-1 flex flex-col gap-2.5 min-w-0">
                      {/* Title & Options */}
                      <div className="flex items-start justify-between gap-3">
                        <span
                          className={`text-sm font-semibold text-[#203D34] dark:text-stone-100 leading-snug ${
                            isDone ? "line-through opacity-60" : ""
                          }`}
                        >
                          {task.titulo}
                        </span>

                        <div className="relative shrink-0">
                          <button
                            type="button"
                            onClick={() =>
                              setActiveMenuTaskId(activeMenuTaskId === task.id ? null : task.id)
                            }
                            className="p-1 text-[#727B74] hover:text-[#203D34] dark:hover:text-stone-200 rounded cursor-pointer"
                          >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                              <circle cx="12" cy="12" r="2" />
                              <circle cx="19" cy="12" r="2" />
                              <circle cx="5" cy="12" r="2" />
                            </svg>
                          </button>

                          {activeMenuTaskId === task.id && (
                            <div className="absolute right-0 top-7 w-36 bg-white dark:bg-stone-800 border border-[#CCD2CA] dark:border-stone-700 rounded-[8px] shadow-lg py-1 z-30 text-xs">
                              <button
                                type="button"
                                onClick={() => {
                                  const nextState: EstadoTarea =
                                    task.estado === "pendiente" ? "en_curso" : "pendiente"
                                  tripService.updateTask(task.id, { estado: nextState })
                                  setTasks((prev) =>
                                    prev.map((t) => (t.id === task.id ? { ...t, estado: nextState } : t))
                                  )
                                  setActiveMenuTaskId(null)
                                }}
                                className="w-full text-left px-3 py-1.5 hover:bg-[#F5F2E9] dark:hover:bg-stone-700 text-[#203D34] dark:text-stone-100"
                              >
                                {task.estado === "pendiente" ? "Marcar en curso" : "Marcar pendiente"}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteTask(task.id)}
                                className="w-full text-left px-3 py-1.5 hover:bg-red-50 dark:hover:bg-red-950 text-red-600 dark:text-red-400"
                              >
                                Eliminar tarea
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Scope, Status & Due Date Badges */}
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        {/* Scope */}
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-[6px] bg-[#F5F2E9] dark:bg-stone-800 text-[10px] font-medium text-[#4D5B54] dark:text-stone-300">
                          <svg
                            width="11"
                            height="11"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="text-[#727B74]"
                          >
                            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                            <circle cx="12" cy="10" r="3" />
                          </svg>
                          <span>{task.ambito}</span>
                        </div>

                        {/* Status */}
                        {isPending && (
                          <div className="flex items-center gap-1 px-2 py-0.5 rounded-[6px] bg-[#F5ECDD] text-[10px] font-semibold text-[#836035]">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <circle cx="12" cy="12" r="10" />
                              <polyline points="12 6 12 12 16 14" />
                            </svg>
                            <span>Pendiente</span>
                          </div>
                        )}
                        {isInProgress && (
                          <div className="flex items-center gap-1 px-2 py-0.5 rounded-[6px] bg-[#E6EDE5] text-[10px] font-semibold text-[#245544]">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                            </svg>
                            <span>En curso</span>
                          </div>
                        )}
                        {isDone && (
                          <div className="flex items-center gap-1 px-2 py-0.5 rounded-[6px] bg-[#DDEAE2] text-[10px] font-semibold text-[#245544]">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            <span>Hecha</span>
                          </div>
                        )}

                        {/* Due date */}
                        <div className="flex items-center gap-1 ml-auto text-[10px] text-[#727B74] dark:text-stone-400">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                          </svg>
                          <span>{formatDueDate(task.vencimiento)}</span>
                        </div>
                      </div>

                      {/* Authorship & Assignment */}
                      <div className="flex flex-wrap items-center gap-6 pt-1 text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-[#F5ECDD] text-[#7A6242] text-[9px] font-bold flex items-center justify-center">
                            {getInitials(task.creado_por_nombre)}
                          </div>
                          <div>
                            <span className="text-[10px] text-[#727B74] block leading-none">
                              Creada por
                            </span>
                            <span className="text-[11px] font-medium text-[#4D5B54] dark:text-stone-300">
                              {task.creado_por_nombre}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-[#DDEAE2] text-[#245544] text-[9px] font-bold flex items-center justify-center">
                            {getInitials(task.asignado_a_nombre)}
                          </div>
                          <div>
                            <span className="text-[10px] text-[#727B74] block leading-none">
                              Asignada a
                            </span>
                            <span className="text-[11px] font-medium text-[#4D5B54] dark:text-stone-300">
                              {task.asignado_a_nombre}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            )}

            {/* Accordion: Tareas hechas */}
            {doneTasks.length > 0 && (
              <div className="border-t border-[#DFE2DA] dark:border-stone-800 bg-[#FAF9F5]/40 dark:bg-stone-900/40">
                <button
                  type="button"
                  onClick={() => setIsCompletedExpanded(!isCompletedExpanded)}
                  className="w-full px-5 py-3.5 flex items-center justify-between text-xs font-medium text-[#245544] dark:text-[#A7F3D0] hover:bg-[#FAF9F5] dark:hover:bg-stone-800 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                    <span>
                      Ver {doneTasks.length} {doneTasks.length === 1 ? "tarea hecha" : "tareas hechas"}
                    </span>
                  </div>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className={`transform transition-transform ${isCompletedExpanded ? "rotate-180" : ""}`}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {isCompletedExpanded && (
                  <div className="divide-y divide-[#DFE2DA] dark:divide-stone-800 px-5 pb-3">
                    {doneTasks.map((task) => (
                      <div key={task.id} className="py-2.5 flex items-center justify-between gap-3 text-xs opacity-75">
                        <div className="flex items-center gap-2.5">
                          <button
                            type="button"
                            onClick={() => handleToggleTask(task.id)}
                            className="w-4 h-4 rounded bg-[#245544] text-white flex items-center justify-center cursor-pointer"
                          >
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </button>
                          <span className="line-through text-[#4D5B54] dark:text-stone-300">
                            {task.titulo}
                          </span>
                        </div>
                        <span className="text-[10px] text-[#727B74]">
                          {task.ambito}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <p className="text-[11px] text-[#727B74] dark:text-stone-400">
            {openTasks.length} tareas abiertas de {tasks.length} · Las ideas siguen visibles a la derecha.
          </p>
        </div>

        {/* Right Column: Ideas para compartir (5/12 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Header of Ideas */}
          <div className="flex items-baseline justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="font-serif text-2xl font-normal text-[#203D34] dark:text-stone-100">
                  ¿Y si…?
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-[#E6EDE5] dark:bg-stone-800 text-[10px] font-semibold text-[#245544] dark:text-[#A7F3D0]">
                  {activeIdeas.length} {activeIdeas.length === 1 ? "idea" : "ideas"}
                </span>
              </div>
              <p className="text-xs text-[#4D5B54] dark:text-stone-400">
                Propuestas que todavía podéis hacer vuestras.
              </p>
            </div>
          </div>

          {/* Ideas Collection */}
          <div className="flex flex-col gap-3">
            {filteredIdeas.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#727B74] dark:text-stone-400 bg-white dark:bg-stone-900 border border-[#DFE2DA] dark:border-stone-800 rounded-[12px]">
                No hay ideas para este filtro. ¡Pulsa &quot;Añadir idea&quot; para proponer un plan!
              </div>
            ) : (
              filteredIdeas.map((idea) => {
                return (
                  <div
                    key={idea.id}
                    className="p-4 rounded-[12px] bg-white dark:bg-stone-900 border border-[#DFE2DA] dark:border-stone-800 flex flex-col gap-3 shadow-2xs hover:border-[#245544]/30 transition-all"
                  >
                    {/* Header: Scope & Menu */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-[6px] bg-[#F5F2E9] dark:bg-stone-800 text-[10px] font-medium text-[#4D5B54] dark:text-stone-300">
                        {idea.ambito === "Viaje general" ? (
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
                            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                          </svg>
                        ) : (
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                            <circle cx="12" cy="10" r="3" />
                          </svg>
                        )}
                        <span>{idea.ambito || "Viaje general"}</span>
                      </div>

                      <div className="relative">
                        <button
                          type="button"
                          onClick={() =>
                            setActiveMenuIdeaId(activeMenuIdeaId === idea.id ? null : idea.id)
                          }
                          className="p-1 text-[#727B74] hover:text-[#203D34] dark:hover:text-stone-200 rounded cursor-pointer"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <circle cx="12" cy="12" r="2" />
                            <circle cx="19" cy="12" r="2" />
                            <circle cx="5" cy="12" r="2" />
                          </svg>
                        </button>

                        {activeMenuIdeaId === idea.id && (
                          <div className="absolute right-0 top-7 w-32 bg-white dark:bg-stone-800 border border-[#CCD2CA] dark:border-stone-700 rounded-[8px] shadow-lg py-1 z-30 text-xs">
                            <button
                              type="button"
                              onClick={() => handleDeleteIdea(idea.id)}
                              className="w-full text-left px-3 py-1.5 hover:bg-red-50 dark:hover:bg-red-950 text-red-600 dark:text-red-400"
                            >
                              Eliminar idea
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Content & Thumbnail */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 space-y-1">
                        <h3 className="font-serif text-lg font-normal text-[#203D34] dark:text-stone-100 leading-snug">
                          {idea.titulo}
                        </h3>
                        {idea.descripcion && (
                          <p className="text-[11px] text-[#4D5B54] dark:text-stone-300 leading-relaxed">
                            {idea.descripcion}
                          </p>
                        )}
                      </div>

                      {/* Iconografía de la idea (cuaderno predeterminado, caminata, playa, montaña, monumento) */}
                      {renderIdeaIconBox(idea.icono)}
                    </div>

                    {/* Footer: Author & Convert Button */}
                    <div className="flex items-center justify-between pt-1 border-t border-[#F0EEE6] dark:border-stone-800">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-[#DDEAE2] text-[#245544] text-[8px] font-bold flex items-center justify-center">
                          {getInitials(idea.creado_por_nombre)}
                        </div>
                        <div>
                          <span className="text-[9px] text-[#727B74] block leading-none">
                            Creada por
                          </span>
                          <span className="text-[10px] font-medium text-[#4D5B54] dark:text-stone-300">
                            {idea.creado_por_nombre || "Viajero"}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleConvertIdeaToTask(idea)}
                        className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-[#245544] dark:text-emerald-400 hover:underline cursor-pointer"
                      >
                        <span>Convertir en tarea</span>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Ideas Footer Note */}
          <div className="flex items-start gap-2 p-1 text-[10px] text-[#727B74] dark:text-stone-400">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#245544] dark:text-emerald-400 shrink-0 mt-0.5">
              <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
              <path d="M9 18h6" />
              <path d="M10 22h4" />
            </svg>
            <p className="leading-relaxed">
              Cuando una idea tenga un siguiente paso, convertidla en tarea con un solo clic.
            </p>
          </div>
        </div>
      </div>

      {/* 7. Quick Task Form Card ("Una cosa menos que olvidar") */}
      <form
        onSubmit={handleCreateQuickTask}
        className="p-5 sm:p-6 rounded-[12px] bg-[#F5F2E9] dark:bg-stone-850 border border-[#DFE2DA] dark:border-stone-700 flex flex-col gap-4 shadow-2xs"
      >
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
          <div className="flex items-baseline gap-3">
            <h3 className="font-serif text-xl sm:text-2xl font-normal text-[#203D34] dark:text-stone-100">
              Una cosa menos que olvidar
            </h3>
            <span className="text-xs text-[#727B74] dark:text-stone-400">
              Añade una tarea sin salir del viaje.
            </span>
          </div>
          <span className="text-[10px] text-[#727B74] dark:text-stone-400 font-medium">
            Nueva tarea · Pendiente
          </span>
        </div>

        {/* Inputs row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
          {/* Título (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-[#4D5B54] dark:text-stone-300">
              Título de la tarea *
            </label>
            <input
              type="text"
              required
              placeholder="¿Qué falta por hacer?"
              value={quickTitle}
              onChange={(e) => setQuickTitle(e.target.value)}
              className="h-10 px-3 rounded-[8px] border border-[#CCD2CA] dark:border-stone-700 bg-white dark:bg-stone-900 text-xs text-[#203D34] dark:text-stone-100 placeholder:text-[#727B74] focus:outline-none focus:ring-1 focus:ring-[#245544]"
            />
          </div>

          {/* Ámbito (2 cols) */}
          <div className="lg:col-span-2 flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-[#4D5B54] dark:text-stone-300">
              Ámbito *
            </label>
            <select
              value={quickScope}
              onChange={(e) => setQuickScope(e.target.value)}
              className="h-10 px-3 rounded-[8px] border border-[#CCD2CA] dark:border-stone-700 bg-white dark:bg-stone-900 text-xs text-[#203D34] dark:text-stone-100 cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#245544]"
            >
              {availableScopes.filter((s) => s !== "Todo el viaje").map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Asignada a (3 cols) */}
          <div className="lg:col-span-3 flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-[#4D5B54] dark:text-stone-300">
              Asignada a
            </label>
            <select
              value={quickAssignee}
              onChange={(e) => setQuickAssignee(e.target.value)}
              className="h-10 px-3 rounded-[8px] border border-[#CCD2CA] dark:border-stone-700 bg-white dark:bg-stone-900 text-xs text-[#203D34] dark:text-stone-100 cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#245544]"
            >
              {effectiveMembers.map((m) => (
                <option key={m.id} value={m.nombre}>
                  {m.nombre} {m.nombre === currentUserName ? "(tú)" : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Vencimiento (2 cols) */}
          <div className="lg:col-span-2 flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-[#4D5B54] dark:text-stone-300">
              Vencimiento · opcional
            </label>
            <input
              type="date"
              value={quickDueDate}
              onChange={(e) => setQuickDueDate(e.target.value)}
              className="h-10 px-3 rounded-[8px] border border-[#CCD2CA] dark:border-stone-700 bg-white dark:bg-stone-900 text-xs text-[#203D34] dark:text-stone-100 cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#245544]"
            />
          </div>
        </div>

        {/* Footer actions row */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-6 h-6 rounded-full bg-[#DDEAE2] text-[#245544] text-[9px] font-bold flex items-center justify-center">
              {getInitials(currentUserName)}
            </div>
            <div>
              <span className="text-[10px] text-[#727B74] block leading-none">
                Creada por · tú
              </span>
              <span className="text-[11px] font-medium text-[#4D5B54] dark:text-stone-300">
                {currentUserName}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => {
                setQuickTitle("")
                setQuickDueDate("")
              }}
              className="text-xs font-medium text-[#727B74] hover:text-[#203D34] dark:hover:text-stone-200 cursor-pointer"
            >
              Cancelar
            </button>
            <Button
              type="submit"
              disabled={!quickTitle.trim()}
              className="h-9 px-4 rounded-[8px] bg-[#245544] hover:bg-[#1b4335] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M5 12h14" />
                <path d="M12 5v14" />
              </svg>
              <span>Crear tarea</span>
            </Button>
          </div>
        </div>
      </form>

      {/* Modal: Añadir Idea */}
      {isAddIdeaOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-stone-900 rounded-[16px] max-w-md w-full p-6 shadow-2xl border border-[#DFE2DA] dark:border-stone-800 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-semibold text-[#245544] dark:text-[#A7F3D0] uppercase tracking-wider block">
                  NUEVA PROPUESTA
                </span>
                <h3 className="font-serif text-2xl text-[#203D34] dark:text-stone-100">
                  ¿Y si hacemos esto?
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddIdeaOpen(false)}
                className="p-1 rounded-full text-[#727B74] hover:text-[#203D34] dark:hover:text-stone-200"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreateIdeaModal} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#4D5B54] dark:text-stone-300 block mb-1">
                  Título de la idea *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Cenar con fado en el barrio alto"
                  value={ideaTitle}
                  onChange={(e) => setIdeaTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-[8px] border border-[#CCD2CA] dark:border-stone-700 bg-white dark:bg-stone-800 text-xs text-[#203D34] dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-[#245544]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#4D5B54] dark:text-stone-300 block mb-1">
                  Descripción o notas
                </label>
                <textarea
                  rows={3}
                  placeholder="Explica qué os gustaría hacer, un día sugerido o detalles que os ilusionen..."
                  value={ideaDesc}
                  onChange={(e) => setIdeaDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-[8px] border border-[#CCD2CA] dark:border-stone-700 bg-white dark:bg-stone-800 text-xs text-[#203D34] dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-[#245544]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#4D5B54] dark:text-stone-300 block mb-1">
                    Ámbito *
                  </label>
                  <select
                    value={ideaScope}
                    onChange={(e) => setIdeaScope(e.target.value)}
                    className="w-full px-3 py-2 rounded-[8px] border border-[#CCD2CA] dark:border-stone-700 bg-white dark:bg-stone-800 text-xs text-[#203D34] dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-[#245544]"
                  >
                    {availableScopes.filter((s) => s !== "Todo el viaje").map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#4D5B54] dark:text-stone-300 block mb-1">
                    Icono
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="shrink-0">
                      {renderIdeaIconBox(ideaIcon, "sm")}
                    </div>
                    <select
                      value={ideaIcon}
                      onChange={(e) => setIdeaIcon(e.target.value as TipoIconoIdea)}
                      className="w-full px-3 py-2 rounded-[8px] border border-[#CCD2CA] dark:border-stone-700 bg-white dark:bg-stone-800 text-xs text-[#203D34] dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-[#245544]"
                    >
                      <option value="cuaderno">Bloc de notas / Cuaderno (Predeterminada)</option>
                      <option value="caminata">Caminata</option>
                      <option value="playa">Playa</option>
                      <option value="montana">Montaña</option>
                      <option value="monumento">Monumento</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddIdeaOpen(false)}
                  className="rounded-[8px] text-xs"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={!ideaTitle.trim()}
                  className="bg-[#245544] hover:bg-[#1b4335] text-white rounded-[8px] text-xs font-semibold"
                >
                  Guardar idea
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Añadir Tarea */}
      {isAddTaskOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-stone-900 rounded-[16px] max-w-md w-full p-6 shadow-2xl border border-[#DFE2DA] dark:border-stone-800 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-semibold text-[#245544] dark:text-[#A7F3D0] uppercase tracking-wider block">
                  NUEVA TAREA
                </span>
                <h3 className="font-serif text-2xl text-[#203D34] dark:text-stone-100">
                  Añadir tarea al viaje
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddTaskOpen(false)}
                className="p-1 rounded-full text-[#727B74] hover:text-[#203D34] dark:hover:text-stone-200"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreateTaskModal} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#4D5B54] dark:text-stone-300 block mb-1">
                  Título de la tarea *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Comprar entradas, reservar transfer..."
                  value={modalTaskTitle}
                  onChange={(e) => setModalTaskTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-[8px] border border-[#CCD2CA] dark:border-stone-700 bg-white dark:bg-stone-800 text-xs text-[#203D34] dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-[#245544]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#4D5B54] dark:text-stone-300 block mb-1">
                    Ámbito *
                  </label>
                  <select
                    value={modalTaskScope}
                    onChange={(e) => setModalTaskScope(e.target.value)}
                    className="w-full px-3 py-2 rounded-[8px] border border-[#CCD2CA] dark:border-stone-700 bg-white dark:bg-stone-800 text-xs text-[#203D34] dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-[#245544]"
                  >
                    {availableScopes.filter((s) => s !== "Todo el viaje").map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#4D5B54] dark:text-stone-300 block mb-1">
                    Asignada a
                  </label>
                  <select
                    value={modalTaskAssignee}
                    onChange={(e) => setModalTaskAssignee(e.target.value)}
                    className="w-full px-3 py-2 rounded-[8px] border border-[#CCD2CA] dark:border-stone-700 bg-white dark:bg-stone-800 text-xs text-[#203D34] dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-[#245544]"
                  >
                    {effectiveMembers.map((m) => (
                      <option key={m.id} value={m.nombre}>
                        {m.nombre} {m.nombre === currentUserName ? "(tú)" : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#4D5B54] dark:text-stone-300 block mb-1">
                    Vencimiento · opcional
                  </label>
                  <input
                    type="date"
                    value={modalTaskDueDate}
                    onChange={(e) => setModalTaskDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-[8px] border border-[#CCD2CA] dark:border-stone-700 bg-white dark:bg-stone-800 text-xs text-[#203D34] dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-[#245544]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#4D5B54] dark:text-stone-300 block mb-1">
                    Estado inicial
                  </label>
                  <select
                    value={modalTaskStatus}
                    onChange={(e) => setModalTaskStatus(e.target.value as EstadoTarea)}
                    className="w-full px-3 py-2 rounded-[8px] border border-[#CCD2CA] dark:border-stone-700 bg-white dark:bg-stone-800 text-xs text-[#203D34] dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-[#245544]"
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="en_curso">En curso</option>
                    <option value="hecha">Hecha</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddTaskOpen(false)}
                  className="rounded-[8px] text-xs"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={!modalTaskTitle.trim()}
                  className="bg-[#245544] hover:bg-[#1b4335] text-white rounded-[8px] text-xs font-semibold"
                >
                  Crear tarea
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
