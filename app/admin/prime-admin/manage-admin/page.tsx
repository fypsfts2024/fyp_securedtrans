"use client";
import { useAuth } from "@/components/auth-context";
import { createClient } from "@/utils/supabase/client";
import { FormMessage, Message } from "@/components/form-message";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddAdminDialog } from "./components/add-admin-dialog";
import AdminTable from "./components/table";

export default function ManageAdmin({
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
    const [admins, setAdmins] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!admin) {
            window.location.href = "/admin/sign-in";
        }

        const fetchAdmins = async () => {
            const supabase = createClient();

            let query = supabase.from("admin").select("*").neq("role", "Admin");

            if (searchParams.search) {
                query = query.ilike("username", `%${searchParams.search}%`);
            }

            const { data, error } = await query;

            if (error) {
                console.error("Error fetching admin data:", error);
                setError("Error fetching admin data");
            } else {
                setAdmins(data || []);
            }

            setLoading(false);
        };

        fetchAdmins();
    }, [admin, searchParams.search]);

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
                    Manage Secondary Admin
                </h2>
                {loading ? (
                    <p>Loading...</p>
                ) : error ? (
                    <p className="text-red-500">{error}</p>
                ) : admins.length > 0 ? (
                    <AdminTable admins={admins} />
                ) : (
                    <p>No secondary admins found.</p>
                )}

                <AddAdminDialog />
            </div>
        </div>
    );
}
