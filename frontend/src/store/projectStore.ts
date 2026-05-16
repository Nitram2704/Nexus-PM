import { create } from 'zustand'
import type { Project } from '@/types/project'

interface ProjectState {
  activeProject: Project | null
  setActiveProject: (project: Project | null) => void
  
  // UI Triggers for Nexus Command Center
  taskModalTitle: string | null
  setTaskModalTitle: (title: string | null) => void
  
  aiSuggestionPrompt: string | null
  setAiSuggestionPrompt: (prompt: string | null) => void
}

export const useProjectStore = create<ProjectState>()((set) => ({
  activeProject: null,
  setActiveProject: (project) => set({ activeProject: project }),
  
  taskModalTitle: null,
  setTaskModalTitle: (title) => set({ taskModalTitle: title }),
  
  aiSuggestionPrompt: null,
  setAiSuggestionPrompt: (prompt) => set({ aiSuggestionPrompt: prompt }),
}))
