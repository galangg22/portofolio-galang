"use client"

import { useState, useEffect } from 'react'
import CrudManager from '@/app/admin/CrudManager'

export default function ProjectsPage() {
  const [types, setTypes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/admin/project_types', { credentials: 'include' })
        if (res.ok) {
          const data = await res.json()
          setTypes(data)
        }
      } catch (err) {
        console.error('Failed to load project types:', err)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <i className="ri-loader-4-line animate-spin text-3xl text-gray-400"></i>
      </div>
    )
  }

  // Find the selected slug for conditional rendering
  const getSelectedTypeSlug = (formData) => {
    const selectedType = types.find(t => String(t.id) === String(formData.project_type_id))
    return selectedType ? selectedType.slug.toLowerCase() : ''
  }

  const projectsFields = [
    { key: 'title', label: 'Judul Project', type: 'text', required: true, group: 'Informasi Umum' },
    { key: 'description', label: 'Deskripsi', type: 'textarea', group: 'Informasi Umum' },
    { key: 'tags', label: 'Tags / Tech Stack', type: 'tags', group: 'Informasi Umum' },
    { 
      key: 'project_type_id', 
      label: 'Jenis Project', 
      type: 'select', 
      required: true,
      options: types.map(t => ({ value: String(t.id), label: t.name })),
      group: 'Informasi Umum'
    },
    { key: 'thumbnail_url', label: 'Thumbnail / Cover Image', type: 'image', group: 'Informasi Umum' },
    
    // URLs for developers / apps
    { key: 'github_url', label: 'GitHub URL', type: 'url', group: 'Tautan & Eksternal' },
    { key: 'demo_url', label: 'Demo URL (Web)', type: 'url', group: 'Tautan & Eksternal' },
    { key: 'play_store_url', label: 'Play Store URL', type: 'url', group: 'Tautan & Eksternal' },
    { key: 'apk_url', label: 'Download APK URL', type: 'url', group: 'Tautan & Eksternal' },
    
    // Video fields
    { key: 'video_url', label: 'URL Video (Drive/YouTube/Vimeo)', type: 'url', group: 'Tautan & Eksternal' },
    { key: 'platform', label: 'Platform Video', type: 'select', options: ['youtube', 'drive', 'vimeo'], group: 'Tautan & Eksternal' },
    
    // General status
    { key: 'status', label: 'Status', type: 'select', options: ['completed', 'wip', 'private'], group: 'Visibilitas & Status' },
  ]

  const projectsColumns = [
    { key: 'title', label: 'Judul' },
    { 
      key: 'project_type_id', 
      label: 'Jenis Project',
      render: (val) => {
        const type = types.find(t => String(t.id) === String(val))
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-blue-600/20 text-blue-300 border border-blue-500/30">
            <i className="ri-code-box-line"></i>
            {type ? type.name : '-'}
          </span>
        )
      }
    },
    { key: 'status', label: 'Status' }
  ]

  const relatedSection = {
    table: 'project_images',
    foreignKey: 'project_id',
    label: 'Screenshots / Galeri Gambar',
    addLabel: '+ Tambah Gambar',
    hasCaption: true,
    showWhen: (formData) => ['aplikasi', 'desain'].includes(getSelectedTypeSlug(formData)) || !!formData.project_type_id,
  }

  return (
    <CrudManager
      table="projects"
      fields={projectsFields}
      columns={projectsColumns}
      relatedSection={relatedSection}
      filterField={{
        key: 'project_type_id',
        label: 'Jenis Project',
        options: [{ value: 'all', label: 'Semua' }, ...types.map(t => ({ value: String(t.id), label: t.name }))]
      }}
      enableFeaturedDrag={true}
    />
  )
}