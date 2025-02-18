import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const blogs = await prisma.blog.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        title: true,
        image: true,
        readTime: true,
        createdAt: true,
        author: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 4,
    });

    return NextResponse.json(blogs);
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blogs' },
      { status: 500 }
    );
  }
}