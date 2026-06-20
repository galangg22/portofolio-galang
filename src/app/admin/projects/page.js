"use client"

import CrudManager from '@/app/admin/CrudManager'

const projectsFields = [
  { key: 'title', label: 'Judul', type: 'text', required: true },
  { key: 'description', label: 'Deskripsi', type: 'textarea' },
  { key: 'tags', label: 'Tags', type: 'tags' },
  { key: 'type', label: 'Tipe Project', type: 'select', required: true, options: ['web', 'bot', 'android', 'other'] },
  { key: 'thumbnail_url', label: 'Thumbnail', type: 'image' },
  { key: 'github_url', label: 'GitHub URL', type: 'url' },
  { key: 'demo_url', label: 'Demo URL (Web)', type: 'url', showWhen: (f) => f.type === 'web' },
  { key: 'play_store_url', label: 'Play Store URL', type: 'url', showWhen: (f) => f.type === 'android' },
  { key: 'apk_url', label: 'Download APK URL', type: 'url', showWhen: (f) => f.type === 'android' },
  { key: 'status', label: 'Status', type: 'select', options: ['completed', 'wip', 'private'] },
  { key: 'featured', label: 'Featured di Homepage', type: 'checkbox' },
  { key: 'sort_order', label: 'Urutan', type: 'number' },
]

const projectsColumns = ['title', 'type', 'status', 'featured', 'sort_order']

const relatedSection = {
  table: 'project_images',
  foreignKey: 'project_id',
  label: 'Screenshots Android',
  addLabel: '+ Tambah Screenshot',
  hasCaption: true,
  showWhen: (formData) => formData.type === 'android',
}

export default function ProjectsPage() {
  return (
    <CrudManager
      table="projects"
      fields={projectsFields}
      columns={projectsColumns}
      relatedSection={relatedSection}
    />
  )
}