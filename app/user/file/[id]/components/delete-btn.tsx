"use client";

import { createClient } from "@/utils/supabase/client";
import { toast } from "@/hooks/use-toast";

const DeleteButton: React.FC<{ fileId: string }> = ({ fileId }) => {
    const supabase = createClient();

    const deleteFile = async () => {
        if (confirm("Are you sure you want to delete this file?")) {
            const { error: updateError } = await supabase
                .from("files")
                .update({ status: "deleted" })
                .eq("id", fileId);

            if (updateError) {
                toast({
                    title: "Error",
                    description: "An error occurred while deleting the file",
                });
                return;
            }

            toast({
                title: "File Moved",
                description: "The file has been moved to the recycle bin.",
            });

            window.history.back();
        }
    };

    return (
        <>
            <a onClick={deleteFile}>Delete</a>
        </>
    );
};

export default DeleteButton;
