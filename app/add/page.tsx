'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { NavBar } from "@/components/nav-bar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface Project {
  name: string
  description: string
  header_img: string
  is_public: boolean
  is_open: boolean
}

export default function AddProjects() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([
    {
      name: '',
      description: '',
      header_img: '',
      is_public: true,
      is_open: true,
    }
  ])
  const [existingProjects, setExistingProjects] = useState<Array<Project & { id: number }>>([])
  const [uploading, setUploading] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)

  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/auth/sign-in')
      } else {
        setCurrentUser(session.user)
      }
    }
    checkAuth()
  }, [router])

  useEffect(() => {
    const fetchProjects = async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('id', { ascending: false })

      if (error) {
        console.error('Error fetching projects:', error)
      } else {
        setExistingProjects(data || [])
      }
    }

    fetchProjects()
    
    const channel = supabase
      .channel('projects_channel')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'projects' 
        }, 
        () => {
          fetchProjects()
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [])

  const handleChange = (index: number, field: keyof Project, value: string | boolean) => {
    const newProjects = [...projects]
    newProjects[index][field] = value
    setProjects(newProjects)
  }

  const handleImageUpload = async (index: number, file: File) => {
    if (!file) return

    setUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `project-headers/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('project-images')
        .upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      const { data: { publicUrl } } = supabase.storage
        .from('project-images')
        .getPublicUrl(filePath)

      handleChange(index, 'header_img', publicUrl)
    } catch (error) {
      console.error('Error uploading image:', error)
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!currentUser) {
      console.error('No user logged in')
      return
    }

    const validProjects = projects.filter(p => p.name.trim() !== '')

    if (validProjects.length === 0) {
      alert('Please fill in at least one project name')
      return
    }

    for (const project of validProjects) {
      const { error } = await supabase
        .from('projects')
        .insert([{
          ...project,
          created_by: currentUser.id
        }])

      if (error) {
        console.error('Error inserting project:', error)
      }
    }

    router.push('/')
  }

  return (
    <div className="container mx-auto py-6 space-y-8">
      <NavBar />
      
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold">Add Projects</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {projects.map((project, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
                <CardDescription>Fill in the details for your new project</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor={`name-${index}`}>Name</Label>
                  <Input
                    id={`name-${index}`}
                    value={project.name}
                    onChange={(e) => handleChange(index, 'name', e.target.value)}
                    placeholder="Project name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`description-${index}`}>Description</Label>
                  <Textarea
                    id={`description-${index}`}
                    value={project.description}
                    onChange={(e) => handleChange(index, 'description', e.target.value)}
                    placeholder="Project description"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`header-${index}`}>Header Image</Label>
                  <Input
                    id={`header-${index}`}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleImageUpload(index, file)
                    }}
                    disabled={uploading}
                  />
                </div>

                <div className="space-y-4 pt-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor={`public-${index}`}>Public Project</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow others to see this project
                      </p>
                    </div>
                    <Switch
                      id={`public-${index}`}
                      checked={project.is_public}
                      onCheckedChange={(checked) => handleChange(index, 'is_public', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor={`open-${index}`}>Open Project</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow others to join this project
                      </p>
                    </div>
                    <Switch
                      id={`open-${index}`}
                      checked={project.is_open}
                      onCheckedChange={(checked) => handleChange(index, 'is_open', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/')}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={uploading}>
              {uploading ? 'Uploading...' : 'Create Project'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
