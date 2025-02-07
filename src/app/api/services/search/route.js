import prisma from '../../../../lib/prisma';

export async function POST(request) {
  try {
    // Parse the request body to get the query
    const { query } = await request.json();

    if (!query) {
      return new Response(JSON.stringify([]), { status: 200 });
    }

    // Perform the search query
    const services = await prisma.$queryRaw`
        SELECT *, 
               (0.8 * similarity("name", ${query}) + 0.2 * similarity("category"::TEXT, ${query})) AS relevance
        FROM "Service"
        WHERE LOWER("name") ILIKE '%' || LOWER(${query}) || '%' 
           OR LOWER("category"::TEXT) ILIKE '%' || LOWER(${query}) || '%'
        ORDER BY relevance DESC
        LIMIT 5;`;

    return new Response(JSON.stringify(services), { status: 200 });
  } catch (error) {
    console.error('Error fetching services:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch services' }), { status: 500 });
  }
}