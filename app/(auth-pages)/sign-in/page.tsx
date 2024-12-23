import { signInAction } from "@/lib/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/password-input";
import Link from "next/link";
import SignInWithGoogleButton from "./components/signin-with-google-btn";

export default function Login({ searchParams }: { searchParams: Message }) {
    return (
        <form className="flex-1 flex flex-col min-w-64 mx-auto">
            <h1 className="text-2xl font-medium">Sign in</h1>
            <p className="text-sm text-foreground">
                Don't have an account?{" "}
                <Link
                    className="text-foreground font-medium underline"
                    href="/sign-up"
                >
                    Sign up
                </Link>
            </p>
            <div className="flex flex-col gap-2 [&>input]:mb-3 mt-8">
                <Label htmlFor="email">Email</Label>
                <Input name="email" placeholder="john@example.com" required />
                <div className="flex justify-between items-center">
                    <Label htmlFor="password">Password</Label>
                    <Link
                        className="text-xs text-foreground underline"
                        href="/forgot-password"
                    >
                        Forgot Password?
                    </Link>
                </div>
                <PasswordInput name="password" placeholder="Your password" />
                <SubmitButton
                    pendingText="Signing In..."
                    formAction={signInAction}
                >
                    Sign in
                </SubmitButton>
                <p className="text-center">or</p>
                <SignInWithGoogleButton />
                <FormMessage message={searchParams} />
            </div>
        </form>
    );
}
