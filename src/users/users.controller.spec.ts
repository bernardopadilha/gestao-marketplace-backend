/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { CreateOrUpdateUserDto } from './dto/user.dto';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockAuthService = {
    uploadAvatar: jest.fn(() => ({
      imageUrl:
        'https://meu-bucket-de-fotos.s3.us-east-1.amazonaws.com/paisagem.jpg',
    })),
    create: jest.fn(() => ({
      id: 'bc61473c-99ea-4402-b244-7426fc510d33',
      name: 'Bernardo Padilha',
      email: 'bernardoa.padilha@gmail.com',
      phone: '(48) 99158-3678',
      imageUrl: null,
      password: '$2b$12$BPIIKgb8tb.A9xCjuXVrje.e3j6v.ie/.vMR0pE6DR3fjx2cp4Mne',
    })),
    findOne: jest.fn(() => ({
      id: 'bc61473c-99ea-4402-b244-7426fc510d33',
      name: 'Bernardo Padilha',
      email: 'bernardoa.padilha@gmail.com',
      phone: '(48) 99158-3678',
      imageUrl: null,
      password: '$2b$12$BPIIKgb8tb.A9xCjuXVrje.e3j6v.ie/.vMR0pE6DR3fjx2cp4Mne',
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call usersService.create with the dto', async () => {
      const dto: CreateOrUpdateUserDto = {
        name: 'Bernardo Padilha',
        email: 'bernardoa.padilha@gmail.com',
        phone: '(48) 99158-3678',
        password: '123456',
      };

      const result = await controller.create(dto);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          name: 'Bernardo Padilha',
          email: 'bernardoa.padilha@gmail.com',
        }),
      );
    });
  });

  describe('uploadAvatar', () => {
    it('should call usersService.uploadAvatar with dto.userId and file', async () => {
      const userId = 'bc779472-5511-4791-94f0-9150642fe1f0';
      const mockFile = {
        originalname: 'avatar.png',
        buffer: Buffer.from('fake image'),
      } as Express.Multer.File;

      const result = await controller.uploadAvatar(userId, mockFile);

      expect(service.uploadAvatar).toHaveBeenCalledWith(userId, mockFile);
      expect(result).toEqual(
        expect.objectContaining({
          imageUrl: expect.stringContaining('https://meu-bucket-de-fotos'),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should call usersService.findOne with the id', async () => {
      const userId = 'bc61473c-99ea-4402-b244-7426fc510d33';

      const result = await controller.findOne(userId);

      expect(service.findOne).toHaveBeenCalledWith(userId);
      expect(result).toEqual(
        expect.objectContaining({
          id: userId,
          name: 'Bernardo Padilha',
          email: 'bernardoa.padilha@gmail.com',
        }),
      );
    });
  });
});
