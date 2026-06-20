"use client"

import CrudManager from '@/app/admin/CrudManager'

const designFields = [
  { key: 'title', label: 'Judul', type: 'text', required: true },
  { key: 'category', label: 'Kategori', type: 'text' },
  { key: 'cover_image_url', label: 'Cover Image (tampil di grid homepage)', type: 'image' },
  { key: 'description', label: 'Deskripsi', type: 'textarea' },
  { key: 'featured', label: 'Featured di Homepage', type: 'checkbox' },
  { key: 'sort_order', label: 'Urutan', type: 'number' },
]

const designColumns = ['title', 'category', 'featured', 'sort_order']

const relatedSection = {
  table: 'design_images',
  foreignKey: 'design_id',
  label: 'Galeri Gambar',
  addLabel: '+ Tambah Gambar',
  hasCaption: false,
  showWhen: () => true, // Always show if editing a design
}

export default function DesignPage() {
  return (
    <CrudManager
      table="designs"
      fields={designFields}
      columns={designColumns}
      relatedSection={relatedSection}
    />
  )
}