"use client";

import React from "react";
import PinDialog from "@/components/pin-dialog";
import { createClient } from "@/utils/supabase/client";
import { toast } from "@/hooks/use-toast";

interface File {
    id: string;
    status: "active" | "deleted" | "blocked" | "otp_sent";
    pin_attempts: number;
}

interface FileActionsProps {
    file: File;
}

const FileActions: React.FC<FileActionsProps> = ({ file }) => {
    const supabase = createClient();

    const handleFileAction = async (action: string) => {
        switch (action) {
            case "view":
                await viewFile(file);
                break;
            case "delete":
                await deleteFile(file);
                break;
            case "share":
                await shareFile(file);
                break;
            default:
                console.error("Unknown action:", action);
        }
    };

    const viewFile = async (file: File) => {
        const { data, error } = await supabase.auth.getUser();

        if (error || !data.user) {
            toast({
                title: "Error",
                description: "Unable to retrieve user information",
            });
            return;
        }
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ fileId: file.id, userId: data.user.id }),
        });

        if (!res.ok) {
            console.error("Failed to generate token:", res);
            toast({
                title: "Error",
                description: "Failed to generate token",
            });
            return;
        }

        const jsondata = await res.json();
        window.location.href = `/user/file/${file.id}?token=${jsondata.token}`;
    };

    const deleteFile = async (file: File) => {
        if (confirm("Are you sure you want to delete this file?")) {
            const { error: updateError } = await supabase
                .from("files")
                .update({ status: "deleted" })
                .eq("id", file.id);

            if (updateError) {
                toast({
                    title: "Error",
                    description: "An error occurred while deleting the file",
                });
                return;
            }

            toast({
                title: "File Deleted",
                description: "The file has been deleted successfully",
            });

            window.location.href = "/user/library";
        }
    };

    const shareFile = async (file: File) => {
        // Uncomment and implement share functionality
        // const token = await generateAccessToken(file.id, userId);
        // setAccessLink(`${window.location.origin}/file/${file.id}?token=${token}`);
    };

    const renderActionButton = (name: string, action: string) => {
        return (
            <PinDialog
                name={name}
                fileId={file.id}
                status={file.status}
                onSuccess={() => handleFileAction(action)}
                onFailure={() => console.log("File access failed")}
            />
        );
    };

    return (
        <div className="flex flex-col">
            {renderActionButton("View", "view")}
            {renderActionButton("Delete", "delete")}
            {renderActionButton("Share", "share")}
        </div>
    );
};

export default FileActions;