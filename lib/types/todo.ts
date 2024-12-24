export interface Todo {
  id: string
  name: string
  text: string
  done: boolean
  done_at: string | null
  user_id: string
  created_at: string
}

export type NewTodo = Omit<Todo, 'id' | 'created_at' | 'done_at'>
