"use server";

import { encodedRedirect } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";

export const updateProfileAction = async (formData: FormData) => {
    const {
        data: { user },
    } = await createClient().auth.getUser();
    const supabase = createClient();
    const username = formData.get("username") as string;
    const phone = formData.get("phone") as string;
    const website = formData.get("website") as string;
    const address = formData.get("address") as string;
    const avatarFile = formData.get("avatar") as File | null;
    const acc_status = formData.get("acc-status") as string;
    const last_updated = new Date().toISOString();

    let avatar_url: string | null = null;

    if (avatarFile && avatarFile.size > 0) {
        const fileBuffer = await avatarFile.arrayBuffer();
        const fileName = `avatar_${user?.id}_${Date.now()}${avatarFile.name.substring(avatarFile.name.lastIndexOf('.'))}`;

        const { data: fileData, error: fileError } = await supabase.storage
            .from("avatars")
            .upload(fileName, fileBuffer, {
                contentType: avatarFile.type,
                upsert: true,
            });

        if (fileError) {
            console.error(fileError.message);
            return encodedRedirect("error", "/user/profile", fileError.message);
        }

        const { data } = supabase.storage
            .from("avatars")
            .getPublicUrl(fileName);
        avatar_url = data.publicUrl;
    }

    const updateData: {
        username: string;
        phone: string;
        website: string;
        address: string;
        avatar?: string;
        account_status: string;
        last_updated: string;
    } = {
        username: username,
        phone: phone,
        website: website,
        address: address,
        account_status: acc_status,
        last_updated: last_updated,
    };

    if (avatar_url) {
        updateData["avatar"] = avatar_url;
    }

    const { error, data: updateProfileData } = await supabase
        .from("user_profile")
        .update(updateData)
        .eq("id", user?.id);

    if (error) {
        console.error(`Error: ${error.code} - ${error.message}`);
        return encodedRedirect("error", "/user/profile", error.message);
    }

    return encodedRedirect(
        "success",
        "/user/profile",
        "Profile updated successfully!"
    );
};
