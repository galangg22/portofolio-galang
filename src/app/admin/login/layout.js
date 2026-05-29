// Override parent admin layout — halaman login tidak butuh auth.
export default function LoginLayout({ children }) {
  return <>{children}</>;
}
