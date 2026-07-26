"use client"

import CrudManager from '@/app/admin/CrudManager'

const certificateFields = [
  { key: 'title', label: 'Judul Sertifikat', type: 'text', required: true, group: 'Informasi Utama' },
  { key: 'issuer', label: 'Penerbit', type: 'text', required: true, group: 'Informasi Utama' },
  { key: 'issue_date', label: 'Tanggal Terbit (kosongkan jika tidak ada)', type: 'date', group: 'Informasi Utama' },
  { key: 'credential_id', label: 'Credential ID (opsional)', type: 'text', group: 'Detail Kredensial' },
  { key: 'credential_url', label: 'Link Verifikasi Credential (opsional)', type: 'url', group: 'Detail Kredensial' },
  { key: 'image_url', label: 'Thumbnail Sertifikat (Otomatis dari PDF jika kosong)', type: 'image', group: 'Media & Deskripsi' },
  { key: 'verify_url', label: 'Link PDF Sertifikat (GDrive / storage)', type: 'url', group: 'Media & Deskripsi' },
  { key: 'description', label: 'Deskripsi', type: 'textarea', group: 'Media & Deskripsi' },
]

const certificateColumns = ['title', 'issuer', 'issue_date']

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
      featuredLimit={3}
    />
  )
}