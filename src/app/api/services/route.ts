import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams;
        const query = searchParams.get('query') || '';
        const category = searchParams.get('category');

        let services;

        if (query.length == 0 && !category) {
            services = await prisma.$queryRaw`
                SELECT *
                FROM "Service"
                ORDER BY numberoforders DESC;
            `;
        }
        else if (category && category !== 'all' && query.length != 0) {
            services = await prisma.$queryRaw`
                SELECT *,  
                similarity(name, ${query}) AS name_similarity, 
                similarity(category::text, ${query}) AS category_similarity,
                (0.7 * similarity(name, ${query}) + 0.3 * similarity(category::text, ${query})) AS overall_similarity
                FROM "Service"
                WHERE category::text = ${category} AND (similarity(name, ${query}) > 0.05
                OR similarity(category::text, ${query}) > 0.05)
                ORDER BY overall_similarity DESC
                LIMIT 5;
            `;
        }
        else if (category && category !== 'all' && query.length == 0) {
            services = await prisma.service.findMany({
                where: { category: category as any },
            });
        }
        else if (query) {
            services = await prisma.$queryRaw`
                SELECT *,  
                similarity(name, ${query}) AS name_similarity, 
                similarity(category::text, ${query}) AS category_similarity,
                (0.7 * similarity(name, ${query}) + 0.3 * similarity(category::text, ${query})) AS overall_similarity
                FROM "Service"
                WHERE similarity(name, ${query}) > 0.05
                OR similarity(category::text, ${query}) > 0.05
                ORDER BY overall_similarity DESC
                LIMIT 5;
            `;
        }
        else {
            services = await prisma.service.findMany();
        }

        return NextResponse.json(services, { status: 200 });
    } catch (error) {
        console.error('Error fetching services:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
