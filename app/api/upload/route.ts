import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { startVirusTotalScan } from "@/utils/virusTotal";

export async function POST(request: Request) {
    const supabase = createClient();

    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        const scanId = await startVirusTotalScan(file);

        return NextResponse.json({ message: "File scan initiated", scanId }, { status: 202 });
    } catch (error) {
        console.error("Error initiating file scan:", error);
        return NextResponse.json({ error: "An error occurred while initiating the file scan" }, { status: 500 });
    }
}