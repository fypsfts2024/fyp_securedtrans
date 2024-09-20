import { createClient } from "@/utils/supabase/server";
import { FormMessage, Message } from "@/components/form-message";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import LibraryTable from "./components/table";

export default async function Library({
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

    const supabase = createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    //get files
    const { data: files, error } = await supabase
        .from("files")
        .select("*")
        .eq("user_id", user?.id);

    return (
        <div className="flex-1 w-full flex flex-col gap-12">
            <div className="w-full">
                <div className="relative ml-auto flex-1 md:grow-0">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search by file name"
                        className="w-full rounded-lg bg-background pl-8"
                    />
                </div>
            </div>
            <div className="flex flex-col gap-2 items-start">
                <h2 className="font-bold text-2xl mb-4">My Library</h2>
                <LibraryTable files={files} />
            </div>
        </div>
    );
}
