'use server';

import { unstable_noStore } from 'next/cache';
import { backendClient } from './edgestore-server';

export async function serverSideDelete(url: string) {
    unstable_noStore(); // Ensure this always triggers a fresh request
  
    if (!url) {
      throw new Error('No URL provided for deletion');
    }
  
    try {
      await backendClient.publicFiles.deleteFile({ url });
      console.log(`Successfully deleted: ${url}`);
    } catch (error) {
      console.error('Failed to delete file:', error);
      throw new Error('Failed to delete file');
    }
  }