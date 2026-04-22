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

export const forgotPasswordApi = (email: string) =>
  apiClient.post('/auth/password-reset/', { email })

export const resetPasswordApi = (uidb64: string, token: string, data: any) =>
  apiClient.post(`/auth/password-reset-confirm/${uidb64}/${token}/`, data)
