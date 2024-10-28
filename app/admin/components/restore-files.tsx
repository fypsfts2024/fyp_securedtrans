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

const RestoreTable = () => {
    const [loading, setLoading] = useState(true);
    const [files, setFiles] = useState<any[]>([]);

    useEffect(() => {
        fetchFiles();
    }, []);

    const fetchFiles = async () => {
        const supabase = createClient();

        let query = supabase
            .from("recycle_bin")
            .select(`*, files ( *,user_profile(*) )`)
            .eq("status", "restore_requested");

        const { data, error } = await query;

        if (error) {
            console.error("Error fetching recycle bin data:", error);
        } else {
            setFiles(data || []);
        }

        setLoading(false);
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!files.length) {
        return (
            <>
                <div className="flex flex-col">
                    <h1 className="font-semibold">Request To Restore File</h1>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>No.</TableHead>
                                <TableHead>Deleted at</TableHead>
                                <TableHead>Filename</TableHead>
                                <TableHead>Request From</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell colSpan={4} className="text-center">No data</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
            </>
        );
    }

    return (
        <>
            <div className="flex flex-col">
                <h1 className="font-semibold">Request To Restore File</h1>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>No.</TableHead>
                            <TableHead>Deleted at</TableHead>
                            <TableHead>Filename</TableHead>
                            <TableHead>Request From</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {/* Only display the first 3 items */}
                        {files.slice(0, 3).map((file, index) => (
                            <TableRow key={file.id}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell className="font-medium">
                                    {formatDateTime(file.deleted_at)}
                                </TableCell>
                                <TableCell>{file.files.file_name}</TableCell>
                                <TableCell>
                                    {file.files.user_profile.username}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <div className="ml-auto mt-4">
                    <Button
                        onClick={() =>
                            (window.location.href = "/admin/restore")
                        }
                    >
                        View All
                    </Button>
                </div>
            </div>
        </>
    );
};

export default RestoreTable;
