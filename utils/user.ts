import { createClient } from "@/utils/supabase/server";

export const getCurrentUser = async () => {
    const supabase = createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("No user is logged in");
    }

    return user;
};