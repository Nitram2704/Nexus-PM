import api from './auth'

export interface DashboardStats {
  total_assigned: number
  pending: number
  completed: number
}

export interface DashboardTask {
  id: string
  title: string
  priority: string
  project_name: string
  project_id: string
  key: string
}

export interface DashboardProject {
  id: string
  name: string
  key: string
  role: string
}

export interface DashboardData {
  tasks: DashboardTask[]
  projects: DashboardProject[]
  stats: DashboardStats
}

export const getDashboardDataApi = () => api.get<DashboardData>('/accounts/dashboard/')
