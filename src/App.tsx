import { useEffect, useState } from "react"
import { supabase, isSupabaseConfigured } from "@/supabaseClient"
import { LoginScreen } from "@/components/auth/LoginScreen"
import { TripOverview } from "@/components/trip/TripOverview"
import { Logo } from "@/components/auth/Logo"
import type { User } from "@supabase/supabase-js"

export function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  // Default to overview so user immediately sees the new "Travesía · Vista general" screen
  const [activeView, setActiveView] = useState<"overview" | "auth">("overview")

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }

    // Check initial active session safely
    supabase.auth
      .getSession()
      .then(({ data }) => {
        setUser(data?.session?.user ?? null)
      })
      .catch((err) => {
        console.warn("No se pudo obtener la sesión:", err)
      })
      .finally(() => {
        setLoading(false)
      })

    // Listen to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#FAF9F5] dark:bg-[#121714]">
        <div className="flex flex-col items-center gap-3">
          <Logo />
          <div className="w-5 h-5 border-2 border-[#245544] border-t-transparent dark:border-emerald-400 dark:border-t-transparent rounded-full animate-spin mt-2" />
        </div>
      </div>
    )
  }

  const userName =
    user?.user_metadata?.name ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Clara López"

  return (
    <div className="relative min-h-screen">
      {/* Floating View Switcher Pill so the user can easily switch between Vista general and Login/Register */}
      <div className="fixed bottom-4 right-4 z-50 flex items-center gap-1.5 p-1 rounded-full bg-white/92 dark:bg-stone-900/92 backdrop-blur-md border border-[#CCD2CA] dark:border-stone-700 shadow-lg text-xs">
        <button
          type="button"
          onClick={() => setActiveView("overview")}
          className={`px-3 py-1.5 rounded-full font-medium transition-colors cursor-pointer ${
            activeView === "overview"
              ? "bg-[#245544] text-white shadow-xs"
              : "text-[#4D5B54] dark:text-stone-300 hover:text-[#203D34] dark:hover:text-white"
          }`}
        >
          Vista general
        </button>
        <button
          type="button"
          onClick={() => setActiveView("auth")}
          className={`px-3 py-1.5 rounded-full font-medium transition-colors cursor-pointer ${
            activeView === "auth"
              ? "bg-[#245544] text-white shadow-xs"
              : "text-[#4D5B54] dark:text-stone-300 hover:text-[#203D34] dark:hover:text-white"
          }`}
        >
          Login / Registro
        </button>
      </div>

      {activeView === "overview" ? (
        <TripOverview
          userName={userName}
          onSignOut={
            user
              ? () => {
                  supabase.auth.signOut()
                  setUser(null)
                }
              : undefined
          }
        />
      ) : (
        <LoginScreen />
      )}
    </div>
  )
}

export default App
