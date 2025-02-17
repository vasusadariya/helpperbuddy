import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const pendingAdmins = await prisma.user.findMany({
            where: {
                role: 'PENDING_ADMIN'
            },
            select: {
                id: true,
                name: true,
                email: true,
                phoneno: true,
                createdAt: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json({ 
            pendingAdmins,
            count: pendingAdmins.length 
        });
    } catch (error) {
        console.error("Error fetching pending admins:", error);
        return NextResponse.json(
            { error: "Failed to fetch pending admins" },
            { status: 500 }
        );
    }
}