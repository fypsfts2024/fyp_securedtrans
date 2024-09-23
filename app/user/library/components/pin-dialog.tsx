"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp";
import { validatePinAction } from "@/lib/pin-entry-actions";
import { createClient } from "@/utils/supabase/client";
import { toast } from "@/hooks/use-toast";

const InputSchema = z.object({
    value: z.string().length(6, {
        message: "Input must be 6 characters.",
    }),
});

interface PinDialogProps {
    name: string;
    fileId: string;
    status: "active" | "deleted" | "blocked" | "otp_sent";
    onSuccess: () => void;
    onFailure: () => void;
}

const PinDialog: React.FC<PinDialogProps> = ({
    name,
    fileId,
    status: initialStatus,
    onSuccess,
    onFailure,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [attempts, setAttempts] = useState(0);
    const [status, setStatus] = useState(initialStatus);

    const form = useForm<z.infer<typeof InputSchema>>({
        resolver: zodResolver(InputSchema),
        defaultValues: { value: "" },
    });

    const supabase = createClient();

    async function onSubmit(data: z.infer<typeof InputSchema>) {
        if (status === "active") {
            const isPinCorrect = await validatePinAction(data.value);
            if (isPinCorrect) {
                setIsOpen(false);
                onSuccess();
            } else {
                const newAttempts = attempts + 1;
                setAttempts(newAttempts);
                if (newAttempts >= 3) {
                    await updateFileStatus("blocked");
                    setStatus("blocked");
                }
                form.reset();
            }
        } else if (status === "otp_sent") {
            const isOtpCorrect = await validateOtp(data.value);
            if (isOtpCorrect) {
                await updateFileStatus("active");
                setIsOpen(false);
                onSuccess();
            } else {
                await updateFileStatus("deleted");
                setIsOpen(false);
                onFailure();
            }
        }
    }

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
            setStatus(
                newStatus as "active" | "deleted" | "blocked" | "otp_sent"
            );
        }
    }

    async function validateOtp(otp: string): Promise<boolean> {
        const { data, error } = await supabase
            .from("files")
            .select("unblock_otp")
            .eq("id", fileId)
            .single();

        if (error || !data) {
            toast({
                title: "Error",
                description: "An error occurred while fetching the OTP",
            });
            return false;
        }

        return data.unblock_otp === otp;
    }

    if (initialStatus === "deleted") {
        return null;
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" className="justify-start">
                    {name}
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {status === "otp_sent" ? "Enter OTP" : "Enter PIN"}
                    </DialogTitle>
                    <DialogDescription>
                        {status === "otp_sent"
                            ? "Enter the 6-digit OTP sent to your email."
                            : "Enter your 6-digit PIN to access the file."}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-6"
                    >
                        <FormField
                            control={form.control}
                            name="value"
                            render={({ field }) => (
                                <FormItem className="flex flex-col justify-center items-center">
                                    <FormLabel>
                                        {status === "otp_sent" ? "OTP" : "PIN"}
                                    </FormLabel>
                                    <FormControl>
                                        <InputOTP maxLength={6} {...field}>
                                            <InputOTPGroup>
                                                {[...Array(6)].map((_, i) => (
                                                    <InputOTPSlot
                                                        key={i}
                                                        index={i}
                                                    />
                                                ))}
                                            </InputOTPGroup>
                                        </InputOTP>
                                    </FormControl>
                                    <FormMessage />
                                    {status === "active" && (
                                        <FormDescription>
                                            Attempts remaining: {3 - attempts}
                                        </FormDescription>
                                    )}
                                </FormItem>
                            )}
                        />
                        <div className="w-full flex justify-center">
                            <Button type="submit">Submit</Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};

export default PinDialog;
