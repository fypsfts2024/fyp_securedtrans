"use client";

import React, { useState } from "react";
import SharedPinDialog from "@/components/shared-pin-dialog";
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
            case "leave":
                await leaveFile(file);
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
        
        //get from supabase, match with the user id and file id, and the latest created token
        const { data: tokenData, error: tokenError } = await supabase
            .from("file_access_tokens")
            .select("token")
            .eq("file_id", file.id)
            .eq("user_id", data.user.id)
            .order("created_at", { ascending: false })
            .limit(1);

        if (tokenError || !tokenData) {
            toast({
                title: "Error",
                description: "An error occurred while fetching the token",
            });
            return;
        }

        window.location.href = `/user/file/${file.id}?token=${tokenData[0].token}&shared=true`;
    };

    const leaveFile = async (file: File) => {
        if (confirm("Are you sure you want to leave this file?")) {
            const { data, error } = await supabase.auth.getUser();

            if (error || !data.user) {
                toast({
                    title: "Error",
                    description: "Unable to retrieve user information",
                });
                return;
            }

            const { error: updateError } = await supabase
                .from("file_shares")
                .delete()
                .eq("file_id", file.id)
                .eq("shared_with_user_id", data.user.id);

            if (updateError) {
                toast({
                    title: "Error",
                    description: "An error occurred while leaving the file",
                });
                return;
            }

            toast({
                title: "Success",
                description: "You have successfully left the file",
            });

            window.location.reload();
        }
    };

    const renderActionButton = (name: string, action: string) => {
        return (
            <SharedPinDialog
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
            {renderActionButton("Leave", "leave")}
        </div>
    );
};

export default FileActions;