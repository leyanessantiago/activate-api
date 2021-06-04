import { Test, TestingModule } from '@nestjs/testing';
import { InterestsController } from './interests.controller';
import { InterestsService } from './interests.service';
import { PrismaService } from '../prisma/prisma.service';

describe('UserInterestsController', () => {
  let controller: InterestsController;

  beforeEach(async () => {
    const prismaServiceMock = jest.fn();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InterestsController],
      providers: [
        InterestsService,
        { provide: PrismaService, useValue: prismaServiceMock },
      ],
    }).compile();

    controller = module.get<InterestsController>(InterestsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
