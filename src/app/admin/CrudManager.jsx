'use client';

import { useEffect, useState, useCallback } from 'react';

const inputCls = 'w-full bg-white/5 border border-white/10 rounded-xl p-3';

const TYPE_BADGE = {
  web: 'bg-blue-500/20 text-blue-300',
  bot: 'bg-green-500/20 text-green-300',
  android: 'bg-emerald-500/20 text-emerald-300',
  other: 'bg-gray-500/20 text-gray-300',
};

// Child images (project_images / design_images) untuk satu parent row.
// hasCaption=true → tampilkan field caption + deskripsi (Android screenshots).
function RelatedImages({ table, fk, parentId, hasCaption }) {
  const [rows, setRows] = useState([]);

  const load = useCallback(async () => {
    const res = await fetch(`/api/admin/${table}?${fk}=${parentId}`);
    if (res.ok) setRows(await res.json());
  }, [table, fk, parentId]);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch on mount
  useEffect(() => { load(); }, [load]);

  const update = (idx, patch) => setRows((rs) => rs.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  const addDraft = () => setRows((rs) => [...rs, { _draft: true, image_url: '', caption: '', description: '', sort_order: 0 }]);

  const upload = async (idx, file) => {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    if (!res.ok) return;
    const { url } = await res.json();
    update(idx, { image_url: url });
  };

  const save = async (row) => {
    if (!row.image_url) return;
    const payload = { image_url: row.image_url, sort_order: Number(row.sort_order) || 0 };
    if (hasCaption) { payload.caption = row.caption || null; payload.description = row.description || null; }
    if (row.id) {
      await fetch(`/api/admin/${table}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: row.id, ...payload }),
      });
    } else {
      await fetch(`/api/admin/${table}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [fk]: parentId, ...payload }),
      });
    }
    load();
  };

  const remove = async (row, idx) => {
    if (!row.id) { setRows((rs) => rs.filter((_, i) => i !== idx)); return; }
    if (!confirm('Hapus gambar ini?')) return;
    await fetch(`/api/admin/${table}`, {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: row.id }),
    });
    load();
  };

  return (
    <div className="bg-card-bg border border-white/10 rounded-2xl p-6 mb-8">
      <h2 className="text-lg font-bold mb-4">{hasCaption ? 'Screenshots' : 'Galeri Gambar'}</h2>
      <div className="space-y-3 mb-4">
        {rows.map((row, idx) => (
          <div key={row.id || `draft-${idx}`} className="flex gap-3 bg-white/5 border border-white/10 rounded-xl p-3">
            <div className="shrink-0 w-20">
              {row.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={row.image_url} alt={row.caption || ''} className="w-20 h-20 object-cover rounded-lg" />
              ) : (
                <input type="file" accept="image/*" className="text-[10px] w-20"
                  onChange={(e) => e.target.files[0] && upload(idx, e.target.files[0])} />
              )}
            </div>
            <div className="flex-1 min-w-0 space-y-2">
              {hasCaption && (
                <>
                  <input placeholder="Caption" value={row.caption ?? ''} onChange={(e) => update(idx, { caption: e.target.value })} className={inputCls} />
                  <input placeholder="Deskripsi" value={row.description ?? ''} onChange={(e) => update(idx, { description: e.target.value })} className={inputCls} />
                </>
              )}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-gray-400">Urutan</span>
                <input type="number" value={row.sort_order ?? 0} onChange={(e) => update(idx, { sort_order: e.target.value })}
                  className="w-16 bg-white/5 border border-white/10 rounded-lg p-2" />
                <button type="button" onClick={() => save(row)} className="px-3 py-2 bg-accent text-bg-dark text-xs font-bold rounded-lg">Simpan</button>
                <button type="button" onClick={() => remove(row, idx)} className="px-3 py-2 text-red-400 text-xs">Hapus</button>
              </div>
            </div>
          </div>
        ))}
        {!rows.length && <p className="text-gray-500 text-sm">Belum ada gambar.</p>}
      </div>
      <button type="button" onClick={addDraft} className="px-5 py-2.5 border border-white/20 rounded-xl text-sm font-bold">
        + Tambah {hasCaption ? 'Screenshot' : 'Gambar'}
      </button>
    </div>
  );
}

