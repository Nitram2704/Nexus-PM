import apiClient from '@/lib/apiClient'
import type {
  Member,
  MemberRole,
  Project,
  ProjectAnalytics,
  ProjectCreateData,
  ProjectSummary,
  ProjectUpdateData,
} from '@/types/project'

export const getProjectDetailApi = (id: string) =>
  apiClient.get<Project>(`/v1/projects/${id}/`)

export const getProjectAnalyticsApi = (id: string) =>
  apiClient.get<ProjectAnalytics>(`/v1/projects/${id}/analytics/`)

export const moveTaskApi = (taskId: string, columnId: string) =>
  apiClient.post(`/v1/tasks/${taskId}/move/`, { column: columnId })

// ── Project CRUD ────────────────────────────────────────────────────────────────
export const listProjectsApi = () =>
  apiClient.get<ProjectSummary[]>('/v1/projects/')

export const createProjectApi = (data: ProjectCreateData) =>
  apiClient.post<Project>('/v1/projects/', data)

export const updateProjectApi = (id: string, data: ProjectUpdateData) =>
  apiClient.patch<Project>(`/v1/projects/${id}/`, data)

export const archiveProjectApi = (id: string, isArchived: boolean) =>
  apiClient.patch<Project>(`/v1/projects/${id}/`, { is_archived: isArchived })

// ── Members ─────────────────────────────────────────────────────────────────────
export const inviteMemberApi = (projectId: string, email: string, role: MemberRole) =>
  apiClient.post<Member>(`/v1/projects/${projectId}/invite/`, { email, role })

export const updateMemberRoleApi = (projectId: string, userId: number, role: MemberRole) =>
  apiClient.post<Member>(`/v1/projects/${projectId}/update_member_role/`, { user_id: userId, role })

export const removeMemberApi = (projectId: string, userId: number) =>
  apiClient.post(`/v1/projects/${projectId}/remove_member/`, { user_id: userId })

// ── Export ──────────────────────────────────────────────────────────────────────
export const exportBacklogCsvApi = (projectId: string) =>
  apiClient.get<Blob>(`/v1/projects/${projectId}/export_csv/`, { responseType: 'blob' })
