'use client';

import CrudManager from '../CrudManager';

export default function AdminDesign() {
  return (
    <CrudManager
      table="designs"
      title="Design Gallery"
      fields={[
        { key: 'title', label: 'Title', type: 'text' },
        { key: 'category', label: 'Category', type: 'text' },
        { key: 'image_url', label: 'Image', type: 'image' },
        { key: 'description', label: 'Description', type: 'textarea' },
        { key: 'sort_order', label: 'Sort Order', type: 'number' },
      ]}
    />
  );
}
