'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/utils/supabase/client'
import { useDebounce } from '@/hooks/use-debounce'
import { Todo, NewTodo } from '@/lib/types/todo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { ChevronRight, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Checkbox } from '@/components/ui/checkbox'

export function TodoList() {
  const { toast } = useToast()
  const supabase = createClient()
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTodo, setNewTodo] = useState('')
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null)
  const [editingTodo, setEditingTodo] = useState<{ id: string; name: string } | null>(null)
  const debouncedEditingTodo = useDebounce(editingTodo, 500)
  const [isLoading, setIsLoading] = useState(false)
  const [isAdding, setIsAdding] = useState(false)

  useEffect(() => {
    fetchTodos()
  }, [])

  useEffect(() => {
    if (debouncedEditingTodo) {
      updateTodo(debouncedEditingTodo.id, { name: debouncedEditingTodo.name })
    }
  }, [debouncedEditingTodo])

  async function fetchTodos() {
    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "You must be logged in to view todos",
        })
        return
      }

      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })

      if (error) throw error
      if (data) {
        setTodos(data)
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch todos",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function addTodo(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!newTodo.trim()) return

    setIsAdding(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "You must be logged in to add todos",
        })
        return
      }

      const newTodoItem: NewTodo = {
        name: newTodo.trim(),
        text: '',
        done: false,
        user_id: user.id,
      }
      
      const { data, error } = await supabase
        .from('todos')
        .insert([newTodoItem])
        .select()
        .single()

      if (error) throw error
      if (data) {
        setTodos([...todos, data])
        setNewTodo('')
        toast({
          title: "Success",
          description: "Todo added successfully",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add todo",
      })
    } finally {
      setIsAdding(false)
    }
  }

  async function updateTodo(id: string, updates: Partial<Todo>) {
    try {
      const { data, error } = await supabase
        .from('todos')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      if (data) {
        setTodos(todos.map(todo => todo.id === id ? data : todo))
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update todo",
      })
    }
  }

  async function toggleTodo(id: string, done: boolean) {
    await updateTodo(id, {
      done,
      done_at: done ? new Date().toISOString() : null
    })
  }

  const sortedTodos = [...todos].sort((a, b) => {
    if (a.done === b.done) return 0
    return a.done ? 1 : -1
  })

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <form onSubmit={addTodo} className="flex items-center space-x-2">
        <Input
          placeholder="Add a new todo..."
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          className="flex-1"
          disabled={isAdding}
        />
        {isAdding && <Loader2 className="h-4 w-4 animate-spin" />}
      </form>

      {isLoading ? (
        <div className="flex justify-center p-4">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : (
        <AnimatePresence>
          {sortedTodos.map((todo) => (
            <motion.div
              key={todo.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent"
            >
              <Checkbox
                checked={todo.done}
                onCheckedChange={(checked) => toggleTodo(todo.id, checked as boolean)}
              />
              <Input
                value={editingTodo?.id === todo.id ? editingTodo.name : todo.name}
                onChange={(e) => setEditingTodo({ id: todo.id, name: e.target.value })}
                onFocus={() => setEditingTodo({ id: todo.id, name: todo.name })}
                className={`flex-1 border-none bg-transparent ${todo.done ? 'line-through text-muted-foreground' : ''}`}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedTodo(todo)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </motion.div>
          ))}
        </AnimatePresence>
      )}

      <Sheet open={!!selectedTodo} onOpenChange={() => setSelectedTodo(null)}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{selectedTodo?.name}</SheetTitle>
          </SheetHeader>
          <div className="mt-4">
            <p className="text-muted-foreground">{selectedTodo?.text || 'No description'}</p>
            <div className="mt-4 text-sm text-muted-foreground">
              {selectedTodo?.done_at && (
                <p>Completed: {new Date(selectedTodo.done_at).toLocaleDateString()}</p>
              )}
              <p>Created: {selectedTodo && new Date(selectedTodo.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