// Generic CRUD manager.
// fields: [{ key, label, type, options?, required?, showWhen?(form)->bool }]
//   type: text | textarea | select | checkbox | url | number | tags | image
// columns: array key field yang ditampilkan di list (default: ['title']).
// relatedImages (opsional): { table, fk, hasCaption?, showWhen?(form)->bool }
export default function CrudManager({ table, title, fields, columns = ['title'], relatedImages }) {
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

  const visibleFields = fields.filter((f) => !f.showWhen || f.showWhen(form));

  const save = async (e) => {
    e.preventDefault();
    // Hanya field yang visible (lolos showWhen) yang ikut di-submit.
    const payload = {};
    visibleFields.forEach((f) => {
      let v = form[f.key];
      if (f.type === 'tags') v = typeof v === 'string' ? v.split(',').map((s) => s.trim()).filter(Boolean) : (v || []);
      else if (f.type === 'number') { if (v === '' || v == null) return; v = Number(v); }
      else if (f.type === 'checkbox') v = !!v;
      payload[f.key] = v;
    });
    const method = editingId ? 'PUT' : 'POST';
    const body = editingId ? { id: editingId, ...payload } : payload;
    const res = await fetch(`/api/admin/${table}`, {
      method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
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
      method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }),
    });
    if (res.ok) load();
  };

  const uploadImage = async (k, file) => {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    if (res.ok) { const { url } = await res.json(); setField(k, url); }
    else setMsg('Upload gagal.');
  };

  return (
    <main className="min-h-screen bg-bg-dark text-white p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <a href="/admin" className="text-accent text-sm mb-6 inline-block">← Dashboard</a>
        <h1 className="text-3xl font-bold mb-8">{title}</h1>

        <form onSubmit={save} className="bg-card-bg border border-white/10 rounded-2xl p-6 mb-8 space-y-4">
          {visibleFields.map((f) => (
            <div key={f.key}>
              <label className="block text-xs uppercase tracking-widest text-gray-400 mb-1">{f.label}</label>
              {f.type === 'textarea' ? (
                <textarea value={form[f.key] ?? ''} onChange={(e) => setField(f.key, e.target.value)} className={inputCls} rows="3" />
              ) : f.type === 'checkbox' ? (
                <input type="checkbox" checked={!!form[f.key]} onChange={(e) => setField(f.key, e.target.checked)} />
              ) : f.type === 'select' ? (
                <select value={form[f.key] ?? f.options[0]} onChange={(e) => setField(f.key, e.target.value)} className={inputCls}>
                  {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : f.type === 'image' ? (
                <div className="flex items-center gap-3">
                  {form[f.key] ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={form[f.key]} alt={f.label} className="w-20 h-20 object-cover rounded-xl border border-white/10 shrink-0" />
                      <label className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm cursor-pointer">
                        Ganti
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files[0] && uploadImage(f.key, e.target.files[0])} />
                      </label>
                      <button type="button" onClick={() => setField(f.key, '')} className="text-red-400 text-xs">Hapus</button>
                    </>
                  ) : (
                    <input type="file" accept="image/*" onChange={(e) => e.target.files[0] && uploadImage(f.key, e.target.files[0])} />
                  )}
                </div>
              ) : f.type === 'url' ? (
                <div className="flex gap-2">
                  <input type="text" value={form[f.key] ?? ''} onChange={(e) => setField(f.key, e.target.value)} className={inputCls} />
                  {form[f.key] && (
                    <a href={form[f.key]} target="_blank" rel="noopener noreferrer"
                      className="shrink-0 px-4 flex items-center bg-white/5 border border-white/10 rounded-xl text-accent" aria-label="Buka link">
                      <i className="ri-external-link-line"></i>
                    </a>
                  )}
                </div>
              ) : (
                <input type={f.type === 'number' ? 'number' : 'text'} value={form[f.key] ?? ''}
                  onChange={(e) => setField(f.key, e.target.value)} className={inputCls} />
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

        {relatedImages && editingId && (!relatedImages.showWhen || relatedImages.showWhen(form)) && (
          <RelatedImages
            table={relatedImages.table}
            fk={relatedImages.fk}
            parentId={editingId}
            hasCaption={relatedImages.hasCaption}
          />
        )}

        <div className="space-y-3">
          {rows.map((row) => (
            <div key={row.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex justify-between items-center gap-4">
              <div className="flex items-center gap-3 min-w-0 flex-wrap">
                {columns.map((col) => {
                  const v = row[col];
                  if (col === 'type' && v) {
                    return <span key={col} className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${TYPE_BADGE[v] || TYPE_BADGE.other}`}>{v}</span>;
                  }
                  if (typeof v === 'boolean') {
                    return <span key={col} className={`text-xs ${v ? 'text-accent' : 'text-gray-600'}`}>{col}: {v ? '✓' : '—'}</span>;
                  }
                  if (col === columns[0]) {
                    return <span key={col} className="font-bold truncate">{v ?? '—'}</span>;
                  }
                  return <span key={col} className="text-xs text-gray-400 truncate">{v ?? '—'}</span>;
                })}
              </div>
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
