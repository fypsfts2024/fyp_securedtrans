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

interface RecycleBin {
    id: string;
    file_id: string;
    deleted_at: string;
    status:
        | "deleted"
        | "restore_requested"
        | "restore_approved"
        | "restore_rejected";
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
        return null;
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

    const updateFileStatus = async (id: string, status: string) => {
        const supabase = createClient();
        const { error } = await supabase
            .from("recycle_bin")
            .update({ status })
            .eq("id", id);

        if (error) {
            console.error("Error updating file status:", error);
        }

        toast({
            title: "Success",
            description: `File request ${status.replace("_", " ")} successfully`,
        })

        window.location.reload();
    };

    const approveRequest = async (id: string) => {
        //send otp to user
        const supabase = createClient();
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const emailRedirectTo = `${process.env.NEXT_PUBLIC_BASE_URL}/user/recycle-bin?fileId=${id}&openModal=true`;
        const recipient = files.find((file) => file.id === id)?.files
            .user_profile.email;
        const fileId = files.find((file) => file.id === id)?.file_id;

        if (!recipient) {
            console.error("Recipient email not found");
            return;
        }

        const res = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_API_URL}/email`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    emailRedirectTo,
                    recipient,
                    generatedOtp: otp,
                    fileId,
                }),
            }
        );

        if (!res.ok) {
            console.error("Failed to send OTP:", res);
            return;
        }

        const { error } = await supabase
            .from("recycle_bin")
            .update({ status: "restore_approved", otp })
            .eq("id", id);

        if (error) {
            console.error("Error updating file status:", error);
        }

        toast({
            title: "Success",
            description: "OTP sent successfully",
        });

        window.location.reload();
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
                        <TableHead>Request From</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sortedFiles.map((file) => (
                        <TableRow key={file.id}>
                            <TableCell>{file.file_id}</TableCell>
                            <TableCell className="font-medium">
                                {formatDateTime(file.deleted_at)}
                            </TableCell>
                            <TableCell>{file.files.file_name}</TableCell>
                            <TableCell>
                                {file.files.user_profile.username}
                            </TableCell>
                            <TableCell className="text-right">
                                <Button onClick={() => approveRequest(file.id)}>
                                    Approved
                                </Button>
                                <Button
                                    variant={"ghost"}
                                    onClick={() => {
                                        const isConfirmed = window.confirm(
                                            "Are you sure you want to reject this request?"
                                        );
                                        if (isConfirmed) {
                                            updateFileStatus(
                                                file.id,
                                                "restore_rejected"
                                            );
                                        }
                                    }}
                                >
                                    Reject
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </>
    );
};

export default RecycleBinTable;
