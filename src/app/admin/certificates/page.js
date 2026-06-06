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
        { key: 'featured', label: 'Featured di Homepage (Max 3)', type: 'checkbox' },
        { key: 'sort_order', label: 'Urutan Featured (0-2, hanya jika Featured dicentang)', type: 'number' },
      ]}
      helpText="Centang Featured dan atur sort_order (0, 1, atau 2) untuk menampilkan di homepage. Max 3 sertifikat."
    />
  );
}
