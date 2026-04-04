import nodemailer from 'nodemailer';
import { PrismaClient } from '@prisma/client';

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  retryable: boolean;
}

export interface BookingEmailData {
  bookingId: string;
  confirmationNumber: string;
  studioName: string;
  date: string;
  time: string;
  duration: string;
  totalCost: string;
  userDetails: {
    fullName: string;
    email: string;
    phone: string;
    company?: string;
  };
}

export class ZohoEmailService {
  private transporter: nodemailer.Transporter;
  private prisma: PrismaClient;
  private maxRetries = 3;
  private retryDelays = [1000, 5000, 15000]; // ms

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;

    // Validate required environment variables
    const requiredEnvVars = ['ZOHO_EMAIL', 'ZOHO_APP_PASSWORD'];
    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        throw new Error(`${envVar} environment variable is required`);
      }
    }

    // Optional: Studio email from address (defaults to ZOHO_EMAIL if not set)
    const fromEmail = process.env.STUDIO_EMAIL_FROM || process.env.ZOHO_EMAIL;
    const fromName = process.env.STUDIO_EMAIL_NAME || 'Qala Studios';

    // Zoho SMTP configuration
    this.transporter = nodemailer.createTransport({
      host: 'smtp.zoho.in',
      port: 465, // SSL port
      secure: true, // Use SSL
      auth: {
        user: process.env.ZOHO_EMAIL,
        pass: process.env.ZOHO_APP_PASSWORD
      },
      // Additional security options
      tls: {
        rejectUnauthorized: true
      }
    });

    // Store from address for use in emails
    (this.transporter as any).fromAddress = `"${fromName}" <${fromEmail}>`;
  }

  async sendConfirmationEmail(bookingData: BookingEmailData): Promise<EmailResult> {
    const emailLog = await this.prisma.emailLog.create({
      data: {
        booking_id: bookingData.bookingId,
        email_type: 'confirmation',
        recipient_email: bookingData.userDetails.email,
        status: 'pending'
      }
    });

    try {
      const { htmlContent, textContent } = this.generateEmailContent(bookingData);

      const fromAddress = (this.transporter as any).fromAddress || 'Qala Studios <noreply@qalastudios.com>';

      const mailOptions = {
        from: fromAddress,
        to: bookingData.userDetails.email,
        subject: `Booking Confirmation - ${bookingData.confirmationNumber}`,
        html: htmlContent,
        text: textContent,
        // Additional headers for better deliverability
        headers: {
          'X-Priority': '1',
          'X-MSMail-Priority': 'High',
          'Importance': 'high'
        }
      };

      const info = await this.transporter.sendMail(mailOptions);
      
      await this.updateEmailLog(emailLog.id, 'sent', info.messageId);
      
      return {
        success: true,
        messageId: info.messageId,
        retryable: false
      };

    } catch (error: any) {
      const errorMessage = error.message || 'Unknown error';
      const isRetryable = this.isRetryableError(error);
      
      await this.updateEmailLog(emailLog.id, 'failed', undefined, errorMessage);
      
      return {
        success: false,
        error: errorMessage,
        retryable: isRetryable
      };
    }
  }

  async retryFailedEmail(emailLogId: string): Promise<EmailResult> {
    const emailLog = await this.prisma.emailLog.findUnique({
      where: { id: emailLogId },
      include: { booking: { include: { user_details: true, studio: true } } }
    });

    if (!emailLog || emailLog.retry_count >= this.maxRetries) {
      return { success: false, error: 'Max retries exceeded', retryable: false };
    }

    await this.prisma.emailLog.update({
      where: { id: emailLogId },
      data: { retry_count: emailLog.retry_count + 1 }
    });

    // Wait for retry delay
    await new Promise(resolve => setTimeout(resolve, this.retryDelays[emailLog.retry_count] || 15000));

    const bookingData: BookingEmailData = {
      bookingId: emailLog.booking.id,
      confirmationNumber: emailLog.booking.id.substring(0, 8).toUpperCase(),
      studioName: emailLog.booking.studio.name,
      date: emailLog.booking.start_datetime.toLocaleDateString(),
      time: emailLog.booking.start_datetime.toLocaleTimeString(),
      duration: `${Math.round((emailLog.booking.end_datetime.getTime() - emailLog.booking.start_datetime.getTime()) / (1000 * 60 * 60))} hours`,
      totalCost: `$${emailLog.booking.total_price}`,
      userDetails: {
        fullName: emailLog.booking.user_details?.full_name || '',
        email: emailLog.booking.user_details?.email || emailLog.recipient_email,
        phone: emailLog.booking.user_details?.phone || '',
        company: emailLog.booking.user_details?.company || undefined
      }
    };

    return this.sendConfirmationEmail(bookingData);
  }

  private generateEmailContent(data: BookingEmailData): { htmlContent: string; textContent: string } {
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Booking Confirmation</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1a1a1a; color: white; padding: 20px; text-align: center; }
        .logo { font-size: 24px; font-weight: bold; }
        .content { padding: 30px 20px; background: #f9f9f9; }
        .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
        .detail-label { font-weight: bold; }
        .footer { background: #1a1a1a; color: white; padding: 20px; text-align: center; font-size: 14px; }
        .contact-info { margin: 20px 0; padding: 15px; background: #e8f4f8; border-radius: 5px; }
        @media (max-width: 600px) {
            .container { padding: 10px; }
            .detail-row { flex-direction: column; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">QALA STUDIOS</div>
            <p>Professional Studio Spaces</p>
        </div>
        
        <div class="content">
            <h2>Booking Confirmed!</h2>
            <p>Dear ${data.userDetails.fullName},</p>
            <p>Thank you for booking with Qala Studios. Your reservation has been confirmed and payment processed successfully.</p>
            
            <div class="booking-details">
                <h3>Booking Details</h3>
                <div class="detail-row">
                    <span class="detail-label">Confirmation Number:</span>
                    <span>${data.confirmationNumber}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Studio:</span>
                    <span>${data.studioName}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Date:</span>
                    <span>${data.date}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Time:</span>
                    <span>${data.time}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Duration:</span>
                    <span>${data.duration}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Total Cost:</span>
                    <span>${data.totalCost}</span>
                </div>
            </div>

            <div class="contact-info">
                <h4>Studio Information</h4>
                <p><strong>Address:</strong> Plot Number 1019, Sector 82, JLPL Industrial Area, Mohali, PB 140306</p>
                <p><strong>Phone:</strong> +91 98765 43210</p>
                <p><strong>Email:</strong> info@qalastudios.com</p>
            </div>

            <div class="contact-info">
                <h4>Important Information</h4>
                <p><strong>Cancellation Policy:</strong> Cancellations must be made at least 24 hours in advance for a full refund.</p>
                <p><strong>Late Arrival:</strong> Please arrive 15 minutes early for setup. Late arrivals may result in reduced session time.</p>
            </div>
        </div>
        
        <div class="footer">
            <p>&copy; 2024 Qala Studios. All rights reserved.</p>
            <p>For questions about your booking, reply to this email or call +91 98765 43210</p>
        </div>
    </div>
</body>
</html>`;

    const textContent = `
QALA STUDIOS - BOOKING CONFIRMATION

Dear ${data.userDetails.fullName},

Thank you for booking with Qala Studios. Your reservation has been confirmed and payment processed successfully.

BOOKING DETAILS:
Confirmation Number: ${data.confirmationNumber}
Studio: ${data.studioName}
Date: ${data.date}
Time: ${data.time}
Duration: ${data.duration}
Total Cost: ${data.totalCost}

STUDIO INFORMATION:
Address: Plot Number 1019, Sector 82, JLPL Industrial Area, Mohali, PB 140306
Phone: +91 98765 43210
Email: info@qalastudios.com

IMPORTANT INFORMATION:
- Cancellation Policy: Cancellations must be made at least 24 hours in advance for a full refund.
- Late Arrival: Please arrive 15 minutes early for setup. Late arrivals may result in reduced session time.

For questions about your booking, reply to this email or call +91 98765 43210.

© 2024 Qala Studios. All rights reserved.
`;

    return { htmlContent, textContent };
  }

  private async updateEmailLog(id: string, status: string, messageId?: string, errorMessage?: string): Promise<void> {
    await this.prisma.emailLog.update({
      where: { id },
      data: {
        status,
        message_id: messageId,
        error_message: errorMessage,
        sent_at: status === 'sent' ? new Date() : undefined
      }
    });
  }

  private isRetryableError(error: any): boolean {
    // Zoho/SMTP specific retryable errors
    const retryableErrors = [
      'ECONNRESET',
      'ETIMEDOUT', 
      'ENOTFOUND',
      'ECONNREFUSED',
      'Rate limit exceeded',
      'Temporary failure',
      'Service unavailable'
    ];
    
    return retryableErrors.some(err => 
      error.message?.toLowerCase().includes(err.toLowerCase()) || 
      error.code?.toLowerCase().includes(err.toLowerCase())
    );
  }

  async validateConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('Zoho SMTP connection failed:', error);
      return false;
    }
  }
}