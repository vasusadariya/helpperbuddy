import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const services = await prisma.requestedService.findMany({
            orderBy: { id: 'desc' }
        });

        if (!services || services.length === 0) {
            return NextResponse.json({ message: 'No requested services found' }, { status: 404 });
        }

        return NextResponse.json(services, { status: 200 });

    } catch (error) {
        console.error('Error fetching RequestedService:', error);
        return NextResponse.json({ error: 'Failed to fetch requested services' }, { status: 500 });
    }
}
