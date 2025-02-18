import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  // Await the params object before accessing id
  const { id } = await params;
  
  const blog = await prisma.blog.findUnique({
    where: { 
      id: id,
      isActive: true 
    },
  });

  if (!blog) return NextResponse.json({ error: "Blog not found" }, { status: 404 });
  return NextResponse.json(blog);
}