"use server";

import { encodedRedirect } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const signUpAction = async (formData: FormData) => {
    const email = formData.get("email")?.toString();
    const password = formData.get("password")?.toString();
    const username = formData.get("username")?.toString();
    const phone = formData.get("phone")?.toString();
    const passwordConfirmation = formData
        .get("passwordConfirmation")
        ?.toString();

    const supabase = createClient();
    const origin = headers().get("origin");

    // Basic validation
    if (!email || !password || !username || !phone || !passwordConfirmation) {
        return encodedRedirect("error", "/sign-up", "All fields are required.");
    }

    if (password !== passwordConfirmation) {
        return encodedRedirect("error", "/sign-up", "Passwords do not match.");
    }

    if (password.length < 8) {
        return encodedRedirect(
            "error",
            "/sign-up",
            "Password must be at least 8 characters."
        );
    }

    const { data: existingUser, error: existingUserError } = await supabase
        .from("user_profile")
        .select("*")
        .eq("email", email)
        .limit(1)
        .maybeSingle();

    if (existingUser) {
        // Check if the account is banned
        const { is_banned, message } = await checkUserBanStatus(
            existingUser?.id as string
        );

        if (is_banned) {
            return encodedRedirect("error", "/sign-up", message);
        }

        return encodedRedirect(
            "error",
            "/sign-up",
            "Account already exists. Please log in or use a different email to register."
        );
    }

    if (existingUserError) {
        return encodedRedirect(
            "error",
            "/sign-up",
            `${existingUserError.message}`
        );
    }

    // Sign up user using Supabase
    const { error, data: signUpData } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: `${origin}/auth/callback`,
            data: {
                username,
                phone,
            },
        },
    });

    if (error) {
        console.error(`Error: ${error.code} - ${error.message}`);
        return encodedRedirect("error", "/sign-up", error.message);
    }

    // Handle post-sign-up logic (e.g., success message)
    return encodedRedirect(
        "success",
        "/sign-in",
        "Thanks for signing up! Please check your email for a verification link."
    );
};

export const signInAction = async (formData: FormData) => {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const supabase = createClient();

    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (signInError) {
        return encodedRedirect(
            "error",
            "/sign-in",
            `${signInError.message}`
        );
    }

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user?.email_confirmed_at) {
        await supabase.auth.signOut();
        
        return encodedRedirect(
            "error",
            "/sign-in",
            "Please verify your email before signing in. Check your inbox for the verification link."
        );
    }

    return redirect("/user");
};

export const forgotPasswordAction = async (formData: FormData) => {
    const email = formData.get("email")?.toString();
    const supabase = createClient();
    const origin = headers().get("origin");
    const callbackUrl = formData.get("callbackUrl")?.toString();

    if (!email) {
        return encodedRedirect(
            "error",
            "/forgot-password",
            "Email is required"
        );
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/auth/callback?redirect_to=/user/reset-password`,
    });

    if (error) {
        console.error(error.message);
        return encodedRedirect(
            "error",
            "/forgot-password",
            "Could not reset password"
        );
    }

    if (callbackUrl) {
        return redirect(callbackUrl);
    }

    return encodedRedirect(
        "success",
        "/forgot-password",
        "Check your email for a link to reset your password."
    );
};

export const resetPasswordAction = async (formData: FormData) => {
    const supabase = createClient();

    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!password || !confirmPassword) {
        encodedRedirect(
            "error",
            "/user/reset-password",
            "Password and confirm password are required"
        );
    }

    if (password !== confirmPassword) {
        encodedRedirect(
            "error",
            "/user/reset-password",
            "Passwords do not match"
        );
    }

    const { error } = await supabase.auth.updateUser({
        password: password,
    });

    if (error) {
        encodedRedirect(
            "error",
            "/user/reset-password",
            "Password update failed: " + error.message
        );
    }

    encodedRedirect("success", "/sign-in", "Password updated");
};

export const signOutAction = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    return redirect("/sign-in");
};

export async function signInWithGoogle() {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
            queryParams: {
                access_type: "offline",
                prompt: "consent",
            },
            redirectTo: `${headers().get("origin")}/auth/callback`,
        },
    });

    if (error) {
        console.error("Error during Google sign-in:", error);
        return encodedRedirect("error", "/sign-in", error.message);
    }

    redirect(data.url);
}

export const AdminSignInAction = async (formData: FormData) => {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const supabase = createClient();

    const { data, error } = await supabase
        .from("admin")
        .select("*")
        .eq("email", email)
        .eq("password", password)
        .single();

    if (error || !data) {
        return {
            success: false,
            message: "Invalid email or password",
        };
    }

    return {
        success: true,
        admin: data,
    };
};

interface BanResponse {
    success: boolean;
    banned_until?: string;
    message: string;
}

interface BanStatusResponse {
    is_banned: boolean;
    banned_until: string | null;
    message: string;
}

export const banUserAction = async (userId: string): Promise<BanResponse> => {
    const supabase = createClient();

    try {
        const { data, error } = await supabase.rpc("ban_user", {
            user_id: userId,
        });

        if (error) throw error;

        return data as BanResponse;
    } catch (error) {
        console.error("Error banning user:", error);
        return {
            success: false,
            message:
                error instanceof Error ? error.message : "Failed to ban user",
        };
    }
};

export const checkUserBanStatus = async (
    userId: string
): Promise<BanStatusResponse> => {
    const supabase = createClient();

    try {
        const { data, error } = await supabase.rpc("is_user_banned", {
            user_id: userId,
        });

        if (error) throw error;

        return data as BanStatusResponse;
    } catch (error) {
        console.error("Error checking ban status:", error);
        return {
            is_banned: false,
            banned_until: null,
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to check ban status",
        };
    }
};
