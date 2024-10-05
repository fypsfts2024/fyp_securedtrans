import { sign, verify } from "jsonwebtoken";
import { createClient } from "@/utils/supabase/server";
const SECRET_KEY = process.env.JWT_SECRET || "secret-key";

export const generateAccessToken = async (
    fileId: string,
    userId: string,
    expiresIn: string | number = "1h"
) => {
    const supabase = createClient();
    const token = sign({ fileId, userId }, SECRET_KEY, { expiresIn });

    const expirationMs = parseExpiration(expiresIn);
    await supabase.from("file_access_tokens").insert({
        file_id: fileId,
        user_id: userId,
        token,
        expires_at: new Date(Date.now() + expirationMs),
    });

    return token;
};

const parseExpiration = (expiresIn: string | number): number => {
    if (typeof expiresIn === 'number') {
        return expiresIn * 1000;
    }

    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) {
        throw new Error('Invalid expiration format. Use a number (seconds) or a string like "1h", "30m", etc.');
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
        case 's': return value * 1000;
        case 'm': return value * 60 * 1000;
        case 'h': return value * 60 * 60 * 1000;
        case 'd': return value * 24 * 60 * 60 * 1000;
        default: throw new Error('Invalid time unit');
    }
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