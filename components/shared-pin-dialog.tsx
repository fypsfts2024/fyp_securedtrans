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

const SharedPinDialog: React.FC<SharedPinDialogProps> = ({
    name,
    fileId: propFileId,
    shared,
    status: initialStatus,
    onSuccess,
    onFailure,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [attempts, setAttempts] = useState(() => {
        // Get attempts from localStorage or set to 0
        const savedAttempts = localStorage.getItem("sharedPinAttempts");
        return savedAttempts ? parseInt(savedAttempts, 10) : 0;
    });
    const [sharedFile, setSharedFile] = useState(shared || false);
    const [status, setStatus] = useState(initialStatus);
    const [fileId, setFileId] = useState<string | null>(propFileId || null);

    const form = useForm<z.infer<typeof InputSchema>>({
        resolver: zodResolver(InputSchema),
        defaultValues: { value: "" },
    });

    const supabase = createClient();

    useEffect(() => {
        setFileId(propFileId || null);
    }, [propFileId]);

    useEffect(() => {
        localStorage.setItem("sharedPinAttempts", attempts.toString());
    }, [attempts]);

    async function onSubmit(data: z.infer<typeof InputSchema>) {
        if (!fileId) {
            toast({
                title: "Error",
                description: "File ID is missing.",
            });
            return;
        }

        if (status === "active") {
            const isPinCorrect = await validateSharedPin(data.value);
            if (isPinCorrect) {
                setIsOpen(false);
                onSuccess();
                setAttempts(0); // Reset attempts on success
            } else {
                const newAttempts = attempts + 1;
                setAttempts(newAttempts);
                if (newAttempts >= 3) {
                    await leaveFile();
                    window.location.reload();
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

        setAttempts(0);
    }

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
        </>
    );
};

export default SharedPinDialog;