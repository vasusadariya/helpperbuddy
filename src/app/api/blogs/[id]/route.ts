import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const blog = await prisma.blog.findUnique({
    where: { id: params.id, isActive: true },
  });

  if (!blog) return NextResponse.json({ error: "Blog not found" }, { status: 404 });

  return NextResponse.json(blog);
}
