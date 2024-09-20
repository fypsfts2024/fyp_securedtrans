"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

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
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { updatePinAction } from "./pin-update";

const FormSchema = z
    .object({
        pin: z.string().min(6, {
            message: "Your pin must be 6 characters.",
        }),
        secpin: z.string().min(6, {
            message: "Your pin must be 6 characters.",
        }),
    })
    .refine((data) => data.pin === data.secpin, {
        path: ["secpin"],
        message: "Pins do not match. Please ensure both pins are identical.",
    });

export function PinSetup() {
    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            pin: "",
            secpin: "",
        },
    });

    function onSubmit(data: z.infer<typeof FormSchema>) {
        updatePinAction(data.pin);
    }

    return (
        <div className="flex justify-center items-center h-full">
            <Card className="md:w-1/2 text-center items-center">
                <CardHeader>
                    <CardTitle>Pin Setup</CardTitle>
                    <CardDescription>
                        Take note: This is important and you need to memorize
                        the pin as you will need to enter it every time you want
                        to access your file.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="w-2/3 space-y-6"
                        >
                            <FormField
                                control={form.control}
                                name="pin"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Please enter a 6-digit pin
                                        </FormLabel>
                                        <FormControl>
                                            <InputOTP maxLength={6} {...field}>
                                                <InputOTPGroup>
                                                    <InputOTPSlot index={0} />
                                                    <InputOTPSlot index={1} />
                                                    <InputOTPSlot index={2} />
                                                    <InputOTPSlot index={3} />
                                                    <InputOTPSlot index={4} />
                                                    <InputOTPSlot index={5} />
                                                </InputOTPGroup>
                                            </InputOTP>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="secpin"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Retype the 6-digit pin
                                        </FormLabel>
                                        <FormControl>
                                            <InputOTP maxLength={6} {...field}>
                                                <InputOTPGroup>
                                                    <InputOTPSlot index={0} />
                                                    <InputOTPSlot index={1} />
                                                    <InputOTPSlot index={2} />
                                                    <InputOTPSlot index={3} />
                                                    <InputOTPSlot index={4} />
                                                    <InputOTPSlot index={5} />
                                                </InputOTPGroup>
                                            </InputOTP>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit">Submit</Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
