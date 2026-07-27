"use client"

import { useState, useEffect, useCallback } from 'react'
import { useToast } from '@/app/admin/components/ToastProvider'
import { useSafeNavigation } from '@/app/admin/hooks/useNavigation'

export default function ProjectTypesPage() {
  const [types, setTypes] = useState([])
  const [newName, setNewName] = useState('')
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(null) // ID of action
  const toast = useToast()
  const { redirectToLogin } = useSafeNavigation()

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      // Fetch types
      const typesRes = await fetch('/api/admin/project_types', { credentials: 'include' })
      if (typesRes.status === 401) {
        redirectToLogin()
        return
      }
      if (!typesRes.ok) throw new Error('Gagal mengambil data jenis project')
      const typesData = await typesRes.json()

      // Fetch projects to count them
      const projectsRes = await fetch('/api/admin/projects', { credentials: 'include' })
      if (!projectsRes.ok) throw new Error('Gagal mengambil data projects')
      const projectsData = await projectsRes.json()

      // Map counts
      const counts = {}
      projectsData.forEach(p => {
        const tid = p.project_type_id
        if (tid) {
          counts[tid] = (counts[tid] || 0) + 1
        }
      })

      const processed = typesData.map(t => ({
        ...t,
        count: counts[t.id] || 0
      })).sort((a, b) => a.name.localeCompare(b.name))

      setTypes(processed)
    } catch (err) {
      console.error(err)
      toast.error(err.message || 'Gagal memuat data')
    } finally {
      setLoading(false)
    }
  }, [toast, redirectToLogin])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData()
  }, [fetchData])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!newName.trim()) return

    setActionLoading('create')
    try {
      const res = await fetch('/api/admin/project_types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim() }),
        credentials: 'include'
      })

      if (res.status === 401) {
        redirectToLogin()
        return
      }

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Gagal menambah jenis project')
      }

      toast.success('Jenis project berhasil ditambahkan')
      setNewName('')
      fetchData()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (id, name, count) => {
    if (count > 0) {
      if (!confirm(`Peringatan: Ada ${count} project yang menggunakan jenis "${name}". Jika dihapus, project tersebut akan kehilangan jenisnya. Yakin ingin menghapus?`)) {
        return
      }
    } else {
      if (!confirm(`Yakin ingin menghapus jenis project "${name}"?`)) return
    }

    setActionLoading(id)
    try {
      const res = await fetch('/api/admin/project_types', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
        credentials: 'include'
      })

      if (res.status === 401) {
        redirectToLogin()
        return
      }

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Gagal menghapus jenis project')
      }

      toast.success('Jenis project berhasil dihapus')
      fetchData()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-white">Pengaturan Jenis Project</h1>
          <p className="text-sm text-gray-400 mt-1">Kelola jenis project portfolio secara dinamis.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Form Tambah */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 h-fit">
          <h2 className="text-sm font-semibold text-gray-200 mb-4">Tambah Jenis Baru</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label htmlFor="name-input" className="block text-xs font-medium text-gray-400 mb-1.5">Nama Jenis Project</label>
              <input
                id="name-input"
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Contoh: Aplikasi Mobile, Game, IoT"
                className="w-full text-sm bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-accent transition-colors"
                required
              />
            </div>
            <button
              type="submit"
              disabled={actionLoading === 'create' || !newName.trim()}
              className="w-full text-xs font-bold uppercase tracking-wider bg-accent text-bg-dark hover:bg-accent/90 transition-colors rounded-lg py-2.5 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {actionLoading === 'create' ? (
                <>
                  <i className="ri-loader-4-line animate-spin text-sm"></i>
                  Menambah...
                </>
              ) : (
                'Tambah Jenis'
              )}
            </button>
          </form>
        </div>

        {/* Daftar Jenis */}
        <div className="md:col-span-2 space-y-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
              <h2 className="text-sm font-semibold text-gray-200">Daftar Jenis</h2>
              <span className="text-xs text-gray-400 bg-gray-800 px-2.5 py-0.5 rounded-full font-medium">{types.length} Kategori</span>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <i className="ri-loader-4-line animate-spin text-2xl text-accent"></i>
                <p className="text-xs text-gray-500">Memuat jenis project...</p>
              </div>
            ) : types.length === 0 ? (
              <div className="text-center py-16">
                <i className="ri-folder-open-line text-4xl text-gray-600 mb-3 block"></i>
                <p className="text-sm text-gray-400">Belum ada jenis project.</p>
                <p className="text-xs text-gray-600 mt-1">Gunakan formulir disamping untuk membuat baru.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-800">
                {types.map((type) => (
                  <div key={type.id} className="px-5 py-4 flex items-center justify-between hover:bg-gray-800/10 transition-colors group">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium text-white">{type.name}</p>
                      <p className="text-xs text-gray-500">slug: <code className="text-accent">{type.slug}</code></p>
                    </div>
                    <div className="flex items-center gap-4">
                      {/* Projects Count Badge */}
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-800/60 border border-gray-700 text-gray-300 px-3 py-1 rounded-full">
                        {type.count} Konten
                      </span>
                      <button
                        onClick={() => handleDelete(type.id, type.name, type.count)}
                        disabled={actionLoading === type.id}
                        className="text-gray-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-gray-800/50 transition-all active:scale-95 disabled:opacity-50"
                        title="Hapus Jenis Project"
                      >
                        {actionLoading === type.id ? (
                          <i className="ri-loader-4-line animate-spin text-sm"></i>
                        ) : (
                          <i className="ri-delete-bin-line text-sm"></i>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
