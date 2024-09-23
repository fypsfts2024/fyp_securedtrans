import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function PUT(
    request: Request,
    { params }: { params: { fileId: string } }
) {
    const supabase = createClient();

    try {
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json(
                { error: "User not authenticated" },
                { status: 401 }
            );
        }

        // Parse the multipart form data
        const formData = await request.formData();
        const file = formData.get("file") as File;
        const fileId = params.fileId;

        if (!file || !fileId) {
            return NextResponse.json(
                { error: "File or file ID missing" },
                { status: 400 }
            );
        }

        // Convert file to a Blob (or ArrayBuffer) for VirusTotal scan
        const fileArrayBuffer = await file.arrayBuffer();
        const fileBlob = new Blob([fileArrayBuffer], { type: file.type });

        // Scan the file with VirusTotal
        const vtFormData = new FormData();
        vtFormData.append("file", fileBlob, file.name);

        const vtResponse = await fetch(
            "https://www.virustotal.com/api/v3/files",
            {
                method: "POST",
                headers: {
                    accept: "application/json",
                    "x-apikey": process.env.VIRUSTOTAL_API_KEY || "",
                },
                body: vtFormData,
            }
        );

        const vtResult = await vtResponse.json();

        if (!vtResponse.ok) {
            console.error("VirusTotal scan error:", vtResult);
            return NextResponse.json(
                { error: "Error scanning file with VirusTotal" },
                { status: 500 }
            );
        }

        const analysisUrl = vtResult.data.links.self;

        // Query the analysis result (VirusTotal scan is asynchronous)
        const analysisResponse = await fetch(analysisUrl, {
            method: "GET",
            headers: {
                accept: "application/json",
                "x-apikey": process.env.VIRUSTOTAL_API_KEY || "",
            },
        });

        const analysisResult = await analysisResponse.json();

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
            .upload(newFilePath, fileArrayBuffer);

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

        return NextResponse.json(
            {
                message: "File updated and scanned successfully",
                scanResults: analysisResult,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error updating file:", error);
        return NextResponse.json(
            { error: "An error occurred while updating the file" },
            { status: 500 }
        );
    }
}
