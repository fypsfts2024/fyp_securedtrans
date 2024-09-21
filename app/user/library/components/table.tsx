"use client";

import React, { useState } from "react";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import UploadFileDialog from "./upload-file-dialog";

interface UserProfile {
    username: string;
}

interface File {
    id: string;
    user_id: string;
    file_name: string;
    file_path: string;
    status: string;
    pin_attempts: number;
    last_pin_attempt: string;
    created_at: string;
    user_profile: UserProfile;
}

type LibraryProps = {
    files: File[] | null;
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

const LibraryTable = ({ files }: LibraryProps) => {
    if (!files || files.length === 0) {
        return (
            <div className="w-full flex-1 flex flex-col items-center h-screen sm:max-w-md justify-center gap-2 p-4">
                <p className="text-muted-foreground">No files found.</p>
                <UploadFileDialog />
            </div>
        );
    }

    return (
        <>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Created at</TableHead>
                        <TableHead>Filename</TableHead>
                        <TableHead>Creator</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {files.map((file) => (
                        <TableRow key={file.id}>
                            <TableCell className="font-medium">
                                {formatDateTime(file.created_at)}
                            </TableCell>
                            <TableCell>{file.file_name}</TableCell>
                            <TableCell>{file.user_profile.username}</TableCell>
                            <TableCell className="text-right">
                                <button className="btn">View</button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <UploadFileDialog />
        </>
    );
};

export default LibraryTable;
