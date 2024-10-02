import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const supabase = createClient();

    try {
        // Get the current user
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

        if (!file) {
            return NextResponse.json(
                { error: "No file uploaded" },
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
        console.log("VirusTotal analysis result:", analysisResult);

        // Check if bucket exists, if not create it
        const { data: buckets, error: bucketError } =
            await supabase.storage.listBuckets();
        if (bucketError) throw bucketError;

        if (!buckets.find((b) => b.name === user.id)) {
            const { error } = await supabase.storage.createBucket(user.id, {
                public: true,
            });
            if (error) throw error;
        }

        const filename = `${Date.now()}_${file.name}`;

        // Upload file to Supabase Storage
        const { error: uploadError } = await supabase.storage
            .from(user.id)
            .upload(filename, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
            .from(user.id)
            .getPublicUrl(filename);

        //update files table
        const { error: fileError } = await supabase.from("files").insert([
            {
                user_id: user.id,
                file_name: file.name,
                file_path: data.publicUrl,
            },
        ]);

        if (fileError) throw fileError;

        return NextResponse.json(
            {
                message: "File uploaded and scanned successfully",
                scanResults: analysisResult,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error processing file:", error);
        return NextResponse.json(
            { error: "An error occurred while processing the file" },
            { status: 500 }
        );
    }
}
