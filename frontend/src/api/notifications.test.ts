import { describe, it, expect, vi } from 'vitest'
import { getNotificationsApi } from './notifications'
import apiClient from '@/lib/apiClient'

vi.mock('@/lib/apiClient', () => ({
  default: {
    get: vi.fn()
  }
}))

describe('Notifications API', () => {
  it('fetches notifications from correct v1 endpoint', async () => {
    const mockData = [{ id: '1', title: 'Test' }]
    vi.mocked(apiClient.get).mockResolvedValue({ data: mockData })
    
    const result = await getNotificationsApi()
    
    expect(apiClient.get).toHaveBeenCalledWith('/v1/notifications/')
    expect(result).toEqual(mockData)
  })
})
