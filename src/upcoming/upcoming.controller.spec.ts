import { Test, TestingModule } from '@nestjs/testing';
import { UpcomingController } from './upcoming.controller';
import { UpcomingService } from './upcoming.service';
import { PrismaService } from '../prisma/prisma.service';

describe('UpcomingController', () => {
  let controller: UpcomingController;

  beforeEach(async () => {
    const prismaServiceMock = jest.fn();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UpcomingController],
      providers: [
        UpcomingService,
        { provide: PrismaService, useValue: prismaServiceMock },
      ],
    }).compile();

    controller = module.get<UpcomingController>(UpcomingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
