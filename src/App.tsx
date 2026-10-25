import { useEffect, useState } from "react"
import { supabase, isSupabaseConfigured } from "@/supabaseClient"
import { LoginScreen } from "@/components/auth/LoginScreen"
import { TripOverview } from "@/components/trip/TripOverview"
import { Logo } from "@/components/auth/Logo"
import type { User } from "@supabase/supabase-js"

export function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

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
      const newUser = session?.user ?? null
      setUser(newUser)
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

  // Si no está registrado o no ha iniciado sesión, no puede acceder a vista general
  if (!user) {
    return <LoginScreen />
  }

  const userName =
    user.user_metadata?.name ||
    user.user_metadata?.full_name ||
    user.email?.split("@")[0] ||
    "Viajero"

  return (
    <TripOverview
      user={user}
      userName={userName}
      onSignOut={async () => {
        await supabase.auth.signOut()
        setUser(null)
      }}
    />
  )
}

export default App
