import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    const { id } = params;

    try {
        await prisma.$executeRaw`DELETE FROM "Service" WHERE id = ${id}`;

        return NextResponse.json({ message: 'Service deleted successfully' }, { status: 200 });

    } catch (error) {
        console.error('Error deleting service:', error);
        return NextResponse.json({ error: 'Failed to delete service' }, { status: 500 });
    }
}
