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
  } from "@/components/ui/table"

interface File {
    id: string;
    user_id: string;
    file_name: string;
    file_path: string;
    status: string;
    pin_attempts: number;
    last_pin_attempt: string;
    created_at: string;
}

type LibraryProps = {
    files: File[] | null;
};

const LibraryTable = ({ files }: LibraryProps) => {
    if (!files || files.length === 0) {
        return <p>No files available.</p>;
    }
    
    return (
        <>
        <Table>
            <TableCaption>A list of your recent invoices.</TableCaption>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-[100px]">ID</TableHead>
                    <TableHead>Creator</TableHead>
                    <TableHead>Created at</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {files.map((file) => (
                    <TableRow key={file.id}>
                        <TableCell className="font-medium">
                            {file.id}
                        </TableCell>
                        <TableCell>{file.user_id}</TableCell>
                        <TableCell>{file.created_at}</TableCell>
                        <TableCell className="text-right">
                            <button className="btn">View</button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
        </>
    );
};

export default LibraryTable;