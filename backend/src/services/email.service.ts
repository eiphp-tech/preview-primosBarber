import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    const data = await resend.emails.send({
      from: "Primos Barber <onboarding@resend.dev>",
      to: [to], // Destinatário
      subject: subject,
      html: html,
    });

    console.log("Email enviado ID:", data.data?.id);
    return data;
  } catch (error) {
    console.error("Erro ao enviar email:", error);
    return null;
  }
};
