export async function getParams<T>(params: Promise<T>): Promise<T> {
    try {
      return await params;
    } catch (error) {
      console.error('Error resolving params:', error);
      throw error;
    }
  }