import { supabaseAdmin } from '@/lib/supabase-admin'
import Link from 'next/link'

function timeAgo(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now - date) / 1000)
  
  let interval = seconds / 31536000
  if (interval > 1) return Math.floor(interval) + ' tahun yang lalu'
  interval = seconds / 2592000
  if (interval > 1) return Math.floor(interval) + ' bulan yang lalu'
  interval = seconds / 86400
  if (interval > 1) return Math.floor(interval) + ' hari yang lalu'
  interval = seconds / 3600
  if (interval > 1) return Math.floor(interval) + ' jam yang lalu'
  interval = seconds / 60
  if (interval > 1) return Math.floor(interval) + ' menit yang lalu'
  return 'baru saja'
}

export default async function AdminDashboardPage() {
  let hasError = false
  let totalProjects = 0
  let totalCerts = 0
  let totalTypes = 0
  let recentProjects = []

  try {
    // 1. Fetch counts and recent activity
    const [projectsRes, certsRes, typesRes] = await Promise.all([
      supabaseAdmin.from('projects').select('id, created_at, title, status, project_types(name, slug)', { count: 'exact' }).order('created_at', { ascending: false }).limit(5),
      supabaseAdmin.from('certificates').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('project_types').select('id', { count: 'exact', head: true })
    ])

    if (projectsRes.error) throw projectsRes.error
    if (certsRes.error) throw certsRes.error
    if (typesRes.error) throw typesRes.error

    totalProjects = projectsRes.count ?? projectsRes.data.length
    totalCerts = certsRes.count ?? 0
    totalTypes = typesRes.count ?? 0
    recentProjects = projectsRes.data || []

  } catch (error) {
    console.error('Error loading dashboard stats:', error)
    hasError = true
  }

  // Get current date formatted
  const today = new Date()
  const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
  const formattedDate = today.toLocaleDateString('id-ID', dateOptions)

  if (hasError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center bg-gray-900/50 p-8 rounded-2xl border border-red-900/30">
          <i className="ri-error-warning-line text-4xl text-red-400 mb-3 block"></i>
          <p className="text-gray-300 font-medium mb-1">Gagal memuat data dashboard</p>
          <p className="text-gray-500 text-sm mb-5">Terjadi kesalahan saat terhubung ke database.</p>
          <Link href="/admin" className="px-5 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg text-sm font-medium transition-colors">
            Coba Ulang
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header & Greeting */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Overview</h1>
          <p className="text-gray-400 text-sm">Selamat datang kembali! Berikut ringkasan portofolio Anda.</p>
        </div>
        <div className="flex items-center gap-2 bg-gray-900/60 border border-gray-800 px-4 py-2 rounded-lg backdrop-blur-sm shadow-sm">
          <i className="ri-calendar-line text-blue-400"></i>
          <span className="text-sm text-gray-300 font-medium">{formattedDate}</span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Metric 1 */}
        <Link href="/admin/projects" className="group bg-gray-800/80 hover:bg-gray-800 border border-gray-700 hover:border-gray-600 rounded-2xl p-6 transition-all duration-300 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
            <i className="ri-code-box-line text-8xl text-white"></i>
          </div>
          <div className="relative z-10">
            <div className="w-11 h-11 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 mb-5">
              <i className="ri-folder-open-line text-blue-400 text-xl"></i>
            </div>
            <p className="text-gray-400 text-sm font-medium mb-1">Total Proyek</p>
            <h3 className="text-3xl font-bold text-white">{totalProjects}</h3>
          </div>
        </Link>

        {/* Metric 2 */}
        <Link href="/admin/certificates" className="group bg-gray-800/80 hover:bg-gray-800 border border-gray-700 hover:border-gray-600 rounded-2xl p-6 transition-all duration-300 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
            <i className="ri-award-line text-8xl text-white"></i>
          </div>
          <div className="relative z-10">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 mb-5">
              <i className="ri-award-fill text-emerald-400 text-xl"></i>
            </div>
            <p className="text-gray-400 text-sm font-medium mb-1">Sertifikat Valid</p>
            <h3 className="text-3xl font-bold text-white">{totalCerts}</h3>
          </div>
        </Link>

        {/* Metric 3 */}
        <Link href="/admin/project_types" className="group bg-gray-800/80 hover:bg-gray-800 border border-gray-700 hover:border-gray-600 rounded-2xl p-6 transition-all duration-300 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
            <i className="ri-layout-grid-line text-8xl text-white"></i>
          </div>
          <div className="relative z-10">
            <div className="w-11 h-11 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 mb-5">
              <i className="ri-list-settings-line text-amber-400 text-xl"></i>
            </div>
            <p className="text-gray-400 text-sm font-medium mb-1">Kategori Konten</p>
            <h3 className="text-3xl font-bold text-white">{totalTypes}</h3>
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
        {/* Main Content: Recent Activity */}
        <div className="lg:col-span-2 bg-gray-800/50 border border-gray-700/50 rounded-2xl overflow-hidden flex flex-col shadow-lg">
          <div className="px-6 py-5 border-b border-gray-700 flex justify-between items-center bg-gray-800/80">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <i className="ri-history-line text-gray-400"></i> Konten Terbaru
            </h2>
            <Link href="/admin/projects" className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors bg-blue-500/10 hover:bg-blue-500/20 px-3 py-1.5 rounded-lg border border-blue-500/20">
              Lihat Semua
            </Link>
          </div>
          <div className="p-0 flex-1 bg-gray-900/20">
            {recentProjects.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[250px] text-gray-500">
                <i className="ri-inbox-line text-4xl mb-3 opacity-50"></i>
                <p className="text-sm">Belum ada proyek yang ditambahkan.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-700/50">
                {recentProjects.map((project) => (
                  <div key={project.id} className="p-5 flex items-center gap-4 hover:bg-gray-800/80 transition-colors group">
                    <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center shrink-0 border border-gray-700 group-hover:border-blue-500/40 transition-colors">
                      <i className="ri-file-list-3-line text-gray-400 group-hover:text-blue-400 transition-colors"></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-medium text-gray-200 truncate group-hover:text-white transition-colors">{project.title}</h4>
                        {project.status === 'completed' && <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0 shadow-[0_0_8px_rgba(34,197,94,0.5)]" title="Completed"></span>}
                        {project.status === 'wip' && <span className="w-2 h-2 rounded-full bg-yellow-500 flex-shrink-0 shadow-[0_0_8px_rgba(234,179,8,0.5)]" title="Work in Progress"></span>}
                        {project.status === 'private' && <span className="w-2 h-2 rounded-full bg-gray-500 flex-shrink-0" title="Private"></span>}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1.5 bg-gray-800 px-2 py-0.5 rounded-md border border-gray-700">
                          <i className="ri-price-tag-3-line"></i> {project.project_types?.name || 'Tanpa Kategori'}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <i className="ri-time-line"></i> {timeAgo(project.created_at)}
                        </span>
                      </div>
                    </div>
                    <Link href="/admin/projects" className="p-2 text-gray-500 hover:text-white bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0" title="Kelola">
                      <i className="ri-arrow-right-line"></i>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar: Quick Actions & Status */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-gradient-to-b from-gray-800 to-gray-900 border border-gray-700 rounded-2xl p-6 shadow-lg">
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-5">Akses Cepat</h2>
            <div className="space-y-3">
              <Link href="/admin/projects" className="flex items-center gap-3 w-full p-3 bg-gray-800/80 hover:bg-gray-700 border border-gray-700 rounded-xl transition-all group shadow-sm hover:shadow-md hover:border-gray-600">
                <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                  <i className="ri-add-line text-lg"></i>
                </div>
                <div className="text-left flex-1">
                  <p className="text-sm font-semibold text-gray-300 group-hover:text-white transition-colors">Proyek Baru</p>
                </div>
                <div className="w-6 h-6 rounded-full bg-gray-700/50 flex items-center justify-center group-hover:bg-gray-600 transition-colors">
                  <i className="ri-arrow-right-s-line text-gray-400 group-hover:text-white transition-colors"></i>
                </div>
              </Link>
              
              <Link href="/admin/certificates" className="flex items-center gap-3 w-full p-3 bg-gray-800/80 hover:bg-gray-700 border border-gray-700 rounded-xl transition-all group shadow-sm hover:shadow-md hover:border-gray-600">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                  <i className="ri-award-line text-lg"></i>
                </div>
                <div className="text-left flex-1">
                  <p className="text-sm font-semibold text-gray-300 group-hover:text-white transition-colors">Upload Sertifikat</p>
                </div>
                <div className="w-6 h-6 rounded-full bg-gray-700/50 flex items-center justify-center group-hover:bg-gray-600 transition-colors">
                  <i className="ri-arrow-right-s-line text-gray-400 group-hover:text-white transition-colors"></i>
                </div>
              </Link>

              <Link href="/admin/project_types" className="flex items-center gap-3 w-full p-3 bg-gray-800/80 hover:bg-gray-700 border border-gray-700 rounded-xl transition-all group shadow-sm hover:shadow-md hover:border-gray-600">
                <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                  <i className="ri-folder-add-line text-lg"></i>
                </div>
                <div className="text-left flex-1">
                  <p className="text-sm font-semibold text-gray-300 group-hover:text-white transition-colors">Kategori Baru</p>
                </div>
                <div className="w-6 h-6 rounded-full bg-gray-700/50 flex items-center justify-center group-hover:bg-gray-600 transition-colors">
                  <i className="ri-arrow-right-s-line text-gray-400 group-hover:text-white transition-colors"></i>
                </div>
              </Link>
            </div>
          </div>

          {/* System Status */}
          <div className="bg-gray-800/40 border border-gray-700/50 rounded-2xl p-6 relative overflow-hidden shadow-lg">
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-green-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 relative z-10">Status Sistem</h2>
            <div className="flex items-center gap-3 relative z-10">
              <div className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </div>
              <p className="text-sm font-semibold text-white">Database Online</p>
            </div>
            <p className="text-xs text-gray-500 mt-3 relative z-10 leading-relaxed">Semua sistem operasional dan berjalan optimal. Sinkronisasi data dengan frontend aktif.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
