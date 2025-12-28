import Resend from 'resend';
import { Injectable, Logger } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class NotificationsService {
  private resend: any;
  private logger = new Logger(NotificationsService.name);
  private fromEmail = process.env.RESEND_FROM_EMAIL;
  private fromName = process.env.RESEND_FROM_NAME;

  constructor() {
    this.resend = Resend;
  }

  private async sendEmail(
    to: string,
    subject: string,
    templateName: string,
    context: Record<string, any>,
  ) {
    try {
      const templatePath = path.join(__dirname, 'templates', `${templateName}.html`);
      let html = fs.readFileSync(templatePath, 'utf-8');

      Object.keys(context).forEach(key => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        html = html.replace(regex, context[key]);
      });

      const response = await this.resend.emails.send({
        from: `${this.fromName} <${this.fromEmail}>`,
        to,
        subject,
        html,
      });

      if (response?.error) {
        this.logger.error(`Email API error for ${to}: ${JSON.stringify(response.error)}`);
        throw new Error(`Email send failed: ${response.error}`);
      }

      this.logger.log(`Email sent to ${to} (${subject})`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}: ${error instanceof Error ? error.message : error}`);
      throw error;  // Re-throw to allow job processor to handle retry
    }
  }

  async sendAppointmentConfirmationEmail(user: any, appointment: any) {
    const appointmentDate = appointment.startTime instanceof Date 
      ? appointment.startTime.toLocaleString('he-IL')
      : new Date(appointment.startTime).toLocaleString('he-IL');
    
    return this.sendEmail(
      user.email,
      'אישור תור',
      'appointment-confirmation',
      {
        clientName: user.firstName,
        serviceName: appointment.service?.name || 'Service',
        appointmentDate,
      },
    );
  }

  async sendAppointmentCancelledEmail(user: any, appointment: any, reason?: string) {
    const appointmentDate = appointment.startTime instanceof Date 
      ? appointment.startTime.toLocaleString('he-IL')
      : new Date(appointment.startTime).toLocaleString('he-IL');
    
    return this.sendEmail(
      user.email,
      'ביטול תור',
      'appointment-cancelled',
      {
        clientName: user.firstName,
        serviceName: appointment.service?.name || 'Service',
        appointmentDate,
        reason: reason || 'No reason specified',
      },
    );
  }

  async sendAppointmentReminderEmail(user: any, appointment: any) {
    const appointmentDate = appointment.startTime instanceof Date 
      ? appointment.startTime.toLocaleString('he-IL')
      : new Date(appointment.startTime).toLocaleString('he-IL');
    
    return this.sendEmail(
      user.email,
      'תזכורת לתור',
      'appointment-reminder',
      {
        clientName: user.firstName,
        serviceName: appointment.service?.name || 'Service',
        appointmentDate,
      },
    );
  }

  async sendAppointmentUpdatedEmail(user: any, appointment: any) {
    const appointmentDate = appointment.startTime instanceof Date 
      ? appointment.startTime.toLocaleString('he-IL')
      : new Date(appointment.startTime).toLocaleString('he-IL');
    
    const appointmentEnd = appointment.endTime instanceof Date 
      ? appointment.endTime.toLocaleString('he-IL')
      : new Date(appointment.endTime).toLocaleString('he-IL');
    
    return this.sendEmail(
      user.email,
      'התור שלך עודכן',
      'appointment-updated',
      {
        clientName: user.firstName,
        serviceName: appointment.service?.name || 'Service',
        appointmentDate,
        appointmentEnd,
      },
    );
  }


  async sendWaitlistNotificationEmail(user: any, service: any, availableTime: string) {
    return this.sendEmail(
      user.email,
      'תור פנוי מרשימת המתנה',
      'waitlist-notification',
      {
        clientName: user.firstName,
        serviceName: service.name,
        appointmentDate: availableTime,
      },
    );
  }
}
