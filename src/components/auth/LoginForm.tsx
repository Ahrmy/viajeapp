import { useState, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { supabase, isSupabaseConfigured } from "@/supabaseClient"

interface LoginFormProps {
  onSuccess?: () => void
  onSwitchToRegister?: () => void
}

export function LoginForm({ onSwitchToRegister: _onSwitchToRegister }: LoginFormProps) {
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

    if (!isSupabaseConfigured) {
      setErrorMessage(
        "Falta configurar las credenciales de Supabase en el archivo .env (VITE_SUPABASE_URL y VITE_SUPABASE_API_KEY)."
      )
      return
    }

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

    if (!isSupabaseConfigured) {
      setErrorMessage(
        "Falta configurar las credenciales de Supabase en el archivo .env (VITE_SUPABASE_URL y VITE_SUPABASE_API_KEY)."
      )
      return
    }

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
    <div className="w-full max-w-[420px] mx-auto flex flex-col">
      {/* Title & Subtitle */}
      <div className="flex flex-col gap-2.5 mb-8">
        <h2 className="font-serif text-3xl sm:text-4xl md:text-[44px] font-normal leading-[1.15] tracking-tight text-[#203D34] dark:text-stone-100">
          Qué bueno verte.
        </h2>
        <p className="text-sm sm:text-[15px] leading-[1.6] text-[#4D5B54] dark:text-stone-300">
          Tu próxima aventura en familia
          <br />
          te está esperando.
        </p>
      </div>

      {/* Inline Feedback Alerts */}
      {errorMessage && (
        <div
          role="alert"
          className="mb-5 flex items-start gap-2.5 rounded-[8px] border border-red-200 bg-red-50/90 dark:border-red-900/50 dark:bg-red-950/40 p-3.5 text-xs text-red-800 dark:text-red-300 transition-all animate-in fade-in duration-200"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-red-600 dark:text-red-400 shrink-0 mt-0.5"
          >
            <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
            <path d="M8 5V8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="8" cy="11.5" r="0.75" fill="currentColor" />
          </svg>
          <span className="flex-1 leading-normal">{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div
          role="status"
          className="mb-5 flex items-start gap-2.5 rounded-[8px] border border-emerald-200 bg-emerald-50/90 dark:border-emerald-900/50 dark:bg-emerald-950/40 p-3.5 text-xs text-emerald-800 dark:text-emerald-300 transition-all animate-in fade-in duration-200"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5"
          >
            <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
            <path
              d="M5 8.5L7 10.5L11 5.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="flex-1 leading-normal">{successMessage}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handlePasswordLogin} className="flex flex-col gap-5">
        {/* Email Field */}
        <div className="flex flex-col gap-2">
          <Label
            htmlFor="email"
            className="text-sm font-medium text-[#203D34] dark:text-stone-200"
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
            className="h-[52px] rounded-[8px] border-[#CCD2CA] bg-white dark:bg-stone-900/70 dark:border-stone-700 px-4 text-sm text-[#203D34] dark:text-stone-100 placeholder:text-[#727B74] focus-visible:border-[#245544] focus-visible:ring-1 focus-visible:ring-[#245544] dark:focus-visible:border-emerald-500 shadow-2xs"
          />
        </div>

        {/* Password Field */}
        <div className="flex flex-col gap-2">
          <Label
            htmlFor="password"
            className="text-sm font-medium text-[#203D34] dark:text-stone-200"
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
              className="h-[52px] rounded-[8px] border-[#CCD2CA] bg-white dark:bg-stone-900/70 dark:border-stone-700 pl-4 pr-24 text-sm text-[#203D34] dark:text-stone-100 placeholder:text-[#727B74] focus-visible:border-[#245544] focus-visible:ring-1 focus-visible:ring-[#245544] dark:focus-visible:border-emerald-500 shadow-2xs"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-[11px] font-medium text-[#4D5B54] hover:text-[#203D34] dark:text-stone-400 dark:hover:text-stone-200 transition-colors cursor-pointer py-1 px-1.5 rounded-sm"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="shrink-0"
              >
                <path
                  d="M1.5 9C1.5 9 4.5 3.75 9 3.75C13.5 3.75 16.5 9 16.5 9C16.5 9 13.5 14.25 9 14.25C4.5 14.25 1.5 9 1.5 9Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle
                  cx="9"
                  cy="9"
                  r="2.25"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>{showPassword ? "Ocultar" : "Mostrar"}</span>
            </button>
          </div>
        </div>

        {/* Remember me & Forgot Password */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <Checkbox
              id="remember-me"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked === true)}
              className="h-[17px] w-[17px] rounded-[4px] border-[#CCD2CA] data-checked:bg-[#245544] data-checked:border-[#245544] dark:border-stone-600 dark:data-checked:bg-emerald-600"
            />
            <Label
              htmlFor="remember-me"
              className="text-xs text-[#4D5B54] dark:text-stone-400 cursor-pointer font-normal select-none"
            >
              Recordar sesión
            </Label>
          </div>

          <a
            href="#forgot-password"
            onClick={(e) => {
              e.preventDefault()
              alert(
                "Para recuperar tu contraseña, introduce tu correo y pulsa 'Recibir un enlace mágico' abajo."
              )
            }}
            className="text-xs font-medium text-[#245544] hover:underline dark:text-emerald-400 transition-colors"
          >
            ¿Olvidaste tu contraseña?
          </a>
        </div>

        {/* Primary Submit Button */}
        <div className="pt-2">
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-[52px] bg-[#245544] hover:bg-[#1b4335] text-white font-semibold text-sm rounded-[8px] transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-xs dark:bg-[#204e3e] dark:hover:bg-[#193e31]"
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Iniciando sesión...
              </span>
            ) : (
              <>
                <span>Iniciar sesión</span>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3.75 9H14.25M14.25 9L9.75 4.5M14.25 9L9.75 13.5"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Divider */}
      <div className="relative my-7">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#DFE2DA] dark:border-stone-800" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-[#FAF9F5] dark:bg-[#121714] px-4 text-[#727B74] dark:text-stone-400 select-none">
            o entra sin contraseña
          </span>
        </div>
      </div>

      {/* Magic Link Button */}
      <div className="flex flex-col gap-3">
        <Button
          type="button"
          variant="outline"
          disabled={isMagicLinkLoading}
          onClick={handleMagicLink}
          className="w-full h-[52px] border-[#CCD2CA] dark:border-stone-700 bg-[#FAF9F5] dark:bg-stone-900/40 hover:bg-[#F0EEE6] dark:hover:bg-stone-800 text-[#245544] dark:text-emerald-400 rounded-[8px] font-medium text-sm flex items-center justify-center gap-2.5 shadow-2xs transition-colors cursor-pointer"
        >
          {isMagicLinkLoading ? (
            <span className="inline-flex items-center gap-2 text-[#4D5B54] dark:text-stone-300">
              <span className="w-4 h-4 border-2 border-stone-400 border-t-stone-800 rounded-full animate-spin" />
              Enviando enlace...
            </span>
          ) : (
            <>
              <svg
                width="19"
                height="19"
                viewBox="0 0 19 19"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-[#245544] dark:text-emerald-400 shrink-0"
              >
                <path
                  d="M2.375 5.54167C2.375 4.66722 3.08388 3.95833 3.95833 3.95833H15.0417C15.9161 3.95833 16.625 4.66722 16.625 5.54167V13.4583C16.625 14.3328 15.9161 15.0417 15.0417 15.0417H3.95833C3.08388 15.0417 2.375 14.3328 2.375 13.4583V5.54167Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M3.16666 4.75L9.5 9.89583L15.8333 4.75"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>Recibir un enlace mágico</span>
            </>
          )}
        </Button>

        <p className="text-center text-xs leading-[1.6] text-[#727B74] dark:text-stone-400 px-2 select-none">
          Escribe tu correo arriba y te enviaremos un enlace
          <br />
          para entrar. No necesitas contraseña.
        </p>
      </div>
    </div>
  )
}
