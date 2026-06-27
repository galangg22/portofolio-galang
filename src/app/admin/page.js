import { supabaseAdmin } from '@/lib/supabase-admin'
import Link from 'next/link'

export default async function AdminDashboardPage() {
  const fetchCounts = async (table, type = null) => {
    let query = supabaseAdmin.from(table).select('count', { count: 'exact', head: true })
    if (type) query = query.eq('type', type)
    const { count, error } = await query
    if (error) return 0
    return count
  }

  const [projectsCount, webCount, botCount, androidCount, designsCount, videosCount, certificatesCount] = await Promise.all([
    fetchCounts('projects'),
    fetchCounts('projects', 'web'),
    fetchCounts('projects', 'bot'),
    fetchCounts('projects', 'android'),
    fetchCounts('designs'),
    fetchCounts('videos'),
    fetchCounts('certificates'),
  ])

  const stats = [
    { label: 'Total Projects', value: projectsCount, link: '/admin/projects' },
    { label: 'Web Projects', value: webCount, link: '/admin/projects?type=web' },
    { label: 'Bot Projects', value: botCount, link: '/admin/projects?type=bot' },
    { label: 'Android Projects', value: androidCount, link: '/admin/projects?type=android' },
    { label: 'Total Designs', value: designsCount, link: '/admin/design' },
    { label: 'Total Videos', value: videosCount, link: '/admin/video' },
    { label: 'Total Certificates', value: certificatesCount, link: '/admin/certificates' },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {stats.map((stat) => (
        <Link href={stat.link} key={stat.label} className="block">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-primary/50 hover:border-accent transition-all duration-300 transform hover:scale-105">
            <h2 className="text-xl font-semibold text-gray-300 mb-2">{stat.label}</h2>
            <p className="text-4xl font-bold text-primary">{stat.value}</p>
          </div>
        </Link>
      ))}
    </div>
  )
}