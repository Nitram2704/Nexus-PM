export interface User {
  id: number
  email: string
  username: string
  first_name: string
  last_name: string
  full_name: string
  bio: string
  avatar: string | null
  created_at: string
}

export interface AuthTokens {
  access: string
  refresh: string
}

export interface LoginResponse {
  user: User
  access: string
  refresh: string
}

export interface ApiError {
  detail?: string
  locked?: boolean
  remaining_seconds?: number
}
