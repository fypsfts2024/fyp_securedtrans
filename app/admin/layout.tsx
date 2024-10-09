"use client"
import { AuthProvider } from "@/components/auth-context";

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div>
            <AuthProvider>{children}</AuthProvider>
        </div>
    );
}
