"use client"

import CrudManager from '@/app/admin/CrudManager'

const certificateFields = [
  { key: 'title', label: 'Judul Sertifikat', type: 'text', required: true },
  { key: 'issuer', label: 'Penerbit', type: 'text', required: true },
  { key: 'credential_id', label: 'Credential ID (opsional)', type: 'text' },
  { key: 'credential_url', label: 'Link Verifikasi Credential (opsional)', type: 'url' },
  { key: 'issue_date', label: 'Tanggal Terbit (kosongkan jika tidak ada)', type: 'date' },
  { key: 'image_url', label: 'Gambar Sertifikat', type: 'image' },
  { key: 'verify_url', label: 'Link PDF Sertifikat (GDrive / storage)', type: 'url' },
  { key: 'description', label: 'Deskripsi', type: 'textarea' },
  { key: 'featured', label: 'Featured di Homepage', type: 'checkbox' },
  { key: 'sort_order', label: 'Urutan', type: 'number' },
]

const certificateColumns = ['title', 'issuer', 'issue_date', 'featured', 'sort_order']

const relatedSection = {
  table: 'certificate_images',
  foreignKey: 'certificate_id',
  label: 'Halaman Tambahan',
  addLabel: '+ Tambah Halaman',
  hasCaption: false,
  showWhen: () => true,
}

export default function CertificatesPage() {
  return (
    <CrudManager
      table="certificates"
      fields={certificateFields}
      columns={certificateColumns}
      relatedSection={relatedSection}
    />
  )
}