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

const DeleteButton: React.FC<{ id: string }> = ({ id }) => {
    const supabase = createClient();

    async function deleteFile(): Promise<void> {
        const { error } = await supabase.from("files").delete().eq("id", id);

        if (error) {
            console.error("Failed to delete file:", error);
            return;
        }

        window.location.reload();
    }

    return (
        <>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="outline">Delete</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {" "}
                            Are you sure you want to delete this file?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete your file and remove it from your library.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={deleteFile}>
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};

export default DeleteButton;