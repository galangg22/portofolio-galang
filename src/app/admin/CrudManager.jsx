'use client';

import { useEffect, useState, useCallback } from 'react';

const inputCls = 'w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder-gray-500 focus:outline-none focus:border-accent/60 transition-colors';

const TYPE_BADGE = {
  web: 'bg-blue-500/20 text-blue-300',
  bot: 'bg-green-500/20 text-green-300',
  android: 'bg-emerald-500/20 text-emerald-300',
  other: 'bg-gray-500/20 text-gray-300',
};

const STATUS_BADGE = {
  completed: 'bg-green-500/20 text-green-300',
  wip: 'bg-yellow-500/20 text-yellow-300',
  private: 'bg-red-500/20 text-red-300',
};

// ─── Toast notification ───
function Toast({ msg, type, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t); }, [onDone]);
  const bg = type === 'ok' ? 'bg-green-500/20 border-green-500/30 text-green-300' : 'bg-red-500/20 border-red-500/30 text-red-300';
  return (
    <div className={`fixed top-6 right-6 z-[200] px-5 py-3 rounded-xl border text-sm font-bold shadow-2xl animate-slide-in ${bg}`}>
      <i className={`ri-${type === 'ok' ? 'check' : 'error-warning'}-line mr-2`}></i>{msg}
    </div>
  );
}

