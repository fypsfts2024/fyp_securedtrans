"use client";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/password-input";
import { useAuth } from "@/components/auth-context";
import { AdminSignInAction } from "@/lib/actions";

export default function Login({ searchParams }: { searchParams: Message }) {
    const { setAdmin } = useAuth();

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
    
        const result = await AdminSignInAction(formData);

        if (result.success) {
            setAdmin(result.admin);
            window.location.href = result.admin.role === "Admin" ? "/admin/prime-admin" : "/admin/sec-admin";
        } else {
            const errorMessage = result.message || "An error occurred";
            window.location.href = `/admin/sign-in?error=${errorMessage}`;
        }
    };    

    return (
        <form
            className="flex-1 flex flex-col min-w-64 mx-auto"
            onSubmit={handleSubmit}
        >
            <h1 className="text-2xl font-medium">Sign in</h1>
            <div className="flex flex-col gap-2 [&>input]:mb-3 mt-8">
                <Label htmlFor="email">Email</Label>
                <Input
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    required
                />
                <div className="flex justify-between items-center">
                    <Label htmlFor="password">Password</Label>
                </div>
                <PasswordInput name="password" placeholder="Your password" />
                <SubmitButton pendingText="Signing In...">Sign in</SubmitButton>
                <FormMessage message={searchParams} />
            </div>
        </form>
    );
}
