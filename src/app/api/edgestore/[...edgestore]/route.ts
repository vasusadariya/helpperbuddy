import { initEdgeStore } from '@edgestore/server';
import { handler } from '@/lib/edgestore-server';

export { handler as GET, handler as POST };

const es = initEdgeStore.create();

/**
 * This is the main router for the Edge Store buckets.
 */

export const edgeStoreRouter = es.router({
  publicFiles: es.fileBucket(),
});

/**
 * This type is used to create the type-safe client for the frontend.
 */
export type EdgeStoreRouter = typeof edgeStoreRouter;
