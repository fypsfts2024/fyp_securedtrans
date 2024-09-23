"use client";

import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { toast } from "@/hooks/use-toast";

interface UnblockButtonProps {
    fileId: string;
}

const UnblockButton: React.FC<UnblockButtonProps> = ({
    fileId
}) => {
    const supabase = createClient();

    async function updateFileStatus(newStatus: string): Promise<void> {
        const { error } = await supabase
            .from("files")
            .update({ status: newStatus })
            .eq("id", fileId);

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

    async function sendOtp(): Promise<void> {
        // Implement logic to send OTP to user's email
        const { data, error } = await supabase.auth.getUser();
        
        if (error || !data.user) {
            toast({
                title: "Error",
                description: "Unable to retrieve user information",
            });
            return;
        }

        const email = data.user.email;
        
        if (!email) {
            toast({
                title: "Error",
                description: "User email not found",
            });
            return;
        }

        // Generate OTP (you might want to use a library for this)
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Send email with OTP (you'll need to implement this part)
        // For now, we'll just log it
        console.log(`OTP ${otp} sent to ${email} for file ${fileId}`);

        // await updateFileStatus("otp_sent");
        toast({
            title: "OTP Sent",
            description: "Check your email for the OTP",
        });
    }

    return (
        <div className="flex justify-end">
            <Button onClick={sendOtp}>Unblock File</Button>
        </div>
    )  
};

export default UnblockButton;