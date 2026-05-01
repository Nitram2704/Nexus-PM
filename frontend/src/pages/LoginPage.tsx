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
    <div className="min-h-screen bg-[var(--color-bg)] flex">
      {/* ── Left panel: tactical branding ────────────────────── */}
      <div className="hidden lg:flex flex-col justify-between flex-[0_0_50%] border-r border-white/5 p-12 relative overflow-hidden">
        {/* Grid background */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
            maskImage: 'radial-gradient(ellipse at center, black 20%, transparent 75%)'
          }}
          aria-hidden="true" 
        />

        {/* Top: Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-6 h-6 border border-cyan-400/30 flex items-center justify-center relative">
              <div className="absolute top-0 left-0 w-1.5 h-[1px] bg-cyan-400" />
              <div className="w-2 h-2 bg-cyan-400/20" />
            </div>
            <span className="font-mono text-[11px] font-bold tracking-[0.3em] text-white/60 uppercase">Nexus_PM</span>
          </div>
          <div className="font-mono text-[9px] text-white/15 tracking-[0.2em] uppercase ml-9">
            // SECURE_GATEWAY v0.7
          </div>
        </div>

        {/* Center: Headline */}
        <div className="relative z-10 max-w-md">
          <h1 className="text-4xl font-bold tracking-tight text-white leading-tight mb-6">
            Tu equipo.<br />Tu sprint.<br />
            <span className="text-cyan-400">Tu agente IA.</span>
          </h1>
          <p className="text-sm text-white/30 leading-relaxed font-light">
            Gestión ágil de proyectos potenciada con inteligencia artificial.
            Del backlog al deploy, sin fricción.
          </p>
        </div>

        {/* Bottom: Stats */}
        <div className="relative z-10 flex gap-8 border-t border-white/5 pt-6">
          {[
            { value: 'SCRUM', label: 'NATIVE' },
            { value: 'AI', label: 'INTEGRATED' },
            { value: 'REAL_TIME', label: 'KANBAN' },
          ].map((stat) => (
            <div key={stat.label} className="space-y-1">
              <span className="font-mono text-xs font-bold text-cyan-400/80 tracking-wider">{stat.value}</span>
              <div className="font-mono text-[9px] text-white/20 uppercase tracking-[0.2em]">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right panel: form ────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-16">
        <div className="w-full max-w-sm space-y-8">
          {/* Auth header */}
          <div>
            <div className="font-mono text-[9px] uppercase tracking-[0.3em] text-white/20 mb-4">
              // AUTH_MODULE
            </div>
            <h2 className="text-xl font-semibold tracking-tight text-white mb-1">
              Iniciar sesión
            </h2>
            <p className="text-sm text-white/30">
              ¿No tenés cuenta?{' '}
              <Link to="/register" className="text-cyan-400 hover:text-cyan-300 transition-colors font-medium">
                Registrate gratis
              </Link>
            </p>
          </div>

          {/* Error / lockout banner */}
          {errorMsg && (
            <div className={`flex items-start gap-3 p-3 border text-xs ${
              isLocked 
                ? 'border-amber-400/20 bg-amber-400/5 text-amber-300' 
                : 'border-rose-400/20 bg-rose-400/5 text-rose-300'
            }`} role="alert">
              <AlertCircle size={14} className="shrink-0 mt-0.5" aria-hidden="true" />
              <div className="space-y-1">
                <span>{errorMsg}</span>
                {isLocked && (
                  <div className="font-mono text-[10px] text-amber-400/60">
                    COOLDOWN: <strong>{formatCountdown(remainingSeconds)}</strong>
                  </div>
                )}
              </div>
            </div>
          )}

          <form id="login-form" className="space-y-5" onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="login-email" className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/30 block">
                Email
              </label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/15" aria-hidden="true" />
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  placeholder="operator@nexus.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLocked || isLoading}
                  required
                  className="w-full h-10 pl-9 pr-3 bg-white/[0.03] border border-white/10 text-white text-sm font-mono placeholder:text-white/15 focus:border-cyan-400/50 focus:outline-none transition-colors disabled:opacity-30"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="login-password" className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/30 block">
                  Password
                </label>
                <Link to="/forgot-password" className="font-mono text-[9px] text-cyan-400/50 hover:text-cyan-400 transition-colors uppercase tracking-wider">
                  RESET_KEY
                </Link>
              </div>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/15" aria-hidden="true" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLocked || isLoading}
                  required
                  className="w-full h-10 pl-9 pr-10 bg-white/[0.03] border border-white/10 text-white text-sm font-mono placeholder:text-white/15 focus:border-cyan-400/50 focus:outline-none transition-colors disabled:opacity-30"
                />
                <button
                  type="button"
                  id="toggle-password-visibility"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              id="login-submit-btn"
              type="submit"
              className="w-full h-10 bg-cyan-400/10 border border-cyan-400/30 text-cyan-400 font-mono text-xs uppercase tracking-[0.2em] hover:bg-cyan-400/20 hover:border-cyan-400/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              disabled={isLoading || isLocked || !email || !password}
            >
              {isLoading ? (
                <>
                  <Loader2 size={14} className="animate-spin" aria-hidden="true" />
                  AUTHENTICATING...
                </>
              ) : (
                'INIT_SESSION'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
