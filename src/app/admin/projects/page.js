'use client';

import CrudManager from '../CrudManager';

export default function AdminProjects() {
  return (
    <CrudManager
      table="projects"
      title="Dev Projects"
      columns={['title', 'type', 'status', 'featured', 'sort_order']}
      fields={[
        { key: 'title', label: 'Judul', type: 'text', required: true },
        { key: 'description', label: 'Deskripsi', type: 'textarea' },
        { key: 'tags', label: 'Tags (pisah koma)', type: 'tags' },
        { key: 'type', label: 'Tipe', type: 'select', required: true, options: ['web', 'bot', 'android', 'other'] },
        { key: 'thumbnail_url', label: 'Thumbnail', type: 'image' },
        { key: 'github_url', label: 'GitHub URL', type: 'url' },
        { key: 'demo_url', label: 'Demo URL', type: 'url', showWhen: (f) => f.type === 'web' },
        { key: 'play_store_url', label: 'Play Store URL', type: 'url', showWhen: (f) => f.type === 'android' },
        { key: 'apk_url', label: 'APK URL', type: 'url', showWhen: (f) => f.type === 'android' },
        { key: 'status', label: 'Status', type: 'select', options: ['completed', 'wip', 'private'] },
        { key: 'featured', label: 'Featured', type: 'checkbox' },
        { key: 'sort_order', label: 'Urutan', type: 'number' },
      ]}
      relatedImages={{
        table: 'project_images',
        fk: 'project_id',
        hasCaption: true,
        showWhen: (f) => f.type === 'android',
      }}
      helpText="Kelola semua project. Tipe Android bisa tambah screenshots. Tipe Web bisa isi Demo URL. Status 'private' tidak akan ditampilkan di frontend."
    />
  );
}
