import { useState, useEffect } from "react";
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
import { createClient } from "@/utils/supabase/client";
import { toast } from "@/hooks/use-toast";

const InputSchema = z.object({
    value: z.string().length(6, {
        message: "Input must be 6 characters.",
    }),
});

interface SharedPinDialogProps {
    name: string;
    fileId?: string;
    shared?: boolean;
    status: "active" | "deleted" | "blocked" | "otp_sent";
    onSuccess: () => void;
    onFailure: () => void;
}

interface PinAttempts {
    [fileId: string]: {
        count: number;
        lastAttempt: number;
    };
}

const ATTEMPT_RESET_TIME = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const MAX_ATTEMPTS = 3;

const SharedPinDialog: React.FC<SharedPinDialogProps> = ({
    name,
    fileId: propFileId,
    shared,
    status: initialStatus,
    onSuccess,
    onFailure,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [sharedFile, setSharedFile] = useState(shared || false);
    const [status, setStatus] = useState(initialStatus);
    const [fileId, setFileId] = useState<string | null>(propFileId || null);

    const form = useForm<z.infer<typeof InputSchema>>({
        resolver: zodResolver(InputSchema),
        defaultValues: { value: "" },
    });

    const supabase = createClient();

    // Get attempts for the current file
    const getFileAttempts = (fileId: string): number => {
        const attemptsData = localStorage.getItem('sharedPinAttempts');
        if (!attemptsData) return 0;

        const attempts: PinAttempts = JSON.parse(attemptsData);
        const fileAttempts = attempts[fileId];

        if (!fileAttempts) return 0;

        // Reset attempts if last attempt was more than 24 hours ago
        if (Date.now() - fileAttempts.lastAttempt > ATTEMPT_RESET_TIME) {
            updateFileAttempts(fileId, 0);
            return 0;
        }

        return fileAttempts.count;
    };

    // Update attempts for a specific file
    const updateFileAttempts = (fileId: string, count: number) => {
        const attemptsData = localStorage.getItem('sharedPinAttempts');
        const attempts: PinAttempts = attemptsData ? JSON.parse(attemptsData) : {};

        attempts[fileId] = {
            count,
            lastAttempt: Date.now(),
        };

        localStorage.setItem('sharedPinAttempts', JSON.stringify(attempts));
    };

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

        // Get current attempts for this file
        const currentAttempts = getFileAttempts(fileId);

        if (currentAttempts >= MAX_ATTEMPTS) {
            toast({
                title: "Too many attempts",
                description: "Please try again in 24 hours.",
            });
            return;
        }

        if (status === "active") {
            const isPinCorrect = await validateSharedPin(data.value);
            if (isPinCorrect) {
                setIsOpen(false);
                onSuccess();
                updateFileAttempts(fileId, 0); // Reset attempts on success
            } else {
                const newAttempts = currentAttempts + 1;
                updateFileAttempts(fileId, newAttempts);
                
                if (newAttempts >= MAX_ATTEMPTS) {
                    await leaveFile();
                    toast({
                        title: "Access Blocked",
                        description: "Too many incorrect attempts. Try again in 24 hours or request a new share.",
                    });
                    window.location.reload();
                } else {
                    toast({
                        title: "Incorrect PIN",
                        description: `${MAX_ATTEMPTS - newAttempts} attempts remaining.`,
                    });
                }
                form.reset();
            }
        } else {
            toast({
                title: "Error",
                description: "Invalid file status for PIN entry.",
            });
        }
    }

    async function validateSharedPin(pin: string) {
        const { data, error } = await supabase.auth.getUser();

        if (error || !data.user) {
            toast({
                title: "Error",
                description: "Unable to retrieve user information",
            });
            return false;
        }

        const { data: sharedFile, error: sharedError } = await supabase
            .from("file_shares")
            .select("pin")
            .eq("shared_with_user_id", data.user.id)
            .eq("file_id", fileId)
            .single();

        if (sharedError) {
            console.error("Error fetching shared file:", error);
            return false;
        }

        if (!sharedFile) {
            console.error("No shared file found.");
            return false;
        }

        return sharedFile.pin === pin;
    }

    async function leaveFile() {
        if (!fileId) {
            toast({
                title: "Error",
                description: "File ID is missing.",
            });
            return;
        }

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
            .eq("file_id", fileId)
            .eq("shared_with_user_id", data.user.id);

        if (updateError) {
            toast({
                title: "Error",
                description: "An error occurred while leaving the file",
            });
            return;
        }

        toast({
            title: "You have left the file",
            description: "To access the file again, you will need to ask for a new share link.",
        });

        // Reset attempts for this file
        updateFileAttempts(fileId, 0);
    }

    // Get current attempts for display
    const currentAttempts = fileId ? getFileAttempts(fileId) : 0;

    return (
        <>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                    <Button variant="ghost">{name}</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            Enter PIN
                        </DialogTitle>
                        <DialogDescription>
                            Enter the 6-digit PIN provided by the file owner.
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
                                                {MAX_ATTEMPTS - currentAttempts}
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
        </>
    );
};

export default SharedPinDialog;