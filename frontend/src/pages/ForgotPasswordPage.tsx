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

      <style>{`
        /* Reuse styles from LoginPage via global or local scope */
        .auth-layout { display: flex; min-height: 100vh; background: var(--color-bg); }
        .auth-brand { position: relative; flex: 0 0 55%; display: flex; align-items: center; justify-content: center; background: var(--color-surface); border-right: 1px solid var(--color-border); overflow: hidden; }
        .auth-brand-inner { position: relative; z-index: 1; max-width: 480px; padding: 48px; display: flex; flex-direction: column; gap: 40px; }
        .brand-logo { display: flex; align-items: center; gap: 12px; }
        .brand-name { font-family: var(--font-display); font-size: 1.25rem; font-weight: 700; color: var(--color-text-primary); letter-spacing: -0.02em; }
        .brand-headline { font-family: var(--font-display); font-size: clamp(2rem, 3.5vw, 2.75rem); font-weight: 700; line-height: 1.15; letter-spacing: -0.03em; color: var(--color-text-primary); }
        .brand-accent { color: var(--color-accent); }
        .brand-sub { margin-top: 16px; font-size: 1rem; line-height: 1.7; color: var(--color-text-secondary); }
        .brand-stats { display: flex; gap: 32px; padding-top: 8px; border-top: 1px solid var(--color-border-subtle); }
        .brand-stat { display: flex; flex-direction: column; gap: 2px; }
        .brand-stat-value { font-family: var(--font-display); font-size: 1rem; font-weight: 600; color: var(--color-accent); }
        .brand-stat-label { font-size: 0.75rem; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.08em; }
        .brand-grid { position: absolute; inset: 0; background-image: linear-gradient(var(--color-border-subtle) 1px, transparent 1px), linear-gradient(90deg, var(--color-border-subtle) 1px, transparent 1px); background-size: 40px 40px; opacity: 0.4; mask-image: radial-gradient(ellipse at center, black 30%, transparent 75%); }
        .auth-form-panel { flex: 1; display: flex; align-items: center; justify-content: center; padding: 48px 32px; }
        .auth-form-container { width: 100%; max-width: 400px; display: flex; flex-direction: column; gap: 28px; }
        .auth-header { display: flex; flex-direction: column; gap: 8px; }
        .auth-title { font-family: var(--font-display); font-size: 1.625rem; font-weight: 700; letter-spacing: -0.02em; color: var(--color-text-primary); }
        .auth-subtitle { font-size: 0.875rem; color: var(--color-text-secondary); }
        .auth-link { color: var(--color-accent); text-decoration: none; font-weight: 500; transition: color 0.15s; }
        .auth-link:hover { color: var(--color-accent-hover); text-decoration: underline; }
        .auth-link--sm { font-size: 0.8125rem; }
        .auth-alert { display: flex; align-items: flex-start; gap: 10px; padding: 12px 14px; border-radius: var(--radius-md); font-size: 0.875rem; animation: slideDown 0.2s ease-out; }
        .auth-alert--error { background: var(--color-error-muted); border: 1px solid rgba(239, 68, 68, 0.25); color: #fca5a5; }
        .auth-alert-content { display: flex; flex-direction: column; gap: 4px; }
        .auth-form { display: flex; flex-direction: column; gap: 20px; }
        .field-group { display: flex; flex-direction: column; gap: 6px; }
        .field-label { font-size: 0.875rem; font-weight: 500; color: var(--color-text-secondary); }
        .field-input-wrapper { position: relative; display: flex; align-items: center; }
        .field-icon { position: absolute; left: 14px; color: var(--color-text-muted); pointer-events: none; }
        .field-input { width: 100%; height: 44px; padding: 0 14px 0 42px; background: var(--color-surface-2); border: 1px solid var(--color-border); border-radius: var(--radius-md); color: var(--color-text-primary); font-family: var(--font-sans); font-size: 0.9375rem; transition: border-color 0.15s, box-shadow 0.15s; outline: none; }
        .field-input::placeholder { color: var(--color-text-muted); }
        .field-input:focus { border-color: var(--color-accent); box-shadow: 0 0 0 3px var(--color-accent-muted); }
        .btn-primary { width: 100%; height: 46px; display: flex; align-items: center; justify-content: center; gap: 8px; background: var(--color-accent); color: #fff; border: none; border-radius: var(--radius-md); font-family: var(--font-sans); font-size: 0.9375rem; font-weight: 600; cursor: pointer; transition: background 0.15s, transform 0.1s, box-shadow 0.15s; margin-top: 4px; }
        .btn-primary:hover:not(:disabled) { background: var(--color-accent-hover); box-shadow: 0 4px 16px rgba(59, 130, 246, 0.3); }
        .btn-spinner { animation: spin 0.75s linear infinite; }
        .status-badge { display: inline-flex; padding: 20px; background: rgba(34, 197, 94, 0.1); border-radius: 50%; border: 1px solid rgba(34, 197, 94, 0.2); }
        .animate-fade-in { animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .auth-layout { flex-direction: column; }
          .auth-brand { flex: 0 0 auto; padding: 32px 24px; border-right: none; border-bottom: 1px solid var(--color-border); }
          .auth-brand-inner { padding: 24px; gap: 24px; }
          .auth-form-panel { padding: 32px 24px; }
        }
      `}</style>
    </div>
  )
}
