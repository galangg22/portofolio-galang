'use client';

import CrudManager from '../CrudManager';

export default function AdminDesign() {
  return (
    <CrudManager
      table="designs"
      title="Design Gallery"
      columns={['title', 'category', 'featured', 'sort_order']}
      fields={[
        { key: 'title', label: 'Judul', type: 'text', required: true },
        { key: 'category', label: 'Kategori (branding, ui, poster, dll)', type: 'text' },
        { key: 'cover_image_url', label: 'Cover Image (tampil di grid homepage)', type: 'image' },
        { key: 'description', label: 'Deskripsi', type: 'textarea' },
        { key: 'featured', label: 'Featured di Homepage', type: 'checkbox' },
        { key: 'sort_order', label: 'Urutan', type: 'number' },
      ]}
      relatedImages={{
        table: 'design_images',
        fk: 'design_id',
        hasCaption: false,
      }}
      helpText="Cover image ditampilkan di grid. Klik Edit lalu tambah gambar di panel Galeri untuk lightbox multi-image."
    />
  );
}
