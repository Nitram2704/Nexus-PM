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
    </div>
  )
}
