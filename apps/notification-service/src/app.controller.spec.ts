import { Test, TestingModule } from '@nestjs/testing';
import { NotificationServiceController } from './app.controller';
import { NotificationServiceService } from './app.service';

describe('NotificationServiceController', () => {
  let notificationServiceController: NotificationServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [NotificationServiceController],
      providers: [NotificationServiceService],
    }).compile();

    notificationServiceController = app.get<NotificationServiceController>(NotificationServiceController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(notificationServiceController.getHello()).toBe('Hello World!');
    });
  });
});
