import { NextRequest, NextResponse } from 'next/server';
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const services = await prisma.service.findMany({
            orderBy: { createdAt: 'desc' },
        });
        return NextResponse.json(services, { status: 200 });
    } catch (error) {
        console.error("Error fetching services:", error);
        return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const { name, description, category, image } = await request.json();
        let { price } = await request.json();
        price = parseFloat(price);
        const result = await prisma.$queryRaw<{ enum_range: string[] }[]>`
            SELECT enum_range(NULL::"Category") AS enum_range;
        `;
        const categories = result[0]?.enum_range ?? [];
        
        if (!categories.includes(category)) {
            return NextResponse.json(
                { error: `Invalid category. Must be one of: ${categories.join(', ')}` },
                { status: 400 }
            );
        }

        const newService = await prisma.service.create({
            data: {
                name,
                description,
                price,
                category,
                image
            }
        });

        return NextResponse.json({ success: true, service: newService }, { status: 201 });
    } catch (error) {
        console.error("Error creating service:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to create service";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}