import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Loader2, Lock, Eye, EyeOff, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react'
import { resetPasswordApi } from '@/api/auth'
import toast from 'react-hot-toast'
import type { AxiosError } from 'axios'

export function ResetPasswordPage() {
  const { uid, token } = useParams<{ uid: string; token: string }>()

  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== passwordConfirm) {
      setErrorMsg('Las contraseñas no coinciden.')
      return
    }

    setIsLoading(true)
    setErrorMsg(null)

    try {
      await resetPasswordApi(uid!, token!, {
        password,
        password_confirm: passwordConfirm,
      })
      setIsSuccess(true)
      toast.success('Contraseña restablecida correctamente.')
    } catch (err) {
      const axiosError = err as AxiosError<{ detail: string }>
      setErrorMsg(axiosError.response?.data?.detail ?? 'El enlace es inválido o ha expirado.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="auth-layout">
      {/* ── Left panel: branding ─────────────────────────────────── */}
      <div className="auth-brand">
        <div className="auth-brand-inner">
          <div className="brand-logo">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <rect width="40" height="40" rx="12" fill="#3b82f6" fillOpacity="0.15" />
              <path
                d="M10 28L20 12L30 28"
                stroke="#3b82f6"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="20" cy="20" r="3" fill="#3b82f6" />
            </svg>
            <span className="brand-name">Nexus PM</span>
          </div>

          <div className="brand-content">
            <h1 className="brand-headline">
              Seguridad<br />ante todo.<br />
              <span className="brand-accent">Nueva clave.</span>
            </h1>
            <p className="brand-sub">
              Estás a un paso de recuperar tu acceso. Elegí una contraseña robusta
              para mantener tus proyectos protegidos.
            </p>
          </div>

          <div className="brand-stats">
            {[
              { value: 'Robusta', label: 'Seguridad' },
              { value: 'Encriptada', label: 'Base' },
              { value: 'Directo', label: 'Acceso' },
            ].map((stat) => (
              <div key={stat.label} className="brand-stat">
                <span className="brand-stat-value">{stat.value}</span>
                <span className="brand-stat-label">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="brand-grid" aria-hidden="true" />
      </div>

      {/* ── Right panel: form ────────────────────────────────────── */}
      <div className="auth-form-panel">
        <div className="auth-form-container">
          {isSuccess ? (
            <div className="text-center animate-fade-in">
              <div className="flex justify-center mb-6">
                <div className="status-badge status-badge--success">
                  <CheckCircle size={32} className="text-green-500" />
                </div>
              </div>
              <h2 className="auth-title mb-4">¡Contraseña actualizada!</h2>
              <p className="auth-subtitle mb-8 leading-relaxed">
                Tu contraseña ha sido restablecida con éxito. Ahora podés iniciar sesión con tus nuevas credenciales.
              </p>
              <Link to="/login" className="btn-primary no-underline">
                Ir al inicio de sesión
              </Link>
            </div>
          ) : (
            <>
              <div className="auth-header">
                <h2 className="auth-title">Nueva contraseña</h2>
                <p className="auth-subtitle">
                  Ingresá tu nueva clave para asegurar tu cuenta.
                </p>
              </div>

              {errorMsg && (
                <div className="auth-alert auth-alert--error" role="alert">
                  <AlertCircle size={16} aria-hidden="true" />
                  <div className="auth-alert-content">
                    <span>{errorMsg}</span>
                  </div>
                </div>
              )}

              <form className="auth-form" onSubmit={handleSubmit} noValidate>
                <div className="field-group">
                  <label htmlFor="new-password" className="field-label">Nueva contraseña</label>
                  <div className="field-input-wrapper">
                    <Lock size={16} className="field-icon" aria-hidden="true" />
                    <input
                      id="new-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Mínimo 8 caracteres"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="field-input field-input--password"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      className="field-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="field-group">
                  <label htmlFor="confirm-password" className="field-label">Confirmar contraseña</label>
                  <div className="field-input-wrapper">
                    <Lock size={16} className="field-icon" aria-hidden="true" />
                    <input
                      id="confirm-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Repetí tu nueva contraseña"
                      value={passwordConfirm}
                      onChange={(e) => setPasswordConfirm(e.target.value)}
                      required
                      className="field-input"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <button type="submit" className="btn-primary" disabled={isLoading || !password || !passwordConfirm}>
                  {isLoading ? (
                    <><Loader2 size={16} className="btn-spinner" />Actualizando…</>
                  ) : (
                    'Restablecer contraseña'
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
