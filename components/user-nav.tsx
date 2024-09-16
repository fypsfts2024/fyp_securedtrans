"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function UserNav() {
    const pathname = usePathname();

    const links = [
        { href: "/user", label: "Home" },
        { href: "/user/library", label: "My Library" },
        { href: "/user/recycle-bin", label: "Recycle Bin" },
        { href: "/user/profile", label: "Profile" },
    ];

    return (
        <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
            {links.map((link) => (
                <Link
                    key={link.href}
                    href={link.href}
                    className={
                        pathname === link.href
                            ? "text-foreground"
                            : "text-muted-foreground transition-colors hover:text-foreground"
                    }
                >
                    {link.label}
                </Link>
            ))}
        </nav>
    );
}