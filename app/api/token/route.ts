import { NextResponse } from "next/server";
import { sign, verify } from "jsonwebtoken";
import { createClient } from "@/utils/supabase/server";
const SECRET_KEY = process.env.JWT_SECRET || "secret-key";

export const generateAccessToken = async (
    fileId: string,
    userId: string,
    expiresIn = "1h"
) => {
    const supabase = createClient();
    const token = sign({ fileId, userId }, SECRET_KEY, { expiresIn });

    await supabase.from("file_access_tokens").insert({
        file_id: fileId,
        user_id: userId,
        token,
        expires_at: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
    });

    return token;
};

export const validateAccessToken = async (
    token: string
): Promise<string | null> => {
    const supabase = createClient();
    try {
        const decoded = verify(token, SECRET_KEY) as {
            fileId: string;
            userId: string;
        };

        const { data, error } = await supabase
            .from("file_access_tokens")
            .select("*")
            .eq("token", token)
            .gt("expires_at", new Date().toISOString())
            .single();

        if (error || !data) {
            console.error("Token validation error:", error);
            return null;
        }

        return decoded.fileId;
    } catch (error) {
        console.error("Token verification error:", error);
        return null;
    }
};

export async function POST(request: Request) {
    try {
        const { fileId, userId } = await request.json();
        if (!fileId || !userId) {
            return NextResponse.json(
                { error: "Invalid request" },
                { status: 400 }
            );
        }

        const token = await generateAccessToken(fileId, userId);
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