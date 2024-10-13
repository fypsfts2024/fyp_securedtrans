"use client";
import { useAuth } from "@/components/auth-context";
import RestoreTable from "../components/restore-files";
import UnblockTable from "../components/unblock-files";
import AuditLogTable from "../components/audit-log";
import AdminTable from "../components/admin-info";

export default function PrimaryAdminPage() {
    const { admin } = useAuth();

    if (!admin) {
        window.location.href = "/admin/sign-in";
    }

    return (
        <div className="w-full lg:min-w-full flex flex-col gap-12">
            <div className="w-full">
                <div className="grid grid-cols-2 gap-5">
                    <div className="border border-zinc-600 rounded-lg p-4">
                        <RestoreTable />
                    </div>
                    <div className="border border-zinc-600 rounded-lg p-4">
                        <UnblockTable />
                    </div>
                    <div className="border border-zinc-600 rounded-lg p-4">
                        <AuditLogTable />
                    </div>
                    <div className="border border-zinc-600 rounded-lg p-4">
                        <AdminTable />
                    </div>
                </div>
            </div>
        </div>
    );
}