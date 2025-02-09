import { EdgeStoreProvider } from '../../lib/edgestore';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <EdgeStoreProvider>
      {children} {/* Only admin pages get EdgeStore context */}
    </EdgeStoreProvider>
  );
}