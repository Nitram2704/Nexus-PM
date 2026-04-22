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
    </div>
  )
}
