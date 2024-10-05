"use client"
import { useAuth } from "@/components/auth-context";

export default function PrimaryAdminPage(){
    const { admin } = useAuth();

    if(!admin){
       window.location.href = "/admin/sign-in";
    }

    return (
        <div className="w-full lg:min-w-full flex flex-col gap-12">
            <div className="w-full">
                <div className="bg-accent text-sm p-3 px-5 rounded-md text-foreground flex gap-3 items-center">
                    This is a protected page that you can only see as an admin
                </div>
            </div>
        </div>
    );
}