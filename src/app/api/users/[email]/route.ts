import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { email: string } }
) {
  try {
    const email = params.email;
    
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

// Optionally add PATCH for updating user details
export async function PATCH(
  request: NextRequest,
  { params }: { params: { email: string } }
) {
  try {
    const email = params.email;
    const updates = await request.json();

    const user = await prisma.user.update({
      where: { email: decodeURIComponent(email) },
      data: updates,
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

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Optionally add DELETE for removing users
export async function DELETE(
  request: NextRequest,
  { params }: { params: { email: string } }
) {
  try {
    const email = params.email;
    
    await prisma.user.delete({
      where: { email: decodeURIComponent(email) },
    });

    return NextResponse.json({ message: "User deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}