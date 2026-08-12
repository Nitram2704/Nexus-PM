import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Navbar } from '@/components/layout/Navbar'

vi.mock('react-router-dom', () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
  useLocation: () => ({ pathname: '/dashboard' }),
  useNavigate: () => vi.fn(),
  useParams: () => ({}),
}))

vi.mock('@/store/authStore', () => ({
  useAuthStore: () => ({
    user: { first_name: 'Test', last_name: 'User', email: 'test@test.com', avatar: null },
    logout: vi.fn(),
  }),
}))

vi.mock('@/store/projectStore', () => ({
  useProjectStore: () => null,
}))

vi.mock('@/store/chatStore', () => ({
  useChatStore: () => ({ pendingActionsCount: 0 }),
}))

vi.mock('@/store/uiStore', () => ({
  useUIStore: () => ({ isIntelligenceOpen: false, toggleIntelligence: vi.fn() }),
}))

vi.mock('@/components/notifications/NotificationBell', () => ({
  NotificationBell: () => <div data-testid="notification-bell" />,
}))

vi.mock('@/components/SettingsModal', () => ({
  SettingsModal: () => null,
}))

vi.mock('@/components/ProfileModal', () => ({
  ProfileModal: () => null,
}))

describe('Navbar', () => {
  it('renders the app name NEXUS_PM // INIT', () => {
    render(<Navbar />)
    expect(screen.getByText('NEXUS_PM // INIT')).toBeInTheDocument()
  })
})
