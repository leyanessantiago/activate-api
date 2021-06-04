import { Test, TestingModule } from '@nestjs/testing';
import { InterestsService } from './interests.service';
import { PrismaService } from '../prisma/prisma.service';

describe('UserInterestsService', () => {
  let service: InterestsService;

  beforeEach(async () => {
    const prismaServiceMock = jest.fn();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InterestsService,
        { provide: PrismaService, useValue: prismaServiceMock },
      ],
    }).compile();

    service = module.get<InterestsService>(InterestsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
