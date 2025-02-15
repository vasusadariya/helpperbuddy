import { EdgeStoreProvider } from '../../lib/edgestore';
import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <main className="p-6">
      <EdgeStoreProvider>{children}</EdgeStoreProvider></main>
    </div>
  );
}