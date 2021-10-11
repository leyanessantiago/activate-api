import { Test, TestingModule } from '@nestjs/testing';
import { MailerModule, MailerService } from '@nestjs-modules/mailer';
import { MailService } from './mail.service';

describe('MailService', () => {
  let service: MailService;

  beforeEach(async () => {
    const mailerServiceMock = jest.fn();
    const module: TestingModule = await Test.createTestingModule({
      imports: [MailerModule],
      providers: [
        MailService,
        { provide: MailerService, useValue: mailerServiceMock },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
