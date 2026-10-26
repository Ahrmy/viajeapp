import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import type { TripMember, RolMiembro } from "@/types/database"

interface ManageMembersModalProps {
  isOpen: boolean
  onClose: () => void
  tripId: string
  tripName: string
  members: TripMember[]
  currentUserEmail?: string
  onInvite: (
    email: string,
    nombre?: string,
    rol?: RolMiembro
  ) => Promise<{ success: boolean; error?: string }>
  onUpdateRole: (memberId: string, rol: RolMiembro) => Promise<void>
  onRemoveMember: (memberId: string) => Promise<void>
  onResendInvite?: (memberId: string) => Promise<void>
}

function getInitials(name: string, email: string): string {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return parts[0].substring(0, 2).toUpperCase()
  }
  return email ? email.substring(0, 2).toUpperCase() : "??"
}

export function ManageMembersModal({
  isOpen,
  onClose,
  tripId,
  tripName,
  members,
  currentUserEmail,
  onInvite,
  onUpdateRole,
  onRemoveMember,
  onResendInvite,
}: ManageMembersModalProps) {
  const [email, setEmail] = useState("")
  const [nombre, setNombre] = useState("")
  const [selectedRole, setSelectedRole] = useState<RolMiembro>("editor")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [copiedLink, setCopiedLink] = useState(false)
  const [resendingId, setResendingId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const currentMember = members.find(
    (m) =>
      currentUserEmail &&
      m.email &&
      m.email.toLowerCase() === currentUserEmail.toLowerCase()
  )
  const isCurrentUserOwner = currentMember ? currentMember.rol === "owner" : true

  if (!isOpen) return null

  const shareableUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/#viaje=${tripId}`
      : `https://viajeapp.com/#viaje=${tripId}`

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareableUrl)
      }
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2200)
    } catch {
      // Fallback
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2200)
    }
  }

  const getMailtoUrl = (recipientEmail: string, recipientName?: string) => {
    const subject = encodeURIComponent(`Invitación para unirte al viaje "${tripName}"`)
    const greeting = recipientName && recipientName.trim() ? `¡Hola ${recipientName.trim()}!` : "¡Hola!"
    const body = encodeURIComponent(
      `${greeting}\n\nTe he invitado a colaborar en la organización de nuestro viaje "${tripName}".\n\nPuedes entrar a ver y editar el itinerario, las ciudades y los alojamientos desde este enlace directo:\n${shareableUrl}\n\n¡Un abrazo!`
    )
    return `mailto:${encodeURIComponent(recipientEmail)}?subject=${subject}&body=${body}`
  }

  const handleSubmitInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)

    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("Por favor, introduce un correo electrónico válido.")
      return
    }

    setIsSubmitting(true)
    try {
      const res = await onInvite(email, nombre, selectedRole)
      if (res.success) {
        setSuccessMessage(`¡Invitación asociada con éxito a ${email.trim()}!`)
        setEmail("")
        setNombre("")
        setSelectedRole("editor")
        setTimeout(() => setSuccessMessage(null), 4000)
      } else {
        setErrorMessage(res.error || "No se pudo enviar la invitación.")
      }
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : "Error al enviar la invitación."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResend = async (memberId: string, memberEmail: string) => {
    if (!onResendInvite) return
    setResendingId(memberId)
    try {
      await onResendInvite(memberId)
      setSuccessMessage(`Invitación reenviada a ${memberEmail}`)
      setTimeout(() => setSuccessMessage(null), 3000)
    } finally {
      setResendingId(null)
    }
  }

  const handleDelete = async (memberId: string) => {
    try {
      await onRemoveMember(memberId)
      setConfirmDeleteId(null)
    } catch (err) {
      console.warn("Error eliminando miembro:", err)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="w-full max-w-xl max-h-[92vh] flex flex-col rounded-[20px] bg-[#FAF9F5] dark:bg-[#141C17] border border-[#CCD2CA] dark:border-stone-700 shadow-2xl overflow-hidden transition-all">
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4 border-b border-[#E6E2D8] dark:border-stone-800 bg-[#F4F1EA] dark:bg-[#18221C]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-[#E8EFEA] dark:bg-stone-800 text-[#245544] dark:text-[#A7F3D0]">
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
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <line x1="19" y1="8" x2="19" y2="14" />
                  <line x1="22" y1="11" x2="16" y2="11" />
                </svg>
              </span>
              <h2 className="font-serif text-xl sm:text-2xl font-normal text-[#203D34] dark:text-stone-100">
                Viajeros e Invitados
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#245544]/10 dark:bg-emerald-950/40 text-[#245544] dark:text-[#A7F3D0] border border-[#245544]/20">
                {members.length} {members.length === 1 ? "persona" : "personas"}
              </span>
            </div>
            <p className="text-xs text-[#5D6B63] dark:text-stone-400">
              Gestiona quién colabora y acompaña la planificación de{" "}
              <strong className="text-[#203D34] dark:text-stone-200">
                {tripName}
              </strong>
              .
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors"
            title="Cerrar ventana"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Notifications */}
          {errorMessage && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs flex items-center justify-between">
              <span>{errorMessage}</span>
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="text-red-500 hover:text-red-800"
              >
                ✕
              </button>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-[#245544] dark:text-[#A7F3D0] text-xs flex items-center gap-2">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
              <span>{successMessage}</span>
            </div>
          )}

          {/* Compartir enlace rápido */}
          <div className="p-4 rounded-[14px] bg-white dark:bg-stone-900 border border-[#CCD2CA] dark:border-stone-800 space-y-2.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#203D34] dark:text-stone-200 flex items-center gap-1.5">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
                Enlace directo al viaje
              </span>
              <span className="text-[11px] text-[#727B74] dark:text-stone-400">
                Acceso rápido
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareableUrl}
                className="flex-1 h-9 px-3 rounded-[8px] bg-[#FAF9F5] dark:bg-stone-800/70 border border-[#CCD2CA] dark:border-stone-700 text-xs text-[#4D5B54] dark:text-stone-300 font-mono select-all truncate"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopyLink}
                className={`h-9 px-3 rounded-[8px] text-xs font-semibold shrink-0 transition-colors ${
                  copiedLink
                    ? "bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700"
                    : "border-[#CCD2CA] dark:border-stone-700 bg-white dark:bg-stone-800 text-[#245544] dark:text-[#A7F3D0] hover:bg-[#E8EFEA] dark:hover:bg-stone-700"
                }`}
              >
                {copiedLink ? (
                  <span className="flex items-center gap-1.5">
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    ¡Copiado!
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                    Copiar enlace
                  </span>
                )}
              </Button>
            </div>
          </div>

          {/* Formulario: Invitar nuevo miembro (solo el organizador/owner puede invitar) */}
          {isCurrentUserOwner ? (
            <form
              onSubmit={handleSubmitInvite}
              className="p-4 rounded-[14px] bg-white dark:bg-stone-900 border border-[#CCD2CA] dark:border-stone-800 space-y-3.5 shadow-2xs"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-[#203D34] dark:text-stone-200 flex items-center gap-1.5">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  Invitar a un nuevo acompañante
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label
                    htmlFor="invite-email"
                    className="text-[11px] font-medium text-[#4D5B54] dark:text-stone-300"
                  >
                    Correo electrónico *
                  </Label>
                  <Input
                    id="invite-email"
                    type="email"
                    required
                    placeholder="familiar@correo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-9 text-xs rounded-[8px] bg-[#FAF9F5] dark:bg-stone-800 border-[#CCD2CA] dark:border-stone-700 focus-visible:ring-[#245544]"
                  />
                </div>

                <div className="space-y-1">
                  <Label
                    htmlFor="invite-name"
                    className="text-[11px] font-medium text-[#4D5B54] dark:text-stone-300"
                  >
                    Nombre o apodo (opcional)
                  </Label>
                  <Input
                    id="invite-name"
                    type="text"
                    placeholder="Ej. Pablo o Abuela Carmen"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="h-9 text-xs rounded-[8px] bg-[#FAF9F5] dark:bg-stone-800 border-[#CCD2CA] dark:border-stone-700 focus-visible:ring-[#245544]"
                  />
                </div>
              </div>

              {/* Selector de Rol */}
              <div className="space-y-1.5">
                <Label className="text-[11px] font-medium text-[#4D5B54] dark:text-stone-300">
                  Rol y permisos para este viaje
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedRole("editor")}
                    className={`p-2.5 rounded-[10px] text-left border transition-all cursor-pointer ${
                      selectedRole === "editor"
                        ? "border-[#245544] bg-[#E8EFEA]/60 dark:bg-emerald-950/40 text-[#203D34] dark:text-emerald-300 ring-1 ring-[#245544]"
                        : "border-[#CCD2CA] dark:border-stone-800 bg-[#FAF9F5] dark:bg-stone-800/40 text-[#4D5B54] dark:text-stone-400 hover:border-stone-400"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold">Editor</span>
                      {selectedRole === "editor" && (
                        <span className="w-2 h-2 rounded-full bg-[#245544] dark:bg-emerald-400" />
                      )}
                    </div>
                    <p className="text-[10px] text-[#5D6B63] dark:text-stone-400 mt-0.5 leading-snug">
                      Puede proponer y editar ciudades, alojamientos y gastos.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedRole("viewer")}
                    className={`p-2.5 rounded-[10px] text-left border transition-all cursor-pointer ${
                      selectedRole === "viewer"
                        ? "border-[#245544] bg-[#E8EFEA]/60 dark:bg-emerald-950/40 text-[#203D34] dark:text-emerald-300 ring-1 ring-[#245544]"
                        : "border-[#CCD2CA] dark:border-stone-800 bg-[#FAF9F5] dark:bg-stone-800/40 text-[#4D5B54] dark:text-stone-400 hover:border-stone-400"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold">Lector</span>
                      {selectedRole === "viewer" && (
                        <span className="w-2 h-2 rounded-full bg-[#245544] dark:bg-emerald-400" />
                      )}
                    </div>
                    <p className="text-[10px] text-[#5D6B63] dark:text-stone-400 mt-0.5 leading-snug">
                      Solo puede consultar el itinerario y ver las reservas.
                    </p>
                  </button>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-9 px-4 text-xs font-semibold rounded-[8px] bg-[#245544] hover:bg-[#1b4335] text-white flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Enviando...</span>
                    </>
                  ) : (
                    <>
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="22" y1="2" x2="11" y2="13" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                      </svg>
                      <span>Enviar invitación</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          ) : (
            <div className="p-3.5 rounded-[14px] bg-white dark:bg-stone-900 border border-[#CCD2CA] dark:border-stone-800 flex items-center gap-3 text-xs text-[#5D6B63] dark:text-stone-300 shadow-2xs">
              <div className="w-8 h-8 rounded-full bg-[#E8EFEA] dark:bg-stone-800 text-[#245544] dark:text-emerald-400 flex items-center justify-center shrink-0">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-[#203D34] dark:text-stone-100">
                  Colaborador del viaje ({currentMember?.rol === "editor" ? "Editor" : "Lector"})
                </span>
                <span className="text-[11px] text-[#727B74] dark:text-stone-400">
                  Solo el Administrador del viaje puede enviar invitaciones o modificar roles.
                </span>
              </div>
            </div>
          )}

          {/* Lista de miembros actuales */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#5D6B63] dark:text-stone-400">
                Viajeros en este viaje ({members.length})
              </h3>
              <span className="text-[11px] text-[#727B74] dark:text-stone-400">
                Roles y acceso
              </span>
            </div>

            <div className="space-y-2">
              {members.map((member, index) => {
                const isOwner = member.rol === "owner"
                const isPending = member.estado === "pendiente"
                const isYou = Boolean(
                  currentUserEmail &&
                  member.email &&
                  member.email.toLowerCase() === currentUserEmail.toLowerCase()
                )

                const isDeletingThis = confirmDeleteId === member.id

                return (
                  <div
                    key={member.id || index}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-[12px] bg-white dark:bg-stone-900 border border-[#CCD2CA] dark:border-stone-800 gap-3 transition-colors hover:border-[#245544]/40"
                  >
                    {/* User info */}
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar className="h-10 w-10 border-2 border-[#FAF9F5] dark:border-stone-800 shadow-2xs shrink-0">
                        <AvatarFallback
                          className={`text-xs font-semibold ${
                            index % 2 === 0
                              ? "bg-[#DDEAE2] text-[#245544]"
                              : "bg-[#EFE9DF] text-[#7A6242]"
                          }`}
                        >
                          {getInitials(member.nombre, member.email)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-semibold text-[#203D34] dark:text-stone-100 truncate">
                            {member.nombre}
                          </span>
                          {isYou && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-[#E8EFEA] text-[#245544] dark:bg-stone-800 dark:text-emerald-300">
                              Tú
                            </span>
                          )}
                          {isPending ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                              Invitación pendiente
                            </span>
                          ) : member.user_id ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300">
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                              Cuenta vinculada
                            </span>
                          ) : null}
                        </div>
                        <span className="text-[11px] text-[#727B74] dark:text-stone-400 truncate">
                          {member.email || "Sin correo"}
                        </span>
                      </div>
                    </div>

                    {/* Roles & Actions */}
                    <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100 dark:border-stone-800">
                      {isOwner ? (
                        <div className="flex items-center gap-1 px-2.5 py-1 rounded-[6px] bg-[#E8EFEA] dark:bg-stone-800 text-[#245544] dark:text-[#A7F3D0] text-xs font-semibold">
                          <svg
                            width="13"
                            height="13"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M12 2l3 7h7l-5.5 4.5 2 7.5-6.5-4.5-6.5 4.5 2-7.5-5.5-4.5h7z" />
                          </svg>
                          <span>Administrador</span>
                        </div>
                      ) : isCurrentUserOwner ? (
                        <select
                          value={member.rol}
                          onChange={(e) =>
                            onUpdateRole(
                              member.id,
                              e.target.value as RolMiembro
                            )
                          }
                          aria-label={`Rol para ${member.nombre}`}
                          className="h-8 px-2.5 py-1 text-xs font-medium rounded-[6px] bg-[#FAF9F5] dark:bg-stone-800 border border-[#CCD2CA] dark:border-stone-700 text-[#203D34] dark:text-stone-200 focus:outline-hidden focus:ring-1 focus:ring-[#245544] cursor-pointer"
                        >
                          <option value="editor">Editor</option>
                          <option value="viewer">Lector</option>
                        </select>
                      ) : (
                        <div className="flex items-center gap-1 px-2.5 py-1 rounded-[6px] bg-[#FAF9F5] dark:bg-stone-800 border border-[#CCD2CA] dark:border-stone-700 text-[#203D34] dark:text-stone-200 text-xs font-medium capitalize">
                          <span>{member.rol === "editor" ? "Editor" : "Lector"}</span>
                        </div>
                      )}

                      {/* Enlace directo por email (solo para owner cuando la invitación está pendiente) */}
                      {isCurrentUserOwner && isPending && member.email && (
                        <a
                          href={getMailtoUrl(member.email, member.nombre)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 h-8 px-2 text-xs font-medium rounded-[6px] text-[#245544] dark:text-emerald-400 hover:bg-[#E8EFEA] dark:hover:bg-stone-800 transition-colors"
                          title={`Abrir gestor de correo para enviar invitación a ${member.email}`}
                        >
                          <svg
                            width="13"
                            height="13"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                            <polyline points="22,6 12,13 2,6" />
                          </svg>
                          <span className="hidden sm:inline">Enviar email</span>
                        </a>
                      )}

                      {/* Resend invite button (solo para owner) */}
                      {isCurrentUserOwner && isPending && onResendInvite && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={resendingId === member.id}
                          onClick={() => handleResend(member.id, member.email)}
                          title="Actualizar y reenviar invitación"
                          className="h-8 px-2 text-xs text-[#245544] dark:text-emerald-400 hover:bg-[#E8EFEA] dark:hover:bg-stone-800 cursor-pointer"
                        >
                          {resendingId === member.id ? (
                            <div className="w-3 h-3 border-2 border-[#245544] border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <span className="flex items-center gap-1">
                              <svg
                                width="13"
                                height="13"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <polyline points="23 4 23 10 17 10" />
                                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                              </svg>
                              <span className="hidden sm:inline">Reenviar</span>
                            </span>
                          )}
                        </Button>
                      )}

                      {/* Delete member button (Dueño elimina a otros, o no-dueño sale del viaje) */}
                      {!isOwner && (isCurrentUserOwner || isYou) && (
                        <div>
                          {isDeletingThis ? (
                            <div className="flex items-center gap-1">
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDelete(member.id)}
                                className="h-7 px-2 text-[11px] rounded-[6px] bg-red-600 hover:bg-red-700 text-white cursor-pointer"
                              >
                                {isYou ? "Salir" : "Confirmar"}
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setConfirmDeleteId(null)}
                                className="h-7 px-1.5 text-[11px] rounded-[6px] text-stone-500 hover:text-stone-800"
                              >
                                ✕
                              </Button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(member.id)}
                              title={
                                isYou
                                  ? "Salir de este viaje"
                                  : isPending
                                  ? "Cancelar invitación"
                                  : "Eliminar viajero"
                              }
                              className="p-1.5 rounded-[6px] text-stone-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                            >
                              <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                              </svg>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 px-6 border-t border-[#E6E2D8] dark:border-stone-800 bg-[#F4F1EA] dark:bg-[#18221C]">
          <span className="text-xs text-[#5D6B63] dark:text-stone-400">
            Los cambios de rol y colaboradores se guardan automáticamente.
          </span>
          <Button
            type="button"
            onClick={onClose}
            className="h-9 px-5 rounded-[8px] bg-[#245544] hover:bg-[#1b4335] text-white text-xs font-semibold shadow-2xs cursor-pointer"
          >
            Listo
          </Button>
        </div>
      </div>
    </div>
  )
}
