import { EnvVarWarning } from "@/components/env-var-warning";
import HeaderAuth from "@/components/header-auth";
import AdminHeaderAuth from "@/app/admin/components/admin-header-auth";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import { GeistSans } from "geist/font/sans";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import Image from "next/image";
import Link from "next/link";
import "./globals.css";
import { headers } from "next/headers";
import dynamic from "next/dynamic";

const ClientSideAuthProvider = dynamic(
    () => import("@/components/auth-context").then((mod) => mod.AuthProvider),
    { ssr: false }
);

const defaultUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

export const metadata = {
    metadataBase: new URL(defaultUrl),
    title: "SecuredTrans",
    description: "Your files, your control",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = headers().get("x-next-pathname") as string;
    const isAdminRoute = pathname.includes("/admin");

    return (
        <html
            lang="en"
            className={GeistSans.className}
            suppressHydrationWarning
        >
            <body className="bg-background text-foreground">
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <ClientSideAuthProvider>
                        <main className="min-h-screen flex flex-col items-center">
                            <div className="flex-1 w-full flex flex-col gap-10 items-center">
                                <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
                                    <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
                                        <div className="flex gap-5 items-center font-semibold">
                                            <Link
                                                href={
                                                    isAdminRoute
                                                        ? "/admin/prime-admin"
                                                        : "/"
                                                }
                                                className="flex items-center gap-2"
                                            >
                                                <Image
                                                    src="/logo.png"
                                                    alt={
                                                        isAdminRoute
                                                            ? "SecuredTrans Admin"
                                                            : "SecuredTrans logo"
                                                    }
                                                    width={40}
                                                    height={40}
                                                />
                                                {isAdminRoute
                                                    ? "SecuredTrans Admin"
                                                    : "SecuredTrans"}
                                            </Link>
                                        </div>
                                        <div className="flex">
                                            {!hasEnvVars ? (
                                                <EnvVarWarning />
                                            ) : isAdminRoute ? (
                                                <AdminHeaderAuth />
                                            ) : (
                                                <HeaderAuth />
                                            )}
                                            <ThemeSwitcher />
                                        </div>
                                    </div>
                                </nav>
                                <div className="flex flex-col gap-20 max-w-5xl px-3 w-full">
                                    {children}
                                </div>
                            </div>
                        </main>
                        <Toaster />
                    </ClientSideAuthProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
