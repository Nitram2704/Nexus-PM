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

export interface AIRecommendation {
    id: string
    title: string
    description: string
    type: 'risk' | 'improvement' | 'technical'
    status: 'pending' | 'applied' | 'discarded'
    created_at: string
}

export const generateRecommendationsApi = async (projectId: string) => {
    const response = await apiClient.post<AIRecommendation[]>(`/v1/projects/${projectId}/ai/recommendations/generate/`)
    return response.data
}

export const getRecommendationsApi = async (projectId: string) => {
    const response = await apiClient.get<AIRecommendation[]>(`/v1/projects/${projectId}/ai/recommendations/`)
    return response.data
}

export const updateRecommendationApi = async (projectId: string, recommendationId: string, status: 'applied' | 'discarded') => {
    const response = await apiClient.patch<AIRecommendation>(`/v1/projects/${projectId}/ai/recommendations/${recommendationId}/`, { status })
    return response.data
}

export interface ChatMessage {
    role: 'user' | 'model'
    parts: { text: string }[]
}

export const projectChatApi = async (projectId: string, message: string, history: ChatMessage[]) => {
    const response = await apiClient.post<{ response: string }>(`/v1/projects/${projectId}/ai/chat/`, { message, history })
    return response.data
}

export interface AIPrioritizationSuggestion {
    reasoning: string
    ordered_ids: string[]
}

export const getBacklogPrioritizationApi = async (projectId: string) => {
    const response = await apiClient.get<AIPrioritizationSuggestion>(`/v1/projects/${projectId}/ai/prioritize-backlog/`)
    return response.data
}

export const applyBacklogPrioritizationApi = async (projectId: string, orderedIds: string[]) => {
    const response = await apiClient.post<{ message: string }>(`/v1/projects/${projectId}/ai/prioritize-backlog/`, { ordered_ids: orderedIds })
    return response.data
}
