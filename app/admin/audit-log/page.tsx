"use client";
import { useAuth } from "@/components/auth-context";
import { createClient } from "@/utils/supabase/client";
import { FormMessage, Message } from "@/components/form-message";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import AuditLogTable from "./components/table";

interface UserProfile {
    username: string;
    email: string;
}

interface File {
    id: string;
    user_profile: UserProfile;
    file_name: string;
    file_path: string;
    status: "active" | "deleted" | "blocked" | "otp_sent";
    pin_attempts: number;
    last_pin_attempt: string;
    created_at: string;
}

interface AuditLog {
    id: string;
    action: string;
    created_at: string;
    file_id: string;
    file: File | null;
    user_id: string;
    user_profile: UserProfile;
}

export default function AuditLog({
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
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!admin) {
            window.location.href = "/admin/sign-in";
        }

        const fetchLogs = async () => {
            const supabase = createClient();

            let query = supabase
                .from("logs")
                .select(`*, user_profile(*), file:files(*)`);

            if (searchParams.search) {
                query = query.ilike("file.file_name", `%${searchParams.search}%`);
            }

            const { data, error } = await query;

            if (error) {
                console.error("Error fetching logs:", error);
                setError("Error fetching logs. Please try again.");
            } else {
                setLogs(data as AuditLog[] || []);
            }

            setLoading(false);
        };

        fetchLogs();
    }, [admin, searchParams.search]);

    return (
        <div className="w-full lg:min-w-full flex flex-col gap-12">
            <div className="w-full">
                <form
                    action="/admin/audit-log"
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
                    Audit Log
                </h2>
                {loading ? (
                    <p>Loading...</p>
                ) : error ? (
                    <p className="text-red-500">{error}</p>
                ) : logs.length > 0 ? (
                    <AuditLogTable log={logs} />
                ) : (
                    <p>No logs found</p>
                )}
            </div>
        </div>
    );
}