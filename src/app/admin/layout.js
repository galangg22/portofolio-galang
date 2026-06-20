import AdminNav from './components/AdminNav'

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <AdminNav />
      <main className="container mx-auto p-4">
        {children}
      </main>
    </div>
  )
}