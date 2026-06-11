'use client';

import CrudManager from '../CrudManager';

export default function AdminCertificates() {
  return (
    <CrudManager
      table="certificates"
      title="Certificates"
      columns={['title', 'issuer', 'issue_date', 'featured', 'sort_order']}
      fields={[
        { key: 'title', label: 'Judul Sertifikat', type: 'text', required: true },
        { key: 'issuer', label: 'Penerbit', type: 'text', required: true },
        { key: 'credential_id', label: 'Credential ID (opsional)', type: 'text' },
        { key: 'issue_date', label: 'Tanggal Terbit (kosongkan jika tidak ada)', type: 'date' },
        { key: 'verify_url', label: 'Link PDF', type: 'pdf' },
        { key: 'description', label: 'Deskripsi', type: 'textarea' },
        { key: 'featured', label: 'Featured di Homepage', type: 'checkbox' },
        { key: 'sort_order', label: 'Slot Featured', type: 'featured_slot', showWhen: (f) => !!f.featured },
      ]}
      featuredSlots={{
        maxSlots: 3,
        slotField: 'sort_order',
        featuredField: 'featured',
        table: 'certificates',
      }}
      relatedImages={{
        table: 'certificate_images',
        fk: 'certificate_id',
        hasCaption: false,
      }}
      helpText="Centang Featured untuk menampilkan di homepage (max 3 slot). Pilih slot dari dropdown — slot yang sudah terpakai akan ditampilkan."
    />
  );
}
