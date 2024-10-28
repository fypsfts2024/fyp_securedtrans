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
import { validatePinAction } from "@/lib/pin-entry-actions";

const InputSchema = z.object({
    value: z.string().length(6, {
        message: "Input must be 6 characters.",
    }),
});

interface DeactivatePinDialogProps {
    onSuccess: () => void;
    onFailure: () => void;
    open: boolean;
    onClose: () => void;
}

const DeactivatePinDialog: React.FC<DeactivatePinDialogProps> = ({
    onSuccess,
    onFailure,
    open,
    onClose,
}) => {
    const [attempts, setAttempts] = useState(() => {
        const savedAttempts = localStorage.getItem("pinAttempts");
        return savedAttempts ? parseInt(savedAttempts, 10) : 0;
    });

    const form = useForm<z.infer<typeof InputSchema>>({
        resolver: zodResolver(InputSchema),
        defaultValues: { value: "" },
    });

    useEffect(() => {
        if (attempts >= 3) {
            toast({
                title: "Attempts Exceeded",
                description:
                    "You have exceeded the maximum number of attempts, please try again tomorrow.",
            });
            onFailure();
            // localStorage.removeItem("pinAttempts");
        }
    }, [attempts, onFailure]);

    const handleSubmit = async (data: z.infer<typeof InputSchema>) => {
        if (attempts >= 3) {
            toast({
                title: "Attempts Exceeded",
                description:
                    "You have exceeded the maximum number of attempts, please try again tomorrow.",
            });
            return;
        }

        const isPinCorrect = await validatePinAction(data.value);
        if (isPinCorrect) {
            onSuccess();
            setAttempts(0);
            localStorage.removeItem("pinAttempts");
            onClose();
        } else {
            const newAttempts = attempts + 1;
            setAttempts(newAttempts);
            localStorage.setItem("pinAttempts", newAttempts.toString());
            form.reset();
            toast({
                title: "Incorrect PIN",
                description: `You have ${3 - newAttempts} attempts remaining.`,
            });
        }
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(isOpen) => {
                if (!isOpen) {
                    document.body.style.pointerEvents = ''
                    onClose();
                }
                setTimeout(() => {
                    if (!open) {
                        document.body.style.pointerEvents = ''
                    }
                }, 100)
            }}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Enter PIN</DialogTitle>
                    <DialogDescription>
                        Enter your 6-digit PIN to deactivate your account.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(handleSubmit)}
                        className="space-y-6"
                    >
                        <FormField
                            control={form.control}
                            name="value"
                            render={({ field }) => (
                                <FormItem className="flex flex-col justify-center items-center">
                                    <FormLabel> PIN</FormLabel>
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
                                    <FormDescription>
                                        Attempts remaining: {3 - attempts}
                                    </FormDescription>
                                </FormItem>
                            )}
                        />
                        <div className="w-full flex justify-center">
                            <Button type="submit">Confirm</Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};

export default DeactivatePinDialog;
