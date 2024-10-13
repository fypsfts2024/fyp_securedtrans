"use client";
import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useSearchParams } from "next/navigation";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { EditAdminDialog } from "./edit-admin-dialog";

interface Admin {
    id: string;
    username: string;
    assign_date: string;
    email: string;
    role: string;
    created_at: string;
}

type AdminProps = {
    admins: Admin[] | null;
};

const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-GB", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
    }).format(date);
};

const deleteAdmin = async (id: string) => {
    if (!confirm("Are you sure you want to delete this admin?")) {
        return;
    }
    const supabase = createClient();
    const { error } = await supabase.from("admin").delete().eq("id", id);

    if (error) {
        console.error("Error deleting admin:", error);
    }
};

const AdminTable = ({ admins }: AdminProps) => {
    const searchParams = useSearchParams();

    if (!admins) {
        return null;
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Secondary Admin ID</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Assign Date</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Action</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {admins.map((admin) => (
                    <TableRow key={admin.id}>
                        <TableCell>{admin.id}</TableCell>
                        <TableCell>{admin.username}</TableCell>
                        <TableCell>{admin.role}</TableCell>
                        <TableCell>{admin.assign_date}</TableCell>
                        <TableCell>
                            {formatDateTime(admin.created_at)}
                        </TableCell>
                        <TableCell>
                            <EditAdminDialog admin={admin} />
                            <Button variant='ghost' onClick={() => deleteAdmin(admin.id)}>Delete</Button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};

export default AdminTable;
