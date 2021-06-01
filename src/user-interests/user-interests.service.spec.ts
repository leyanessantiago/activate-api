import { Test, TestingModule } from '@nestjs/testing';
import { UserInterestsService } from './user-interests.service';
import { PrismaService } from '../prisma/prisma.service';

describe('UserInterestsService', () => {
  let service: UserInterestsService;

  beforeEach(async () => {
    const prismaServiceMock = jest.fn();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserInterestsService,
        { provide: PrismaService, useValue: prismaServiceMock },
      ],
    }).compile();

    service = module.get<UserInterestsService>(UserInterestsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
