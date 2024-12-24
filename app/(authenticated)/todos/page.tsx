import { TodoList } from '@/components/todo-list'

export default function TodosPage() {
  return (
    <div className="container py-4 mx-auto">
      <h1 className="text-4xl font-bold mb-8 text-center">Todos</h1>
      <TodoList />
    </div>
  )
}
