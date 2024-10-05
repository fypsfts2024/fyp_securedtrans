import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
    request: Request,
    { params }: { params: { fileId: string } }
) {
    const supabase = createClient();

    const { data: fileData, error: fileError } = await supabase
        .from("files")
        .select("*")
        .eq("id", params.fileId)
        .single();

    if (fileError || !fileData) {
        return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const filename = fileData.file_path.split("/").pop();

    // Download file from Supabase storage
    const { data, error: downloadError } = await supabase.storage
        .from(fileData.user_id)
        .download(filename);

    if (downloadError) {
        console.error("Error downloading file:", downloadError);
        return NextResponse.json(
            { error: "File download failed" },
            { status: 500 }
        );
    }

    // Set appropriate headers
    const headers = new Headers();
    headers.set(
        "Content-Disposition",
        `attachment; filename="${fileData.file_name}"`
    );
    headers.set("Content-Type", "application/octet-stream");

    // Return file content
    return new NextResponse(data, {
        status: 200,
        headers,
    });
}
