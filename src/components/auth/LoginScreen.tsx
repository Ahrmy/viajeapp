import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowUpRight01Icon,
  Sun01Icon,
  Moon02Icon,
} from "@hugeicons/core-free-icons"
import { ShowcaseCard } from "./ShowcaseCard"
import { LoginForm } from "./LoginForm"
import { Logo } from "./Logo"
import { useTheme } from "@/components/theme-provider"

export function LoginScreen() {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <main className="min-h-screen w-full bg-[#FAF8F5] dark:bg-[#121714] text-stone-900 dark:text-stone-100 flex items-center justify-center p-3 sm:p-5 md:p-8 lg:p-10 transition-colors selection:bg-[#1B4332]/20 selection:text-[#162D24]">
      {/* Container matching Figma's exact proportion and structure */}
      <div className="w-full max-w-[1440px] grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 min-h-[calc(100vh-2.5rem)] md:min-h-[760px] items-stretch">
        {/* Left Side: Brand Showcase Card (5 cols on lg) */}
        <div className="lg:col-span-5 xl:col-span-5 flex flex-col">
          <ShowcaseCard />
        </div>

        {/* Right Side: Authentication Panel (7 cols on lg) */}
        <section
          aria-label="Formulario de inicio de sesión"
          className="lg:col-span-7 xl:col-span-7 flex flex-col justify-between px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20 py-4 sm:py-6 md:py-8"
        >
          {/* Top Navigation Row: Mobile logo (if needed) + Sign up link + Theme toggle */}
          <header className="flex items-center justify-between sm:justify-end gap-4 w-full">
            {/* Show simple logo on small screens when showcase card is scrolled past */}
            <div className="lg:hidden">
              <Logo textSize="text-xl" iconSize={24} />
            </div>

            <div className="flex items-center gap-4 text-xs sm:text-sm">
              <p className="text-stone-500 dark:text-stone-400">
                ¿Aún no tienes cuenta?{" "}
                <a
                  href="#registro"
                  onClick={(e) => {
                    e.preventDefault()
                    alert(
                      "La creación de nuevas cuentas estará disponible próximamente en Travesía."
                    )
                  }}
                  className="font-semibold text-[#162D24] dark:text-[#A7F3D0] inline-flex items-center gap-0.5 hover:underline decoration-1 underline-offset-4 ml-1 transition-colors"
                >
                  <span>Crear una cuenta</span>
                  <HugeiconsIcon
                    icon={ArrowUpRight01Icon}
                    className="w-3.5 h-3.5"
                    strokeWidth={2}
                  />
                </a>
              </p>

              {/* Theme toggle button */}
              <button
                type="button"
                onClick={toggleTheme}
                title={
                  theme === "dark"
                    ? "Cambiar a modo claro"
                    : "Cambiar a modo oscuro"
                }
                aria-label="Cambiar tema visual"
                className="p-2 rounded-full border border-[#E5E0D6] dark:border-stone-700/80 bg-white/60 dark:bg-stone-900/60 hover:bg-[#F2EFE9] dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 transition-colors cursor-pointer"
              >
                <HugeiconsIcon
                  icon={theme === "dark" ? Sun01Icon : Moon02Icon}
                  className="w-4 h-4"
                  strokeWidth={1.8}
                />
              </button>
            </div>
          </header>

          {/* Center: Main Login Form */}
          <div className="my-auto py-8 sm:py-12">
            <LoginForm />
          </div>

          {/* Bottom Footer: Legal / Links */}
          <footer className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500 dark:text-stone-400 pt-6 border-t border-[#EDE8E0] dark:border-stone-800/80 select-none">
            <p>© 2026 Travesía</p>
            <div className="flex items-center gap-5">
              <a
                href="#privacidad"
                className="hover:text-stone-900 dark:hover:text-stone-200 transition-colors"
              >
                Privacidad
              </a>
              <a
                href="#terminos"
                className="hover:text-stone-900 dark:hover:text-stone-200 transition-colors"
              >
                Términos
              </a>
              <a
                href="#ayuda"
                className="hover:text-stone-900 dark:hover:text-stone-200 transition-colors"
              >
                Ayuda
              </a>
            </div>
          </footer>
        </section>
      </div>
    </main>
  )
}
