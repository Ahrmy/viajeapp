import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export interface TaskItem {
  id: string
  title: string
  subtitle: string
  assignee: string
  completed: boolean
}

const INITIAL_TASKS: TaskItem[] = []

interface UpcomingTasksCardProps {
  tasks?: TaskItem[]
  onToggleTask?: (id: string) => void
  onViewAllTasks?: () => void
}

export function UpcomingTasksCard({
  tasks: propsTasks,
  onToggleTask,
  onViewAllTasks,
}: UpcomingTasksCardProps) {
  const [tasks, setTasks] = useState<TaskItem[]>(
    propsTasks !== undefined ? propsTasks : INITIAL_TASKS
  )

  useEffect(() => {
    if (propsTasks !== undefined) {
      setTasks(propsTasks)
    }
  }, [propsTasks])

  const toggleTask = (id: string) => {
    if (onToggleTask) {
      onToggleTask(id)
    } else {
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
      )
    }
  }

  const pendingCount = tasks.filter((t) => !t.completed).length

  return (
    <Card className="flex flex-col justify-between p-6 rounded-[14px] bg-white dark:bg-stone-900 border-[#DFE2DA] dark:border-stone-800 shadow-2xs">
      <CardContent className="p-0 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-serif text-lg font-normal text-[#203D34] dark:text-stone-100">
              Lo próximo por hacer
            </h3>
            <span className="w-[22px] h-[22px] rounded-full bg-[#E8EFEA] text-[#245544] dark:bg-stone-800 dark:text-[#A7F3D0] flex items-center justify-center text-[11px] font-semibold">
              {pendingCount}
            </span>
          </div>

          <button
            type="button"
            onClick={onViewAllTasks}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#245544] dark:text-emerald-400 hover:underline transition-colors cursor-pointer"
          >
            <span>Ver todas</span>
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

        {/* Task List */}
        <div className="flex flex-col gap-2.5 pt-1">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`flex items-center justify-between p-2.5 rounded-[8px] transition-colors ${
                task.completed
                  ? "bg-stone-50 dark:bg-stone-800/40 opacity-60"
                  : "hover:bg-[#F7F5F0] dark:hover:bg-stone-800/60"
              }`}
            >
              <div className="flex items-start gap-3 flex-1 overflow-hidden">
                <Checkbox
                  id={task.id}
                  checked={task.completed}
                  onCheckedChange={() => toggleTask(task.id)}
                  className="mt-0.5 rounded-[4px] border-[#CCD2CA] data-checked:bg-[#245544] data-checked:border-[#245544] dark:border-stone-600 dark:data-checked:bg-emerald-600"
                />

                <div className="flex flex-col gap-0.5 overflow-hidden pr-2">
                  <label
                    htmlFor={task.id}
                    className={`text-xs font-medium text-[#203D34] dark:text-stone-100 cursor-pointer select-none leading-snug truncate ${
                      task.completed ? "line-through text-[#727B74]" : ""
                    }`}
                  >
                    {task.title}
                  </label>
                  <span className="text-[11px] text-[#727B74] dark:text-stone-400 select-none">
                    {task.subtitle}
                  </span>
                </div>
              </div>

              {/* Assignee Avatar */}
              <Avatar className="h-[28px] w-[28px] shrink-0 border border-white dark:border-stone-700 shadow-2xs">
                <AvatarFallback className="bg-[#E8EFEA] text-[#245544] text-[10px] font-semibold">
                  {task.assignee}
                </AvatarFallback>
              </Avatar>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
