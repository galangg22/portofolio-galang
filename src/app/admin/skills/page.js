'use client';

import CrudManager from '../CrudManager';

export default function AdminSkills() {
  return (
    <CrudManager
      table="skills"
      title="Skills"
      columns={['category', 'icon', 'sort_order']}
      fields={[
        { key: 'category', label: 'Nama Kategori', type: 'text', required: true },
        { key: 'icon', label: 'Icon (Remixicon class, e.g. ri-terminal-box-line)', type: 'text' },
        { key: 'items', label: 'Daftar Skill (pisah koma)', type: 'tags' },
        { key: 'span', label: 'Grid Span', type: 'select', options: ['col-span-1', 'md:col-span-2'] },
        { key: 'color', label: 'Warna Gradient (e.g. from-accent to-emerald-400)', type: 'text' },
        { key: 'sort_order', label: 'Urutan', type: 'number' },
      ]}
      helpText="Kelola kategori skill yang tampil di bento grid homepage. Gunakan class Remixicon untuk icon."
    />
  );
}
