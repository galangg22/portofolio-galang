"use client"

import CrudManager from '@/app/admin/CrudManager'

const videoFields = [
  { key: 'title', label: 'Judul', type: 'text', required: true },
  { key: 'video_url', label: 'URL Video', type: 'url', required: true },
  { key: 'platform', label: 'Platform', type: 'select', options: ['youtube', 'drive', 'vimeo'] },
  { key: 'thumbnail_url', label: 'Thumbnail', type: 'image' },
  { key: 'description', label: 'Deskripsi', type: 'textarea' },
  { key: 'featured', label: 'Featured di Homepage', type: 'checkbox' },
  { key: 'sort_order', label: 'Urutan', type: 'number' },
]

const videoColumns = ['title', 'platform', 'featured', 'sort_order']

export default function VideoPage() {
  return (
    <CrudManager
      table="videos"
      fields={videoFields}
      columns={videoColumns}
    />
  )
}