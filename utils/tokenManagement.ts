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
        expires_at: new Date(Date.now() + (parseExpiration(expiresIn) * 1000)), // Convert to milliseconds
    });

    return token;
};

const parseExpiration = (expiresIn: string): number => {
    const regex = /(\d+)([hms])/; // Match number and unit
    const match = expiresIn.match(regex);
    if (!match) return 3600; // Default to 1 hour if parsing fails

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
        case 'h':
            return value * 3600; // Convert hours to seconds
        case 'm':
            return value * 60; // Convert minutes to seconds
        case 's':
        default:
            return value; // Seconds
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