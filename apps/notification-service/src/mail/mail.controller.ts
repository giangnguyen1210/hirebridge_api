import { Controller } from '@nestjs/common';
import { MailService } from './mail.service';
import { EventPattern } from '@nestjs/microservices/decorators/event-pattern.decorator';
import { Payload } from '@nestjs/microservices';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}
  
  @EventPattern('user_created') 
  async handleUserCreated(@Payload() message: { email: string; token: string; name: string }) {

    console.log('Received event:', message);
    
    await this.mailService.sendUserConfirmation(message.email, message.token, message.name);
  }
}
