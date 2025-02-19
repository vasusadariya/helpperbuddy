import { NextResponse, NextRequest } from 'next/server';
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

export async function DELETE(req: NextRequest) {
    try {
        const { id } = await req.json();

        if (!id) {
            return NextResponse.json({ message: 'Valid ID is required' }, { status: 400 });
        }

        await prisma.requestedService.delete({ where: { id } });

        return NextResponse.json({ message: 'Deleted successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error deleting requested service:', error);
        return NextResponse.json({ message: 'Error deleting requested service' }, { status: 500 });
    }
}