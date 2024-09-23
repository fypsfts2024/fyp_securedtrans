"use client"
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
import { X } from "lucide-react";
import { toast  } from "@/hooks/use-toast"

interface FileWithPreview extends FileWithPath {
    preview: string;
}

interface UploadFileDialogProps {
    action: "upload" | "update";
    fileId?: string;
}

const UploadFileDialog: React.FC<UploadFileDialogProps> = ({ action, fileId }) => {
    const [files, setFiles] = useState<FileWithPreview[]>([]);
    const [uploading, setUploading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        setFiles(
            acceptedFiles.map((file) =>
                Object.assign(file, {
                    preview: URL.createObjectURL(file),
                })
            ) as FileWithPreview[]
        );
    }, []);

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

        try {
            for (const file of files) {
                const formData = new FormData();
                formData.append("file", file);

                const apiUrl =
                action === "upload"
                    ? `${process.env.NEXT_PUBLIC_BASE_API_URL}/upload`
                    : `${process.env.NEXT_PUBLIC_BASE_API_URL}/files/${fileId}/update`; 

                const res = await fetch(apiUrl, {
                    method: action === "upload" ? "POST" : "PUT",
                    body: formData,
                });

                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(
                        errorData.error ||
                            "An error occurred while uploading the file"
                    );
                }
            }

            setUploading(false);
            setFiles([]);

            toast({
                title: "Upload successful!",
                description: "Your files have been uploaded successfully.",
            });

            window.location.href = "/user/library";
        } catch (error: any) {
            setUploading(false);
            setError(error.message || "An error occurred");

            toast({
                title: "Upload failed",
                description: error.message || "An error occurred during upload.",
                variant: "destructive",
            });
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                {action === "upload" ? (
                    <Button variant="outline">Upload File</Button>
                ) : (
                    <Button variant="ghost" className="p-0" onClick={(event) => { event.stopPropagation(); }}>Update</Button>
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
                {error && (
                    <p className="text-red-500 mt-4 text-sm">{error}</p>
                )}
                <Button
                    onClick={uploadFiles}
                    disabled={files.length === 0 || uploading}
                    className="w-full mt-4"
                >
                    {uploading ? "Uploading..." : "Upload"}
                </Button>
            </DialogContent>
        </Dialog>
    );
};

export default UploadFileDialog;
