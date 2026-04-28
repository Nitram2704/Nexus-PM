import apiClient from '@/lib/apiClient'

export interface AIProposal {
    id: string
    description: string
    data: AIStoryProposal[]
    created_at: string
    is_imported: boolean
}

export interface AIStoryProposal {
    title: string
    description: string
    type: 'feature' | 'bug' | 'task' | 'story'
    priority: 'high' | 'medium' | 'low'
}

export const generateBacklogApi = async (projectId: string, description: string) => {
    const response = await apiClient.post<AIProposal>(`/v1/projects/${projectId}/ai/generate-backlog/`, { description })
    return response.data
}

export const importProposalApi = async (projectId: string, proposalId: string, selectedIndices: number[]) => {
    const response = await apiClient.post<{ message: string }>(`/v1/projects/${projectId}/ai/import-proposal/${proposalId}/`, { 
        selected_indices: selectedIndices 
    })
    return response.data
}
