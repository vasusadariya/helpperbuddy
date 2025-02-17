import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const blogs = await prisma.blog.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(blogs, { status: 200 });
  } catch (error) {
    console.error("Error fetching blogs:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch blogs";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, content, image, author, readTime } = await request.json();

    const requiredFields = { title, content, author };
    const missingFields = Object.entries(requiredFields)
    .filter(([, value]) => !value) // No `_` warning
    .map(([field]) => field);


    if (missingFields.length > 0) {
      return NextResponse.json({ 
        error: `Missing required fields: ${missingFields.join(', ')}` 
      }, { status: 400 });
    }

    if (readTime && typeof readTime !== 'number') {
      return NextResponse.json({ 
        error: 'readTime must be a number' 
      }, { status: 400 });
    }

    const newBlog = await prisma.blog.create({
      data: {
        title,
        content,
        image,
        author,
        readTime
      },
    });

    return NextResponse.json({ 
      success: true, 
      blog: newBlog 
    }, { status: 201 });

  } catch (error) {
    console.error("Error creating blog:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to create blog";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, title, content, image, readTime } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Blog ID is required' }, { status: 400 });
    }

    const updatedBlog = await prisma.blog.update({
      where: { id },
      data: {
        title,
        content,
        image,
        readTime
      }
    });

    return NextResponse.json({ 
      success: true, 
      blog: updatedBlog 
    }, { status: 200 });

  } catch (error) {
    console.error("Error updating blog:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to update blog";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Blog ID is required' }, { status: 400 });
    }

    await prisma.blog.delete({
      where: { id }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Blog deleted successfully' 
    }, { status: 200 });

  } catch (error) {
    console.error("Error deleting blog:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to delete blog";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}