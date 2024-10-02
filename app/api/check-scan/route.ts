import { NextResponse } from "next/server";
import { checkVirusTotalAnalysis } from "@/utils/virusTotal";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const scanId = searchParams.get('scanId');

    if (!scanId) {
        return NextResponse.json({ error: "No scan ID provided" }, { status: 400 });
    }

    try {
        const analysisResult = await checkVirusTotalAnalysis(scanId);
        return NextResponse.json(analysisResult);
    } catch (error) {
        console.error("Error checking scan status:", error);
        return NextResponse.json({ error: "An error occurred while checking the scan status" }, { status: 500 });
    }
}