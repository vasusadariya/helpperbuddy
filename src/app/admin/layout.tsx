import { EdgeStoreProvider } from '../../lib/edgestore';
import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <nav className="p-4 bg-gray-900 text-white">
        <Link href="/admin/dashboard" className="mr-4">Dashboard</Link>
        <Link href="/admin/analytics" className="mr-4">Analytics</Link>
      </nav>
      <main className="p-6">
      <EdgeStoreProvider>{children}</EdgeStoreProvider></main>
    </div>
  );
}