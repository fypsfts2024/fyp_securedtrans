"use client";
import { useAuth } from "@/components/auth-context";
import { createClient } from "@/utils/supabase/client";
import { FormMessage, Message } from "@/components/form-message";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import UnblockFilesTable from "./components/table";

interface File {
    id: string;
    user_profile: {
        username: string;
        email: string;
    };
    file_name: string;
    file_path: string;
    status: "active" | "deleted" | "blocked" | "otp_sent";
    pin_attempts: number;
    last_pin_attempt: string;
    created_at: string;
}

export default function UnblockFiles({
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
    const { admin } = useAuth();
    const [files, setFiles] = useState<File[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!admin) {
            window.location.href = "/admin/sign-in";
        }

        const fetchFiles = async () => {
            const supabase = createClient();

            let query = supabase
                .from("files")
                .select(`*, user_profile(*)`)
                .neq("unblock_otp", null)
                .neq("unblock_otp", "");

            if (searchParams.search) {
                query = query.ilike("file_name", `%${searchParams.search}%`);
            }

            const { data, error } = await query;

            if (error) {
                console.error("Error fetching files:", error);
                setError("Error fetching files. Please try again.");
            } else {
                setFiles(data as File[] || []);
            }

            setLoading(false);
        };

        fetchFiles();
    }, [admin, searchParams.search]);

    return (
        <div className="w-full lg:min-w-full flex flex-col gap-12">
            <div className="w-full">
                <form
                    action="/admin/unblock-files"
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
                <h2 className="font-bold text-2xl mb-4 text-center">
                    Request To Unblock File
                </h2>
                {loading ? (
                    <p>Loading...</p>
                ) : error ? (
                    <p className="text-red-500">{error}</p>
                ) : files.length > 0 ? (
                    <UnblockFilesTable files={files} />
                ) : (
                    <p>No files found</p>
                )}
            </div>
        </div>
    );
}