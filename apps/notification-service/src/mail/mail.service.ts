import { MailerService } from '@nestjs-modules/mailer/dist/mailer.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) { }

  async sendUserConfirmation(email: string, token: string, name: string) {
    const url = process.env.FRONTEND_URL || 'http://localhost:3000';
    this.sendEmailTemplate(
      email,
      'Hire-dev - Xác thực email đăng ký',
      'register_success',
      {
        username: name,
        activationCode: token,
        activationLink: `${url}/auth/verify/?mail=${email}&code=${token}`,
      },
    )
    .then((success) => console.log(success))
    .catch((error) => console.log(error));
  }

  public sendEmailTemplate(email: string, subject: string, template: string, data: object, bcc?: string): Promise<boolean> {
    return this.mailerService
      .sendMail({
        to: email,
        bcc: bcc,
        subject: subject,
        template: template,
        context: data, 
      })
  }
}
