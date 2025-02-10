import { NextRequest, NextResponse } from 'next/server';
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const blogs = await prisma.service.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(blogs, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    let { name, description, price, category, image } = await request.json();
    price = parseFloat(price)
    const newService = await prisma.$executeRaw`INSERT INTO "Service" (name, description, price, category, image)
VALUES (${name}, ${description}, ${price}, 'ELECTRICIAN', ${image})`;

    return NextResponse.json(newService, { status: 201 });
  } catch (error) {
    console.error("Error creating service:", error);
    return NextResponse.json({ error: "Failed to create service" }, { status: 500 });
  }
}
