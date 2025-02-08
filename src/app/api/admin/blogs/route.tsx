import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const blogs = await prisma.blog.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(blogs, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch blogs' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { title, content, image, author, readTime } = await request.json();

    if (!title || !content || !author) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const newBlog = await prisma.blog.create({
      data: { title, content, image, author, readTime },
    });

    return NextResponse.json(newBlog, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create blog' }, { status: 500 });
  }
}
