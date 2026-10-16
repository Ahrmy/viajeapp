import { useState, type FormEvent } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowRight01Icon,
  Mail01Icon,
  ViewIcon,
  ViewOffIcon,
  Tick02Icon,
  AlertCircleIcon,
} from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { supabase } from "@/supabaseClient"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const [isLoading, setIsLoading] = useState(false)
  const [isMagicLinkLoading, setIsMagicLinkLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handlePasswordLogin = async (e: FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)

    if (!email.trim()) {
      setErrorMessage("Por favor, introduce tu correo electrónico.")
      return
    }

    if (!password) {
      setErrorMessage("Por favor, introduce tu contraseña.")
      return
    }

    setIsLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (error) {
        setErrorMessage(
          error.message === "Invalid login credentials"
            ? "Credenciales incorrectas. Comprueba tu correo y contraseña."
            : error.message
        )
      } else if (data.session) {
        setSuccessMessage("¡Inicio de sesión exitoso! Redirigiendo...")
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Error inesperado al iniciar sesión."
      setErrorMessage(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleMagicLink = async () => {
    setErrorMessage(null)
    setSuccessMessage(null)

    if (!email.trim()) {
      setErrorMessage("Introduce tu correo arriba para recibir el enlace mágico.")
      return
    }

    setIsMagicLinkLoading(true)

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: window.location.origin,
        },
      })

      if (error) {
        setErrorMessage(error.message)
      } else {
        setSuccessMessage(
          "¡Enlace mágico enviado! Revisa tu bandeja de entrada para entrar sin contraseña."
        )
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Error al enviar el enlace mágico."
      setErrorMessage(message)
    } finally {
      setIsMagicLinkLoading(false)
    }
  }

  return (
    <div className="w-full max-w-[420px] mx-auto">
      {/* Title & Subtitle */}
      <div className="mb-8">
        <h2 className="font-serif text-3xl sm:text-[38px] font-bold tracking-tight text-[#162D24] dark:text-stone-100">
          Qué bueno verte.
        </h2>
        <p className="mt-2 text-sm sm:text-[15px] leading-relaxed text-stone-600 dark:text-stone-400">
          Tu próxima aventura en familia
          <br />
          te está esperando.
        </p>
      </div>

      {/* Inline Feedback Alerts */}
      {errorMessage && (
        <div
          role="alert"
          className="mb-5 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50/90 p-3 text-xs text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300 transition-all animate-in fade-in duration-200"
        >
          <HugeiconsIcon
            icon={AlertCircleIcon}
            className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5"
          />
          <span className="flex-1 leading-normal">{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div
          role="status"
          className="mb-5 flex items-start gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50/90 p-3 text-xs text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300 transition-all animate-in fade-in duration-200"
        >
          <HugeiconsIcon
            icon={Tick02Icon}
            className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5"
          />
          <span className="flex-1 leading-normal">{successMessage}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handlePasswordLogin} className="space-y-4">
        {/* Email Field */}
        <div className="space-y-1.5">
          <Label
            htmlFor="email"
            className="text-xs font-semibold text-[#162D24] dark:text-stone-300"
          >
            Correo electrónico
          </Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@correo.com"
            className="h-11 rounded-lg border-[#DDD7CD] dark:border-stone-700 bg-white dark:bg-stone-900/70 px-3.5 text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 shadow-2xs focus-visible:border-[#1B4332] focus-visible:ring-1 focus-visible:ring-[#1B4332] dark:focus-visible:border-emerald-500 dark:focus-visible:ring-emerald-500"
          />
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <Label
            htmlFor="password"
            className="text-xs font-semibold text-[#162D24] dark:text-stone-300"
          >
            Contraseña
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Introduce tu contraseña"
              className="h-11 rounded-lg border-[#DDD7CD] dark:border-stone-700 bg-white dark:bg-stone-900/70 pl-3.5 pr-20 text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 shadow-2xs focus-visible:border-[#1B4332] focus-visible:ring-1 focus-visible:ring-[#1B4332] dark:focus-visible:border-emerald-500 dark:focus-visible:ring-emerald-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs font-medium text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 transition-colors cursor-pointer select-none py-1 px-1 rounded-sm focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-[#1B4332]"
            >
              <HugeiconsIcon
                icon={showPassword ? ViewOffIcon : ViewIcon}
                className="w-3.5 h-3.5"
                strokeWidth={2}
              />
              <span>{showPassword ? "Ocultar" : "Mostrar"}</span>
            </button>
          </div>
        </div>

        {/* Remember me & Forgot Password */}
        <div className="flex items-center justify-between pt-0.5">
          <div className="flex items-center gap-2">
            <Checkbox
              id="remember-me"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked === true)}
              className="border-[#C5BFB5] data-checked:bg-[#1B4332] data-checked:border-[#1B4332] dark:border-stone-600 dark:data-checked:bg-emerald-600 dark:data-checked:border-emerald-600"
            />
            <Label
              htmlFor="remember-me"
              className="text-xs text-stone-600 dark:text-stone-400 cursor-pointer font-normal select-none"
            >
              Recordar sesión
            </Label>
          </div>

          <a
            href="#forgot-password"
            onClick={(e) => {
              e.preventDefault()
              alert(
                "Para recuperar tu contraseña, introduce tu correo arriba y pulsa 'Recibir un enlace mágico' para acceder directamente."
              )
            }}
            className="text-xs text-stone-600 hover:text-[#162D24] dark:text-stone-400 dark:hover:text-stone-200 transition-colors underline-offset-4 hover:underline"
          >
            ¿Olvidaste tu contraseña?
          </a>
        </div>

        {/* Primary Submit Button */}
        <div className="pt-2">
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 bg-[#1C4532] hover:bg-[#153526] text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 group cursor-pointer dark:bg-[#1E4D39] dark:hover:bg-[#163B2C]"
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Iniciando sesión...
              </span>
            ) : (
              <>
                <span>Iniciar sesión</span>
                <HugeiconsIcon
                  icon={ArrowRight01Icon}
                  className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1"
                  strokeWidth={2}
                />
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#E2DDD3] dark:border-stone-800" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-[#FAF8F5] dark:bg-[#131915] px-3 text-stone-500 dark:text-stone-400 select-none">
            o entra sin contraseña
          </span>
        </div>
      </div>

      {/* Magic Link Button */}
      <div>
        <Button
          type="button"
          variant="outline"
          disabled={isMagicLinkLoading}
          onClick={handleMagicLink}
          className="w-full h-11 border-[#DCD6CC] dark:border-stone-700/80 bg-white dark:bg-stone-900/40 hover:bg-[#F5F2EB] dark:hover:bg-stone-800/80 text-stone-800 dark:text-stone-200 rounded-lg font-medium flex items-center justify-center gap-2 shadow-2xs transition-colors cursor-pointer"
        >
          {isMagicLinkLoading ? (
            <span className="inline-flex items-center gap-2 text-stone-600 dark:text-stone-300">
              <span className="w-4 h-4 border-2 border-stone-400 border-t-stone-800 rounded-full animate-spin dark:border-stone-600 dark:border-t-stone-200" />
              Enviando enlace...
            </span>
          ) : (
            <>
              <HugeiconsIcon
                icon={Mail01Icon}
                className="w-4 h-4 text-stone-600 dark:text-stone-400"
                strokeWidth={1.8}
              />
              <span>Recibir un enlace mágico</span>
            </>
          )}
        </Button>

        <p className="mt-3 text-center text-[11px] sm:text-xs leading-relaxed text-stone-500 dark:text-stone-400 px-2 select-none">
          Escribe tu correo arriba y te enviaremos un enlace para entrar. No
          necesitas contraseña.
        </p>
      </div>
    </div>
  )
}
