import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const supabase = createClient();

    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get("file") as File;
        const scanResultsString = formData.get("scanResults") as string; // Get scanResults as string
        
        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
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

        // Check if bucket exists, if not create it
        const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
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

        // Update files table
        const { error: fileError } = await supabase.from("files").insert([{
            user_id: user.id,
            file_name: file.name,
            file_path: data.publicUrl,
        }]);

        if (fileError) throw fileError;

        return NextResponse.json({ message: "File stored successfully" }, { status: 200 });

    } catch (error) {
        console.error("Error storing file:", error);
        return NextResponse.json({ error: "An error occurred while storing the file" }, { status: 500 });
    }
}