import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { UserClientService } from './user-client.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000, // 5 seconds timeout
      maxRedirects: 5,
    }),
  ],
  providers: [UserClientService],
  exports: [UserClientService],
})
export class UserClientModule {}
