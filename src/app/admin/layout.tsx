import { EdgeStoreProvider } from '../../lib/edgestore';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <main className="p-6">
      <EdgeStoreProvider>{children}</EdgeStoreProvider></main>
    </div>
  );
}