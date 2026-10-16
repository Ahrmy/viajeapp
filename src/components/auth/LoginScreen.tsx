import { useState } from "react"
import { ShowcaseCard } from "./ShowcaseCard"
import { LoginForm } from "./LoginForm"
import { RegisterForm } from "./RegisterForm"
import { Logo } from "./Logo"
import { useTheme } from "@/components/theme-provider"

export function LoginScreen() {
  const [authMode, setAuthMode] = useState<"login" | "register">("login")
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <main className="min-h-screen w-full bg-[#FAF9F5] dark:bg-[#121714] text-stone-900 dark:text-stone-100 flex items-center justify-center p-3 sm:p-5 md:p-6 lg:p-6 transition-colors selection:bg-[#245544]/20 selection:text-[#203D34]">
      {/* 1440px Container matching Figma's exact canvas & frame layout */}
      <div className="w-full max-w-[1440px] grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 min-h-[calc(100vh-3rem)] items-stretch">
        {/* Left Side: Brand Showcase Card (Bienvenida) */}
        <div className="lg:col-span-5 xl:col-span-5 flex flex-col">
          <ShowcaseCard />
        </div>

        {/* Right Side: Authentication Panel (Registro / Acceso) */}
        <section
          aria-label={
            authMode === "login"
              ? "Formulario de inicio de sesión"
              : "Formulario de registro"
          }
          className="lg:col-span-7 xl:col-span-7 flex flex-col justify-between px-4 sm:px-8 md:px-12 lg:px-14 xl:px-16 py-4 sm:py-6"
        >
          {/* Top Navigation Row: Switch between Login and Register + Theme Toggle */}
          <header className="flex items-center justify-between sm:justify-end gap-5 w-full">
            {/* Mobile logo on small screens */}
            <div className="lg:hidden">
              <Logo textSize="text-2xl" iconSize={28} />
            </div>

            <div className="flex items-center gap-4 text-xs sm:text-sm">
              {authMode === "login" ? (
                <p className="text-[#4D5B54] dark:text-stone-400">
                  ¿Aún no tienes cuenta?{" "}
                  <button
                    type="button"
                    onClick={() => setAuthMode("register")}
                    className="font-semibold text-[#245544] dark:text-[#A7F3D0] inline-flex items-center gap-1 hover:underline decoration-1 underline-offset-4 ml-1 transition-colors cursor-pointer"
                  >
                    <span>Crear una cuenta</span>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M4 10L10 4M10 4H5M10 4V9"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </p>
              ) : (
                <p className="text-[#4D5B54] dark:text-stone-400">
                  ¿Ya tienes cuenta?{" "}
                  <button
                    type="button"
                    onClick={() => setAuthMode("login")}
                    className="font-semibold text-[#245544] dark:text-[#A7F3D0] inline-flex items-center gap-1 hover:underline decoration-1 underline-offset-4 ml-1 transition-colors cursor-pointer"
                  >
                    <span>Iniciar sesión</span>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M4 10L10 4M10 4H5M10 4V9"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </p>
              )}

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
                className="p-2 rounded-full border border-[#DFE2DA] dark:border-stone-700 bg-white/70 dark:bg-stone-900/60 hover:bg-[#F0EEE6] dark:hover:bg-stone-800 text-[#4D5B54] dark:text-stone-300 transition-colors cursor-pointer shadow-2xs"
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
            </div>
          </header>

          {/* Center Form: Login or Register */}
          <div className="my-auto py-8 sm:py-10">
            {authMode === "login" ? (
              <LoginForm onSwitchToRegister={() => setAuthMode("register")} />
            ) : (
              <RegisterForm onSwitchToLogin={() => setAuthMode("login")} />
            )}
          </div>

          {/* Bottom Footer: Legal / Links */}
          <footer className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#727B74] dark:text-stone-400 pt-6 border-t border-[#DFE2DA] dark:border-stone-800 select-none">
            <p>© 2026 Travesía</p>
            <div className="flex items-center gap-4 sm:gap-5 text-[#4D5B54] dark:text-stone-300">
              <a
                href="#privacidad"
                className="hover:text-[#203D34] dark:hover:text-stone-100 transition-colors"
              >
                Privacidad
              </a>
              <a
                href="#terminos"
                className="hover:text-[#203D34] dark:hover:text-stone-100 transition-colors"
              >
                Términos
              </a>
              <a
                href="#ayuda"
                className="hover:text-[#203D34] dark:hover:text-stone-100 transition-colors"
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
