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

const UnblockTable = () => {
    const [loading, setLoading] = useState(true);
    const [files, setFiles] = useState<any[]>([]);

    useEffect(() => {
        fetchFiles();
    }, []);

    const fetchFiles = async () => {
        const supabase = createClient();

        // Fetch only files where unlock_otp is not empty
        const { data, error } = await supabase
            .from("files")
            .select(`*, user_profile(*)`)
            .neq("unblock_otp", null)
            .neq("unblock_otp", "");

        console.log(data);

        if (error) {
            console.error("Error fetching files:", error);
        } else {
            setFiles(data || []);
        }

        setLoading(false);
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!files.length) {
        return <div>No files found</div>;
    }

    return (
        <>
            <div className="flex flex-col">
                <h1 className="font-semibold">Request To Unblock File</h1>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>No.</TableHead>
                            <TableHead>Date Time</TableHead>
                            <TableHead>Filename</TableHead>
                            <TableHead>Owner</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {/* Only display the first 3 items */}
                        {files.slice(0, 3).map((file, index) => (
                            <TableRow key={file.id}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell className="font-medium">
                                    {formatDateTime(file.created_at)}
                                </TableCell>
                                <TableCell>{file.file_name}</TableCell>
                                <TableCell>
                                    {file.user_profile.username}
                                </TableCell>
                                <TableCell>
                                    {file.status === "active" && "Success"}
                                    {file.status === "deleted" && "Failed"}
                                    {file.status === "otp_sent" && "Pending"}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <div className="ml-auto mt-4">
                    <Button
                        onClick={() =>
                            (window.location.href = "/admin/unblock-files")
                        }
                    >
                        View All
                    </Button>
                </div>
            </div>
        </>
    );
};

export default UnblockTable;
