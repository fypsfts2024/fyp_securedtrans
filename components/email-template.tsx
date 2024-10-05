import * as React from 'react';

interface InviteEmailTemplateProps {
    sender: string;
    title: string;
    redirectUrl: string;
    fileId: string;
}

interface EmailTemplateProps {
    title: string;
    redirectUrl: string;
    generatedOtp: string;
    fileId: string;
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
    title, redirectUrl, generatedOtp, fileId
}) => (
    <div style={{ fontFamily: 'Arial, sans-serif', color: '#333' }}>
        <h2 style={{ color: '#4A90E2' }}>{title}</h2>
        <p>Hello,</p>
        <p>
            You have requested access to a secure file. Please use the following one-time password (OTP) to access the file:
        </p>
        <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#FF0000' }}>
            {generatedOtp}
        </p>
        <p>
            Click the button below to access the file (ID: {fileId}).
        </p>
        <a href={redirectUrl} style={{
            display: 'inline-block',
            padding: '10px 20px',
            backgroundColor: '#4A90E2',
            color: '#fff',
            textDecoration: 'none',
            borderRadius: '5px'
        }}>
            Access Secure File
        </a>
        <p>
            If you did not request access to this file, please ignore this email.
        </p>
        <p>
            Best regards,<br />
            SecuredTrans Team
        </p>
    </div>
);

export const InviteEmailTemplate: React.FC<Readonly<InviteEmailTemplateProps>> = ({
    sender, title, redirectUrl,fileId
}) => (
    <div style={{ fontFamily: 'Arial, sans-serif', color: '#333' }}>
        <h2 style={{ color: '#4A90E2' }}>{title}</h2>
        <p>Hello,</p>
        <p>
            You have been invited to access a secure file by {sender}.
        </p>
        <p>
            Click the button below to access the file (ID: {fileId}).
        </p>
        <a href={redirectUrl} style={{
            display: 'inline-block',
            padding: '10px 20px',
            backgroundColor: '#4A90E2',
            color: '#fff',
            textDecoration: 'none',
            borderRadius: '5px'
        }}>
            Access Secure File
        </a>
        <p>
            Best regards,<br />
            SecuredTrans Team
        </p>
    </div>
);