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
        "/sign-up",
        "Thanks for signing up! Please check your email for a verification link."
    );
};

export const signInAction = async (formData: FormData) => {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        return encodedRedirect("error", "/sign-in", error.message);
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
            "Password update failed"
        );
    }

    encodedRedirect("success", "/user/reset-password", "Password updated");
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
            redirectTo: `${headers().get("origin")}/auth/callback`
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
