import { createClient } from "@/utils/supabase/server";
import { InfoIcon } from "lucide-react";
import { redirect } from "next/navigation";
import { PinSetup } from "./components/pin-setup";

export default async function UserPage() {
    const supabase = createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return redirect("/sign-in");
    }

    const { data, error } = await supabase
        .from('user_profile')
        .select('pin')
        .eq('id', user.id)
        .single();

    if (data?.pin === null) {
        return <PinSetup />;
    }

    return (
        <div className="w-full lg:min-w-full flex flex-col gap-12">
            <div className="w-full">
                <div className="bg-accent text-sm p-3 px-5 rounded-md text-foreground flex gap-3 items-center">
                    <InfoIcon size="16" strokeWidth={2} />
                    This is a protected page that you can only see as an
                    authenticated user
                </div>
            </div>
            <div className="flex flex-col gap-2 items-start">
                <h2 className="font-bold text-2xl mb-4">Your user details</h2>
                <pre className="text-xs font-mono p-3 rounded border max-h-32 overflow-auto max-w-full">
                    {JSON.stringify(user, null, 2)}
                </pre>
            </div>
        </div>
    );
}
