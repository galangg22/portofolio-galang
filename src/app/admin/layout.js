import AdminNav from './components/AdminNav'
import { ToastProvider } from './components/ToastProvider'
import { ErrorBoundary } from './components/ErrorBoundary'

export default function AdminLayout({ children }) {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <div className="min-h-screen bg-gray-950 text-white">
          <AdminNav />
          <main className="px-4 py-6">
            {children}
          </main>
        </div>
      </ToastProvider>
    </ErrorBoundary>
  )
}