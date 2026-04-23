export type SprintStatus = 'planning' | 'active' | 'completed'

export interface Sprint {
  id: string
  project: string
  name: string
  goal: string
  status: SprintStatus
  start_date: string | null
  end_date: string | null
  task_count: number
  completed_count: number
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  project: string
  sprint: string | null
  column: string
  title: string
  description: string
  key: string
  type: 'feature' | 'bug' | 'task' | 'story'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: string
  assignee: number | null
  assignee_email: string
  creator: number
  creator_email: string
  story_points: number
  parent: string | null
  created_at: string
  updated_at: string
}

export interface Column {
  id: string
  project: string
  name: string
  position: number
  is_done_column: boolean
  tasks: Task[]
  created_at: string
}

export interface Project {
  id: string
  name: string
  key: string
  description: string | null
  is_archived: boolean
  task_counter: number
  columns: Column[]
  created_at: string
  updated_at: string
}
