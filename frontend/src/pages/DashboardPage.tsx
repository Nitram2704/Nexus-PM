import { useNavigate } from 'react-router-dom'
import { LogOut, LayoutDashboard } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

export function DashboardPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="dashboard-shell">
      {/* Top bar */}
      <header className="dash-header">
        <div className="dash-logo">
          <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
            <rect width="40" height="40" rx="12" fill="#3b82f6" fillOpacity="0.15" />
            <path d="M10 28L20 12L30 28" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="20" cy="20" r="3" fill="#3b82f6" />
          </svg>
          <span className="dash-logo-text">Nexus PM</span>
        </div>

        <div className="dash-user">
          <span className="dash-user-name">{user?.full_name || user?.email}</span>
          <button id="logout-btn" className="dash-logout-btn" onClick={handleLogout}>
            <LogOut size={16} />
            Cerrar sesión
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="dash-main">
        <div className="dash-welcome">
          <LayoutDashboard size={48} className="dash-welcome-icon" />
          <h1 className="dash-welcome-title">
            ¡Bienvenido, {user?.first_name || 'usuario'}! 👋
          </h1>
          <p className="dash-welcome-sub">
            Tu sesión está activa. El dashboard de proyectos llegará en la Phase 2.
          </p>
          <div className="dash-badge">HU-02 ✓ Login exitoso</div>
        </div>
      </main>

      <style>{`
        .dashboard-shell { min-height:100vh; background:var(--color-bg); display:flex; flex-direction:column; }
        .dash-header { display:flex; align-items:center; justify-content:space-between; padding:0 24px; height:60px; background:var(--color-surface); border-bottom:1px solid var(--color-border); }
        .dash-logo { display:flex; align-items:center; gap:10px; }
        .dash-logo-text { font-family:var(--font-display); font-weight:700; font-size:1rem; color:var(--color-text-primary); letter-spacing:-0.02em; }
        .dash-user { display:flex; align-items:center; gap:16px; }
        .dash-user-name { font-size:0.875rem; color:var(--color-text-secondary); }
        .dash-logout-btn { display:flex; align-items:center; gap:6px; background:none; border:1px solid var(--color-border); color:var(--color-text-secondary); padding:6px 12px; border-radius:var(--radius-sm); font-size:0.8125rem; cursor:pointer; transition:all 0.15s; }
        .dash-logout-btn:hover { border-color:var(--color-error); color:var(--color-error); }
        .dash-main { flex:1; display:flex; align-items:center; justify-content:center; }
        .dash-welcome { display:flex; flex-direction:column; align-items:center; gap:16px; text-align:center; max-width:480px; padding:48px 24px; }
        .dash-welcome-icon { color:var(--color-accent); opacity:0.6; }
        .dash-welcome-title { font-family:var(--font-display); font-size:1.75rem; font-weight:700; letter-spacing:-0.02em; color:var(--color-text-primary); }
        .dash-welcome-sub { font-size:1rem; color:var(--color-text-secondary); line-height:1.6; }
        .dash-badge { display:inline-flex; align-items:center; padding:6px 14px; background:rgba(34,197,94,0.1); border:1px solid rgba(34,197,94,0.25); color:#4ade80; border-radius:20px; font-size:0.8125rem; font-weight:500; }
      `}</style>
    </div>
  )
}
