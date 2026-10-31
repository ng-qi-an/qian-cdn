import "server-only";
import { Resend } from 'resend';
import { ReactNode } from "react";


const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export default async function sendEmail({destinationEmails, subject, template}: {destinationEmails: string[], subject: string, template: ReactNode}) {
    if (!resend) {
        throw new Error("Resend API key is not set. Please set the RESEND_API_KEY environment variable to send emails.");
    }
    if (!process.env.NOTIFICATION_EMAIL) {
        throw new Error("NOTIFICATION_EMAIL environment variable is not set.");
    }
    if (destinationEmails.length === 0) {
        return;
    }
    const { error } = await resend.batch.send(destinationEmails.map((email)=> ({
        from: `Unified CDN <${process.env.NOTIFICATION_EMAIL}>`,
        to: [email],
        subject: subject,
        react: template,
    })));
    if (error){
        throw new Error(`Error sending email (${error.name}): ${error.message}`);
    }
}