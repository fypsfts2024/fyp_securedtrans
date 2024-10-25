import { createClient } from "@/utils/supabase/server";
import { FormMessage, Message } from "@/components/form-message";
import { redirect } from "next/navigation";
import { PinSetup } from "./components/pin-setup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import SharedTable from "./components/table";

export default async function UserPage({
    searchParams,
}: {
    searchParams: { message?: string; search?: string };
}) {
    if (searchParams.message) {
        return (
            <div className="w-full flex-1 flex items-center h-screen sm:max-w-md justify-center gap-2 p-4">
                <FormMessage message={searchParams as Message} />
            </div>
        );
    }
    const supabase = createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return redirect("/sign-in");
    }

    const { data, error } = await supabase
        .from("user_profile")
        .select("pin")
        .eq("id", user.id)
        .single();

    if (data?.pin === null) {
        return <PinSetup />;
    }

    let query = supabase
        .from("file_shares")
        .select("*, files (*, user_profile(*))")
        .eq("shared_with_user_id", user.id)
        .neq("files.status", "deleted")
        .not("files", "is", null);

    if (searchParams.search) {
        query = query.ilike("files.file_name", `%${searchParams.search}%`);
    }

    const { data: files, error: filesError } = await query;

    if (filesError) {
        console.error("Error fetching files:", filesError);
    }

    const formattedFiles = files?.map((file) => ({
        id: file.files.id,
        user_id: file.files.user_id,
        file_name: file.files.file_name,
        file_path: file.files.file_path,
        status: file.files.status,
        pin_attempts: file.files.pin_attempts ?? 0,
        last_pin_attempt: file.files.last_pin_attempt ?? "",
        created_at: file.files.created_at,
        user_profile: {
            username: file.files.user_profile?.username ?? "",
        },
    }));

    return (
        <div className="w-full lg:min-w-full flex flex-col gap-6">
            <div className="w-full">
                <form
                    action="/user/home"
                    method="get"
                    className="flex flex-row space-x-3"
                >
                    <div className="relative w-full">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            name="search"
                            placeholder="Search by file name"
                            className="w-full rounded-lg bg-background pl-8"
                            defaultValue={searchParams.search || ""}
                        />
                    </div>
                    <Button type="submit">Search</Button>
                </form>
            </div>
            <div className="w-full flex flex-col gap-2 items-center">
                <h2 className="font-bold text-2xl mb-4 text-center">Home</h2>
                <SharedTable files={formattedFiles || []} />
            </div>
        </div>
    );
}
