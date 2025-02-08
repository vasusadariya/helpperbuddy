import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
    try {
        const { name } = await req.json();

        // Validate input
        if (!name || name.length < 3 || name.length > 50) {
            return NextResponse.json({ error: 'Invalid service name' }, { status: 400 });
        }

        // Check if the service has already been requested
        const existingRequest = await prisma.requestedService.findFirst({
            where: { name },
        });        

        if (existingRequest) {
            return NextResponse.json({ message: 'Service already requested' }, { status: 409 });
        }

        // Add the requested service
        const newService = await prisma.requestedService.create({
            data: { name },
        });

        return NextResponse.json(newService, { status: 201 });
    } catch (error) {
        console.error('Error requesting service:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
