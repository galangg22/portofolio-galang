'use client';

import CrudManager from '../CrudManager';

export default function AdminVideo() {
  return (
    <CrudManager
      table="videos"
      title="Video Gallery"
      columns={['title', 'platform', 'featured', 'sort_order']}
      fields={[
        { key: 'title', label: 'Judul', type: 'text', required: true },
        { key: 'video_url', label: 'URL Video', type: 'url', required: true },
        { key: 'platform', label: 'Platform', type: 'select', options: ['youtube', 'drive', 'vimeo'] },
        { key: 'thumbnail_url', label: 'Thumbnail', type: 'image' },
        { key: 'description', label: 'Deskripsi', type: 'textarea' },
        { key: 'featured', label: 'Featured', type: 'checkbox' },
        { key: 'sort_order', label: 'Urutan', type: 'number' },
      ]}
    />
  );
}
