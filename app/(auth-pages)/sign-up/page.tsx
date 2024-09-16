import { signUpAction } from "@/lib/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/password-input";
import Link from "next/link";

export default function Signup({ searchParams }: { searchParams: Message }) {
    if ("message" in searchParams) {
        return (
            <div className="w-full flex-1 flex items-center h-screen sm:max-w-md justify-center gap-2 p-4">
                <FormMessage message={searchParams} />
            </div>
        );
    }

    return (
        <>
            <form className="flex flex-col min-w-64 mx-auto">
                <h1 className="text-2xl font-medium">Sign up</h1>
                <p className="text-sm text text-foreground">
                    Already have an account?{" "}
                    <Link
                        className="text-primary font-medium underline"
                        href="/sign-in"
                    >
                        Sign in
                    </Link>
                </p>
                <div className="flex flex-col gap-2 [&>input]:mb-3 mt-8">
                    <div className="flex flex-row gap-2">
                        <div className="[&>input]:mb-3">
                            <Label htmlFor="username">Username</Label>
                            <Input
                                name="username"
                                placeholder="Your username"
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                                name="phone"
                                placeholder="Your mobile number"
                                pattern="^(?:\+?601|01)[0-9]{8,9}$"
                                title="Please enter a valid Malaysian mobile number."
                                required
                            />
                        </div>
                    </div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                        name="email"
                        placeholder="you@example.com"
                        required
                    />
                    <Label htmlFor="password">Password</Label>
                    <PasswordInput
                        name="password"
                        placeholder="Your password"
                    />
                    <Label htmlFor="password">Password Confirmation</Label>
                    <PasswordInput
                        name="passwordConfirmation"
                        placeholder="Confirm your password"
                    />
                    <SubmitButton
                        formAction={signUpAction}
                        pendingText="Signing up..."
                    >
                        Sign up
                    </SubmitButton>
                    <FormMessage message={searchParams} />
                </div>
            </form>
        </>
    );
}