// ─── Related Images (project_images / design_images / certificate_images) ───
function RelatedImages({ table, fk, parentId, hasCaption }) {
  const [rows, setRows] = useState([]);

  const load = useCallback(async () => {
    const res = await fetch(`/api/admin/${table}?${fk}=${parentId}`);
    if (res.ok) setRows(await res.json());
  }, [table, fk, parentId]);
  useEffect(() => { load(); }, [load]);

  const update = (idx, patch) => setRows((rs) => rs.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  const addDraft = () => setRows((rs) => [...rs, { _draft: true, image_url: '', caption: '', description: '', sort_order: rs.length }]);

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
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <i className={`ri-${hasCaption ? 'screenshot-2' : 'image-2'}-line text-accent`}></i>
          {hasCaption ? 'Screenshots' : 'Galeri Gambar'}
          <span className="text-xs text-gray-500 font-normal">({rows.length} item)</span>
        </h2>
        <button type="button" onClick={addDraft} className="px-4 py-2 bg-accent/20 text-accent border border-accent/30 rounded-xl text-xs font-bold hover:bg-accent/30 transition-colors">
          + Tambah {hasCaption ? 'Screenshot' : 'Gambar'}
        </button>
      </div>
      <div className="space-y-3">
        {rows.map((row, idx) => (
          <div key={row.id || `draft-${idx}`} className="flex gap-3 bg-white/5 border border-white/10 rounded-xl p-3">
            <div className="shrink-0 w-20">
              {row.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={row.image_url} alt={row.caption || ''} className="w-20 h-20 object-cover rounded-lg" />
              ) : (
                <label className="w-20 h-20 flex items-center justify-center bg-white/5 border border-dashed border-white/20 rounded-lg cursor-pointer hover:border-accent/50 transition-colors">
                  <i className="ri-upload-2-line text-gray-500"></i>
                  <input type="file" accept="image/*" className="hidden"
                    onChange={(e) => e.target.files[0] && upload(idx, e.target.files[0])} />
                </label>
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
                  className="w-16 bg-white/5 border border-white/10 rounded-lg p-2 text-white text-sm" />
                <button type="button" onClick={() => save(row)} className="px-3 py-2 bg-accent text-white text-xs font-bold rounded-lg hover:scale-105 transition-transform">Simpan</button>
                <button type="button" onClick={() => remove(row, idx)} className="px-3 py-2 text-red-400 text-xs hover:text-red-300 transition-colors">Hapus</button>
              </div>
            </div>
          </div>
        ))}
        {!rows.length && <p className="text-gray-500 text-sm text-center py-4">Belum ada gambar.</p>}
      </div>
    </div>
  );
}

// ─── Featured Slot Dropdown ───
// Shows dropdown of slots (0..maxSlots-1) with availability status
function FeaturedSlotSelect({ value, onChange, maxSlots, occupiedSlots, currentEditId }) {
  const slots = Array.from({ length: maxSlots }, (_, i) => i);
  return (
    <div className="space-y-2">
      <select value={value ?? ''} onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))} className={inputCls}>
        <option value="">— Pilih Slot Featured —</option>
        {slots.map((s) => {
          const occupant = occupiedSlots.find((o) => o.sort_order === s);
          const isSelf = occupant && occupant.id === currentEditId;
          const taken = occupant && !isSelf;
          return (
            <option key={s} value={s} disabled={taken}>
              Slot {s + 1}{taken ? ` ⛔ (dipakai: ${occupant.title})` : isSelf ? ' ✓ (slot anda saat ini)' : ' ✅ tersedia'}
            </option>
          );
        })}
      </select>
      <div className="flex flex-wrap gap-2">
        {slots.map((s) => {
          const occupant = occupiedSlots.find((o) => o.sort_order === s);
          const isSelf = occupant && occupant.id === currentEditId;
          const isSelected = Number(value) === s;
          return (
            <div key={s} className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all ${
              isSelected ? 'bg-accent/20 border-accent/50 text-accent' :
              occupant && !isSelf ? 'bg-red-500/10 border-red-500/20 text-red-400' :
              'bg-green-500/10 border-green-500/20 text-green-400'
            }`}>
              Slot {s + 1}: {occupant && !isSelf ? occupant.title?.substring(0, 20) : isSelected ? 'Anda' : 'Kosong'}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Generic CRUD Manager ───
// fields: [{ key, label, type, options?, required?, showWhen?(form)->bool }]
//   type: text | textarea | select | checkbox | url | number | tags | image | date | pdf | featured_slot
// columns: array key field yang ditampilkan di list (default: ['title']).
// relatedImages (opsional): { table, fk, hasCaption?, showWhen?(form)->bool }
// helpText (opsional): teks bantuan di atas form
// featuredSlots (opsional): { maxSlots, slotField, featuredField, table }
export default function CrudManager({ table, title, fields, columns = ['title'], relatedImages, helpText, featuredSlots }) {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState('');
  const [occupiedSlots, setOccupiedSlots] = useState([]);

  const load = useCallback(async () => {
    const res = await fetch(`/api/admin/${table}`);
    if (res.ok) setRows(await res.json());
  }, [table]);

  useEffect(() => { load(); }, [load]);

  // Load occupied featured slots
  useEffect(() => {
    if (!featuredSlots) return;
    const loadSlots = async () => {
      const res = await fetch(`/api/admin/${featuredSlots.table || table}`);
      if (res.ok) {
        const all = await res.json();
        setOccupiedSlots(all.filter((r) => r[featuredSlots.featuredField]));
      }
    };
    loadSlots();
  }, [featuredSlots, table, rows]);

  const setField = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const reset = () => { setForm({}); setEditingId(null); };
  const notify = (msg, type = 'ok') => setToast({ msg, type });

  const visibleFields = fields.filter((f) => !f.showWhen || f.showWhen(form));

  const save = async (e) => {
    e.preventDefault();
    const payload = {};
    visibleFields.forEach((f) => {
      let v = form[f.key];
      if (f.type === 'tags') v = typeof v === 'string' ? v.split(',').map((s) => s.trim()).filter(Boolean) : (v || []);
      else if (f.type === 'number' || f.type === 'featured_slot') { if (v === '' || v == null) return; v = Number(v); }
      else if (f.type === 'checkbox') v = !!v;
      payload[f.key] = v;
    });

    // If featured is unchecked, reset sort_order
    if (featuredSlots && !payload[featuredSlots.featuredField]) {
      payload[featuredSlots.slotField] = 0;
    }

    const method = editingId ? 'PUT' : 'POST';
    const body = editingId ? { id: editingId, ...payload } : payload;
    const res = await fetch(`/api/admin/${table}`, {
      method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    });
    if (res.ok) { notify('Tersimpan!'); reset(); load(); }
    else notify('Gagal: ' + (await res.json()).error, 'err');
  };

  const edit = (row) => {
    const f = { ...row };
    fields.forEach((fl) => {
      if (fl.type === 'tags' && Array.isArray(f[fl.key])) f[fl.key] = f[fl.key].join(', ');
    });
    setForm(f);
    setEditingId(row.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const remove = async (id) => {
    if (!confirm('Hapus item ini?')) return;
    const res = await fetch(`/api/admin/${table}`, {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }),
    });
    if (res.ok) { notify('Dihapus.'); load(); }
  };

  const uploadImage = async (k, file, bucket) => {
    const fd = new FormData();
    fd.append('file', file);
    if (bucket) fd.append('bucket', bucket);
    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    if (res.ok) { const { url } = await res.json(); setField(k, url); }
    else notify('Upload gagal.', 'err');
  };

  // Filtered rows
  const filtered = search
    ? rows.filter((r) => columns.some((c) => String(r[c] ?? '').toLowerCase().includes(search.toLowerCase())))
    : rows;

  return (
    <main className="min-h-screen bg-bg-dark text-white p-6 md:p-12">
      {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
      <div className="max-w-4xl mx-auto">
        <a href="/admin" className="inline-flex items-center gap-2 text-accent text-sm mb-6 hover:text-black dark:hover:text-white transition-colors group">
          <span className="w-7 h-7 rounded-full border border-accent/30 flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-all">
            <i className="ri-arrow-left-s-line"></i>
          </span>
          Dashboard
        </a>
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">{title}</h1>
          <span className="text-xs bg-white/5 border border-white/10 px-3 py-1.5 rounded-full text-gray-400 font-bold">{rows.length} item</span>
        </div>

        {helpText && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-6 flex items-start gap-3">
            <i className="ri-information-line text-blue-400 text-lg shrink-0 mt-0.5"></i>
            <p className="text-sm text-blue-300">{helpText}</p>
          </div>
        )}

        {/* ─── FORM ─── */}
        <form onSubmit={save} className="bg-card-bg border border-white/10 rounded-2xl p-6 mb-8 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-2">
            {editingId ? '✏️ Edit Item' : '➕ Tambah Baru'}
          </h2>
          {visibleFields.map((f) => (
            <div key={f.key}>
              <label className="block text-xs uppercase tracking-widest text-gray-400 mb-1.5">{f.label}</label>
              {f.type === 'textarea' ? (
                <textarea value={form[f.key] ?? ''} onChange={(e) => setField(f.key, e.target.value)} className={inputCls} rows="3" />
              ) : f.type === 'checkbox' ? (
                <label className="inline-flex items-center gap-3 cursor-pointer select-none">
                  <div className={`w-10 h-6 rounded-full transition-colors relative ${form[f.key] ? 'bg-accent' : 'bg-white/10'}`}
                    onClick={() => setField(f.key, !form[f.key])}>
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${form[f.key] ? 'translate-x-5' : 'translate-x-1'}`}></div>
                  </div>
                  <span className={`text-sm font-bold ${form[f.key] ? 'text-accent' : 'text-gray-500'}`}>{form[f.key] ? 'Ya' : 'Tidak'}</span>
                </label>
              ) : f.type === 'select' ? (
                <select value={form[f.key] ?? f.options[0]} onChange={(e) => setField(f.key, e.target.value)} className={inputCls}>
                  {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : f.type === 'featured_slot' ? (
                <FeaturedSlotSelect
                  value={form[f.key]}
                  onChange={(v) => setField(f.key, v)}
                  maxSlots={featuredSlots?.maxSlots || 3}
                  occupiedSlots={occupiedSlots}
                  currentEditId={editingId}
                />
              ) : f.type === 'image' ? (
                <div className="flex items-center gap-3">
                  {form[f.key] ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={form[f.key]} alt={f.label} className="w-20 h-20 object-cover rounded-xl border border-white/10 shrink-0" />
                      <label className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm cursor-pointer hover:border-accent/40 transition-colors">
                        Ganti
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files[0] && uploadImage(f.key, e.target.files[0])} />
                      </label>
                      <button type="button" onClick={() => setField(f.key, '')} className="text-red-400 text-xs hover:text-red-300">Hapus</button>
                    </>
                  ) : (
                    <label className="flex items-center gap-2 px-4 py-3 bg-white/5 border border-dashed border-white/20 rounded-xl cursor-pointer hover:border-accent/40 transition-colors">
                      <i className="ri-upload-2-line text-gray-400"></i>
                      <span className="text-sm text-gray-400">Pilih gambar</span>
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files[0] && uploadImage(f.key, e.target.files[0])} />
                    </label>
                  )}
                </div>
              ) : f.type === 'pdf' ? (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input type="text" placeholder="Paste URL PDF / storage" value={form[f.key] ?? ''} onChange={(e) => setField(f.key, e.target.value)} className={inputCls} />
                    {form[f.key] && (
                      <a href={form[f.key]} target="_blank" rel="noopener noreferrer"
                        className="shrink-0 px-4 flex items-center bg-white/5 border border-white/10 rounded-xl text-accent hover:border-accent/40 transition-colors" aria-label="Buka link">
                        <i className="ri-external-link-line"></i>
                      </a>
                    )}
                  </div>
                  <label className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm cursor-pointer w-fit hover:border-accent/40 transition-colors">
                    <i className="ri-upload-2-line"></i> Upload PDF
                    <input type="file" accept="application/pdf" className="hidden" onChange={(e) => e.target.files[0] && uploadImage(f.key, e.target.files[0], 'certificates')} />
                  </label>
                </div>
              ) : f.type === 'url' ? (
                <div className="flex gap-2">
                  <input type="text" value={form[f.key] ?? ''} onChange={(e) => setField(f.key, e.target.value)} className={inputCls} />
                  {form[f.key] && (
                    <a href={form[f.key]} target="_blank" rel="noopener noreferrer"
                      className="shrink-0 px-4 flex items-center bg-white/5 border border-white/10 rounded-xl text-accent hover:border-accent/40 transition-colors" aria-label="Buka link">
                      <i className="ri-external-link-line"></i>
                    </a>
                  )}
                </div>
              ) : (
                <input type={f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : 'text'} value={form[f.key] ?? ''}
                  onChange={(e) => setField(f.key, e.target.value)} className={inputCls} />
              )}
            </div>
          ))}
          <div className="flex gap-3 pt-2">
            <button type="submit" className="px-6 py-3 bg-accent text-white font-bold rounded-xl hover:scale-105 transition-transform">
              {editingId ? 'Update' : 'Tambah'}
            </button>
            {editingId && <button type="button" onClick={reset} className="px-6 py-3 border border-white/20 rounded-xl hover:bg-white/5 transition-colors">Batal</button>}
          </div>
        </form>

        {/* ─── RELATED IMAGES ─── */}
        {relatedImages && editingId && (!relatedImages.showWhen || relatedImages.showWhen(form)) && (
          <RelatedImages
            table={relatedImages.table}
            fk={relatedImages.fk}
            parentId={editingId}
            hasCaption={relatedImages.hasCaption}
          />
        )}

        {/* ─── SEARCH ─── */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 relative">
            <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"></i>
            <input type="text" placeholder="Cari..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-accent/40 transition-colors" />
          </div>
          <span className="text-xs text-gray-500">{filtered.length}/{rows.length}</span>
        </div>

        {/* ─── LIST ─── */}
        <div className="space-y-3">
          {filtered.map((row) => (
            <div key={row.id} className={`bg-white/5 border rounded-xl p-4 flex justify-between items-center gap-4 transition-all hover:bg-white/[0.07] ${editingId === row.id ? 'border-accent/40 bg-accent/5' : 'border-white/10'}`}>
              <div className="flex items-center gap-3 min-w-0 flex-1 flex-wrap">
                {/* Thumbnail if available */}
                {(row.thumbnail_url || row.cover_image_url || row.image_url) && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={row.thumbnail_url || row.cover_image_url || row.image_url} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0 border border-white/10" />
                )}
                {columns.map((col) => {
                  const v = row[col];
                  if (col === 'type' && v) {
                    return <span key={col} className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${TYPE_BADGE[v] || TYPE_BADGE.other}`}>{v}</span>;
                  }
                  if (col === 'status' && v) {
                    return <span key={col} className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${STATUS_BADGE[v] || ''}`}>{v}</span>;
                  }
                  if (typeof v === 'boolean') {
                    return <span key={col} className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${v ? 'bg-accent/20 text-accent' : 'bg-white/5 text-gray-600'}`}>{col}: {v ? '✓' : '—'}</span>;
                  }
                  if (col === 'sort_order') {
                    return <span key={col} className="text-[10px] text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">#{v ?? 0}</span>;
                  }
                  if (col === columns[0]) {
                    return <span key={col} className="font-bold truncate">{v ?? '—'}</span>;
                  }
                  return <span key={col} className="text-xs text-gray-400 truncate">{v ?? '—'}</span>;
                })}
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => edit(row)} className="px-3 py-1.5 bg-accent/10 text-accent text-xs font-bold rounded-lg hover:bg-accent/20 transition-colors">
                  <i className="ri-edit-line mr-1"></i>Edit
                </button>
                <button onClick={() => remove(row.id)} className="px-3 py-1.5 bg-red-500/10 text-red-400 text-xs font-bold rounded-lg hover:bg-red-500/20 transition-colors">
                  <i className="ri-delete-bin-line mr-1"></i>Hapus
                </button>
              </div>
            </div>
          ))}
          {!filtered.length && <p className="text-gray-500 text-sm text-center py-8">Tidak ada data.</p>}
        </div>
      </div>
    </main>
  );
}
