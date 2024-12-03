"use client";
import { useAuth } from "@/components/auth-context";
import { createClient } from "@/utils/supabase/client";
import { FormMessage, Message } from "@/components/form-message";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import RecycleBinTable from "./components/table";
import Link from "next/link";

export default function RestoreFile({
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
    const [files, setFiles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!admin) {
            window.location.href = "/admin/sign-in";
        }

        const fetchFiles = async () => {
            const supabase = createClient();

            let query = supabase
                .from("recycle_bin")
                .select(`*, files ( *,user_profile(*) )`)
                .eq("status", "restore_requested")
                .order("deleted_at", { ascending: false }); // 排序：最新删除的在最上面

            if (searchParams.search) {
                query = query.ilike(
                    "files.file_name",
                    `%${searchParams.search}%`
                );
            }

            const { data, error } = await query;

            if (error) {
                console.error("Error fetching recycle bin data:", error);
                setError("Error fetching recycle bin data");
            } else {
                setFiles(data || []);
            }

            setLoading(false);
        };

        fetchFiles();
    }, [admin, searchParams.search]);

    if (admin?.role === "Junior Admin") {
        return (
            <div className="flex flex-col items-center justify-center">
                <div className="p-4 bg-red-200 text-red-800 border border-red-400 rounded-md shadow-md mb-4">
                    You are not authorized to view this page.
                </div>
                <Link href="/admin/sec-admin">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-300">
                        Back to Home
                    </button>
                </Link>
            </div>
        );
    }

    return (
        <div className="w-full lg:min-w-full flex flex-col gap-12">
            <div className="w-full">
                <form
                    action="/admin/prime-admin/manage-admin"
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
                    Restore Files Request
                </h2>
                {loading ? (
                    <p>Loading...</p>
                ) : error ? (
                    <p className="text-red-500">{error}</p>
                ) : files.length > 0 ? (
                    <RecycleBinTable files={files} />
                ) : (
                    <p>No files found.</p>
                )}
            </div>
        </div>
    );
}
