import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
    request: Request,
    { params }: { params: { fileId: string } }
) {
    const supabase = createClient();

    const { data, error } = await supabase
        .from("files")
        .select("file_path, file_name")
        .eq("id", params.fileId)
        .single();

    if (error || !data) {
        return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const headers = new Headers();
    headers.set(
        "Content-Disposition",
        `attachment; filename="${data.file_name}"`
    );
    headers.set("Content-Type", "application/octet-stream");

    return new NextResponse(data.file_path, {
        status: 200,
        headers,
    });
}
