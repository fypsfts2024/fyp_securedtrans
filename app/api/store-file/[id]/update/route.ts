import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    const supabase = createClient();

    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
        }

        // Parse the multipart form data
        const formData = await request.formData();
        const file = formData.get("file") as File;
        const scanResultsString = formData.get("scanResults") as string; 

        const fileId = params.id;

        if (!file || !fileId) {
            return NextResponse.json(
                { error: "File or file ID missing" },
                { status: 400 }
            );
        }

        if (!scanResultsString) {
            return NextResponse.json({ error: "No scan results provided" }, { status: 400 });
        }

        // Parse scanResults from string to JSON
        let scanResults;
        try {
            scanResults = JSON.parse(scanResultsString);
        } catch (error) {
            return NextResponse.json({ error: "Invalid scan results format" }, { status: 400 });
        }

        // Check scanResults properties after parsing
        if (scanResults.data.attributes.status !== "completed") {
            return NextResponse.json({ error: "Scan not completed" }, { status: 400 });
        }

        const isSafe = scanResults.data.attributes.stats.malicious === 0;

        if (!isSafe) {
            return NextResponse.json({ error: "File deemed unsafe" }, { status: 400 });
        }

        // Fetch existing file information from Supabase
        const { data: existingFile, error: fileError } = await supabase
            .from("files")
            .select("*")
            .eq("id", fileId)
            .single();

        if (fileError || !existingFile) {
            return NextResponse.json(
                {
                    error: "File not found or unable to retrieve file information",
                },
                { status: 404 }
            );
        }

        const filePath = existingFile.file_path.split('/').pop();
        // Remove the old file from Supabase Storage if required
        const { error: deleteError } = await supabase.storage
            .from(user.id)
            .remove([filePath]);

        if (deleteError) {
            console.error("Error deleting old file:", deleteError);
            return NextResponse.json(
                { error: "Failed to delete the old file" },
                { status: 500 }
            );
        }

        // Upload new file to Supabase Storage
        const newFilePath = `${Date.now()}_${file.name}`;
        const { error: uploadError } = await supabase.storage
            .from(user.id)
            .upload(newFilePath, file);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
            .from(user.id)
            .getPublicUrl(newFilePath);

        // Update the `files` table with the new file details
        const { error: updateError } = await supabase
            .from("files")
            .update({
                file_name: file.name,
                file_path: publicUrlData.publicUrl,
            })
            .eq("id", fileId);

        if (updateError) throw updateError;

        return NextResponse.json({ message: "File updated and scanned successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error updating file:", error);
        return NextResponse.json(
            { error: "An error occurred while updating the file" },
            { status: 500 }
        );
    }
}
