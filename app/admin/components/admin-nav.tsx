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
import { useAuth } from "@/components/auth-context";

export function AdminNav() {
    const pathname = usePathname();
    const { admin } = useAuth();

    const primary_links = [
        { href: "/admin/prime-admin", label: "Home" },
        { href: "/admin/restore", label: "Restore" },
        {
            href: "/admin/prime-admin/manage-admin",
            label: "Manage Secondary Admin",
        },
        { href: "/admin/profile", label: "Profile" },
    ];

    const secondary_links = [
        { href: "/admin/sec-admin", label: "Home" },
        { href: "/admin/restore", label: "Restore" },
        { href: "/admin/profile", label: "Profile" },
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
                        {admin?.role === "Admin"
                            ? primary_links.map((link) => (
                                  <DropdownMenuItem key={link.href}>
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
                              ))
                            : secondary_links.map((link) => (
                                  <DropdownMenuItem key={link.href}>
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
                {admin?.role === "Admin"
                    ? primary_links.map((link) => (
                          <Link
                              key={link.href}
                              href={link.href}
                              className={
                                  pathname === link.href ? "bg-accent" : ""
                              }
                          >
                              {link.label}
                          </Link>
                      ))
                    : secondary_links.map((link) => (
                          <Link
                              key={link.href}
                              href={link.href}
                              className={
                                  pathname === link.href ? "bg-accent" : ""
                              }
                          >
                              {link.label}
                          </Link>
                      ))}
            </nav>
        </>
    );
}
