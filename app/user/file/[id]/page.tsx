import Link from "next/link";
import { validateAccessToken } from "@/utils/tokenManagement";
import { createClient } from "@/utils/supabase/server";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical } from "lucide-react";
import DeleteButton from "./components/delete-btn";
import UploadFileDialog from "@/components/upload-file-dialog";

interface FileData {
    id: string;
    file_name: string;
    file_path: string;
    created_at: string;
}

async function fetchFileContent(fileId: string): Promise<FileData | null> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("files")
        .select("*")
        .eq("id", fileId)
        .single();

    if (error) {
        console.error("Error fetching file:", error);
        return null;
    }

    return data as FileData;
}

function renderFileContent(file: FileData): JSX.Element {
    const fileExtension = file.file_path.split(".").pop()?.toLowerCase() || "";

    switch (fileExtension) {
        case "jpg":
        case "jpeg":
        case "png":
        case "gif":
            return (
                <img
                    src={file.file_path}
                    alt={file.file_name}
                    className="w-full"
                />
            );
        case "pdf":
            return (
                <embed
                    src={file.file_path}
                    type="application/pdf"
                    width="100%"
                    height="600px"
                />
            );
        case "xlsx":
        case "xls":
            return (
                <div>
                    <p>
                        This is an Excel file. You can download it using the
                        link below:
                    </p>
                    <a
                        href={file.file_path}
                        download
                        className="text-blue-600 hover:underline"
                    >
                        Download Excel File
                    </a>
                </div>
            );
        case "doc":
        case "docx":
            return (
                <div>
                    <p>
                        This is a Word document. You can download it using the
                        link below:
                    </p>
                    <a
                        href={file.file_path}
                        download
                        className="text-blue-600 hover:underline"
                    >
                        Download Word Document
                    </a>
                </div>
            );
        default:
            return (
                <p>
                    Unsupported file type. You can download the file to view its
                    contents.
                </p>
            );
    }
}

interface FilePageProps {
    params: { id: string };
    searchParams: { [key: string]: string | string[] | undefined };
}

export default async function FilePage({
    params,
    searchParams,
}: FilePageProps): Promise<JSX.Element> {
    const { id } = params;
    const token = searchParams.token;

    if (typeof token === "string" && typeof id === "string") {
        try {
            const validFileId = await validateAccessToken(token);

            if (validFileId === id) {
                const fileData = await fetchFileContent(id);

                if (fileData) {
                    return (
                        <div className="container mx-auto p-4">
                            <div className="flex justify-between">
                                <div>
                                    <h1 className="text-2xl font-bold mb-4">
                                        {fileData.file_name}
                                    </h1>
                                    <p className="mb-4">
                                        Date:{" "}
                                        {new Date(
                                            fileData.created_at
                                        ).toLocaleString()}
                                    </p>
                                </div>
                                <div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger>
                                            <MoreVertical className="h-4 w-4" />
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            <DropdownMenuLabel>
                                                File Actions
                                            </DropdownMenuLabel>
                                            <DropdownMenuItem>
                                                <a
                                                    href={fileData.file_path}
                                                    download
                                                    className="cursor-pointer"
                                                >
                                                    Download
                                                </a>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>
                                                <UploadFileDialog
                                                    action="update"
                                                    fileId={id}
                                                />
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>
                                                <DeleteButton fileId={id} />
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                            <hr className="mb-4" />
                            <div className="p-4 border border-gray-200 rounded-md shadow-md">
                                {renderFileContent(fileData)}
                            </div>
                        </div>
                    );
                }
            }
        } catch (error) {
            console.error("Error validating access token:", error);
        }
    }

    return (
        <div className="flex flex-col items-center justify-center">
            <div className="p-4 bg-red-200 text-red-800 border border-red-400 rounded-md shadow-md mb-4">
                Unauthorized access. Please obtain a valid access link.
            </div>
            <Link href="/user/library">
                <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-300">
                    Go back to library
                </button>
            </Link>
        </div>
    );
}
