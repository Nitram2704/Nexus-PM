import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Loader2, Mail, User, Lock } from 'lucide-react'
import { registerApi } from '@/api/auth'
import { useAuthStore } from '@/store/authStore'
import type { AxiosError } from 'axios'

export function RegisterPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    password_confirm: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const update = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setIsLoading(true)

    try {
      const { data } = await registerApi(form)
      setAuth(data.user, data.access, data.refresh)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      const axiosError = err as AxiosError<Record<string, string[]>>
      const data = axiosError.response?.data ?? {}
      const flat: Record<string, string> = {}
      for (const [key, val] of Object.entries(data)) {
        flat[key] = Array.isArray(val) ? val[0] : String(val)
      }
      setErrors(flat)
    } finally {
      setIsLoading(false)
    }
  }

  const fieldError = (key: string) =>
    errors[key] ? (
      <span className="field-error" role="alert">
        {errors[key]}
      </span>
    ) : null

  return (
    <div className="auth-layout">
      {/* Brand panel */}
      <div className="auth-brand">
        <div className="auth-brand-inner">
          <div className="brand-logo">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <rect width="40" height="40" rx="12" fill="#3b82f6" fillOpacity="0.15" />
              <path d="M10 28L20 12L30 28" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="20" cy="20" r="3" fill="#3b82f6" />
            </svg>
            <span className="brand-name">Nexus PM</span>
          </div>
          <div className="brand-content">
            <h1 className="brand-headline">
              Empezá hoy.<br />
              <span className="brand-accent">Tu primer sprint</span><br />
              en minutos.
            </h1>
            <p className="brand-sub">
              Creá tu cuenta gratis y accedé a tu tablero Kanban, backlog inteligente
              y agente Scrum Master con IA.
            </p>
          </div>
        </div>
        <div className="brand-grid" aria-hidden="true" />
      </div>

      {/* Form panel */}
      <div className="auth-form-panel">
        <div className="auth-form-container">
          <div className="auth-header">
            <h2 className="auth-title">Crear cuenta</h2>
            <p className="auth-subtitle">
              ¿Ya tenés cuenta?{' '}
              <Link to="/login" className="auth-link">
                Iniciar sesión
              </Link>
            </p>
          </div>

          {errors.detail && (
            <div className="auth-alert auth-alert--error" role="alert">
              {errors.detail}
            </div>
          )}

          <form id="register-form" className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="field-row">
              <div className="field-group">
                <label htmlFor="reg-first-name" className="field-label">Nombre</label>
                <div className="field-input-wrapper">
                  <User size={16} className="field-icon" />
                  <input
                    id="reg-first-name"
                    type="text"
                    autoComplete="given-name"
                    placeholder="Juan"
                    value={form.first_name}
                    onChange={update('first_name')}
                    className="field-input"
                    required
                  />
                </div>
                {fieldError('first_name')}
              </div>

              <div className="field-group">
                <label htmlFor="reg-last-name" className="field-label">Apellido</label>
                <div className="field-input-wrapper">
                  <User size={16} className="field-icon" />
                  <input
                    id="reg-last-name"
                    type="text"
                    autoComplete="family-name"
                    placeholder="García"
                    value={form.last_name}
                    onChange={update('last_name')}
                    className="field-input"
                    required
                  />
                </div>
                {fieldError('last_name')}
              </div>
            </div>

            <div className="field-group">
              <label htmlFor="reg-email" className="field-label">Correo electrónico</label>
              <div className="field-input-wrapper">
                <Mail size={16} className="field-icon" />
                <input
                  id="reg-email"
                  type="email"
                  autoComplete="email"
                  placeholder="nombre@empresa.com"
                  value={form.email}
                  onChange={update('email')}
                  className="field-input"
                  required
                />
              </div>
              {fieldError('email')}
            </div>

            <div className="field-group">
              <label htmlFor="reg-password" className="field-label">Contraseña</label>
              <div className="field-input-wrapper">
                <Lock size={16} className="field-icon" />
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Mín. 8 caracteres, 1 mayúscula, 1 número"
                  value={form.password}
                  onChange={update('password')}
                  className="field-input field-input--password"
                  required
                />
                <button
                  type="button"
                  className="field-toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {fieldError('password')}
            </div>

            <div className="field-group">
              <label htmlFor="reg-password-confirm" className="field-label">Confirmar contraseña</label>
              <div className="field-input-wrapper">
                <Lock size={16} className="field-icon" />
                <input
                  id="reg-password-confirm"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Repetí tu contraseña"
                  value={form.password_confirm}
                  onChange={update('password_confirm')}
                  className="field-input"
                  required
                />
              </div>
              {fieldError('password_confirm')}
            </div>

            <button
              id="register-submit-btn"
              type="submit"
              className="btn-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <><Loader2 size={16} className="btn-spinner" />Creando cuenta…</>
              ) : (
                'Crear cuenta'
              )}
            </button>
          </form>
        </div>
      </div>

      <style>{`
        .auth-layout { display:flex; min-height:100vh; background:var(--color-bg); }
        .auth-brand { position:relative; flex:0 0 45%; display:flex; align-items:center; justify-content:center; background:var(--color-surface); border-right:1px solid var(--color-border); overflow:hidden; }
        .auth-brand-inner { position:relative; z-index:1; max-width:420px; padding:48px; display:flex; flex-direction:column; gap:32px; }
        .brand-logo { display:flex; align-items:center; gap:12px; }
        .brand-name { font-family:var(--font-display); font-size:1.25rem; font-weight:700; color:var(--color-text-primary); letter-spacing:-0.02em; }
        .brand-headline { font-family:var(--font-display); font-size:clamp(1.75rem,3vw,2.5rem); font-weight:700; line-height:1.2; letter-spacing:-0.03em; color:var(--color-text-primary); }
        .brand-accent { color:var(--color-accent); }
        .brand-sub { margin-top:12px; font-size:0.9375rem; line-height:1.7; color:var(--color-text-secondary); }
        .brand-grid { position:absolute; inset:0; background-image:linear-gradient(var(--color-border-subtle) 1px,transparent 1px),linear-gradient(90deg,var(--color-border-subtle) 1px,transparent 1px); background-size:40px 40px; opacity:0.4; mask-image:radial-gradient(ellipse at center,black 30%,transparent 75%); }
        .auth-form-panel { flex:1; display:flex; align-items:center; justify-content:center; padding:48px 32px; }
        .auth-form-container { width:100%; max-width:440px; display:flex; flex-direction:column; gap:24px; }
        .auth-header { display:flex; flex-direction:column; gap:8px; }
        .auth-title { font-family:var(--font-display); font-size:1.625rem; font-weight:700; letter-spacing:-0.02em; color:var(--color-text-primary); }
        .auth-subtitle { font-size:0.875rem; color:var(--color-text-secondary); }
        .auth-link { color:var(--color-accent); text-decoration:none; font-weight:500; transition:color 0.15s; }
        .auth-link:hover { color:var(--color-accent-hover); text-decoration:underline; }
        .auth-alert { padding:12px 14px; border-radius:var(--radius-md); font-size:0.875rem; }
        .auth-alert--error { background:var(--color-error-muted); border:1px solid rgba(239,68,68,0.25); color:#fca5a5; }
        .auth-form { display:flex; flex-direction:column; gap:18px; }
        .field-row { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
        .field-group { display:flex; flex-direction:column; gap:6px; }
        .field-label { font-size:0.875rem; font-weight:500; color:var(--color-text-secondary); }
        .field-input-wrapper { position:relative; display:flex; align-items:center; }
        .field-icon { position:absolute; left:14px; color:var(--color-text-muted); pointer-events:none; }
        .field-input { width:100%; height:44px; padding:0 14px 0 42px; background:var(--color-surface-2); border:1px solid var(--color-border); border-radius:var(--radius-md); color:var(--color-text-primary); font-family:var(--font-sans); font-size:0.9375rem; transition:border-color 0.15s,box-shadow 0.15s; outline:none; }
        .field-input::placeholder { color:var(--color-text-muted); }
        .field-input:focus { border-color:var(--color-accent); box-shadow:0 0 0 3px var(--color-accent-muted); }
        .field-input--password { padding-right:44px; }
        .field-toggle { position:absolute; right:12px; background:none; border:none; color:var(--color-text-muted); cursor:pointer; padding:4px; border-radius:var(--radius-sm); display:flex; align-items:center; transition:color 0.15s; }
        .field-toggle:hover { color:var(--color-text-secondary); }
        .field-error { font-size:0.8125rem; color:var(--color-error); }
        .btn-primary { width:100%; height:46px; display:flex; align-items:center; justify-content:center; gap:8px; background:var(--color-accent); color:#fff; border:none; border-radius:var(--radius-md); font-family:var(--font-sans); font-size:0.9375rem; font-weight:600; cursor:pointer; transition:background 0.15s,transform 0.1s,box-shadow 0.15s; margin-top:4px; }
        .btn-primary:hover:not(:disabled) { background:var(--color-accent-hover); box-shadow:0 4px 16px rgba(59,130,246,0.3); }
        .btn-primary:active:not(:disabled) { transform:translateY(1px); }
        .btn-primary:disabled { opacity:0.5; cursor:not-allowed; }
        .btn-spinner { animation:spin 0.75s linear infinite; }
        @keyframes spin { to { transform:rotate(360deg); } }
        @media (max-width:768px) {
          .auth-layout { flex-direction:column; }
          .auth-brand { flex:0 0 auto; border-right:none; border-bottom:1px solid var(--color-border); }
          .field-row { grid-template-columns:1fr; }
        }
      `}</style>
    </div>
  )
}
