"use server";

import { createClient } from "@/utils/supabase/server";

export const validatePinAction = async (pin: string) => {
    const supabase = createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    const { error, data } = await supabase
        .from("user_profile")
        .select("pin")
        .eq("id", user?.id)
        .single();

    if (error) {
        console.error("Error validating pin:", error);
        return false;
    }

    return data.pin === pin;
};