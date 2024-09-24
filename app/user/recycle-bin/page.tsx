import { createClient } from "@/utils/supabase/server";
import { FormMessage, Message } from "@/components/form-message";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import RecycleBinTable from "./components/table";
import { Button } from "@/components/ui/button";

export default async function Library({
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

    let query = supabase
        .from("recycle_bin")
        .select(
            `
            *,
            files (*)
          `
        )
        .eq("files.user_id", user?.id);

    // Apply search filter if search parameter is present
    if (searchParams.search) {
        query = query.ilike("file_name", `%${searchParams.search}%`);
    }

    const { data: files, error } = await query;

    if (error) {
        console.error("Error fetching files:", error);
    }

    return (
        <div className="w-full lg:min-w-full flex flex-col gap-6">
            <div className="w-full">
                <form action="/user/library" method="get" className="flex flex-row space-x-3">
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
                    <Button
                        type="submit"
                    >
                        Search
                    </Button>
                </form>
            </div>
            <div className="w-full flex flex-col gap-2 items-center">
                <h2 className="font-bold text-2xl mb-4 text-center">
                    Recycle Bin
                </h2>
                <RecycleBinTable files={files || []} />
            </div>
        </div>
    );
}
