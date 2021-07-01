import { Test, TestingModule } from '@nestjs/testing';
import { UpcomingEventController } from './upcoming_event.controller';
import { UpcomingEventService } from './upcoming_event.service';
import { PrismaService } from '../prisma/prisma.service';

describe('UpcomingController', () => {
  let controller: UpcomingEventController;

  beforeEach(async () => {
    const prismaServiceMock = jest.fn();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UpcomingEventController],
      providers: [
        UpcomingEventService,
        { provide: PrismaService, useValue: prismaServiceMock },
      ],
    }).compile();

    controller = module.get<UpcomingEventController>(UpcomingEventController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
