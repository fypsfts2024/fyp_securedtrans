"use client";

import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { toast } from "@/hooks/use-toast";

interface RequestRestroreProps {
    id: string;
}

const RequestRestroreButton: React.FC<RequestRestroreProps> = ({
    id
}) => {
    const supabase = createClient();

    async function updateFileStatus(): Promise<void> {
        if (!confirm("Are you sure you want to request restore?")) {
            return;
        }
        const newStatus = "restore_requested";
        const { error } = await supabase
            .from("recycle_bin")
            .update({ status: newStatus })
            .eq("id", id);

        if (error) {
            toast({
                title: "Error",
                description: `An error occurred while updating the file status to ${newStatus}`,
            });
        } else {
            toast({
                title: `File ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`,
                description: `The file has been ${newStatus} successfully`,
            });
        }
    }

    return (
        <div className="flex justify-end">
            <Button onClick={updateFileStatus}>Request Restore</Button>
        </div>
    )  
};

export default RequestRestroreButton;