export interface Project {
  id: number
  name: string
  description: string
  header_img: string
  created_by: string
}

export interface WorkSession {
  id: number
  project_id: number
  name: string
  category: string
  duration: number
  created_at: string
  ended_at: string | null
  created_by: string
}
