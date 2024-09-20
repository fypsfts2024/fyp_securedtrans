"use server"

import { encodedRedirect } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";

export const updatePinAction = async (pin: String) => {
    const supabase = createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    // Update user profile with new PIN
    const { error, data } = await supabase
        .from('user_profile')
        .update({ pin: pin })
        .eq('id', user?.id);

    if (error) {
        console.error(`Error: ${error.message}`);
        return encodedRedirect("error", "/user", error.message);
    }

    // Redirect to user profile page
    return encodedRedirect("success", "/user", "PIN updated successfully.");
};