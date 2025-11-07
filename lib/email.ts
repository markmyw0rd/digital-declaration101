import { Resend } from "resend";
const resend = new Resend(process.env.RESEND_API_KEY!);

export async function sendMagicLink(to: string, url: string, role: string){
  await resend.emails.send({
    from: "noreply@your-domain",
    to, subject: `Your ${role} link`,
    html: `<p>Click to continue: <a href="${url}">${url}</a></p>`
  });
}
