import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Loader2, AlertCircle, Lock, Mail } from 'lucide-react'
import { loginApi } from '@/api/auth'
import { useAuthStore } from '@/store/authStore'
import type { ApiError } from '@/types/auth'
import type { AxiosError } from 'axios'

export function LoginPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isLocked, setIsLocked] = useState(false)
  const [remainingSeconds, setRemainingSeconds] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Countdown timer when account is locked
  useEffect(() => {
    if (isLocked && remainingSeconds > 0) {
      timerRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!)
            setIsLocked(false)
            setErrorMsg(null)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isLocked, remainingSeconds])

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m}:${String(s).padStart(2, '0')}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLocked || isLoading) return

    setIsLoading(true)
    setErrorMsg(null)

    try {
      const { data } = await loginApi(email, password)
      setAuth(data.user, data.access, data.refresh)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      const axiosError = err as AxiosError<ApiError>
      const data = axiosError.response?.data

      if (axiosError.response?.status === 429 && data?.locked) {
        setIsLocked(true)
        setRemainingSeconds(data.remaining_seconds ?? 900)
        setErrorMsg(data.detail ?? 'Cuenta bloqueada temporalmente.')
      } else {
        setErrorMsg(data?.detail ?? 'Credenciales inválidas.')
      }
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
              Tu equipo.<br />Tu sprint.<br />
              <span className="brand-accent">Tu agente IA.</span>
            </h1>
            <p className="brand-sub">
              Gestión ágil de proyectos potenciada con inteligencia artificial.
              Del backlog al deploy, sin fricción.
            </p>
          </div>

          <div className="brand-stats">
            {[
              { value: 'Scrum', label: 'Nativo' },
              { value: 'IA', label: 'Integrada' },
              { value: 'Real-time', label: 'Kanban' },
            ].map((stat) => (
              <div key={stat.label} className="brand-stat">
                <span className="brand-stat-value">{stat.value}</span>
                <span className="brand-stat-label">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Decorative grid */}
        <div className="brand-grid" aria-hidden="true" />
      </div>

      {/* ── Right panel: form ────────────────────────────────────── */}
      <div className="auth-form-panel">
        <div className="auth-form-container">
          <div className="auth-header">
            <h2 className="auth-title">Iniciar sesión</h2>
            <p className="auth-subtitle">
              ¿No tenés cuenta?{' '}
              <Link to="/register" className="auth-link">
                Registrate gratis
              </Link>
            </p>
          </div>

          {/* Error / lockout banner */}
          {errorMsg && (
            <div className={`auth-alert ${isLocked ? 'auth-alert--locked' : 'auth-alert--error'}`} role="alert">
              <AlertCircle size={16} aria-hidden="true" />
              <div className="auth-alert-content">
                <span>{errorMsg}</span>
                {isLocked && (
                  <span className="auth-lockout-timer">
                    Tiempo restante:{' '}
                    <strong>{formatCountdown(remainingSeconds)}</strong>
                  </span>
                )}
              </div>
            </div>
          )}

          <form id="login-form" className="auth-form" onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div className="field-group">
              <label htmlFor="login-email" className="field-label">
                Correo electrónico
              </label>
              <div className="field-input-wrapper">
                <Mail size={16} className="field-icon" aria-hidden="true" />
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  placeholder="nombre@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLocked || isLoading}
                  required
                  className="field-input"
                />
              </div>
            </div>

            {/* Password */}
            <div className="field-group">
              <div className="field-label-row">
                <label htmlFor="login-password" className="field-label">
                  Contraseña
                </label>
                <Link to="/forgot-password" className="auth-link auth-link--sm">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <div className="field-input-wrapper">
                <Lock size={16} className="field-icon" aria-hidden="true" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLocked || isLoading}
                  required
                  className="field-input field-input--password"
                />
                <button
                  type="button"
                  id="toggle-password-visibility"
                  className="field-toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              id="login-submit-btn"
              type="submit"
              className="btn-primary"
              disabled={isLoading || isLocked || !email || !password}
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="btn-spinner" aria-hidden="true" />
                  Iniciando sesión…
                </>
              ) : (
                'Iniciar sesión'
              )}
            </button>
          </form>
        </div>
      </div>

      <style>{`
        /* ── Layout ────────────────────────────────────────────────── */
        .auth-layout {
          display: flex;
          min-height: 100vh;
          background: var(--color-bg);
        }

        /* ── Brand panel ───────────────────────────────────────────── */
        .auth-brand {
          position: relative;
          flex: 0 0 55%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--color-surface);
          border-right: 1px solid var(--color-border);
          overflow: hidden;
        }

        .auth-brand-inner {
          position: relative;
          z-index: 1;
          max-width: 480px;
          padding: 48px;
          display: flex;
          flex-direction: column;
          gap: 40px;
        }

        .brand-logo {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .brand-name {
          font-family: var(--font-display);
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--color-text-primary);
          letter-spacing: -0.02em;
        }

        .brand-headline {
          font-family: var(--font-display);
          font-size: clamp(2rem, 3.5vw, 2.75rem);
          font-weight: 700;
          line-height: 1.15;
          letter-spacing: -0.03em;
          color: var(--color-text-primary);
        }

        .brand-accent {
          color: var(--color-accent);
        }

        .brand-sub {
          margin-top: 16px;
          font-size: 1rem;
          line-height: 1.7;
          color: var(--color-text-secondary);
        }

        .brand-stats {
          display: flex;
          gap: 32px;
          padding-top: 8px;
          border-top: 1px solid var(--color-border-subtle);
        }

        .brand-stat {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .brand-stat-value {
          font-family: var(--font-display);
          font-size: 1rem;
          font-weight: 600;
          color: var(--color-accent);
        }

        .brand-stat-label {
          font-size: 0.75rem;
          color: var(--color-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        /* Decorative grid background */
        .brand-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(var(--color-border-subtle) 1px, transparent 1px),
            linear-gradient(90deg, var(--color-border-subtle) 1px, transparent 1px);
          background-size: 40px 40px;
          opacity: 0.4;
          mask-image: radial-gradient(ellipse at center, black 30%, transparent 75%);
        }

        /* ── Form panel ────────────────────────────────────────────── */
        .auth-form-panel {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px 32px;
        }

        .auth-form-container {
          width: 100%;
          max-width: 400px;
          display: flex;
          flex-direction: column;
          gap: 28px;
        }

        .auth-header {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .auth-title {
          font-family: var(--font-display);
          font-size: 1.625rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: var(--color-text-primary);
        }

        .auth-subtitle {
          font-size: 0.875rem;
          color: var(--color-text-secondary);
        }

        .auth-link {
          color: var(--color-accent);
          text-decoration: none;
          font-weight: 500;
          transition: color 0.15s;
        }

        .auth-link:hover {
          color: var(--color-accent-hover);
          text-decoration: underline;
        }

        .auth-link--sm {
          font-size: 0.8125rem;
        }

        /* ── Alert ─────────────────────────────────────────────────── */
        .auth-alert {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 12px 14px;
          border-radius: var(--radius-md);
          font-size: 0.875rem;
          animation: slideDown 0.2s ease-out;
        }

        .auth-alert--error {
          background: var(--color-error-muted);
          border: 1px solid rgba(239, 68, 68, 0.25);
          color: #fca5a5;
        }

        .auth-alert--locked {
          background: rgba(245, 158, 11, 0.08);
          border: 1px solid rgba(245, 158, 11, 0.25);
          color: #fcd34d;
        }

        .auth-alert-content {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .auth-lockout-timer {
          font-size: 0.8125rem;
          opacity: 0.85;
        }

        /* ── Form ──────────────────────────────────────────────────── */
        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .field-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .field-label-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .field-label {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--color-text-secondary);
        }

        .field-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .field-icon {
          position: absolute;
          left: 14px;
          color: var(--color-text-muted);
          pointer-events: none;
          flex-shrink: 0;
        }

        .field-input {
          width: 100%;
          height: 44px;
          padding: 0 14px 0 42px;
          background: var(--color-surface-2);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          color: var(--color-text-primary);
          font-family: var(--font-sans);
          font-size: 0.9375rem;
          transition: border-color 0.15s, box-shadow 0.15s;
          outline: none;
        }

        .field-input::placeholder {
          color: var(--color-text-muted);
        }

        .field-input:focus {
          border-color: var(--color-accent);
          box-shadow: 0 0 0 3px var(--color-accent-muted);
        }

        .field-input:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .field-input--password {
          padding-right: 44px;
        }

        .field-toggle {
          position: absolute;
          right: 12px;
          background: none;
          border: none;
          color: var(--color-text-muted);
          cursor: pointer;
          padding: 4px;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          transition: color 0.15s;
        }

        .field-toggle:hover {
          color: var(--color-text-secondary);
        }

        /* ── Primary Button ────────────────────────────────────────── */
        .btn-primary {
          width: 100%;
          height: 46px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: var(--color-accent);
          color: #fff;
          border: none;
          border-radius: var(--radius-md);
          font-family: var(--font-sans);
          font-size: 0.9375rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s, transform 0.1s, box-shadow 0.15s;
          margin-top: 4px;
        }

        .btn-primary:hover:not(:disabled) {
          background: var(--color-accent-hover);
          box-shadow: 0 4px 16px rgba(59, 130, 246, 0.3);
        }

        .btn-primary:active:not(:disabled) {
          transform: translateY(1px);
        }

        .btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-spinner {
          animation: spin 0.75s linear infinite;
        }

        /* ── Animations ────────────────────────────────────────────── */
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* ── Responsive ────────────────────────────────────────────── */
        @media (max-width: 768px) {
          .auth-layout { flex-direction: column; }
          .auth-brand {
            flex: 0 0 auto;
            padding: 32px 24px;
            border-right: none;
            border-bottom: 1px solid var(--color-border);
          }
          .auth-brand-inner { padding: 24px; gap: 24px; }
          .auth-form-panel { padding: 32px 24px; }
        }
      `}</style>
    </div>
  )
}
