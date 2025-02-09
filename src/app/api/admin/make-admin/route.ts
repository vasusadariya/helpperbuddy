import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Handle admin approval or rejection
export async function POST(request: NextRequest) {
    try {
        const { userId, action } = await request.json();

        if (!userId || !["approve", "reject"].includes(action)) {
            return NextResponse.json({ error: "Invalid request" }, { status: 400 });
        }

        const newRole = action === "approve" ? "ADMIN" : "USER";

        await prisma.user.update({
            where: { id: userId },
            data: { role: newRole },
        });

        return NextResponse.json({ message: `User has been ${action === "approve" ? "approved as Admin" : "rejected as User"}` }, { status: 200 });
    } catch (error) {
        console.error("Error processing admin request:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
