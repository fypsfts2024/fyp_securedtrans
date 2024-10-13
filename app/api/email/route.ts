import { EmailTemplate } from "@/components/email-template";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
    const { emailRedirectTo, recipient, generatedOtp, fileId } = await request.json();
    const recipients = Array.isArray(recipient) ? recipient : [recipient];

    try {
        const emailPromises = recipients.map(async (email) => {
            const { data, error } = await resend.emails.send({
                from: "SecuredTrans <noreply@securedtrans.site>",
                to: email,
                subject: "Your Secure File Access OTP",
                react: EmailTemplate({
                    title: "Access Your Secured File",
                    redirectUrl: emailRedirectTo,
                    generatedOtp,
                    fileId
                }),
            });

            if (error) {
                throw new Error(`Failed to send email to ${email}: ${error.message}`);
            }

            return data;
        });

        const results = await Promise.all(emailPromises);

        return new Response(JSON.stringify(results), { status: 201 });
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error }), { status: 500 });
    }
}