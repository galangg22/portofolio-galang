'use client';

import CrudManager from '../CrudManager';

export default function AdminProjects() {
  return (
    <CrudManager
      table="projects"
      title="Dev Projects"
      fields={[
        { key: 'title', label: 'Title', type: 'text' },
        { key: 'description', label: 'Description', type: 'textarea' },
        { key: 'tags', label: 'Tags (pisah koma)', type: 'tags' },
        { key: 'thumbnail_url', label: 'Thumbnail', type: 'image' },
        { key: 'github_url', label: 'GitHub URL', type: 'text' },
        { key: 'demo_url', label: 'Demo URL', type: 'text' },
        { key: 'status', label: 'Status', type: 'select', options: ['completed', 'wip', 'private'] },
        { key: 'featured', label: 'Featured', type: 'checkbox' },
        { key: 'sort_order', label: 'Sort Order', type: 'number' },
      ]}
    />
  );
}
