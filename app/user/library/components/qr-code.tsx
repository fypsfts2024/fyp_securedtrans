import React, { useState, useEffect } from "react";
import QRCode from 'qrcode';

interface QRCodeProps {
    fileId: string;
}

const QRCodeComponent: React.FC<QRCodeProps> = ({ fileId }) => {
    const [qrCode, setQRCode] = useState<string | undefined>(undefined);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const generateQRCode = async () => {
            const downloadUrl = `${process.env.NEXT_PUBLIC_BASE_API_URL}/download/${fileId}`;
            console.log("downloadUrl", downloadUrl);
            try {
                const qrCodeDataUrl = await QRCode.toDataURL(downloadUrl);
                setQRCode(qrCodeDataUrl);
                setLoading(false);
            } catch (err) {
                console.error("Failed to generate QR code:", err);
                setError("Failed to generate QR code");
                setLoading(false);
            }
        };

        generateQRCode();
    }, [fileId]);

    if (loading) {
        return <div className="text-gray-500">Loading...</div>;
    }

    if (error) {
        return <div className="text-red-500">{error}</div>;
    }

    if (!qrCode) {
        return <div className="text-gray-500">No QR code available</div>;
    }

    return (
        <div className="flex flex-col items-center justify-center w-full h-full">
            <img
                src={qrCode}
                alt="QR code for file download"
                className="max-w-full max-h-full mb-4"
            />
            <p className="text-sm text-gray-600">Scan to download the file</p>
        </div>
    );
};

export default QRCodeComponent;