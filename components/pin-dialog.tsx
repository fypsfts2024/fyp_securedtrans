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
import { validatePinAction } from "@/lib/pin-entry-actions";

const InputSchema = z.object({
    value: z.string().length(6, {
        message: "Input must be 6 characters.",
    }),
});

interface PinDialogProps {
    name: string;
    fileId?: string;
    status: "active" | "deleted" | "blocked" | "otp_sent";
    hideTrigger?: boolean;
    onSuccess: () => void;
    onFailure: () => void;
}

const PinDialog: React.FC<PinDialogProps> = ({
    name,
    fileId: propFileId,
    status: initialStatus,
    hideTrigger,
    onSuccess,
    onFailure,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [attempts, setAttempts] = useState(() => {
        const savedAttempts = localStorage.getItem("pinAttempts");
        return savedAttempts ? parseInt(savedAttempts, 10) : 0;
    });
    const [status, setStatus] = useState(initialStatus);
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

        if (status === "active") {
            const isPinCorrect = await validatePinAction(data.value);
            if (isPinCorrect) {
                setIsOpen(false);
                onSuccess();
                localStorage.removeItem("pinAttempts"); // Reset attempts on success
            } else {
                const newAttempts = attempts + 1;
                setAttempts(newAttempts);
                localStorage.setItem("pinAttempts", newAttempts.toString()); // Save to localStorage
                if (newAttempts >= 3) {
                    await updateFileStatus("blocked");
                    setStatus("blocked");
                    window.location.reload();
                }
                form.reset();
                toast({
                    title: "Incorrect PIN",
                    description: `You have ${3 - newAttempts} attempts remaining.`,
                });
            }
        } else if (status === "otp_sent") {
            const isOtpCorrect = await validateOtp(data.value);
            if (isOtpCorrect) {
                await updateFileStatus("active");
                setIsOpen(false);
                onSuccess();
                localStorage.removeItem("pinAttempts"); // Reset attempts on success
            } else {
                await updateFileStatus("deleted");
                setIsOpen(false);
                setShowAlertDialog(true);
                // onFailure();
            }
        } else {
            toast({
                title: "Error",
                description: "Invalid file status for PIN entry.",
            });
        }
    }

    async function updateFileStatus(newStatus: string): Promise<void> {
        if (!fileId) return;

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
                description: `The file has been ${newStatus}`,
            });
            setStatus(
                newStatus as "active" | "deleted" | "blocked" | "otp_sent"
            );
            if (newStatus === "blocked") {
                localStorage.removeItem("pinAttempts"); // Clear attempts on block
            }
        }
    }

    async function validateOtp(otp: string): Promise<boolean> {
        if (!fileId) return false;

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

    return (
        <>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                {!triggerHidden && (
                    <DialogTrigger asChild>
                        <Button variant="ghost">{name}</Button>
                    </DialogTrigger>
                )}
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {status === "otp_sent" ? "Enter OTP" : "Enter PIN"}
                        </DialogTitle>
                        <DialogDescription>
                            {status === "otp_sent"
                                ? "Please enter the 6-digit OTP sent to your email. If you don’t see it in your inbox, check your spam or junk folder."
                                : "Enter your 6-digit PIN to access the file securely."}
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
                                            {" "}
                                            {status === "otp_sent"
                                                ? "OTP"
                                                : "PIN"}
                                        </FormLabel>
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
                                        {status === "active" && (
                                            <FormDescription>
                                                Attempts remaining:{" "}
                                                {3 - attempts}
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

            <AlertDialog
                open={showAlertDialog}
                onOpenChange={setShowAlertDialog}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Your file has been moved to the recycle bin
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            If you wish to access the file again, please click
                            request to restore.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel
                            onClick={() => (window.location.href = "/user")}
                        >
                            Go back to Home
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={onFailure}>
                            Request Restore
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};

export default PinDialog;
