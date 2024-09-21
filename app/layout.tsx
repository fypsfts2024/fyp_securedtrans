import { EnvVarWarning } from "@/components/env-var-warning";
import HeaderAuth from "@/components/header-auth";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import { GeistSans } from "geist/font/sans";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import Image from "next/image";
import Link from "next/link";
import "./globals.css";

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
                    <main className="min-h-screen flex flex-col items-center">
                        <div className="flex-1 w-full flex flex-col gap-10 items-center">
                            <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
                                <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
                                    <div className="flex gap-5 items-center font-semibold">
                                        <Link href={"/"} className="flex items-center gap-2">
                                            <Image
                                                src="/logo.png"
                                                alt="SecuredTrans logo"
                                                width={40}
                                                height={40}
                                            />
                                            SecuredTrans
                                        </Link>
                                    </div>
                                    <div className="flex">
                                        {!hasEnvVars ? (
                                            <EnvVarWarning />
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
                </ThemeProvider>
            </body>
        </html>
    );
}
