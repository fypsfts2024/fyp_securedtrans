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
import { ArrowDownUp, ArrowUp, ArrowDown } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface UserProfile {
    username: string;
    email: string;
}

interface File {
    id: string;
    user_profile: UserProfile;
    file_name: string;
    file_path: string;
    status: "active" | "deleted" | "blocked" | "otp_sent";
    pin_attempts: number;
    last_pin_attempt: string;
    created_at: string;
}

type UnblockFilesProps = {
    files: File[] | null;
};

type SortField = "created_at" | "file_name";
type SortOrder = "asc" | "desc";

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

const UnblockFilesTable = ({ files }: UnblockFilesProps) => {
    const [sortField, setSortField] = useState<SortField>("created_at");
    const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

    if (!files || files.length === 0) {
        return null;
    }

    const sortedFiles = [...files].sort((a, b) => {
        if (sortField === "created_at") {
            return sortOrder === "asc"
                ? new Date(a.created_at).getTime() -
                      new Date(b.created_at).getTime()
                : new Date(b.created_at).getTime() -
                      new Date(a.created_at).getTime();
        } else {
            return sortOrder === "asc"
                ? a.file_name.localeCompare(b.file_name)
                : b.file_name.localeCompare(a.file_name);
        }
    });

    const toggleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortOrder("asc");
        }
    };

    const SortIcon = ({ field }: { field: SortField }) => {
        if (sortField !== field)
            return <ArrowDownUp className="h-4 w-4 ml-1" />;
        return sortOrder === "asc" ? (
            <ArrowUp className="h-4 w-4 ml-1" />
        ) : (
            <ArrowDown className="h-4 w-4 ml-1" />
        );
    };

    return (
        <>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>File ID</TableHead>
                        <TableHead>
                            <Button
                                variant="ghost"
                                onClick={() => toggleSort("created_at")}
                                className="hover:bg-transparent px-0"
                            >
                                Created at
                                <SortIcon field="created_at" />
                            </Button>
                        </TableHead>
                        <TableHead>
                            <Button
                                variant="ghost"
                                onClick={() => toggleSort("file_name")}
                                className="hover:bg-transparent px-0"
                            >
                                Filename
                                <SortIcon field="file_name" />
                            </Button>
                        </TableHead>
                        <TableHead>Owner</TableHead>
                        <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sortedFiles.map((file) => (
                        <TableRow key={file.id}>
                            <TableCell>{file.id}</TableCell>
                            <TableCell className="font-medium">
                                {formatDateTime(file.created_at)}
                            </TableCell>
                            <TableCell>{file.file_name}</TableCell>
                            <TableCell>{file.user_profile.username}</TableCell>
                            <TableCell className="text-right">
                                {file.status === "active" && "Success"}
                                {file.status === "deleted" && "Failed"}
                                {file.status === "otp_sent" && "Pending"}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </>
    );
};

export default UnblockFilesTable;
