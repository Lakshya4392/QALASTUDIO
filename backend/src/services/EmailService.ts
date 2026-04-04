import nodemailer from 'nodemailer';

export interface BookingEmailData {
  bookingId: string;
  confirmationCode: string;
  studioName: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: string;
  totalAmount: number;
  userDetails: { fullName: string; email: string; phone: string; company?: string; specialRequirements?: string };
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private fromEmail: string;
  private adminEmail: string;

  constructor() {
    this.fromEmail = process.env.ZOHO_EMAIL || process.env.SMTP_FROM || '';
    this.adminEmail = process.env.ADMIN_EMAIL || process.env.ZOHO_EMAIL || '';

    if (this.fromEmail && process.env.ZOHO_APP_PASSWORD) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.zoho.in',
        port: Number(process.env.SMTP_PORT) || 465,
        secure: true,
        auth: { user: this.fromEmail, pass: process.env.ZOHO_APP_PASSWORD },
        tls: { rejectUnauthorized: false },
      });
    }
  }

  private async send(to: string, subject: string, html: string, text: string) {
    if (!this.transporter) {
      console.warn('Email not configured — skipping send to:', to);
      return { success: false, error: 'Email not configured' };
    }
    try {
      const info = await this.transporter.sendMail({
        from: `"Qala Studios" <${this.fromEmail}>`,
        to, subject, html, text,
      });
      console.log('Email sent:', info.messageId, '→', to);
      return { success: true, messageId: info.messageId };
    } catch (e: any) {
      console.error('Email send failed:', e.message);
      return { success: false, error: e.message };
    }
  }

  // 1. Booking confirmation to USER
  async sendBookingConfirmation(data: BookingEmailData) {
    const subject = `Booking Confirmed — ${data.confirmationCode} | Qala Studios`;
    const html = `
<!DOCTYPE html><html><head><meta charset="utf-8"><style>
body{font-family:Arial,sans-serif;background:#f4f4f4;margin:0;padding:0}
.wrap{max-width:600px;margin:0 auto;background:#fff}
.header{background:#000;color:#fff;padding:32px;text-align:center}
.header h1{margin:0;font-size:28px;letter-spacing:4px}
.header p{margin:8px 0 0;color:#999;font-size:12px;letter-spacing:2px;text-transform:uppercase}
.body{padding:32px}
.code{background:#f4f4f4;border:2px solid #000;padding:20px;text-align:center;margin:24px 0}
.code p{margin:0;font-size:12px;color:#666;text-transform:uppercase;letter-spacing:2px}
.code h2{margin:8px 0 0;font-size:32px;font-family:monospace;letter-spacing:4px}
table{width:100%;border-collapse:collapse;margin:24px 0}
td{padding:12px 0;border-bottom:1px solid #eee;font-size:14px}
td:first-child{color:#666;font-weight:bold;text-transform:uppercase;font-size:11px;letter-spacing:1px;width:40%}
.footer{background:#000;color:#666;padding:24px;text-align:center;font-size:12px}
.footer a{color:#999}
</style></head><body>
<div class="wrap">
  <div class="header">
    <h1>QALA STUDIOS</h1>
    <p>Booking Confirmation</p>
  </div>
  <div class="body">
    <p>Dear <strong>${data.userDetails.fullName}</strong>,</p>
    <p>Your studio booking has been confirmed. Here are your booking details:</p>
    <div class="code">
      <p>Confirmation Code</p>
      <h2>${data.confirmationCode}</h2>
    </div>
    <table>
      <tr><td>Studio</td><td><strong>${data.studioName}</strong></td></tr>
      <tr><td>Date</td><td>${data.date}</td></tr>
      <tr><td>Time</td><td>${data.startTime} – ${data.endTime}</td></tr>
      <tr><td>Duration</td><td>${data.duration}</td></tr>
      <tr><td>Total Amount</td><td><strong>₹${data.totalAmount.toLocaleString('en-IN')}</strong></td></tr>
      <tr><td>Phone</td><td>${data.userDetails.phone}</td></tr>
      ${data.userDetails.company ? `<tr><td>Company</td><td>${data.userDetails.company}</td></tr>` : ''}
      ${data.userDetails.specialRequirements ? `<tr><td>Special Requirements</td><td>${data.userDetails.specialRequirements}</td></tr>` : ''}
    </table>
    <p style="background:#f9f9f9;padding:16px;font-size:13px;color:#555">
      <strong>Important:</strong> Please arrive 15 minutes before your session. 
      Free cancellation up to 48 hours before your booking. 
      Keep this confirmation code for your records.
    </p>
    <p>For any queries, contact us at <a href="mailto:${this.adminEmail}">${this.adminEmail}</a></p>
  </div>
  <div class="footer">
    <p>© 2024 Qala Studios · Mohali, Punjab</p>
    <p>This is an automated confirmation email.</p>
  </div>
</div>
</body></html>`;

    const text = `QALA STUDIOS — BOOKING CONFIRMED\n\nDear ${data.userDetails.fullName},\n\nConfirmation Code: ${data.confirmationCode}\nStudio: ${data.studioName}\nDate: ${data.date}\nTime: ${data.startTime} – ${data.endTime}\nDuration: ${data.duration}\nTotal: ₹${data.totalAmount.toLocaleString('en-IN')}\n\nContact: ${this.adminEmail}`;

    return this.send(data.userDetails.email, subject, html, text);
  }

  // 2. New booking notification to ADMIN
  async sendAdminBookingNotification(data: BookingEmailData) {
    if (!this.adminEmail) return { success: false, error: 'Admin email not set' };
    const subject = `🆕 New Booking — ${data.confirmationCode} | ${data.studioName}`;
    const html = `
<!DOCTYPE html><html><head><meta charset="utf-8"><style>
body{font-family:Arial,sans-serif;background:#f4f4f4;margin:0;padding:0}
.wrap{max-width:600px;margin:0 auto;background:#fff}
.header{background:#000;color:#fff;padding:24px;text-align:center}
.header h1{margin:0;font-size:20px;letter-spacing:3px}
.body{padding:32px}
table{width:100%;border-collapse:collapse;margin:16px 0}
td{padding:10px 0;border-bottom:1px solid #eee;font-size:14px}
td:first-child{color:#666;font-weight:bold;text-transform:uppercase;font-size:11px;letter-spacing:1px;width:40%}
.btn{display:inline-block;background:#000;color:#fff;padding:12px 32px;text-decoration:none;font-weight:bold;font-size:12px;letter-spacing:2px;text-transform:uppercase;margin-top:16px}
</style></head><body>
<div class="wrap">
  <div class="header"><h1>NEW BOOKING RECEIVED</h1></div>
  <div class="body">
    <p>A new booking has been made. Review and confirm below.</p>
    <table>
      <tr><td>Confirmation Code</td><td><strong style="font-family:monospace;font-size:18px">${data.confirmationCode}</strong></td></tr>
      <tr><td>Studio</td><td><strong>${data.studioName}</strong></td></tr>
      <tr><td>Date</td><td>${data.date}</td></tr>
      <tr><td>Time</td><td>${data.startTime} – ${data.endTime}</td></tr>
      <tr><td>Duration</td><td>${data.duration}</td></tr>
      <tr><td>Amount</td><td><strong>₹${data.totalAmount.toLocaleString('en-IN')}</strong></td></tr>
      <tr><td>Customer</td><td>${data.userDetails.fullName}</td></tr>
      <tr><td>Email</td><td><a href="mailto:${data.userDetails.email}">${data.userDetails.email}</a></td></tr>
      <tr><td>Phone</td><td>${data.userDetails.phone}</td></tr>
      ${data.userDetails.company ? `<tr><td>Company</td><td>${data.userDetails.company}</td></tr>` : ''}
      ${data.userDetails.specialRequirements ? `<tr><td>Requirements</td><td>${data.userDetails.specialRequirements}</td></tr>` : ''}
    </table>
    <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin/bookings" class="btn">View in Admin Panel</a>
  </div>
</div>
</body></html>`;

    const text = `NEW BOOKING\n\nCode: ${data.confirmationCode}\nStudio: ${data.studioName}\nDate: ${data.date} ${data.startTime}–${data.endTime}\nCustomer: ${data.userDetails.fullName} | ${data.userDetails.email} | ${data.userDetails.phone}\nAmount: ₹${data.totalAmount}`;
    return this.send(this.adminEmail, subject, html, text);
  }

  // 3. Booking approved/status change to USER
  async sendStatusUpdateEmail(data: BookingEmailData, status: string) {
    const statusMessages: Record<string, { subject: string; message: string; color: string }> = {
      CONFIRMED: { subject: `✅ Booking Approved — ${data.confirmationCode}`, message: 'Your booking has been approved by our team. We look forward to seeing you!', color: '#16a34a' },
      CANCELLED: { subject: `❌ Booking Cancelled — ${data.confirmationCode}`, message: 'Your booking has been cancelled. If you have any questions, please contact us.', color: '#dc2626' },
      COMPLETED: { subject: `⭐ Thank You — ${data.confirmationCode}`, message: 'Your session is complete. Thank you for choosing Qala Studios! We hope to see you again.', color: '#2563eb' },
    };

    const info = statusMessages[status];
    if (!info) return { success: false, error: 'Unknown status' };

    const html = `
<!DOCTYPE html><html><head><meta charset="utf-8"><style>
body{font-family:Arial,sans-serif;background:#f4f4f4;margin:0;padding:0}
.wrap{max-width:600px;margin:0 auto;background:#fff}
.header{background:#000;color:#fff;padding:32px;text-align:center}
.header h1{margin:0;font-size:24px;letter-spacing:4px}
.status{background:${info.color};color:#fff;padding:16px;text-align:center;font-weight:bold;font-size:16px;letter-spacing:2px;text-transform:uppercase}
.body{padding:32px}
table{width:100%;border-collapse:collapse;margin:16px 0}
td{padding:10px 0;border-bottom:1px solid #eee;font-size:14px}
td:first-child{color:#666;font-weight:bold;text-transform:uppercase;font-size:11px;letter-spacing:1px;width:40%}
.footer{background:#000;color:#666;padding:24px;text-align:center;font-size:12px}
</style></head><body>
<div class="wrap">
  <div class="header"><h1>QALA STUDIOS</h1></div>
  <div class="status">${status}</div>
  <div class="body">
    <p>Dear <strong>${data.userDetails.fullName}</strong>,</p>
    <p>${info.message}</p>
    <table>
      <tr><td>Confirmation Code</td><td><strong style="font-family:monospace">${data.confirmationCode}</strong></td></tr>
      <tr><td>Studio</td><td>${data.studioName}</td></tr>
      <tr><td>Date</td><td>${data.date}</td></tr>
      <tr><td>Time</td><td>${data.startTime} – ${data.endTime}</td></tr>
      <tr><td>Amount</td><td>₹${data.totalAmount.toLocaleString('en-IN')}</td></tr>
    </table>
    <p>Questions? Contact us at <a href="mailto:${this.adminEmail}">${this.adminEmail}</a></p>
  </div>
  <div class="footer"><p>© 2024 Qala Studios · Mohali, Punjab</p></div>
</div>
</body></html>`;

    const text = `QALA STUDIOS — Booking ${status}\n\nDear ${data.userDetails.fullName},\n\n${info.message}\n\nCode: ${data.confirmationCode}\nStudio: ${data.studioName}\nDate: ${data.date}`;
    return this.send(data.userDetails.email, info.subject, html, text);
  }
}

export const emailService = new EmailService();
