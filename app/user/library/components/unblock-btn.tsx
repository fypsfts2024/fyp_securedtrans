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

    async function updateOtp(otp: string): Promise<void> {
        const { error } = await supabase
            .from("files")
            .update({ unblock_otp: otp })
            .eq("id", fileId);

        if (error) {
            toast({
                title: "Error",
                description: "An error occurred while updating the OTP",
            });
        }
    }

    async function sendOtp(): Promise<void> {
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

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const emailRedirectTo = `${process.env.NEXT_PUBLIC_BASE_URL}/user/library?fileId=${fileId}&openModal=true`;
        const recipient = email;

        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/email`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ emailRedirectTo, recipient, generatedOtp: otp, fileId }),
        });

        if (!res.ok) {
            console.error("Failed to send OTP:", res);
            toast({
                title: "Error",
                description: "Failed to send OTP",
            });
            return;
        }

        await updateOtp(otp);
        await updateFileStatus("otp_sent");

        toast({
            title: "OTP Sent",
            description: "Check your email for the OTP",
        });

        window.location.reload();
    }

    return (
        <div className="flex justify-end">
            <Button onClick={sendOtp}>Unblock File</Button>
        </div>
    )  
};

export default UnblockButton;