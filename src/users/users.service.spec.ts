/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import bcrypt from 'bcrypt';
import { S3Service } from '../_common/s3/s3.service';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from './users.service';

jest.mock('bcrypt');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('UsersService', () => {
  let service: UsersService;
  let prismaService: PrismaService;
  let s3Service: S3Service;

  const mockUser = {
    id: '5cf9365f-edf7-4e04-a17b-827464fb6dc0',
    name: 'Bernardo Padilha',
    email: 'bernardoa.padilha@gmail.com',
    phone: '(48) 99158-3678',
    password: '$2b$12$hashedpassword',
    imageUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaService = {
    user: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockS3Service = {
    uploadFile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: S3Service,
          useValue: mockS3Service,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prismaService = module.get<PrismaService>(PrismaService);
    s3Service = module.get<S3Service>(S3Service);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('uploadAvatar', () => {
    const userId = '5cf9365f-edf7-4e04-a17b-827464fb6dc0';
    const mockFile: Express.Multer.File = {
      fieldname: 'avatar',
      originalname: 'profile.jpg',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      buffer: Buffer.from('fake-image-buffer'),
      size: 1024,
      destination: '',
      filename: '',
      path: '',
      stream: null,
    } as unknown as Express.Multer.File;

    beforeEach(() => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockUser);
    });

    it('deve fazer upload do avatar com sucesso', async () => {
      const expectedImageUrl =
        'https://s3.amazonaws.com/bucket/users/avatars/filename.jpg';
      const expectedFileName = expect.stringMatching(`${userId}-\\d+\\.jpg`);

      mockS3Service.uploadFile.mockResolvedValue(expectedImageUrl);
      mockPrismaService.user.update.mockResolvedValue({
        ...mockUser,
        imageUrl: expectedImageUrl,
      });

      const result = await service.uploadAvatar(userId, mockFile);

      expect(service.findOne).toHaveBeenCalledWith(userId);

      expect(mockS3Service.uploadFile).toHaveBeenCalledWith(
        mockFile.buffer,
        expectedFileName,
        'users/avatars',
        mockFile.mimetype,
      );
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { imageUrl: expectedImageUrl },
      });
      expect(result).toEqual({ imageUrl: expectedImageUrl });
    });

    it('deve lidar com diferentes extensões de arquivo', async () => {
      const pngFile = {
        ...mockFile,
        originalname: 'profile.png',
        mimetype: 'image/png',
      };
      const expectedImageUrl =
        'https://s3.amazonaws.com/bucket/users/avatars/filename.png';
      const expectedFileName = expect.stringMatching(`${userId}-\\d+\\.png`);

      mockS3Service.uploadFile.mockResolvedValue(expectedImageUrl);
      mockPrismaService.user.update.mockResolvedValue({
        ...mockUser,
        imageUrl: expectedImageUrl,
      });

      const result = await service.uploadAvatar(userId, pngFile);

      expect(mockS3Service.uploadFile).toHaveBeenCalledWith(
        pngFile.buffer,
        expectedFileName,
        'users/avatars',
        pngFile.mimetype,
      );
      expect(result).toEqual({ imageUrl: expectedImageUrl });
    });
  });

  describe('create', () => {
    const createUserDto = {
      name: 'Bernardo Padilha',
      email: 'bernardoa.padilha@gmail.com',
      phone: '(48) 99158-1129',
      password: 'Minhasenha123.',
    };

    it('deve criar um novo usuário com sucesso', async () => {
      const hashedPassword = '$2b$12$hashedpassword';
      mockPrismaService.user.findFirst.mockResolvedValue(null);
      mockedBcrypt.hash.mockResolvedValue(hashedPassword as never);
      mockPrismaService.user.create.mockResolvedValue(mockUser);

      const result = await service.create(createUserDto);

      expect(mockPrismaService.user.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [{ email: createUserDto.email }, { phone: createUserDto.phone }],
        },
      });
      expect(mockedBcrypt.hash).toHaveBeenCalledWith(
        createUserDto.password,
        12,
      );
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          name: createUserDto.name,
          email: createUserDto.email,
          password: expect.any(String),
          phone: createUserDto.phone,
        },
        omit: { password: true },
      });
      expect(result).toEqual(mockUser);
    });

    it('deve lançar BadRequestException quando email já existir', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);

      await expect(service.create(createUserDto)).rejects.toThrow(
        new BadRequestException('Email ou telefone já cadastrado'),
      );
      expect(mockPrismaService.user.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [{ email: createUserDto.email }, { phone: createUserDto.phone }],
        },
      });
      expect(mockPrismaService.user.create).not.toHaveBeenCalled();
      expect(mockedBcrypt.hash).not.toHaveBeenCalled();
    });

    it('deve usar bcrypt com salt rounds 12', async () => {
      const hashedPassword = '$2b$12$hashedpassword';
      mockPrismaService.user.findFirst.mockResolvedValue(null);
      mockedBcrypt.hash.mockResolvedValue(hashedPassword as never);
      mockPrismaService.user.create.mockResolvedValue(mockUser);

      await service.create(createUserDto);

      expect(mockedBcrypt.hash).toHaveBeenCalledWith(
        createUserDto.password,
        12,
      );
    });
  });

  describe('findOne', () => {
    const userId = '5cf9365f-edf7-4e04-a17b-827464fb6dc0';

    it('deve encontrar um usuário por ID', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findOne(userId);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
        omit: { password: true },
      });
      expect(result).toEqual(mockUser);
    });

    it('deve lançar BadRequestException quando usuário não for encontrado', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.findOne(userId)).rejects.toThrow(
        new NotFoundException(
          'Não foi possível encontrar o usuário em nossa base de dados',
        ),
      );
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
        omit: { password: true },
      });
    });

    it('deve encontrar usuário com imageUrl', async () => {
      const userWithImage = {
        ...mockUser,
        imageUrl: 'https://s3.amazonaws.com/bucket/users/avatars/avatar.jpg',
      };
      mockPrismaService.user.findUnique.mockResolvedValue(userWithImage);

      const result = await service.findOne(userId);

      expect(result).toEqual(userWithImage);
      expect(result.imageUrl).toBe(
        'https://s3.amazonaws.com/bucket/users/avatars/avatar.jpg',
      );
    });
  });
});
