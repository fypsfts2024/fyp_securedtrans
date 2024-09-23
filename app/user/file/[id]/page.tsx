import Link from "next/link";
import { validateAccessToken } from "@/app/api/token/route";

async function fetchFileContent(fileId: string): Promise<string> {
    return `This is the content of file ${fileId}`;
}

export default async function FilePage({ 
    params,
    searchParams 
}: { 
    params: { id: string },
    searchParams: { [key: string]: string | string[] | undefined }
}) {
    const { id } = params;
    const token = searchParams.token;

    if (typeof token === "string" && typeof id === "string") {
        try {
            const validFileId = await validateAccessToken(token);

            if (validFileId === id) {
                const fileContent = await fetchFileContent(id);

                return (
                    <div>
                        <h1>File Content</h1>
                        <p>{fileContent}</p>
                    </div>
                );
            }
        } catch (error) {
            console.error("Error validating access token:", error);
        }
    }

    return (
        <div>
            <div>Unauthorized access. Please obtain a valid access link.</div>
            <Link href="/user/library">Go back to library</Link>
        </div>
    );
}