import { useState, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { supabase, isSupabaseConfigured } from "@/supabaseClient"

interface RegisterFormProps {
  onSuccess?: () => void
  onSwitchToLogin?: () => void
}

export function RegisterForm({ onSwitchToLogin: _onSwitchToLogin }: RegisterFormProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)

    if (!isSupabaseConfigured) {
      setErrorMessage(
        "Falta configurar las credenciales de Supabase en el archivo .env (VITE_SUPABASE_URL y VITE_SUPABASE_API_KEY)."
      )
      return
    }

    if (!name.trim()) {
      setErrorMessage("Por favor, introduce tu nombre.")
      return
    }

    if (!email.trim()) {
      setErrorMessage("Por favor, introduce tu correo electrónico.")
      return
    }

    if (password.length < 8) {
      setErrorMessage("La contraseña debe tener al menos 8 caracteres.")
      return
    }

    setIsLoading(true)

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            name: name.trim(),
            full_name: name.trim(),
          },
          emailRedirectTo: window.location.origin,
        },
      })

      if (error) {
        if (
          error.message.toLowerCase().includes("already registered") ||
          error.message.toLowerCase().includes("user already exists")
        ) {
          setErrorMessage(
            "Ya existe una cuenta con este correo electrónico. Prueba a iniciar sesión."
          )
        } else if (error.message.toLowerCase().includes("password")) {
          setErrorMessage("La contraseña debe tener al menos 8 caracteres.")
        } else {
          setErrorMessage(error.message)
        }
      } else if (data.user) {
        // If email confirmation is enabled, session might be null
        if (!data.session) {
          setSuccessMessage(
            "¡Cuenta creada con éxito! Te hemos enviado un correo de confirmación. Revisa tu bandeja de entrada para activar tu cuenta."
          )
        } else {
          setSuccessMessage("¡Cuenta creada con éxito! Entrando en Travesía...")
        }
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Error inesperado al crear la cuenta."
      setErrorMessage(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-[420px] mx-auto flex flex-col">
      {/* Header */}
      <div className="flex flex-col gap-2.5 mb-8">
        <h2 className="font-serif text-3xl sm:text-4xl md:text-[44px] font-normal leading-[1.15] tracking-tight text-[#203D34] dark:text-stone-100">
          Todo empieza aquí.
        </h2>
        <p className="text-sm sm:text-[15px] leading-[1.6] text-[#4D5B54] dark:text-stone-300">
          Crea tu cuenta y empezad a planear
          <br />
          vuestro próximo viaje en familia.
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
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Nombre */}
        <div className="flex flex-col gap-2">
          <Label
            htmlFor="register-name"
            className="text-sm font-medium text-[#203D34] dark:text-stone-200"
          >
            Nombre
          </Label>
          <Input
            id="register-name"
            type="text"
            required
            autoComplete="name"
            disabled={isLoading}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tu nombre"
            className="h-[52px] rounded-[8px] border-[#CCD2CA] bg-white dark:bg-stone-900/70 dark:border-stone-700 px-4 text-sm text-[#203D34] dark:text-stone-100 placeholder:text-[#727B74] focus-visible:border-[#245544] focus-visible:ring-1 focus-visible:ring-[#245544] dark:focus-visible:border-emerald-500 shadow-2xs"
          />
        </div>

        {/* Correo electrónico */}
        <div className="flex flex-col gap-2">
          <Label
            htmlFor="register-email"
            className="text-sm font-medium text-[#203D34] dark:text-stone-200"
          >
            Correo electrónico
          </Label>
          <Input
            id="register-email"
            type="email"
            autoComplete="email"
            required
            disabled={isLoading}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@correo.com"
            className="h-[52px] rounded-[8px] border-[#CCD2CA] bg-white dark:bg-stone-900/70 dark:border-stone-700 px-4 text-sm text-[#203D34] dark:text-stone-100 placeholder:text-[#727B74] focus-visible:border-[#245544] focus-visible:ring-1 focus-visible:ring-[#245544] dark:focus-visible:border-emerald-500 shadow-2xs"
          />
        </div>

        {/* Contraseña */}
        <div className="flex flex-col gap-2">
          <Label
            htmlFor="register-password"
            className="text-sm font-medium text-[#203D34] dark:text-stone-200"
          >
            Contraseña
          </Label>
          <div className="relative">
            <Input
              id="register-password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              minLength={8}
              disabled={isLoading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Crea una contraseña"
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
          <p className="text-xs leading-[1.6] text-[#727B74] dark:text-stone-400 pt-0.5">
            Utiliza al menos 8 caracteres.
          </p>
        </div>

        {/* CTA Button & Legal */}
        <div className="flex flex-col gap-4 pt-2">
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-[52px] bg-[#245544] hover:bg-[#1b4335] text-white font-semibold text-sm rounded-[8px] transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-xs dark:bg-[#204e3e] dark:hover:bg-[#193e31]"
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creando tu cuenta...
              </span>
            ) : (
              <>
                <span>Crear una cuenta</span>
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

          <p className="text-center text-xs leading-[1.6] text-[#727B74] dark:text-stone-400 select-none">
            Al crear una cuenta, aceptas nuestros{" "}
            <a
              href="#terminos"
              className="font-medium text-[#245544] hover:underline dark:text-emerald-400"
            >
              Términos
            </a>{" "}
            y nuestra{" "}
            <a
              href="#privacidad"
              className="font-medium text-[#245544] hover:underline dark:text-emerald-400"
            >
              Política de privacidad.
            </a>
          </p>
        </div>
      </form>
    </div>
  )
}
