"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AdminNav } from "./admin-nav";
import { useAuth } from "@/components/auth-context";

const AdminHeaderAuth = () => {
    const { admin, logout } = useAuth();

    return admin ? (
        <div className="flex items-center gap-4">
            <AdminNav />
            <Button variant={"outline"} onClick={logout}>
                Sign out
            </Button>
        </div>
    ) : (
        <Button asChild size="sm" variant={"outline"}>
            <Link href="/admin/sign-in">Sign in</Link>
        </Button>
    );
};

export default AdminHeaderAuth;
