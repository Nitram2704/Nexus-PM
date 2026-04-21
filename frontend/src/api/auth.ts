import apiClient from '@/lib/apiClient'
import type { LoginResponse, User } from '@/types/auth'

export const loginApi = (email: string, password: string) =>
  apiClient.post<LoginResponse>('/auth/login/', { email, password })

export const registerApi = (data: {
  email: string
  first_name: string
  last_name: string
  password: string
  password_confirm: string
}) => apiClient.post<LoginResponse>('/auth/register/', data)

export const getMeApi = () => apiClient.get<User>('/auth/me/')
