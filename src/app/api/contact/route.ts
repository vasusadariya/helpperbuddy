import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma"; 

export async function POST(request: NextRequest) {
  try {
    const { name, email, message } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    await prisma.$queryRaw`
      INSERT INTO "ContactMessage" ("id", "name", "email", "message", "createdAt")
      VALUES (gen_random_uuid(), ${name}, ${email}, ${message}, NOW())
    `;

    return NextResponse.json({ message: "Message sent successfully!" }, { status: 200 });
  } catch (error) {
    console.error("Error saving contact message:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const messages = await prisma.$queryRaw`
      SELECT * FROM "ContactMessage" ORDER BY "createdAt" DESC
    `;

    return NextResponse.json(messages, { status: 200 });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
