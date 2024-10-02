"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MoreVertical } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export function UserNav() {
    const pathname = usePathname();

    const links = [
        { href: "/user", label: "Home" },
        { href: "/user/library", label: "My Library" },
        { href: "/user/recycle-bin", label: "Recycle Bin" },
        { href: "/user/profile", label: "Profile" },
    ];

    return (
        <>
            {/* Mobile Navigation */}
            <nav className="md:hidden">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {links.map((link) => (
                            <DropdownMenuItem key={link.href} asChild>
                                <Link
                                    href={link.href}
                                    className={
                                        pathname === link.href
                                            ? "bg-accent"
                                            : ""
                                    }
                                >
                                    {link.label}
                                </Link>
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </nav>
            
            {/* Desktop Navigation */}
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
        </>
    );
}
