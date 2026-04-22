import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Loader2, Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react'
import { forgotPasswordApi } from '@/api/auth'
import type { AxiosError } from 'axios'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSent, setIsSent] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMsg(null)

    try {
      await forgotPasswordApi(email)
      setIsSent(true)
    } catch (err) {
      const axiosError = err as AxiosError<{ detail: string }>
      setErrorMsg(axiosError.response?.data?.detail ?? 'Error al procesar la solicitud.')
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
              Recuperá el<br />control de<br />
              <span className="brand-accent">tu proyecto.</span>
            </h1>
            <p className="brand-sub">
              No dejes que una contraseña olvidada detenga tu sprint. 
              Enviamos un enlace seguro a tu casilla en segundos.
            </p>
          </div>

          <div className="brand-stats">
            {[
              { value: 'Seguro', label: 'SSL/JWT' },
              { value: 'Rápido', label: 'Email' },
              { value: 'Soporte', label: '24/7' },
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
          {isSent ? (
            <div className="text-center animate-fade-in">
              <div className="flex justify-center mb-6">
                <div className="status-badge status-badge--success">
                  <CheckCircle size={32} className="text-green-500" />
                </div>
              </div>
              <h2 className="auth-title mb-4">¡Correo enviado!</h2>
              <p className="auth-subtitle mb-8 leading-relaxed">
                Si el correo <strong>{email}</strong> está registrado, recibirás un enlace para restablecer tu contraseña en unos minutos.
              </p>
              <Link to="/login" className="btn-primary no-underline inline-flex items-center gap-2">
                <ArrowLeft size={16} />
                Volver al inicio de sesión
              </Link>
            </div>
          ) : (
            <>
              <div className="auth-header">
                <Link to="/login" className="auth-link auth-link--sm inline-flex items-center gap-1 mb-2">
                  <ArrowLeft size={14} />
                  Volver al login
                </Link>
                <h2 className="auth-title">Recuperar acceso</h2>
                <p className="auth-subtitle">
                  Ingresá tu correo y te enviaremos un enlace de recuperación.
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
                  <label htmlFor="reset-email" className="field-label">Correo electrónico</label>
                  <div className="field-input-wrapper">
                    <Mail size={16} className="field-icon" aria-hidden="true" />
                    <input
                      id="reset-email"
                      type="email"
                      autoComplete="email"
                      placeholder="nombre@empresa.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="field-input"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <button type="submit" className="btn-primary" disabled={isLoading || !email}>
                  {isLoading ? (
                    <><Loader2 size={16} className="btn-spinner" />Enviando enlace…</>
                  ) : (
                    'Enviar enlace de recuperación'
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
