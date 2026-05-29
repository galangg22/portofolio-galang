'use client';

import { useEffect, useState, useCallback } from 'react';

// Generic CRUD manager. `fields` mendefinisikan form; `table` = endpoint.
// fields: [{ key, label, type: 'text'|'textarea'|'number'|'checkbox'|'select'|'tags', options? }]
export default function CrudManager({ table, title, fields }) {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [msg, setMsg] = useState('');

  const load = useCallback(async () => {
    const res = await fetch(`/api/admin/${table}`);
    if (res.ok) setRows(await res.json());
  }, [table]);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- data fetch on mount
  useEffect(() => { load(); }, [load]);

  const setField = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const reset = () => { setForm({}); setEditingId(null); };

  const save = async (e) => {
    e.preventDefault();
    const payload = { ...form };
    // normalisasi tags: "a, b" -> ['a','b']
    fields.forEach((f) => {
      if (f.type === 'tags' && typeof payload[f.key] === 'string') {
        payload[f.key] = payload[f.key].split(',').map((s) => s.trim()).filter(Boolean);
      }
      if (f.type === 'number' && payload[f.key] != null) payload[f.key] = Number(payload[f.key]);
    });
    const method = editingId ? 'PUT' : 'POST';
    const body = editingId ? { id: editingId, ...payload } : payload;
    const res = await fetch(`/api/admin/${table}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (res.ok) { setMsg('Tersimpan.'); reset(); load(); }
    else setMsg('Gagal: ' + (await res.json()).error);
  };

  const edit = (row) => {
    const f = { ...row };
    fields.forEach((fl) => {
      if (fl.type === 'tags' && Array.isArray(f[fl.key])) f[fl.key] = f[fl.key].join(', ');
    });
    setForm(f);
    setEditingId(row.id);
  };

  const remove = async (id) => {
    if (!confirm('Hapus item ini?')) return;
    const res = await fetch(`/api/admin/${table}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (res.ok) load();
  };

  const uploadImage = async (k, file) => {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    if (res.ok) setField(k, (await res.json()).url);
    else setMsg('Upload gagal.');
  };

  return (
    <main className="min-h-screen bg-bg-dark text-white p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <a href="/admin" className="text-accent text-sm mb-6 inline-block">← Dashboard</a>
        <h1 className="text-3xl font-bold mb-8">{title}</h1>

        <form onSubmit={save} className="bg-card-bg border border-white/10 rounded-2xl p-6 mb-8 space-y-4">
          {fields.map((f) => (
            <div key={f.key}>
              <label className="block text-xs uppercase tracking-widest text-gray-400 mb-1">{f.label}</label>
              {f.type === 'textarea' ? (
                <textarea value={form[f.key] ?? ''} onChange={(e) => setField(f.key, e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3" rows="3" />
              ) : f.type === 'checkbox' ? (
                <input type="checkbox" checked={!!form[f.key]} onChange={(e) => setField(f.key, e.target.checked)} />
              ) : f.type === 'select' ? (
                <select value={form[f.key] ?? f.options[0]} onChange={(e) => setField(f.key, e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3">
                  {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : f.type === 'image' ? (
                <div>
                  <input type="file" accept="image/*" onChange={(e) => e.target.files[0] && uploadImage(f.key, e.target.files[0])} />
                  {form[f.key] && <p className="text-xs text-accent mt-1 break-all">{form[f.key]}</p>}
                </div>
              ) : (
                <input type={f.type === 'number' ? 'number' : 'text'} value={form[f.key] ?? ''}
                  onChange={(e) => setField(f.key, e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3" />
              )}
            </div>
          ))}
          <div className="flex gap-3">
            <button type="submit" className="px-6 py-3 bg-accent text-bg-dark font-bold rounded-xl">
              {editingId ? 'Update' : 'Tambah'}
            </button>
            {editingId && <button type="button" onClick={reset} className="px-6 py-3 border border-white/20 rounded-xl">Batal</button>}
          </div>
          {msg && <p className="text-sm text-gray-400">{msg}</p>}
        </form>

        <div className="space-y-3">
          {rows.map((row) => (
            <div key={row.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex justify-between items-center gap-4">
              <span className="font-bold truncate">{row.title || row.category}</span>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => edit(row)} className="text-accent text-sm">Edit</button>
                <button onClick={() => remove(row.id)} className="text-red-400 text-sm">Hapus</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
