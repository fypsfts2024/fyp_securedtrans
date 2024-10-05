"use client";

import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface RequestRestroreProps {
    id: string;
}

const RequestRestroreButton: React.FC<RequestRestroreProps> = ({ id }) => {
    const supabase = createClient();

    async function updateFileStatus(): Promise<void> {
        const newStatus = "restore_requested";
        const { error } = await supabase
            .from("recycle_bin")
            .update({ status: newStatus })
            .eq("id", id);

        if (error) {
            console.error("Failed to request restore:", error);
            return;
        }

        window.location.reload();
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button>Request</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        {" "}
                        Are you sure you want to request restore this file?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will request to
                        restore your file.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={updateFileStatus}>
                        Request Restore
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default RequestRestroreButton;
