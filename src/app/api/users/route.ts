import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hash } from "bcryptjs";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const email = url.pathname.split('/').pop(); // Get the email from the URL

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: decodeURIComponent(email) },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phoneno: true,
        createdAt: true,
        referralCode: true,
        wallet: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("Received request at /api/users");

    if (!request.body) {
      console.log("Request body is null or undefined");
      return NextResponse.json({ error: "Request body is missing" }, { status: 400 });
    }

    const body = await request.json();
    console.log("Request body:", body);

    if (!body || typeof body !== "object") {
      console.log("Invalid JSON format");
      return NextResponse.json({ error: "Invalid JSON format" }, { status: 400 });
    }

    const { name, email, phoneno, password } = body;

    if (!name || !email || !phoneno || !password) {
      console.log("Validation failed - Missing fields");
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const isAdminPattern = /^hbadmin[\w\d]+@gmail\.com$/.test(email);
    const assignedRole = isAdminPattern ? "PENDING_ADMIN" : "USER";

    const hashedPassword = await hash(password, 10);
    const referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phoneno,
        password: hashedPassword,
        role: assignedRole,
        referralCode,
      },
    });

    console.log("User created successfully:", user);
    return NextResponse.json(
      { id: user.id, email: user.email, phoneno: user.phoneno, role: user.role },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in /api/users:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
