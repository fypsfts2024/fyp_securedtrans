import { sign, verify } from "jsonwebtoken";
import { createClient } from "@/utils/supabase/server";
const SECRET_KEY = process.env.JWT_SECRET || "secret-key";

export const generateAccessToken = async (
    fileId: string,
    userId: string,
    expiresIn?: number
) => {
    const supabase = createClient();
    
    // If expiresIn is not provided, set default to 1 hour
    const expirationMs = expiresIn || 60 * 60 * 1000; // 1 hour in milliseconds
    
    // Convert expiration from milliseconds to seconds for JWT
    const expiresInSeconds = Math.floor(expirationMs / 1000);
    
    const token = sign({ fileId, userId }, SECRET_KEY, { expiresIn: expiresInSeconds });

    const expiresAt = new Date(Date.now() + expirationMs).toISOString();

    const { data, error } = await supabase.from("file_access_tokens").insert({
        file_id: fileId,
        user_id: userId,
        token,
        expires_at: expiresAt,
    });

    if (error) {
        console.error("Failed to insert token:", error);
        throw new Error(`Failed to insert token: ${error.message}`);
    }

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