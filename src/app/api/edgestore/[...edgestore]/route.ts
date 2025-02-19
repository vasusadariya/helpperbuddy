import { initEdgeStore } from '@edgestore/server';
import { handler } from '@/lib/edgestore-server';

export { handler as GET, handler as POST };

const es = initEdgeStore.create();

export const edgeStoreRouter = es.router({
  publicFiles: es.fileBucket(),
});

export type EdgeStoreRouter = typeof edgeStoreRouter;