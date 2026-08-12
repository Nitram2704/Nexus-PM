import { describe, it, expect, beforeEach } from 'vitest'
import { useAuthStore } from '@/store/authStore'

describe('authStore', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    })
  })

  it('has correct initial state', () => {
    const state = useAuthStore.getState()
    expect(state.user).toBeNull()
    expect(state.accessToken).toBeNull()
    expect(state.refreshToken).toBeNull()
    expect(state.isAuthenticated).toBe(false)
  })

  it('setAuth sets user, tokens, and isAuthenticated', () => {
    const user = { id: 1, email: 'test@test.com', first_name: 'Test', last_name: 'User' } as any
    useAuthStore.getState().setAuth(user, 'access-123', 'refresh-123')

    const state = useAuthStore.getState()
    expect(state.user).toEqual(user)
    expect(state.accessToken).toBe('access-123')
    expect(state.refreshToken).toBe('refresh-123')
    expect(state.isAuthenticated).toBe(true)
  })

  it('logout clears all state', () => {
    const user = { id: 1, email: 'test@test.com' } as any
    useAuthStore.getState().setAuth(user, 'access-123', 'refresh-123')
    useAuthStore.getState().logout()

    const state = useAuthStore.getState()
    expect(state.user).toBeNull()
    expect(state.accessToken).toBeNull()
    expect(state.refreshToken).toBeNull()
    expect(state.isAuthenticated).toBe(false)
  })
})
