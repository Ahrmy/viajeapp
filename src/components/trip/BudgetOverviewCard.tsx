import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface BudgetOverviewCardProps {
  spent?: number
  total?: number
  onViewBudget?: () => void
}

export function BudgetOverviewCard({
  spent: propSpent = 1840,
  total: propTotal = 3200,
  onViewBudget,
}: BudgetOverviewCardProps) {
  const spent = propSpent
  const total = propTotal > 0 ? propTotal : 3200
  const percentage = Math.min(100, Math.round((spent / total) * 1000) / 10)
  const remaining = Math.max(0, total - spent)

  return (
    <Card className="flex flex-col justify-between p-6 rounded-[14px] bg-white dark:bg-stone-900 border-[#DFE2DA] dark:border-stone-800 shadow-2xs">
      <CardContent className="p-0 flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-lg font-normal text-[#203D34] dark:text-stone-100">
            El viaje, en números
          </h3>
          <button
            type="button"
            onClick={onViewBudget}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#245544] dark:text-emerald-400 hover:underline transition-colors cursor-pointer"
          >
            <span>Ver presupuesto</span>
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 7H11M11 7L7.5 3.5M11 7L7.5 10.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* Amount Spent & Projected Limit */}
        <div className="flex items-end justify-between pt-1">
          <div className="flex items-baseline gap-2">
            <span className="font-sans text-3xl font-medium tracking-tight text-[#203D34] dark:text-stone-100">
              {spent.toLocaleString("es-ES")} €
            </span>
            <span className="text-xs text-[#4D5B54] dark:text-stone-400">
              gastados
            </span>
          </div>

          <div className="flex flex-col items-end gap-0.5">
            <span className="text-[11px] text-[#727B74] dark:text-stone-400">
              Límite proyectado
            </span>
            <span className="text-sm font-semibold text-[#203D34] dark:text-stone-100">
              {total.toLocaleString("es-ES")} €
            </span>
          </div>
        </div>

        {/* Progress Bar & Percentage details */}
        <div className="flex flex-col gap-2">
          <Progress
            value={percentage}
            className="h-2.5 bg-[#E8EFEA] dark:bg-stone-800 rounded-full"
            indicatorClassName="bg-[#245544] dark:bg-emerald-500 rounded-full"
          />

          <div className="flex items-center justify-between text-xs pt-0.5">
            <span className="text-[#4D5B54] dark:text-stone-400">
              {percentage.toString().replace(".", ",")} % del presupuesto
            </span>
            <span className="font-medium text-[#245544] dark:text-[#A7F3D0]">
              Quedan {remaining.toLocaleString("es-ES")} €
            </span>
          </div>
        </div>

        {/* Note */}
        <div className="flex items-center gap-2 pt-1 text-[11px] text-[#727B74] dark:text-stone-400">
          <svg
            width="13"
            height="13"
            viewBox="0 0 13 13"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-[#245544] dark:text-[#A7F3D0] shrink-0"
          >
            <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.2" />
            <path
              d="M4.5 6.5L6 8L8.5 5"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>Solo gastos aprobados. Sin estimaciones ni pendientes.</span>
        </div>
      </CardContent>
    </Card>
  )
}
