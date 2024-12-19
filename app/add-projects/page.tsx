'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

interface Project {
  name: string
  description: string
  header_img: string
}

export default function AddProjects() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([
    {
      name: '',
      description: '',
      header_img: '',
    }
  ])
  const [existingProjects, setExistingProjects] = useState<Array<Project & { id: number }>>([])
  const [uploading, setUploading] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/auth/sign-in')
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

  const handleChange = (index: number, field: keyof Project, value: string) => {
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
      alert('Error uploading image')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const { error } = await supabase
      .from('projects')
      .insert(projects)

    if (error) {
      console.error('Error inserting projects:', error)
      alert('Failed to insert projects')
    } else {
      alert('Projects inserted successfully!')
      setProjects([
        { name: '', description: '', header_img: '' }
      ])
      const { data } = await supabase
        .from('projects')
        .select('*')
        .order('id', { ascending: false })
      if (data) {
        setExistingProjects(data)
      }
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Add Project</h1>
      <form onSubmit={handleSubmit} className="space-y-8">
        {projects.map((project, index) => (
          <div key={index} className="p-6 border rounded-lg space-y-4">
            <h2 className="text-xl font-semibold">Project Details</h2>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Name
                <input
                  type="text"
                  value={project.name}
                  onChange={(e) => handleChange(index, 'name', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Description
                <textarea
                  value={project.description}
                  onChange={(e) => handleChange(index, 'description', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  rows={3}
                  required
                />
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Header Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleImageUpload(index, file)
                  }}
                  className="mt-1 block w-full"
                  disabled={uploading}
                />
              </label>
              {project.header_img && (
                <img
                  src={project.header_img}
                  alt="Project header preview"
                  className="mt-2 h-32 w-full object-cover rounded-md"
                />
              )}
            </div>
          </div>
        ))}
        
        <button
          type="submit"
          disabled={uploading}
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-gray-400"
        >
          {uploading ? 'Uploading...' : 'Submit Project'}
        </button>
      </form>

      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-6">Existing Projects</h2>
        <div className="space-y-6">
          {existingProjects.map((project) => (
            <div key={project.id} className="p-6 border rounded-lg">
              {project.header_img && (
                <img
                  src={project.header_img}
                  alt={project.name}
                  className="w-full h-32 object-cover rounded-md mb-4"
                />
              )}
              <h3 className="text-xl font-semibold mb-2">{project.name}</h3>
              <p className="text-gray-600">{project.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
