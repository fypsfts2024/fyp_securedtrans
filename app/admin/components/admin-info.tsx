"use client";
import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

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

const AdminTable = () => {
    const [loading, setLoading] = useState(true);
    const [admins, setAdmins] = useState<any[]>([]);

    useEffect(() => {
        fetchAdmins();
    }, []);

    const fetchAdmins = async () => {
       const supabase = createClient();

       /* let query = supabase.from("admin").select("*").neq("role", "Admin");

        const { data, error } = await query;*/
        
        // Fetch the latest 3 admins sorted by created_at in descending order
        const { data, error } = await supabase
        .from("admin")
        .select("*")
        .neq("role", "Admin") // Exclude records where role is "Admin"
        .order("created_at", { ascending: false }) // Sort by created_at descending (latest first)
        .limit(3); // Limit to the latest 3 records

        if (error) {
            console.error("Error fetching admin data:", error);
        } else {
            setAdmins(data || []);
        }

        setLoading(false);
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!admins.length) {
        return (
            <div className="flex flex-col">
                <h1 className="font-semibold">Secondary Admin Information</h1>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>No.</TableHead>
                            <TableHead>SA ID</TableHead>
                            <TableHead>Username</TableHead>
                            <TableHead>Created Date</TableHead>
                            <TableHead>Role</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell colSpan={5} className="text-center">
                                No secondary admin found
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>
        );
    }

    return (
        <>
            <div className="flex flex-col">
                <h1 className="font-semibold">Secondary Admin Information</h1>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>No.</TableHead>
                            <TableHead>SA ID</TableHead>
                            <TableHead>Username</TableHead>
                            <TableHead>Created Date</TableHead>
                            <TableHead>Role</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {/* Only display the first 3 items */}
                        {admins.slice(0, 3).map((admin, index) => (
                            <TableRow key={admin.id}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell className="font-medium">
                                    {admin.id}
                                </TableCell>
                                <TableCell>{admin.username}</TableCell>
                                <TableCell>
                                    {formatDateTime(admin.created_at)}
                                </TableCell>
                                <TableCell>{admin.role}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <div className="ml-auto mt-4">
                    <Button
                        onClick={() =>
                            (window.location.href =
                                "/admin/prime-admin/manage-admin")
                        }
                    >
                        View All
                    </Button>
                </div>
            </div>
        </>
    );
};

export default AdminTable;
