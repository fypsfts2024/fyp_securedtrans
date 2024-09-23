import { NextResponse } from "next/server";
import { generateAccessToken, validateAccessToken } from "@/utils/tokenManagement";

export async function POST(request: Request) {
    try {
        const { fileId, userId, expiresIn } = await request.json();
        if (!fileId || !userId) {
            return NextResponse.json(
                { error: "Invalid request" },
                { status: 400 }
            );
        }

        const token = await generateAccessToken(fileId, userId, expiresIn);
        return NextResponse.json({ token }, { status: 200 });
    } catch (error) {
        console.error("Error generating token:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function PUT(request: Request) {
    try {
        const { token } = await request.json();
        if (!token) {
            return NextResponse.json(
                { error: "Invalid request" },
                { status: 400 }
            );
        }

        const fileId = await validateAccessToken(token);
        if (!fileId) {
            return NextResponse.json(
                { error: "Token is invalid or expired" },
                { status: 401 }
            );
        }

        return NextResponse.json({ fileId }, { status: 200 });
    } catch (error) {
        console.error("Error validating token:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}