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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, ArrowDownUp, ArrowUp, ArrowDown } from "lucide-react";
import UploadFileDialog from "@/components/upload-file-dialog";
import FileActions from "./file-actions";
import UnblockButton from "./unblock-btn";
import PinDialog from "@/components/pin-dialog";

interface UserProfile {
    username: string;
}

interface File {
    id: string;
    user_id: string;
    file_name: string;
    file_path: string;
    status: "active" | "deleted" | "blocked" | "otp_sent";
    pin_attempts: number;
    last_pin_attempt: string;
    created_at: string;
    user_profile: UserProfile;
}

type LibraryProps = {
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

const LibraryTable = ({ files }: LibraryProps) => {
    const [sortField, setSortField] = useState<SortField>("created_at");
    const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

    if (!files || files.length === 0) {
        return (
            <div className="w-full flex-1 flex flex-col items-center h-screen sm:max-w-md justify-center gap-2 p-4">
                <p className="text-muted-foreground">No files found.</p>
                <UploadFileDialog action="upload" />
            </div>
        );
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
                        <TableHead>Creator</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sortedFiles.map((file) => (
                        <TableRow
                            key={file.id}
                            className={
                                file.status === "blocked" ||
                                file.status === "otp_sent"
                                    ? "text-gray-400"
                                    : ""
                            }
                        >
                            <TableCell className="font-medium">
                                {formatDateTime(file.created_at)}
                            </TableCell>
                            <TableCell>{file.file_name}</TableCell>
                            <TableCell>{file.user_profile.username}</TableCell>
                            <TableCell className="text-right">
                                {file.status === "blocked" && (
                                    <UnblockButton fileId={file.id} />
                                )}
                                {file.status === "otp_sent" && (
                                    <PinDialog
                                        name="OTP Verification"
                                        fileId={file.id}
                                        status={file.status}
                                        onSuccess={() =>
                                            console.log("File unblocked")
                                        }
                                        onFailure={() =>
                                            console.log("File access failed")
                                        }
                                    />
                                )}
                                {file.status === "active" && (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                className="h-8 w-8 p-0"
                                            >
                                                <span className="sr-only">
                                                    Open menu
                                                </span>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>
                                                Actions
                                            </DropdownMenuLabel>
                                            <FileActions file={file} />
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <UploadFileDialog action="upload" />
        </>
    );
};

export default LibraryTable;
