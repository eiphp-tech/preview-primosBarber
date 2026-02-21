import { Resend } from "resend";

export class NotificationService {
  private resend: Resend;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  async sendBookingPending(
    clientName: string,
    clientEmail: string,
    date: Date,
  ) {
    const formattedDate = date.toLocaleString("pt-BR", {
      timeZone: "America/Sao_Paulo",
    });

    try {
      await this.resend.emails.send({
        from: "Primos Barber <onboarding@resend.dev>",
        to: [clientEmail],
        subject: "⏳ Solicitação de Agendamento Recebida",
        html: `
          <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #d97706;">Solicitação em Análise</h2>
            <p>Olá, <strong>${clientName}</strong>.</p>
            <p>Recebemos seu pedido de agendamento para:</p>
            
            <div style="background: #fffbeb; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 5px solid #d97706;">
              <p style="margin: 5px 0; color: #92400e;">📅 <strong>Data:</strong> ${formattedDate}</p>
              <p style="margin: 5px 0; color: #92400e;">⚠️ <strong>Status:</strong> Pendente de Aprovação</p>
            </div>
            
            <p>Assim que o barbeiro confirmar, você receberá outro e-mail com a aprovação final.</p>
          </div>
        `,
      });
      console.log(`✅ [Resend] Pendente enviado para cliente: ${clientEmail}`);
    } catch (error) {
      console.error("❌ [Resend] Erro ao enviar pendente:", error);
    }
  }

  async sendNewBookingNotification(
    barberName: string,
    barberEmail: string,
    clientName: string,
    date: Date,
    bookingId: string,
  ) {
    const formattedDate = date.toLocaleString("pt-BR", {
      timeZone: "America/Sao_Paulo",
    });

    // Link fictício para o painel (futuramente será o link real do seu app)
    const approveLink = "http://localhost:3000/dashboard";

    try {
      await this.resend.emails.send({
        from: "Primos Barber <onboarding@resend.dev>",
        to: [barberEmail],
        subject: "🔔 Ação Necessária: Novo Agendamento",
        html: `
          <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #000;">Nova Solicitação!</h2>
            <p>Olá, <strong>${barberName}</strong>.</p>
            <p>O cliente <strong>${clientName}</strong> quer agendar um horário.</p>
            
            <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 5px 0;">📅 <strong>${formattedDate}</strong></p>
            </div>
            
            <p>Por favor, acesse o painel para aprovar ou recusar:</p>
            <a href="${approveLink}" style="background-color: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Acessar Painel</a>
          </div>
        `,
      });
      console.log(
        `✅ [Resend] Notificação enviada para barbeiro: ${barberEmail}`,
      );
    } catch (error) {
      console.error("❌ [Resend] Erro ao enviar para barbeiro:", error);
    }
  }

  async sendBookingConfirmation(
    clientName: string,
    clientEmail: string,
    date: Date,
  ) {
    const formattedDate = date.toLocaleString("pt-BR", {
      timeZone: "America/Sao_Paulo",
    });

    try {
      await this.resend.emails.send({
        from: "Primos Barber <onboarding@resend.dev>",
        to: [clientEmail],
        subject: "✅ Agendamento Aprovado!",
        html: `
          <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #16a34a;">Tudo Certo!</h2>
            <p>Olá, <strong>${clientName}</strong>.</p>
            <p>O barbeiro aprovou seu horário. Seu visual está garantido.</p>
            
            <div style="background: #dcfce7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 5px solid #16a34a;">
              <p style="margin: 5px 0; color: #14532d;">📅 <strong>${formattedDate}</strong></p>
              <p style="margin: 5px 0; color: #14532d;">📍 <strong>Primos Barber Shop</strong></p>
            </div>
            
            <p>Te esperamos lá!</p>
          </div>
        `,
      });
      console.log(
        `✅ [Resend] Confirmação enviada para cliente: ${clientEmail}`,
      );
    } catch (error) {
      console.error("❌ [Resend] Erro ao enviar confirmação:", error);
    }
  }

  async sendReminder(clientName: string, clientEmail: string, date: Date) {
    const formattedDate = date.toLocaleString("pt-BR", {
      timeZone: "America/Sao_Paulo",
    });
    try {
      await this.resend.emails.send({
        from: "Primos Barber <onboarding@resend.dev>",
        to: [clientEmail],
        subject: "⏰ Lembrete: Seu corte é amanhã!",
        html: `
          <div style="font-family: sans-serif; color: #333;">
            <h2>Não esqueça o horário!</h2>
            <p>Oi <strong>${clientName}</strong>, seu corte é amanhã: <strong>${formattedDate}</strong></p>
          </div>
        `,
      });
      console.log(`✅ [Resend] Lembrete enviado para: ${clientEmail}`);
    } catch (error) {
      console.error("❌ [Resend] Erro ao enviar lembrete:", error);
    }
  }
}
