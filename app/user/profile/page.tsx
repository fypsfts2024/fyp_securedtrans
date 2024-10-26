import { createClient } from "@/utils/supabase/server";
import { FormMessage, Message } from "@/components/form-message";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "@/components/submit-button";
import { updateProfileAction } from "./profile-action";
import { AvatarUpdate } from "@/components/avatar-update";
import AccountStatusSwitch from "./components/acc-status-switch";
import { redirect } from "next/navigation";
import CopyToClipboard from "@/components/copy-text-components";

export default async function Profile({
    searchParams,
}: {
    searchParams: Message;
}) {
    if ("message" in searchParams) {
        return (
            <div className="w-full flex-1 flex items-center h-screen sm:max-w-md justify-center gap-2 p-4">
                <FormMessage message={searchParams} />
            </div>
        );
    }
    const {
        data: { user },
    } = await createClient().auth.getUser();

    if (!user) {
        return redirect("/sign-in");
    }

    const { data, error } = await createClient()
        .from("user_profile")
        .select()
        .eq("id", user?.id)
        .single();

    return (
        <>
            <div className="grid h-screen w-full">
                <div className="flex flex-col">
                    <header className="sticky top-0 z-10 flex h-[57px] items-center gap-1 border-b bg-background px-4">
                        <h1 className="text-xl font-semibold text-center">
                            Hi,{" "}
                            {user?.user_metadata?.username
                                ? user.user_metadata.username
                                : user?.user_metadata?.full_name || user?.email}
                        </h1>
                    </header>
                    <form className="grid gap-4 overflow-auto p-4 md:grid-cols-2 lg:grid-cols-3">
                        <div className="rounded-xl bg-muted/50 p-4 h-fit">
                            <AvatarUpdate avatarUrl={data?.avatar} />
                            <div className="text-xs mt-2 flex flex-col space-y-3">
                                <div>
                                    <p>User ID</p>
                                    <CopyToClipboard text={user?.id} />
                                </div>
                                <div>
                                    <p>Last Log Date</p>
                                    <p className="font-medium">
                                        {user?.last_sign_in_at
                                            ? new Date(
                                                  user.last_sign_in_at
                                              ).toLocaleString("en-US", {
                                                  year: "numeric",
                                                  month: "long",
                                                  day: "numeric",
                                                  hour: "2-digit",
                                                  minute: "2-digit",
                                                  second: "2-digit",
                                              })
                                            : "N/A"}
                                    </p>
                                </div>
                                <div>
                                    <p>Last Update Date</p>
                                    <p className="font-medium">
                                        {data?.last_updated
                                            ? new Date(
                                                  data.last_updated
                                              ).toLocaleString("en-US", {
                                                  year: "numeric",
                                                  month: "long",
                                                  day: "numeric",
                                                  hour: "2-digit",
                                                  minute: "2-digit",
                                                  second: "2-digit",
                                              })
                                            : "N/A"}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div
                            className="relative flex-col items-start gap-8 md:flex lg:col-span-2"
                            x-chunk="dashboard-03-chunk-0"
                        >
                            <div className="grid w-full items-start gap-6">
                                <fieldset className="grid gap-6 rounded-lg border p-4">
                                    <legend className="-ml-1 px-1 text-sm font-medium">
                                        User Details
                                    </legend>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-3">
                                            <Label htmlFor="name">
                                                Username
                                            </Label>
                                            <Input
                                                id="name"
                                                name="username"
                                                type="text"
                                                placeholder="John Doe"
                                                pattern="^[a-zA-Z0-9_]{3,20}$"
                                                title="Username must be 3-20 characters long and contain only letters, numbers, and underscores."
                                                defaultValue={
                                                    data?.username || ""
                                                }
                                            />
                                        </div>
                                        <div className="grid gap-3">
                                            <Label htmlFor="website">
                                                Website
                                            </Label>
                                            <Input
                                                id="website"
                                                name="website"
                                                type="text"
                                                placeholder="https://example.com"
                                                defaultValue={
                                                    data?.website || ""
                                                }
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-3">
                                            <Label htmlFor="email">Email</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="johndoe@gmail.com"
                                                defaultValue={user?.email || ""}
                                                disabled
                                            />
                                        </div>
                                        <div className="grid gap-3">
                                            <Label htmlFor="phone">
                                                Phone No
                                            </Label>
                                            <Input
                                                id="phone"
                                                name="phone"
                                                type="text"
                                                placeholder="+60123456789"
                                                defaultValue={data?.phone || ""}
                                                pattern="^(?:\+?601|01)[0-9]{8,9}$"
                                                title="Phone number format incorrect. Eg: +60123456789/0123456789."
                                            />
                                        </div>
                                    </div>
                                    <div className="grid gap-3">
                                        <Label htmlFor="address">Address</Label>
                                        <Textarea
                                            id="address"
                                            name="address"
                                            placeholder="1234 Main St, City, Country"
                                            defaultValue={data?.address || ""}
                                        />
                                    </div>
                                    <div className="grid gap-3">
                                        <Label htmlFor="temperature">
                                            Account Status
                                        </Label>
                                        <AccountStatusSwitch
                                            initialStatus={data?.account_status}
                                        />
                                    </div>
                                </fieldset>
                                <SubmitButton
                                    formAction={updateProfileAction}
                                    pendingText="Updating..."
                                >
                                    Update Profile
                                </SubmitButton>
                                <FormMessage message={searchParams} />
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
