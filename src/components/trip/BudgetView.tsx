import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { tripService } from "@/lib/tripService"
import type { TripMember } from "@/types/database"

interface BudgetViewProps {
  tripId?: string
  tripName?: string
  tripDates?: string
  initialLimit?: number
  members?: TripMember[]
  currentUser?: { id?: string; name?: string; email?: string } | null
  travelersCount?: number
  onBack: () => void
  onUpdateLimit?: (newLimit: number) => void
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

interface Expense {
  id: string
  title: string
  category: "alojamiento" | "transporte" | "actividades" | "comida" | "otros"
  categoryLabel: string
  status: "realizado" | "proyectado"
  description: string
  amount: number
  author: string
  authorInitials: string
  payer: string
  payerId?: string
  isPaid: boolean
}

const INITIAL_EXPENSES: Expense[] = [
  {
    id: "1",
    title: "Lisboa Pessoa Hotel",
    category: "alojamiento",
    categoryLabel: "Alojamiento",
    status: "realizado",
    description:
      "6–9 nov · 3 noches, 2 habitaciones. Reserva para toda la familia.",
    amount: 810,
    author: "Clara",
    authorInitials: "CL",
    payer: "Clara",
    isPaid: true,
  },
  {
    id: "2",
    title: "Tres noches en Oporto",
    category: "alojamiento",
    categoryLabel: "Alojamiento",
    status: "realizado",
    description:
      "10–13 nov · Apartamento en Cedofeita para los 4 viajeros.",
    amount: 720,
    author: "Daniel",
    authorInitials: "DL",
    payer: "Daniel",
    isPaid: true,
  },
  {
    id: "3",
    title: "Tren Faro → Lisboa",
    category: "transporte",
    categoryLabel: "Transporte",
    status: "realizado",
    description:
      "6 nov · Intercidades, solo ida. Cuatro billetes con equipaje incluido.",
    amount: 94,
    author: "Lucía",
    authorInitials: "LM",
    payer: "Clara",
    isPaid: true,
  },
  {
    id: "4",
    title: "Descubrir Lisboa juntos",
    category: "actividades",
    categoryLabel: "Actividades",
    status: "realizado",
    description:
      "7–8 nov · Entradas al Oceanário y al Monasterio de los Jerónimos.",
    amount: 216,
    author: "Lucía",
    authorInitials: "LM",
    payer: "Lucía",
    isPaid: true,
  },
  {
    id: "5",
    title: "Palacio da Pena, Sintra",
    category: "actividades",
    categoryLabel: "Actividades",
    status: "proyectado",
    description:
      "9 nov · Visita al palacio y al parque. Estimación para los 4 viajeros.",
    amount: 80,
    author: "Nicolás",
    authorInitials: "NM",
    payer: "Pendiente",
    isPaid: false,
  },
  {
    id: "6",
    title: "Sabores de Portugal",
    category: "comida",
    categoryLabel: "Comida y bebida",
    status: "proyectado",
    description:
      "6–13 nov · Fondo para comidas, cafés y alguna parada dulce en ruta.",
    amount: 600,
    author: "Clara",
    authorInitials: "CL",
    payer: "Pendiente",
    isPaid: false,
  },
]

export function BudgetView({
  tripId,
  tripName = "Portugal en familia",
  tripDates = "6–13 noviembre 2026 · Lisboa, Sintra y Oporto",
  initialLimit = 3200,
  members: propMembers,
  currentUser,
  travelersCount = 4,
  onBack,
  onUpdateLimit,
  onInvite,
}: BudgetViewProps) {
  const [localMembers, setLocalMembers] = useState<TripMember[]>([])

  // Cargar miembros si no vienen por props
  useEffect(() => {
    if (!propMembers || propMembers.length === 0) {
      if (tripId) {
        let isMounted = true
        tripService
          .getMembers(tripId, currentUser?.id, {
            name: currentUser?.name,
            email: currentUser?.email,
          })
          .then((m) => {
            if (isMounted && m && m.length > 0) {
              setLocalMembers(m)
            }
          })
        return () => {
          isMounted = false
        }
      }
    }
  }, [tripId, propMembers, currentUser])

  const effectiveMembers = useMemo<TripMember[]>(() => {
    if (propMembers && propMembers.length > 0) return propMembers
    if (localMembers.length > 0) return localMembers
    // Fallback unificado: 4 viajeros por defecto
    return [
      {
        id: "m-1",
        viaje_id: tripId || "",
        user_id: currentUser?.id,
        nombre: currentUser?.name || "Clara López",
        email: currentUser?.email || "clara.lopez@ejemplo.com",
        rol: "owner",
        estado: "activo",
        invitado_en: new Date().toISOString(),
      },
      {
        id: "m-2",
        viaje_id: tripId || "",
        nombre: "Daniel López",
        email: "daniel.l@ejemplo.com",
        rol: "editor",
        estado: "activo",
        invitado_en: new Date().toISOString(),
      },
      {
        id: "m-3",
        viaje_id: tripId || "",
        nombre: "Lucía Martín",
        email: "lucia.martin@ejemplo.com",
        rol: "viewer",
        estado: "activo",
        invitado_en: new Date().toISOString(),
      },
      {
        id: "m-4",
        viaje_id: tripId || "",
        nombre: "Nicolás Martín",
        email: "nicolas.m@ejemplo.com",
        rol: "viewer",
        estado: "activo",
        invitado_en: new Date().toISOString(),
      },
    ]
  }, [propMembers, localMembers, currentUser, tripId])

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    if (tripId && !tripId.startsWith("demo-") && tripId !== "portugal") {
      return []
    }
    return INITIAL_EXPENSES
  })
  const [totalLimit, setTotalLimit] = useState(initialLimit || 3200)
  const [statusFilter, setStatusFilter] = useState<
    "todos" | "realizados" | "proyectados"
  >("todos")
  const [categoryFilter, setCategoryFilter] = useState<string>("todas")

  // Modal Añadir Gasto
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newAmount, setNewAmount] = useState("")
  const [newCategory, setNewCategory] = useState<Expense["category"]>("otros")
  const [newStatus, setNewStatus] = useState<"realizado" | "proyectado">(
    "realizado"
  )
  const [newDescription, setNewDescription] = useState("")
  const [newPayerId, setNewPayerId] = useState<string>("")

  // Seleccionar por defecto el usuario actual en el dropdown de pagador
  useEffect(() => {
    if (effectiveMembers.length > 0) {
      const defaultPayer =
        effectiveMembers.find(
          (m) =>
            (currentUser?.id && m.user_id === currentUser.id) ||
            (currentUser?.email &&
              m.email?.toLowerCase() === currentUser.email.toLowerCase()) ||
            (currentUser?.name &&
              m.nombre.toLowerCase() === currentUser.name.toLowerCase())
        ) || effectiveMembers[0]

      if (
        defaultPayer &&
        (!newPayerId || !effectiveMembers.some((m) => m.id === newPayerId))
      ) {
        setNewPayerId(defaultPayer.id)
      }
    }
  }, [effectiveMembers, currentUser, newPayerId])

  // Modal Editar Límite
  const [isEditLimitOpen, setIsEditLimitOpen] = useState(false)
  const [limitInput, setLimitInput] = useState(totalLimit.toString())

  useEffect(() => {
    if (initialLimit && initialLimit > 0) {
      setTotalLimit(initialLimit)
      setLimitInput(initialLimit.toString())
    }
  }, [initialLimit])

  // Cargar gastos de Supabase si existe tripId y asociar con usuarios reales
  useEffect(() => {
    if (!tripId) return

    let isMounted = true
    tripService.getExpenses(tripId).then((dbExpenses) => {
      if (!isMounted) return
      if (dbExpenses && dbExpenses.length > 0) {
        const categoryLabels: Record<Expense["category"], string> = {
          alojamiento: "Alojamiento",
          transporte: "Transporte",
          actividades: "Actividades",
          comida: "Comida y bebida",
          otros: "Otros",
        }

        const mapped: Expense[] = dbExpenses.map((g) => {
          const rawCat = (g.categoria || "otros").toLowerCase()
          const cat: Expense["category"] = [
            "alojamiento",
            "transporte",
            "actividades",
            "comida",
          ].includes(rawCat)
            ? (rawCat as Expense["category"])
            : "otros"

          const isApproved = g.estado === "aprobado"

          // Enlazar con miembros reales del viaje
          const matchingMember = effectiveMembers.find(
            (m) =>
              (g.pagado_por &&
                (m.user_id === g.pagado_por || m.id === g.pagado_por)) ||
              (g.pagado_por_nombre &&
                (m.nombre.toLowerCase().trim() ===
                  g.pagado_por_nombre.toLowerCase().trim() ||
                  m.nombre
                    .toLowerCase()
                    .includes(g.pagado_por_nombre.toLowerCase()) ||
                  g.pagado_por_nombre
                    .toLowerCase()
                    .includes(m.nombre.toLowerCase())))
          )

          const payerName = matchingMember
            ? matchingMember.nombre
            : g.pagado_por_nombre || (isApproved ? "Registrado" : "Pendiente")

          const authorName =
            matchingMember?.nombre ||
            g.pagado_por_nombre ||
            currentUser?.name ||
            "Viajero"

          return {
            id: g.id,
            title: g.titulo || "Gasto sin título",
            category: cat,
            categoryLabel: categoryLabels[cat] || "Otros",
            status: isApproved ? "realizado" : "proyectado",
            description: g.notas || g.titulo || "Registrado en el viaje",
            amount: Number(g.monto),
            author: authorName,
            authorInitials: getInitials(authorName),
            payer: isApproved ? payerName : "Pendiente",
            payerId: matchingMember?.id || g.pagado_por || undefined,
            isPaid: isApproved,
          }
        })
        setExpenses(mapped)
      } else if (!tripId.startsWith("demo-") && tripId !== "portugal") {
        setExpenses([])
      }
    })

    return () => {
      isMounted = false
    }
  }, [tripId, effectiveMembers, currentUser])

  // Calculations
  const totalRealized = useMemo(
    () =>
      expenses
        .filter((e) => e.status === "realizado")
        .reduce((sum, e) => sum + e.amount, 0),
    [expenses]
  )

  const totalProjected = useMemo(
    () =>
      expenses
        .filter((e) => e.status === "proyectado")
        .reduce((sum, e) => sum + e.amount, 0),
    [expenses]
  )

  const availableRealized = totalLimit - totalRealized
  const totalForecast = totalRealized + totalProjected
  const forecastMargin = totalLimit - totalForecast
  const percentageRealized = Math.min(
    100,
    Math.round((totalRealized / totalLimit) * 1000) / 10
  )

  const effectiveTravelersCount = Math.max(
    effectiveMembers.length,
    travelersCount || 1
  )

  const perPersonLimit = Math.round(totalLimit / effectiveTravelersCount)
  const perPersonRealized = Math.round(totalRealized / effectiveTravelersCount)
  const perPersonAvailable = Math.round(
    availableRealized / effectiveTravelersCount
  )

  // Payments per real traveler
  const memberPaymentStats = useMemo(() => {
    const stats = effectiveMembers.map((member) => {
      const memberName = (member.nombre || member.email || "Viajero").trim()
      const firstName = memberName.split(" ")[0].toLowerCase()

      const totalPaid = expenses
        .filter((e) => e.status === "realizado")
        .filter((e) => {
          if (
            e.payerId &&
            (e.payerId === member.id || e.payerId === member.user_id)
          ) {
            return true
          }
          if (e.payer) {
            const pLower = e.payer.toLowerCase().trim()
            const mLower = memberName.toLowerCase()
            return (
              pLower === mLower ||
              pLower === firstName ||
              mLower.includes(pLower) ||
              pLower.includes(firstName)
            )
          }
          return false
        })
        .reduce((sum, e) => sum + e.amount, 0)

      const isCurrentUser = Boolean(
        (currentUser?.id && member.user_id === currentUser.id) ||
        (currentUser?.email &&
          member.email?.toLowerCase() === currentUser.email.toLowerCase()) ||
        (currentUser?.name &&
          member.nombre.toLowerCase() === currentUser.name.toLowerCase())
      )

      return {
        memberId: member.id,
        name: memberName,
        initials: getInitials(member.nombre, member.email),
        amount: totalPaid,
        isCurrentUser,
      }
    })

    const totalAssigned = stats.reduce((sum, s) => sum + s.amount, 0)
    const unassigned = totalRealized - totalAssigned
    if (unassigned > 0) {
      stats.push({
        memberId: "otros-pagos",
        name: "Fondo común / Otros",
        initials: "FC",
        amount: unassigned,
        isCurrentUser: false,
      })
    }

    return stats
  }, [effectiveMembers, expenses, currentUser, totalRealized])

  // Filtered expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      if (statusFilter === "realizados" && e.status !== "realizado") return false
      if (statusFilter === "proyectados" && e.status !== "proyectado") return false
      if (categoryFilter !== "todas" && e.category !== categoryFilter) return false
      return true
    })
  }, [expenses, statusFilter, categoryFilter])

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim() || !newAmount) return
    const amountVal = parseFloat(newAmount) || 0
    const categoryLabels: Record<Expense["category"], string> = {
      alojamiento: "Alojamiento",
      transporte: "Transporte",
      actividades: "Actividades",
      comida: "Comida y bebida",
      otros: "Otros",
    }

    const selectedMember = effectiveMembers.find((m) => m.id === newPayerId)
    const payerName = selectedMember
      ? selectedMember.nombre || selectedMember.email || "Viajero"
      : currentUser?.name || "Tú"
    const authorName = currentUser?.name || payerName || "Tú"
    const isRealized = newStatus === "realizado"

    let createdId = `exp-${Date.now()}`

    if (tripId) {
      const res = await tripService.createExpense({
        viaje_id: tripId,
        categoria: newCategory,
        titulo: newTitle.trim(),
        monto: amountVal,
        estado: isRealized ? "aprobado" : "pendiente",
        pagado_por:
          selectedMember?.user_id && selectedMember.user_id.length > 20
            ? selectedMember.user_id
            : null,
        pagado_por_nombre: isRealized ? payerName : null,
        notas: newDescription.trim() || undefined,
      })
      if (res.data?.id) {
        createdId = res.data.id
      }
    }

    const newExp: Expense = {
      id: createdId,
      title: newTitle.trim(),
      amount: amountVal,
      category: newCategory,
      categoryLabel: categoryLabels[newCategory],
      status: newStatus,
      description: newDescription.trim() || "Gasto añadido al viaje",
      author: authorName,
      authorInitials: getInitials(authorName, currentUser?.email),
      payer: isRealized ? payerName : "Pendiente",
      payerId: selectedMember?.id,
      isPaid: isRealized,
    }
    setExpenses((prev) => [newExp, ...prev])
    setIsAddExpenseOpen(false)
    setNewTitle("")
    setNewAmount("")
    setNewDescription("")
  }

  const handleToggleExpenseStatus = async (id: string) => {
    const target = expenses.find((e) => e.id === id)
    if (!target) return
    const nextStatus = target.status === "realizado" ? "proyectado" : "realizado"
    setExpenses((prev) =>
      prev.map((e) =>
        e.id === id
          ? {
            ...e,
            status: nextStatus,
            isPaid: nextStatus === "realizado",
            payer: nextStatus === "realizado" ? (e.payer === "Pendiente" ? "Clara" : e.payer) : "Pendiente",
          }
          : e
      )
    )

    if (tripId) {
      await tripService.updateExpense(id, {
        estado: nextStatus === "realizado" ? "aprobado" : "pendiente",
      })
    }
  }

  const handleDeleteExpense = async (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id))
    if (tripId) {
      await tripService.deleteExpense(id)
    }
  }

  const handleSaveLimit = async (e: React.FormEvent) => {
    e.preventDefault()
    const val = parseFloat(limitInput)
    if (!isNaN(val) && val > 0) {
      setTotalLimit(val)
      if (tripId) {
        await tripService.updateTrip(tripId, { presupuesto_total: val })
      }
      onUpdateLimit?.(val)
    }
    setIsEditLimitOpen(false)
  }

  return (
    <div className="flex flex-col gap-8 w-full max-w-[1140px] pb-16 animate-in fade-in duration-300">
      {/* Context & Breadcrumbs Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#727B74] dark:text-stone-400 select-none border-b border-[#E6E2D8] dark:border-stone-800 pb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={onBack}
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
          <span className="text-[#203D34] dark:text-stone-100 font-semibold">
            Presupuesto
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

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex flex-col gap-1.5 max-w-[690px]">
          <span className="text-[10px] sm:text-[11px] font-semibold tracking-wider text-[#245544] dark:text-[#A7F3D0] uppercase select-none">
            LAS CUENTAS CLARAS, EL VIAJE TRANQUILO
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-[52px] font-normal leading-[1.05] text-[#203D34] dark:text-stone-100">
            Presupuesto
          </h1>
          <p className="text-xs sm:text-sm text-[#4D5B54] dark:text-stone-300 leading-relaxed mt-1">
            Lo que habéis gastado y lo que está por venir, en un mismo lugar.
          </p>
          <div className="flex items-center gap-2 text-xs text-[#727B74] dark:text-stone-400 mt-1">
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
            <span>{tripDates}</span>
          </div>
        </div>

        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onInvite}
              className="flex items-center -space-x-2 cursor-pointer group"
              title="Ver y gestionar viajeros"
            >
              {effectiveMembers.slice(0, 4).map((m, idx) => (
                <span
                  key={m.id || idx}
                  title={`${m.nombre || m.email} (${m.rol === "owner" ? "Organizador" : m.rol === "editor" ? "Editor" : "Lector"})`}
                  className={`w-7 h-7 rounded-full text-[10px] font-semibold flex items-center justify-center border-2 border-white dark:border-stone-900 shadow-2xs transition-transform group-hover:scale-105 ${
                    idx % 2 === 0
                      ? "bg-[#DDEAE2] text-[#245544] dark:bg-stone-800 dark:text-[#A7F3D0]"
                      : "bg-[#EFE9DF] text-[#7A6242] dark:bg-stone-700 dark:text-amber-200"
                  }`}
                >
                  {getInitials(m.nombre, m.email)}
                </span>
              ))}
              {effectiveMembers.length > 4 && (
                <span
                  className="w-7 h-7 rounded-full bg-[#E8EFEA] dark:bg-stone-800 text-[#245544] dark:text-emerald-300 text-[10px] font-bold flex items-center justify-center border-2 border-white dark:border-stone-900 shadow-2xs group-hover:scale-105 transition-transform"
                  title={`+${effectiveMembers.length - 4} viajeros más`}
                >
                  +{effectiveMembers.length - 4}
                </span>
              )}
            </button>
            <span className="text-xs text-[#727B74] dark:text-stone-400 font-medium">
              {effectiveTravelersCount}{" "}
              {effectiveTravelersCount === 1 ? "viajero" : "viajeros"}
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

          <Button
            type="button"
            onClick={() => setIsAddExpenseOpen(true)}
            className="h-10 px-4 rounded-[8px] bg-[#245544] hover:bg-[#1b4335] text-white text-xs font-semibold flex items-center gap-2 shadow-xs cursor-pointer"
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
            <span>Añadir gasto</span>
          </Button>
        </div>
      </div>

      {/* SECTION 1: FINANCIAL OVERVIEW CARDS */}
      <section className="flex flex-col gap-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Card Left: Límite general (Dark Green) */}
          <div className="lg:col-span-7 xl:col-span-8 p-6 rounded-[14px] bg-[#245544] text-white shadow-xs flex flex-col justify-between gap-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-xs text-[#DDE8DD] font-medium block">
                  Límite proyectado general
                </span>
                <span className="font-serif text-4xl sm:text-5xl font-normal leading-tight text-white mt-1 block">
                  {totalLimit.toLocaleString("es-ES")} €
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setLimitInput(totalLimit.toString())
                  setIsEditLimitOpen(true)
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] border border-white/30 hover:border-white/60 bg-white/10 hover:bg-white/20 transition-all text-xs font-medium text-white cursor-pointer"
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                  <path d="m15 5 4 4" />
                </svg>
                <span>Editar límite</span>
              </button>
            </div>

            {/* Split Metrics */}
            <div className="flex items-center gap-6 sm:gap-8 pt-2">
              <div>
                <span className="text-[11px] text-[#DDE8DD] block">
                  Gasto realizado
                </span>
                <span className="font-serif text-2xl sm:text-3xl font-medium text-white">
                  {totalRealized.toLocaleString("es-ES")} €
                </span>
              </div>

              <div className="w-px h-10 bg-white/20" />

              <div>
                <span className="text-[11px] text-[#DDE8DD] block">
                  Disponible · frente a lo realizado
                </span>
                <span className="font-serif text-2xl sm:text-3xl font-medium text-white">
                  {availableRealized.toLocaleString("es-ES")} €
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="flex flex-col gap-2">
              <div className="h-2.5 w-full bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#DDE8DD] rounded-full transition-all duration-500"
                  style={{ width: `${percentageRealized}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-white">
                <span className="font-medium">
                  {percentageRealized}% consumido
                </span>
                <span className="text-[11px] text-[#DDE8DD]">
                  Solo gastos realizados
                </span>
              </div>
            </div>
          </div>

          {/* Card Right: Presupuesto por persona */}
          <div className="lg:col-span-5 xl:col-span-4 p-6 rounded-[14px] bg-white dark:bg-stone-900 border border-[#DFE2DA] dark:border-stone-800 shadow-2xs flex flex-col justify-between gap-5">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-xl font-normal text-[#203D34] dark:text-stone-100">
                El viaje, por persona
              </h3>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#245544"
                strokeWidth="1.8"
                className="dark:stroke-emerald-400"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="font-serif text-3xl sm:text-4xl font-normal text-[#203D34] dark:text-stone-100">
                {perPersonLimit.toLocaleString("es-ES")} €
              </span>
              <span className="text-xs text-[#727B74] dark:text-stone-400">
                de límite por viajero
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 py-2 border-y border-[#DFE2DA] dark:border-stone-800">
              <div>
                <span className="text-[11px] text-[#727B74] dark:text-stone-400 block">
                  Media realizada
                </span>
                <span className="font-serif text-xl font-medium text-[#203D34] dark:text-stone-100">
                  {perPersonRealized.toLocaleString("es-ES")} €
                </span>
              </div>
              <div>
                <span className="text-[11px] text-[#727B74] dark:text-stone-400 block">
                  Disponible medio
                </span>
                <span className="font-serif text-xl font-medium text-[#203D34] dark:text-stone-100">
                  {perPersonAvailable.toLocaleString("es-ES")} €
                </span>
              </div>
            </div>

            <p className="text-[11px] text-[#727B74] dark:text-stone-400 leading-relaxed">
              Reparto orientativo entre {effectiveTravelersCount}{" "}
              {effectiveTravelersCount === 1 ? "viajero" : "viajeros"}. La media no es lo que ha
              pagado cada miembro.
            </p>
          </div>
        </div>

        {/* Banner: Previsión con estimaciones */}
        <div className="p-4 sm:p-5 rounded-[12px] bg-[#F5F2E9] dark:bg-stone-800/60 border border-[#CCD2CA] dark:border-stone-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-[8px] bg-[#E8EFEA] dark:bg-stone-800 text-[#245544] dark:text-[#A7F3D0] flex items-center justify-center shrink-0">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <rect x="4" y="2" width="16" height="20" rx="2" />
                <line x1="8" y1="6" x2="16" y2="6" />
                <line x1="16" y1="14" x2="16" y2="18" />
                <path d="M16 10h.01" />
                <path d="M12 10h.01" />
                <path d="M8 10h.01" />
                <path d="M12 14h.01" />
                <path d="M8 14h.01" />
                <path d="M12 18h.01" />
                <path d="M8 18h.01" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[#203D34] dark:text-stone-100">
                Total previsto: {totalForecast.toLocaleString("es-ES")} €
              </h4>
              <p className="text-xs text-[#4D5B54] dark:text-stone-300">
                {totalRealized.toLocaleString("es-ES")} € realizados +{" "}
                {totalProjected.toLocaleString("es-ES")} € de estimaciones
                pendientes · {Math.round(totalForecast / effectiveTravelersCount).toLocaleString("es-ES")} €
                por persona
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right shrink-0">
            <span className="text-sm sm:text-base font-bold text-[#245544] dark:text-emerald-400 block">
              {forecastMargin.toLocaleString("es-ES")} € de margen
            </span>
            <span className="text-[10px] text-[#727B74] dark:text-stone-400">
              si se cumplen las estimaciones
            </span>
          </div>
        </div>
      </section>

      {/* SECTION 2: GASTOS DEL VIAJE */}
      <section className="flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-[#E6E2D8] dark:border-stone-800 pb-3">
          <div>
            <h2 className="font-serif text-2xl font-normal text-[#203D34] dark:text-stone-100">
              Cada gasto cuenta
            </h2>
            <p className="text-xs text-[#4D5B54] dark:text-stone-300 mt-0.5">
              Reservas, pequeños planes y lo que aún está por llegar.
            </p>
          </div>
          <span className="text-xs text-[#727B74] dark:text-stone-400">
            {filteredExpenses.length} gastos · importes para todo el grupo
          </span>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center p-1 rounded-[8px] bg-[#F0EEE6] dark:bg-stone-800/80 gap-1 text-xs">
            <button
              type="button"
              onClick={() => setStatusFilter("todos")}
              className={`px-3 py-1.5 rounded-[6px] font-medium transition-all cursor-pointer ${statusFilter === "todos"
                  ? "bg-[#245544] text-white shadow-2xs"
                  : "text-[#4D5B54] dark:text-stone-300 hover:text-[#203D34]"
                }`}
            >
              Todos · {expenses.length}
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("realizados")}
              className={`px-3 py-1.5 rounded-[6px] font-medium transition-all cursor-pointer ${statusFilter === "realizados"
                  ? "bg-[#245544] text-white shadow-2xs"
                  : "text-[#4D5B54] dark:text-stone-300 hover:text-[#203D34]"
                }`}
            >
              Realizados ·{" "}
              {expenses.filter((e) => e.status === "realizado").length}
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("proyectados")}
              className={`px-3 py-1.5 rounded-[6px] font-medium transition-all cursor-pointer ${statusFilter === "proyectados"
                  ? "bg-[#245544] text-white shadow-2xs"
                  : "text-[#4D5B54] dark:text-stone-300 hover:text-[#203D34]"
                }`}
            >
              Proyectados ·{" "}
              {expenses.filter((e) => e.status === "proyectado").length}
            </button>
          </div>

          {/* Category Dropdown Filter */}
          <div className="flex items-center gap-2 text-xs">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-9 px-3 rounded-[8px] border border-[#CCD2CA] dark:border-stone-700 bg-white dark:bg-stone-900 text-xs text-[#203D34] dark:text-stone-200 focus:outline-hidden"
            >
              <option value="todas">Todas las categorías</option>
              <option value="alojamiento">Alojamiento</option>
              <option value="transporte">Transporte</option>
              <option value="actividades">Actividades</option>
              <option value="comida">Comida y bebida</option>
              <option value="otros">Otros</option>
            </select>
          </div>
        </div>

        {/* Expenses Grid (3 columns on desktop, 1 on mobile) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredExpenses.map((exp) => (
            <div
              key={exp.id}
              className="p-5 rounded-[12px] bg-white dark:bg-stone-900 border border-[#DFE2DA] dark:border-stone-800 shadow-2xs flex flex-col justify-between gap-4 hover:shadow-xs transition-shadow"
            >
              {/* Category & Status Badge */}
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-[#4D5B54] dark:text-stone-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#245544] dark:bg-emerald-400" />
                  {exp.categoryLabel}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleToggleExpenseStatus(exp.id)}
                    title={
                      exp.status === "realizado"
                        ? "Hacer clic para marcar como proyectado (pendiente)"
                        : "Hacer clic para marcar como realizado (aprobado)"
                    }
                    className={`px-2 py-0.5 rounded-[4px] text-[10px] font-semibold cursor-pointer transition-all hover:scale-105 ${exp.status === "realizado"
                        ? "bg-[#E8EFEA] text-[#245544] dark:bg-stone-800 dark:text-[#A7F3D0]"
                        : "bg-[#F5ECDD] text-[#836035] dark:bg-stone-800 dark:text-amber-300"
                      }`}
                  >
                    {exp.status === "realizado" ? "✓ Realizado" : "Proyectado"}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteExpense(exp.id)}
                    title="Eliminar gasto"
                    aria-label="Eliminar gasto"
                    className="p-1 rounded-full text-stone-400 hover:text-red-500 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Title & Description */}
              <div className="space-y-1">
                <h3 className="font-serif text-lg font-normal text-[#203D34] dark:text-stone-100 leading-snug">
                  {exp.title}
                </h3>
                <p className="text-xs text-[#727B74] dark:text-stone-400 leading-relaxed">
                  {exp.description}
                </p>
              </div>

              {/* Amount */}
              <div className="flex items-baseline justify-between pt-2">
                <span
                  className={`font-serif text-2xl font-normal ${exp.status === "realizado"
                      ? "text-[#203D34] dark:text-stone-100"
                      : "text-[#836035] dark:text-amber-300"
                    }`}
                >
                  {exp.amount.toLocaleString("es-ES")} €
                </span>
                <span className="text-[10px] text-[#727B74] dark:text-stone-400">
                  {exp.status === "realizado"
                    ? "Pagado"
                    : "Estimación pendiente"}
                </span>
              </div>

              {/* Author and Payer */}
              <div className="pt-3 border-t border-[#DFE2DA] dark:border-stone-800 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#E6EDE5] text-[#245544] text-[9px] font-bold flex items-center justify-center">
                    {exp.authorInitials}
                  </span>
                  <div className="flex flex-col">
                    <span className="text-[#727B74] dark:text-stone-400 text-[10px]">
                      Añadido por {exp.author}
                    </span>
                    <span
                      className={`font-medium ${exp.isPaid
                          ? "text-[#245544] dark:text-[#A7F3D0]"
                          : "text-[#836035] dark:text-amber-300"
                        }`}
                    >
                      {exp.isPaid ? `Pagado por ${exp.payer}` : "Pendiente"}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  title="Opciones de gasto"
                  onClick={() =>
                    alert(`Opciones para el gasto "${exp.title}": Editar o eliminar.`)
                  }
                  className="p-1 rounded-sm text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
                >
                  •••
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Totals Summary Line */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-[8px] bg-[#FAF9F5] dark:bg-stone-800/40 border border-[#DFE2DA] dark:border-stone-800 text-xs">
          <span className="font-semibold text-[#245544] dark:text-[#A7F3D0]">
            {expenses.filter((e) => e.status === "realizado").length} realizados
            · {totalRealized.toLocaleString("es-ES")} €
          </span>
          <span className="text-[#836035] dark:text-amber-300">
            {expenses.filter((e) => e.status === "proyectado").length}{" "}
            proyectados · {totalProjected.toLocaleString("es-ES")} € adicionales,
            todavía no gastados
          </span>
        </div>
      </section>

      {/* SECTION 3: ¿QUIÉN HA PAGADO HASTA AHORA? */}
      <section className="flex flex-col gap-4 pt-4 border-t border-[#DFE2DA] dark:border-stone-800">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
          <h2 className="font-serif text-xl sm:text-2xl font-normal text-[#203D34] dark:text-stone-100">
            ¿Quién ha pagado hasta ahora?
          </h2>
          <span className="text-xs text-[#727B74] dark:text-stone-400">
            Total pagado por la familia: {totalRealized.toLocaleString("es-ES")} €
          </span>
        </div>

        {/* Real Members Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {memberPaymentStats.map((stat) => (
            <div
              key={stat.memberId}
              className="p-3.5 sm:p-4 rounded-[10px] bg-white dark:bg-stone-900 border border-[#DFE2DA] dark:border-stone-800 flex items-center justify-between gap-2 shadow-2xs"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-8 h-8 rounded-full bg-[#E6EDE5] dark:bg-stone-800 text-[#245544] dark:text-[#A7F3D0] text-xs font-bold flex items-center justify-center shrink-0">
                  {stat.initials}
                </span>
                <div className="min-w-0">
                  <h4 className="text-xs font-medium text-[#4D5B54] dark:text-stone-300 truncate" title={stat.name}>
                    {stat.name} {stat.isCurrentUser && <span className="text-[10px] text-[#245544] dark:text-emerald-400 font-semibold">(Tú)</span>}
                  </h4>
                  <span className="text-sm sm:text-base font-bold text-[#203D34] dark:text-stone-100">
                    {stat.amount.toLocaleString("es-ES")} €
                  </span>
                </div>
              </div>
              <span className="text-[10px] text-[#727B74] dark:text-stone-400 shrink-0 self-end">
                pagados
              </span>
            </div>
          ))}
        </div>

        <p className="text-[11px] text-[#727B74] dark:text-stone-400 italic">
          ℹ Estos son pagos reales registrados en el viaje, no un reparto de deudas. El límite medio es
          de {perPersonLimit.toLocaleString("es-ES")} € por persona.
        </p>
      </section>

      {/* MODAL: AÑADIR GASTO */}
      {isAddExpenseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md p-6 rounded-[16px] bg-white dark:bg-stone-900 border border-[#CCD2CA] dark:border-stone-700 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-xl font-normal text-[#203D34] dark:text-stone-100">
                Añadir nuevo gasto
              </h3>
              <button
                type="button"
                onClick={() => setIsAddExpenseOpen(false)}
                className="p-1 rounded-sm text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-[#4D5B54] dark:text-stone-400">
              Registra un gasto realizado o añade una previsión para el viaje.
            </p>

            <form onSubmit={handleCreateExpense} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#203D34] dark:text-stone-300">
                  Concepto o título
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ej. Billetes de ferry, Cena en el puerto..."
                  className="w-full h-10 px-3 rounded-[8px] border border-[#CCD2CA] dark:border-stone-700 bg-white dark:bg-stone-800 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#203D34] dark:text-stone-300">
                    Importe total (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    placeholder="120"
                    className="w-full h-10 px-3 rounded-[8px] border border-[#CCD2CA] dark:border-stone-700 bg-white dark:bg-stone-800 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#203D34] dark:text-stone-300">
                    Categoría
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) =>
                      setNewCategory(e.target.value as Expense["category"])
                    }
                    className="w-full h-10 px-3 rounded-[8px] border border-[#CCD2CA] dark:border-stone-700 bg-white dark:bg-stone-800 text-xs"
                  >
                    <option value="alojamiento">Alojamiento</option>
                    <option value="transporte">Transporte</option>
                    <option value="actividades">Actividades</option>
                    <option value="comida">Comida y bebida</option>
                    <option value="otros">Otros</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#203D34] dark:text-stone-300">
                    Estado
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) =>
                      setNewStatus(e.target.value as "realizado" | "proyectado")
                    }
                    className="w-full h-10 px-3 rounded-[8px] border border-[#CCD2CA] dark:border-stone-700 bg-white dark:bg-stone-800 text-xs"
                  >
                    <option value="realizado">Ya realizado (pagado)</option>
                    <option value="proyectado">Proyectado (estimación)</option>
                  </select>
                </div>

                {newStatus === "realizado" && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#203D34] dark:text-stone-300">
                      Pagado por
                    </label>
                    <select
                      value={newPayerId}
                      onChange={(e) => setNewPayerId(e.target.value)}
                      className="w-full h-10 px-3 rounded-[8px] border border-[#CCD2CA] dark:border-stone-700 bg-white dark:bg-stone-800 text-xs text-[#203D34] dark:text-stone-200"
                    >
                      {effectiveMembers.map((member) => {
                        const isMe =
                          (currentUser?.id && member.user_id === currentUser.id) ||
                          (currentUser?.email &&
                            member.email?.toLowerCase() === currentUser.email.toLowerCase()) ||
                          (currentUser?.name &&
                            member.nombre.toLowerCase() === currentUser.name.toLowerCase())
                        return (
                          <option key={member.id} value={member.id}>
                            {member.nombre || member.email || "Viajero"}{isMe ? " (Tú)" : ""}
                          </option>
                        )
                      })}
                    </select>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#203D34] dark:text-stone-300">
                  Detalles o notas (opcional)
                </label>
                <input
                  type="text"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Ej. Reserva para 4 personas con cancelación gratuita"
                  className="w-full h-10 px-3 rounded-[8px] border border-[#CCD2CA] dark:border-stone-700 bg-white dark:bg-stone-800 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddExpenseOpen(false)}
                  className="h-9 text-xs rounded-[8px]"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="h-9 text-xs bg-[#245544] hover:bg-[#1b4335] text-white rounded-[8px]"
                >
                  Guardar gasto
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDITAR LÍMITE */}
      {isEditLimitOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-sm p-6 rounded-[16px] bg-white dark:bg-stone-900 border border-[#CCD2CA] dark:border-stone-700 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-xl font-normal text-[#203D34] dark:text-stone-100">
                Editar límite general
              </h3>
              <button
                type="button"
                onClick={() => setIsEditLimitOpen(false)}
                className="p-1 rounded-sm text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-[#4D5B54] dark:text-stone-400">
              Ajusta el presupuesto proyectado total para {tripName}.
            </p>

            <form onSubmit={handleSaveLimit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#203D34] dark:text-stone-300">
                  Límite total (€)
                </label>
                <input
                  type="number"
                  step="50"
                  required
                  value={limitInput}
                  onChange={(e) => setLimitInput(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-[8px] border border-[#CCD2CA] dark:border-stone-700 bg-white dark:bg-stone-800 text-sm font-semibold"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditLimitOpen(false)}
                  className="h-9 text-xs rounded-[8px]"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="h-9 text-xs bg-[#245544] hover:bg-[#1b4335] text-white rounded-[8px]"
                >
                  Actualizar límite
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
