import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hash } from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    console.log("Received request at /api/users");
    const body = await request.json();
    console.log("Request body:", body);

    const { name, email, phoneno, password } = body;

    if (!name || !email || !phoneno || !password) {
      console.log("Validation failed - Missing fields");
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const isAdminPattern = /^hbadmin[\w\d]+@gmail\.com$/.test(email);
    const assignedRole = isAdminPattern ? "PENDING_ADMIN" : "USER";

    const hashedPassword = await hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, phoneno, password: hashedPassword, role: assignedRole },
    });

    console.log("User created successfully:", user);
    return NextResponse.json(
      { id: user.id, email: user.email, phoneno: user.phoneno, role: user.role },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in /api/users:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}