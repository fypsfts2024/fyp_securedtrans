"use client";
import React, { useState, useCallback } from "react";
import { useDropzone, FileWithPath } from "react-dropzone";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { X } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface FileWithPreview extends FileWithPath {
    preview: string;
}

interface UploadFileDialogProps {
    action: "upload" | "update";
    fileId?: string;
}

const UploadFileDialog: React.FC<UploadFileDialogProps> = ({
    action,
    fileId,
}) => {
    const [files, setFiles] = useState<FileWithPreview[]>([]);
    const [uploading, setUploading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [progress, setProgress] = useState<number>(0);
    const [statusText, setStatusText] = useState<string>("");

    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            if (action === "update" && acceptedFiles.length > 1) {
                setError("Only one file can be selected in update mode.");
                return;
            }
            setFiles(
                acceptedFiles
                    .slice(0, action === "update" ? 1 : undefined)
                    .map((file) =>
                        Object.assign(file, {
                            preview: URL.createObjectURL(file),
                        })
                    ) as FileWithPreview[]
            );
            setError(null);
        },
        [action]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
    });

    const removeFile = (file: FileWithPreview) => {
        const newFiles = [...files];
        newFiles.splice(newFiles.indexOf(file), 1);
        setFiles(newFiles);
    };

    const uploadFiles = async () => {
        setUploading(true);
        setError(null);
        setProgress(0);
        setStatusText("Initiating upload...");

        try {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const formData = new FormData();
                formData.append("file", file);

                setStatusText(
                    `Uploading file ${i + 1} of ${files.length}: ${file.name}`
                );

                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_BASE_API_URL}/upload`,
                    {
                        method: "POST",
                        body: formData,
                    }
                );

                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(
                        errorData.error ||
                            "An error occurred while uploading the file"
                    );
                }

                const data = await res.json();

                if (data.scanId) {
                    await pollScanStatus(data.scanId, file);
                }

                setProgress(((i + 1) / files.length) * 100);
            }

            setUploading(false);
            setFiles([]);
            setStatusText("Upload completed successfully!");

            toast({
                title: "Upload successful!",
                description:
                    "Your files have been uploaded and scanned successfully.",
            });

            setTimeout(() => {
                window.location.href = "/user/library";
            }, 2000);
        } catch (error: any) {
            setUploading(false);
            setError(error.message || "An error occurred");
            setStatusText("Upload failed");

            toast({
                title: "Upload failed",
                description:
                    error.message || "An error occurred during upload.",
                variant: "destructive",
            });
        }
    };

    const pollScanStatus = async (scanId: string, file: FileWithPreview) => {
        let scanCompleted = false;
        while (!scanCompleted) {
            setStatusText(`Scanning file: ${file.name}`);
            await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds between checks
            const checkResponse = await fetch(
                `${process.env.NEXT_PUBLIC_BASE_API_URL}/check-scan?scanId=${scanId}`
            );
            const scanResults = await checkResponse.json();
            scanCompleted = scanResults.data.attributes.status === "completed";

            if (scanCompleted) {
                if (scanResults.data.attributes.stats.malicious === 0) {
                    setStatusText(`File ${file.name} scanned and deemed safe.`);
                    await storeFile(file, scanResults);
                } else {
                    throw new Error(`File ${file.name} deemed unsafe.`);
                }
            }
        }
    };

    const storeFile = async (file: FileWithPreview, scanResults: any) => {
        setStatusText(`Storing file: ${file.name}`);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("scanResults", JSON.stringify(scanResults));

        const apiUrl =
            action === "upload"
                ? `${process.env.NEXT_PUBLIC_BASE_API_URL}/store-file`
                : `${process.env.NEXT_PUBLIC_BASE_API_URL}/store-file/${fileId}/update`;

        const storeResponse = await fetch(apiUrl, {
            method: action === "upload" ? "POST" : "PUT",
            body: formData,
        });

        if (!storeResponse.ok) {
            throw new Error(`Failed to store file: ${file.name}`);
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                {action === "upload" ? (
                    <Button variant="outline">Upload File</Button>
                ) : (
                    <Button
                        variant={"ghost"}
                        className="px-2 w-full justify-start"
                        onClick={(event) => {
                            event.stopPropagation();
                        }}
                    >
                        Update
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Upload File</DialogTitle>
                    <DialogDescription>
                        Drag and drop files here or click to select files
                    </DialogDescription>
                </DialogHeader>
                <div
                    {...getRootProps()}
                    className={`p-10 border-2 border-dashed rounded-lg text-center cursor-pointer ${isDragActive ? "border-primary" : "border-gray-300"}`}
                >
                    <input {...getInputProps()} />
                    {isDragActive ? (
                        <p>Drop the files here ...</p>
                    ) : (
                        <p>
                            Drag 'n' drop some files here, or click to select
                            files
                        </p>
                    )}
                </div>
                {files.length > 0 && (
                    <div className="mt-4">
                        <h4 className="text-sm font-medium">Selected Files:</h4>
                        <ul className="mt-2 space-y-2">
                            {files.map((file) => (
                                <li
                                    key={file.name}
                                    className="flex items-center justify-between text-sm"
                                >
                                    <span className="truncate">
                                        {file.name}
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeFile(file)}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                {uploading && (
                    <div className="mt-4">
                        <Progress value={progress} className="w-full" />
                        <p className="text-sm text-center mt-2">{statusText}</p>
                    </div>
                )}
                {error && <p className="text-red-500 mt-4 text-sm">{error}</p>}
                <Button
                    onClick={uploadFiles}
                    disabled={files.length === 0 || uploading}
                    className="w-full mt-4"
                >
                    {uploading ? "Processing..." : "Upload"}
                </Button>
            </DialogContent>
        </Dialog>
    );
};

export default UploadFileDialog;
