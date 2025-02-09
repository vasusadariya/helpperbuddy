import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Get all users with "PENDING_ADMIN" role
export async function GET() {
    try {
        const users = await prisma.user.findMany({
            where: { role: "PENDING_ADMIN" as any },
            select: { id: true, name: true, email: true },
        });

        return NextResponse.json({ users }, { status: 200 });
    } catch (error) {
        console.error("Error fetching pending admins:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}