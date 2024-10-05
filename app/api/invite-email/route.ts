import { InviteEmailTemplate } from "@/components/email-template";
import { Resend } from "resend";
import { createClient } from "@/utils/supabase/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
    const supabase = createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return new Response(JSON.stringify({ error: "User not found" }), {
            status: 404,
        });
    }

    const sender = user.email;
    const { emailRedirectTo, recipient, fileId } = await request.json();

    const recipients: string[] = Array.isArray(recipient)
        ? recipient
        : [recipient];

    try {
        const emailPromises = recipients.map(async (userId: string) => {
            const { data: user, error: userError } = await supabase
                .from("user_profile")
                .select("*")
                .eq("id", userId)
                .single();

            if (userError || !user) {
                throw new Error(`User not found: ${userId}`);
            }

            const recipientEmail = user.email;

            const { data, error } = await resend.emails.send({
                from: "SecuredTrans <noreply@securedtrans.site>",
                to: recipientEmail as string,
                subject: "You have been invited to access a secure file",
                react: InviteEmailTemplate({
                    sender: sender as string,
                    title: "Access Your Secured File",
                    redirectUrl: emailRedirectTo,
                    fileId,
                }),
            });

            if (error) {
                throw new Error(
                    `Failed to send email to ${recipientEmail}: ${error.message}`
                );
            }

            return data;
        });

        const results = await Promise.all(emailPromises);

        return new Response(JSON.stringify(results), { status: 201 });
    } catch (error: any) {
        console.error("Email sending error:", error);
        return new Response(
            JSON.stringify({
                error: "Failed to send invitation emails. Please try again later.",
            }),
            { status: 500 }
        );
    }
}
