// Passthrough. Proteksi auth ditangani oleh src/middleware.js
// (middleware bisa baca pathname, jadi /admin/login bisa dikecualikan
//  tanpa memicu infinite redirect loop).
export default function AdminLayout({ children }) {
  return <>{children}</>;
}
