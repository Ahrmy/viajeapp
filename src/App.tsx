import { useEffect, useState } from "react"
import { supabase } from "@/supabaseClient"
import { LoginScreen } from "@/components/auth/LoginScreen"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/auth/Logo"
import type { User } from "@supabase/supabase-js"

export function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check initial active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
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
      <div className="min-h-screen w-full flex items-center justify-center bg-[#FAF8F5] dark:bg-[#121714]">
        <div className="flex flex-col items-center gap-3">
          <Logo />
          <div className="w-5 h-5 border-2 border-[#1B4332] border-t-transparent dark:border-emerald-400 dark:border-t-transparent rounded-full animate-spin mt-2" />
        </div>
      </div>
    )
  }

  // If user is already authenticated
  if (user) {
    return (
      <div className="min-h-screen w-full bg-[#FAF8F5] dark:bg-[#121714] text-stone-900 dark:text-stone-100 flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full rounded-2xl bg-white dark:bg-stone-900 p-8 shadow-sm border border-[#E5E0D6] dark:border-stone-800 text-center space-y-5">
          <Logo className="justify-center" />
          <div className="space-y-1">
            <h1 className="font-serif text-2xl font-bold text-[#162D24] dark:text-stone-100">
              ¡Bienvenido a Travesía!
            </h1>
            <p className="text-sm text-stone-500 dark:text-stone-400">
              Sesión iniciada con <span className="font-medium text-stone-700 dark:text-stone-200">{user.email}</span>
            </p>
          </div>
          <Button
            onClick={() => supabase.auth.signOut()}
            className="w-full bg-[#1C4532] hover:bg-[#153526] text-white"
          >
            Cerrar sesión
          </Button>
        </div>
      </div>
    )
  }

  return <LoginScreen />
}

export default App
