// app/api/edgestore/[...edgestore]/route.ts
import { createEdgeStoreNextHandler } from '@edgestore/server/adapters/next/app';
import { initEdgeStore } from '@edgestore/server';

const es = initEdgeStore.create();

// Define your edge store router
const edgeStoreRouter = es.router({
  publicFiles: es.fileBucket(),
});

export type EdgeStoreRouter = typeof edgeStoreRouter;

// Create the Next.js API handler
const handler = createEdgeStoreNextHandler({
  router: edgeStoreRouter,
});

export { handler as GET, handler as POST };