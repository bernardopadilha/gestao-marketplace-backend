/* eslint-disable @typescript-eslint/no-unused-vars */
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';

jest.mock('bcrypt');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  const mockUser = {
    id: '5cf9365f-edf7-4e04-a17b-827464fb6dc0',
    name: 'Bernardo Padilha',
    email: 'bernardoa.padilha@gmail.com',
    phone: '(48) 99158-3678',
    password: '$2b$12$hashedpassword',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signIn', () => {
    const signInDto = {
      email: 'bernardoa.padilha@gmail.com',
      password: 'Minhasenha123.',
    };

    it('deve fazer login com credenciais válidas', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(true as never);
      mockJwtService.sign.mockReturnValue('fake-jwt-token');

      const result = await service.signIn(signInDto);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: signInDto.email },
      });
      expect(mockedBcrypt.compare).toHaveBeenCalledWith(
        signInDto.password,
        mockUser.password,
      );
      expect(mockJwtService.sign).toHaveBeenCalledWith({ sub: mockUser.id });
      expect(result).toEqual({
        accessToken: 'fake-jwt-token',
        user: {
          id: mockUser.id,
          email: mockUser.email,
        },
      });
    });

    it('deve lançar UnauthorizedException quando usuário não for encontrado', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.signIn(signInDto)).rejects.toThrow(
        new UnauthorizedException('Email ou senha incorretos'),
      );
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: signInDto.email },
      });
    });

    it('deve lançar UnauthorizedException quando senha for inválida', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(false as never);

      await expect(service.signIn(signInDto)).rejects.toThrow(
        new UnauthorizedException('Email ou senha incorretos'),
      );
      expect(mockedBcrypt.compare).toHaveBeenCalledWith(
        signInDto.password,
        mockUser.password,
      );
    });
  });

  describe('signUp', () => {
    const signUpDto = {
      name: 'Bernardo Padilha',
      email: 'bernardoa.padilha@gmail.com',
      phone: '(48) 99158-3678',
      password: 'Minhasenha123.',
    };

    it('deve criar um novo usuário com sucesso', async () => {
      const hashedPassword = '$2b$12$hashedpassword';
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockedBcrypt.hash.mockResolvedValue(hashedPassword as never);
      mockPrismaService.user.create.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('fake-jwt-token');

      const result = await service.signUp(signUpDto);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: signUpDto.email },
      });
      expect(mockedBcrypt.hash).toHaveBeenCalledWith(signUpDto.password, 12);
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          name: signUpDto.name,
          email: signUpDto.email,
          phone: signUpDto.phone,
          password: hashedPassword,
        },
      });
      expect(mockJwtService.sign).toHaveBeenCalledWith({ sub: mockUser.id });
      expect(result).toEqual({
        accessToken: 'fake-jwt-token',
        user: {
          id: mockUser.id,
          email: mockUser.email,
        },
      });
    });

    it('deve lançar BadRequestException quando email já existir', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(service.signUp(signUpDto)).rejects.toThrow(
        new BadRequestException('Este email já é cadastrado'),
      );
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: signUpDto.email },
      });
      expect(mockPrismaService.user.create).not.toHaveBeenCalled();
    });
  });
});
