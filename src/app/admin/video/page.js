'use client';

import CrudManager from '../CrudManager';

export default function AdminVideo() {
  return (
    <CrudManager
      table="videos"
      title="Video Gallery"
      fields={[
        { key: 'title', label: 'Title', type: 'text' },
        { key: 'video_url', label: 'Video URL', type: 'text' },
        { key: 'platform', label: 'Platform', type: 'select', options: ['youtube', 'drive', 'vimeo'] },
        { key: 'thumbnail_url', label: 'Thumbnail', type: 'image' },
        { key: 'description', label: 'Description', type: 'textarea' },
        { key: 'sort_order', label: 'Sort Order', type: 'number' },
      ]}
    />
  );
}
