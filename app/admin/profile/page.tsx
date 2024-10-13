"use client";
import { useAuth } from "@/components/auth-context";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
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
} from "@/components/ui/form";
import { CalendarIcon } from "@radix-ui/react-icons";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

const FormSchema = z.object({
    id: z.string().optional(),
    username: z.string().min(1, "Username is required"),
    assign_date: z.date(),
    email: z.string().email("Invalid email address"),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .optional(),
    role: z.string().optional(),
});

export default function Profile() {
    const { admin, setAdmin } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        if (!admin) {
            window.location.href = "/admin/sign-in";
        }
    }, [admin]);

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            id: admin?.id || "",
            username: admin?.username || "",
            assign_date: admin?.assign_date
                ? new Date(admin.assign_date)
                : new Date(),
            email: admin?.email || "",
            role: admin?.role || "",
        },
    });

    const onSubmit = async (data: z.infer<typeof FormSchema>) => {
        setIsLoading(true);
        try {
            const updateData: any = {
                username: data.username,
                email: data.email,
            };

            if (data.password) {
                updateData.password = data.password;
            }

            const { error } = await supabase
                .from("admin")
                .update(updateData)
                .eq("id", admin?.id);

            if (error) throw error;

            setAdmin({ ...admin, ...updateData });
            toast({
                title: "Profile updated",
                description: "Your profile has been successfully updated.",
            });
        } catch (error) {
            console.error("Error updating profile:", error);
            toast({
                title: "Error",
                description: "Failed to update profile. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (!admin) return null;

    return (
        <div className="grid h-screen w-full">
            <div className="flex flex-col md:w-1/2 mx-auto">
                <header className="sticky top-0 z-10 flex h-[57px] items-center gap-1 border-b bg-background px-4">
                    <h1 className="text-xl font-semibold text-center">
                        Hi, {admin.username || admin.email}
                    </h1>
                </header>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="grid gap-4 py-4"
                    >
                        <FormField
                            control={form.control}
                            name="id"
                            disabled
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>ID</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="ID"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="username"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Username</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Username"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="assign_date"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Assign Date</FormLabel>
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
                                                    disabled
                                                >
                                                    {field.value ? (
                                                        format(
                                                            field.value,
                                                            "PPP"
                                                        )
                                                    ) : (
                                                        <span>Pick a date</span>
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
                                                onSelect={field.onChange}
                                                disabled={() => true}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Email" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Password (leave blank to keep current)
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            type="password"
                                            placeholder="New Password"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="role"
                            disabled
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Role</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Role" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Updating..." : "Update Profile"}
                        </Button>
                    </form>
                </Form>
            </div>
        </div>
    );
}
