export const startVirusTotalScan = async (file: File) => {
    const fileArrayBuffer = await file.arrayBuffer();
    const fileBlob = new Blob([fileArrayBuffer], { type: file.type });

    const vtFormData = new FormData();
    vtFormData.append("file", fileBlob, file.name);

    const vtResponse = await fetch("https://www.virustotal.com/api/v3/files", {
        method: "POST",
        headers: {
            accept: "application/json",
            "x-apikey": process.env.VIRUSTOTAL_API_KEY || "",
        },
        body: vtFormData,
    });

    const vtResult = await vtResponse.json();

    if (!vtResponse.ok) {
        throw new Error("Error scanning file with VirusTotal");
    }

    return vtResult.data.id;
}

export const checkVirusTotalAnalysis = async (scanId: string) => {
    const analysisUrl = `https://www.virustotal.com/api/v3/analyses/${scanId}`;
    const analysisResponse = await fetch(analysisUrl, {
        method: "GET",
        headers: {
            accept: "application/json",
            "x-apikey": process.env.VIRUSTOTAL_API_KEY || "",
        },
    });

    return await analysisResponse.json();
}