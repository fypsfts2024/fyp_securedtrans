import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
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
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { createClient } from "@/utils/supabase/client";
import { toast } from "@/hooks/use-toast";

const InputSchema = z.object({
    value: z.string().length(6, {
        message: "Input must be 6 characters.",
    }),
});

interface OtpDialogProps {
    fileId?: string;
    hideTrigger?: boolean;
}

const OtpDialog: React.FC<OtpDialogProps> = ({
    fileId: propFileId,
    hideTrigger,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [fileId, setFileId] = useState<string | null>(propFileId || null);
    const [triggerHidden, setTriggerHidden] = useState(hideTrigger || false);
    const [showAlertDialog, setShowAlertDialog] = useState(false);
    const searchParams = useSearchParams();

    const form = useForm<z.infer<typeof InputSchema>>({
        resolver: zodResolver(InputSchema),
        defaultValues: { value: "" },
    });

    const supabase = createClient();

    useEffect(() => {
        const openModal = searchParams.get("openModal");
        const fileIdParam = searchParams.get("fileId");

        if (openModal === "true") {
            if (!fileId && fileIdParam) {
                setFileId(fileIdParam);
            }
            if (fileId || fileIdParam) {
                setIsOpen(true);
            }
        }
    }, [searchParams, fileId]);

    useEffect(() => {
        setFileId(propFileId || null);
    }, [propFileId]);

    async function onSubmit(data: z.infer<typeof InputSchema>) {
        if (!fileId) {
            toast({
                title: "Error",
                description: "File ID is missing.",
            });
            return;
        }

        try {
            const isPinCorrect = await validateOtp(data.value);

            if (isPinCorrect) {
                setIsOpen(false);
                await activateFile();
            } else {
                toast({
                    title: "Error",
                    description: "Invalid OTP, please request a new one.",
                });

                if (fileId) {
                    await updateFileStatus("deleted");
                }

                window.location.href = `/user/recycle-bin`;
            }
        } catch (error) {
            console.error("An error occurred during OTP validation:", error);
            toast({
                title: "Error",
                description: "An unexpected error occurred.",
            });
        }
    }

    async function activateFile() {
        if (!fileId) return;

        try {
            const { data, error } = await supabase
                .from("recycle_bin")
                .delete()
                .eq("id", fileId)
                .select();

            if (error || !data || data.length === 0) {
                throw new Error("Failed to remove file from recycle bin.");
            }

            const { error: fileError } = await supabase
                .from("files")
                .update({ status: "active" })
                .eq("id", data[0].file_id);

            if (fileError) {
                throw new Error("Failed to update file status.");
            }

            toast({
                title: "Success",
                description: "File has been successfully restored.",
            });
            setShowAlertDialog(true);
        } catch (error) {
            console.error("Error restoring the file:", error);
            toast({
                title: "Error",
                description:
                    String(error) ||
                    "An error occurred while restoring the file.",
            });
        }
    }

    async function updateFileStatus(newStatus: string): Promise<void> {
        if (!fileId) return;

        const { error } = await supabase
            .from("recycle_bin")
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
                description: `The file has been ${newStatus}`,
            });
        }
    }

    async function validateOtp(otp: string): Promise<boolean> {
        if (!fileId) return false;

        const { data, error } = await supabase
            .from("recycle_bin")
            .select("otp")
            .eq("id", fileId)
            .single();

        if (error || !data) {
            toast({
                title: "Error",
                description: "An error occurred while fetching the OTP",
            });
            return false;
        }

        return data.otp === otp;
    }

    return (
        <>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                {!triggerHidden && (
                    <DialogTrigger asChild>
                        <Button className="bg-green-500 text-white">
                            OTP Sent
                        </Button>
                    </DialogTrigger>
                )}
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Enter OTP</DialogTitle>
                        <DialogDescription>
                            Please enter the 6-digit OTP sent to your email. If
                            you don’t see it in your inbox, check your spam or
                            junk folder.
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
                                        <FormLabel>OTP</FormLabel>
                                        <FormControl>
                                            <InputOTP maxLength={6} {...field}>
                                                <InputOTPGroup>
                                                    {[...Array(6)].map(
                                                        (_, i) => (
                                                            <InputOTPSlot
                                                                key={i}
                                                                index={i}
                                                            />
                                                        )
                                                    )}
                                                </InputOTPGroup>
                                            </InputOTP>
                                        </FormControl>
                                        <FormMessage />
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

            <AlertDialog
                open={showAlertDialog}
                onOpenChange={setShowAlertDialog}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Your file has successfully restore!
                        </AlertDialogTitle>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel
                            onClick={() =>
                                (window.location.href = `/user/library`)
                            }
                        >
                            OK
                        </AlertDialogCancel>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};

export default OtpDialog;
