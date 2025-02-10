import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const query = body.query?.trim();

        if (!query || query.length === 0) {
            const allServices = await prisma.service.findMany({
                orderBy: { name: 'asc' },
            });
            return NextResponse.json(allServices, { status: 200 });
        }

        const services = await prisma.$queryRaw`
            SELECT *, similarity(name, ${query}) AS sml
            FROM "Service"
            where similarity(name, ${query})>0.1
            ORDER BY sml DESC
            LIMIT 5;
        `;
        return NextResponse.json(services, { status: 200 });
    } catch (error) {
        console.error('Error fetching services:', error);
        return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 });
    }
}
