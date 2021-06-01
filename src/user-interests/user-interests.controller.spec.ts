import { Test, TestingModule } from '@nestjs/testing';
import { UserInterestsController } from './user-interests.controller';
import { UserInterestsService } from './user-interests.service';
import { PrismaService } from '../prisma/prisma.service';

describe('UserInterestsController', () => {
  let controller: UserInterestsController;

  beforeEach(async () => {
    const prismaServiceMock = jest.fn();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserInterestsController],
      providers: [
        UserInterestsService,
        { provide: PrismaService, useValue: prismaServiceMock },
      ],
    }).compile();

    controller = module.get<UserInterestsController>(UserInterestsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
