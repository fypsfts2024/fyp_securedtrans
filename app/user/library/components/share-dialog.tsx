import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp";
import MultipleSelector, { Option } from "@/components/ui/multiple-selector";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import * as z from "zod";
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
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "@radix-ui/react-icons";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import QRCode from "./qr-code";
import { toast } from "@/hooks/use-toast";

interface ShareDialogProps {
    isOpen: boolean;
    onClose: () => void;
    fileId: string;
}

const userSchema = z.object({
    label: z.string(),
    value: z.string(),
    disable: z.boolean().optional(),
});

const FormSchema = z.object({
    users: z.array(userSchema).min(1),
    pin: z.string().length(6),
    date: z.date({ message: "Please select a date" }),
});

const ShareDialog: React.FC<ShareDialogProps> = ({
    isOpen,
    onClose,
    fileId,
}) => {
    const supabase = createClient();

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {},
    });

    const [filename, setFilename] = useState<string>("");
    const [created_at, setCreated_at] = useState<string>("");
    const [users, setUsers] = useState<Option[]>([]);
    const [loading, setLoading] = useState(false);
    const [isTriggered, setIsTriggered] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchFileContent(fileId);
            fetchUsers();
        }
    }, [isOpen, fileId]);

    const fetchFileContent = async (fileId: string) => {
        const { data, error } = await supabase
            .from("files")
            .select("*")
            .eq("id", fileId)
            .single();

        if (error) {
            console.error("Error fetching file:", error);
            return;
        }

        setFilename(data.file_name);
        setCreated_at(data.created_at);
    };

    const fetchUsers = async () => {
        const {
            data: { user },
        } = await supabase.auth.getUser();

        const { data, error } = await supabase
            .from(`user_profile`)
            .select(`*`)
            .neq("id", user?.id);

        const { data: sharedUsers, error: sharedError } = await supabase
            .from("file_shares")
            .select("*")
            .eq("file_id", fileId);

        if (error) {
            console.error("Error fetching users:", error);
            return;
        }

        setUsers(
            data
                .filter((user: any) => {
                    if (sharedUsers) {
                        return !sharedUsers.some(
                            (sharedUser: any) =>
                                sharedUser.shared_with_user_id === user.id
                        );
                    }
                    return true;
                })
                .map((user: any) => ({ value: user.id, label: user.username }))
        );
    };

    const mockSearch = async (value: string): Promise<Option[]> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                if (!value || !users || users.length === 0) {
                    resolve([]);
                    return;
                }

                const res = users.filter(
                    (option) =>
                        option.label
                            ?.toLowerCase()
                            .includes(value.toLowerCase()) ||
                        option.value
                            ?.toLowerCase()
                            .includes(value.toLowerCase())
                );
                resolve(res);
            }, 1000);
        });
    };

    const createShareLink = async (
        fileId: string,
        userId: string,
        expiresIn?: number
    ) => {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_API_URL}/token`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fileId, userId, expiresIn }),
            }
        );
        if (!res.ok)
            throw new Error(`Error creating share link for user: ${userId}`);
        return res.json();
    };

    const storeShareData = async (
        fileId: string,
        userId: string,
        expiresAt: string,
        pin: string
    ) => {
        const { error } = await supabase
            .from("file_shares")
            .insert({ file_id: fileId, shared_with_user_id: userId, pin });
        if (error)
            throw new Error(`Error inserting share data: ${error.message}`);
    };

    const sendInviteEmail = async (
        emailRedirectTo: string,
        recipient: string,
        fileId: string
    ) => {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_API_URL}/invite-email`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ emailRedirectTo, recipient, fileId }),
            }
        );
        if (!res.ok)
            throw new Error(`Error sending email to user: ${recipient}`);
    };

    const onSubmit = async (data: z.infer<typeof FormSchema>) => {
        setLoading(true);
        const errors: string[] = [];
        const expiresIn = data.date
            ? new Date(data.date).getTime() - Date.now()
            : undefined;
        const expiresAt = data.date
            ? new Date(data.date).toISOString()
            : undefined;

        try {
            await Promise.all(
                data.users.map(async (user) => {
                    try {
                        const result = await createShareLink(
                            fileId,
                            user.value,
                            expiresIn
                        );
                        if (expiresAt) {
                            await storeShareData(
                                fileId,
                                user.value,
                                expiresAt,
                                data.pin
                            );
                        }
                        const emailRedirectTo = `${process.env.NEXT_PUBLIC_BASE_URL}/user/file/${fileId}?token=${result.token}&shared=true`;
                        await sendInviteEmail(
                            emailRedirectTo,
                            user.value,
                            fileId
                        );
                    } catch (error) {
                        errors.push(
                            `Error processing user ${user.label}: ${error}`
                        );
                    }
                })
            );

            if (errors.length > 0) {
                toast({
                    title: "Partial Success",
                    description:
                        "Some users could not be processed. Check console for details.",
                });
                console.error("Errors during processing:", errors);
            } else {
                toast({
                    title: "Success",
                    description: "File shared successfully with all users",
                });
            }

            onClose();
        } catch (error) {
            console.error("Error submitting form:", error);
            toast({
                title: "Error",
                description: "An unexpected error occurred. Please try again.",
                variant: "destructive",
            });
        } finally {
            setLoading(false); // Stop loading
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="md:min-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Share File</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="grid gap-5 py-4"
                    >
                        <h2 className="text-2xl font-bold">{filename}</h2>
                        <p>
                            Created at:
                            {new Date(created_at).toLocaleString()}
                        </p>

                        <div className="flex md:flex-row flex-col space-x-4 justify-around">
                            <div className="space-y-3 flex-1">
                                <FormField
                                    control={form.control}
                                    name="users"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Share To</FormLabel>
                                            <FormControl>
                                                <MultipleSelector
                                                    {...field}
                                                    className="col-span-3"
                                                    onSearch={async (value) => {
                                                        setIsTriggered(true);
                                                        const res =
                                                            await mockSearch(
                                                                value
                                                            );
                                                        setIsTriggered(false);
                                                        return res;
                                                    }}
                                                    placeholder="Search by username or id"
                                                    loadingIndicator={
                                                        <p className="py-2 text-center text-lg leading-10 text-muted-foreground">
                                                            loading...
                                                        </p>
                                                    }
                                                    emptyIndicator={
                                                        <p className="w-full text-center text-lg leading-10 text-muted-foreground">
                                                            no results found.
                                                        </p>
                                                    }
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="pin"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Invitee Decrypt PIN
                                            </FormLabel>
                                            <FormControl>
                                                <InputOTP
                                                    maxLength={6}
                                                    {...field}
                                                >
                                                    <InputOTPGroup>
                                                        <InputOTPSlot
                                                            index={0}
                                                        />
                                                        <InputOTPSlot
                                                            index={1}
                                                        />
                                                        <InputOTPSlot
                                                            index={2}
                                                        />
                                                        <InputOTPSlot
                                                            index={3}
                                                        />
                                                        <InputOTPSlot
                                                            index={4}
                                                        />
                                                        <InputOTPSlot
                                                            index={5}
                                                        />
                                                    </InputOTPGroup>
                                                </InputOTP>
                                            </FormControl>
                                            <FormDescription>
                                                A 6-digit PIN for the invitee to
                                                decrypt the file
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="date"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>
                                                Link Expiry Date
                                            </FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant={"outline"}
                                                            className={cn(
                                                                "w-full pl-3 text-left font-normal",
                                                                !field.value &&
                                                                    "text-muted-foreground"
                                                            )}
                                                            onClick={(e) =>
                                                                e.stopPropagation()
                                                            }
                                                        >
                                                            {field.value ? (
                                                                format(
                                                                    field.value,
                                                                    "PPP"
                                                                )
                                                            ) : (
                                                                <span>
                                                                    Pick a date
                                                                </span>
                                                            )}
                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent
                                                    className="w-auto p-0 z-[999]"
                                                    align="start"
                                                >
                                                    <Calendar
                                                        mode="single"
                                                        selected={field.value}
                                                        onSelect={
                                                            field.onChange
                                                        }
                                                        disabled={(date) =>
                                                            date < new Date() ||
                                                            date <
                                                                new Date(
                                                                    "1900-01-01"
                                                                )
                                                        }
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <FormDescription>
                                                The date when the share link
                                                will expire
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="flex-1">
                                <QRCode fileId={fileId} />
                            </div>
                        </div>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Sharing..." : "Share Now"}
                        </Button>
                        <p className="text-sm text-center">
                            Note: Files already shared with the recipient cannot
                            be shared again.
                        </p>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};

export default ShareDialog;
