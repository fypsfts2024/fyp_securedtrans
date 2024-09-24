"use client";
import React, { useState } from "react";
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
import RequestRestroreButton from "./request-restore-btn";

interface File {
    id: string;
    user_id: string;
    file_name: string;
    file_path: string;
    status: "active" | "deleted" | "blocked" | "otp_sent";
    pin_attempts: number;
    last_pin_attempt: string;
    created_at: string;
}

interface RecycleBin {
    id: string;
    file_id: string;
    deleted_at: string;
    status: "deleted" | "restore_requested" | "restore_approved" | "retore_rejected";
    otp: string;
    otp_expiry: string;
    files: File;
}

type RecycleBinProps = {
    files: RecycleBin[] | null;
};

type SortField = "deleted_at" | "file_name";
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

const RecycleBinTable = ({ files }: RecycleBinProps) => {
    const [sortField, setSortField] = useState<SortField>("deleted_at");
    const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

    if (!files || files.length === 0) {
        return (
            <div className="w-full flex-1 flex flex-col items-center h-screen sm:max-w-md justify-center gap-2 p-4">
                <p className="text-muted-foreground">No files found.</p>
            </div>
        );
    }

    const sortedFiles = [...files].sort((a, b) => {
        if (sortField === "deleted_at") {
            return sortOrder === "asc"
                ? new Date(a.deleted_at).getTime() -
                      new Date(b.deleted_at).getTime()
                : new Date(b.deleted_at).getTime() -
                      new Date(a.deleted_at).getTime();
        } else {
            return sortOrder === "asc"
                ? a.files.file_name.localeCompare(b.files.file_name)
                : b.files.file_name.localeCompare(a.files.file_name);
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
                        <TableHead>
                            <Button
                                variant="ghost"
                                onClick={() => toggleSort("deleted_at")}
                                className="hover:bg-transparent px-0"
                            >
                                Deleted at
                                <SortIcon field="deleted_at" />
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
                        <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sortedFiles.map((file) => (
                        <TableRow key={file.id}>
                            <TableCell className="font-medium">
                                {formatDateTime(file.deleted_at)}
                            </TableCell>
                            <TableCell>{file.files.file_name}</TableCell>
                            <TableCell className="text-right">
                                {file.status === "deleted" && (
                                    <RequestRestroreButton id={file.id} />
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </>
    );
};

export default RecycleBinTable;
