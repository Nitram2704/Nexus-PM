import apiClient from '@/lib/apiClient'

export interface AIStoryProposal {
    title: string
    description?: string
    role?: string
    action?: string
    benefit?: string
    acceptance_criteria?: string[]
    type: 'feature' | 'bug' | 'task' | 'story'
    priority: 'high' | 'medium' | 'low'
}

export interface AIEpicProposal {
    epic: string
    items: AIStoryProposal[]
}

export interface AIProposal {
    id: string
    description: string
    data: any[] // Puede ser AIEpicProposal[] o AIStoryProposal[]
    created_at: string
    is_imported: boolean
}

export const generateBacklogApi = async (projectId: string, description: string) => {
    const response = await apiClient.post<AIProposal>(`/v1/projects/${projectId}/ai/generate-backlog/`, { description })
    return response.data
}

export const generateUserStoriesApi = async (projectId: string, description: string) => {
    const response = await apiClient.post<AIProposal>(`/v1/projects/${projectId}/ai/generate-user-stories/`, { description })
    return response.data
}

export const importProposalApi = async (projectId: string, proposalId: string, selectedIndices: string[], editedItems?: AIStoryProposal[]) => {
    const payload = editedItems ? { items: editedItems } : { selected_indices: selectedIndices };
    const response = await apiClient.post<{ message: string }>(`/v1/projects/${projectId}/ai/import-proposal/${proposalId}/`, payload)
    return response.data
}

export interface AIMessage {
    id: string
    role: 'user' | 'assistant'
    content: string
    created_at: string
    action_metadata?: any
}

export const sendMessageApi = async (projectId: string, content: string) => {
    const response = await apiClient.post<AIMessage>(`/v1/projects/${projectId}/ai/chat/`, { content })
    return response.data
}

export const getChatHistoryApi = async (projectId: string) => {
    const response = await apiClient.get<AIMessage[]>(`/v1/projects/${projectId}/ai/chat/history/`)
    return response.data
}

export const orchestrateEpicApi = async (projectId: string, epicDescription: string) => {
    const response = await apiClient.post<{ message: string }>(`/v1/projects/${projectId}/ai/orchestrate/`, { epic_description: epicDescription })
    return response.data
}
