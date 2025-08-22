import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthService = {
    signIn: jest.fn(() => ({
      accessToken: 'fake-token',
      user: {
        id: '5cf9365f-edf7-4e04-a17b-827464fb6dc0',
        email: 'bernardoa.padilha@gmail.com',
      },
    })),
    signUp: jest.fn(() => ({
      accessToken: 'fake-token',
      user: {
        id: '5cf9365f-edf7-4e04-a17b-827464fb6dc0',
        email: 'bernardoa.padilha@gmail.com',
      },
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signIn', () => {
    it('Deve chamar AuthService.signIn e retornar um token', async () => {
      const signInDto = {
        email: 'bernardoa.padilha@gmail.com',
        password: 'Minhasenha123.',
      };
      const result = await controller.signIn(signInDto);

      expect(mockAuthService.signIn).toHaveBeenCalledWith(signInDto);
      expect(result).toEqual({
        accessToken: 'fake-token',
        user: {
          id: '5cf9365f-edf7-4e04-a17b-827464fb6dc0',
          email: 'bernardoa.padilha@gmail.com',
        },
      });
    });
  });

  describe('signUp', () => {
    it('should call AuthService.signUp and return user data', async () => {
      const signUpDto = {
        name: 'Bernardo Padilha',
        email: 'bernardoa.padilha@gmail.com',
        phone: '(48) 99158-3678',
        password: 'Minhasenha123.',
      };
      const result = await controller.signUp(signUpDto);

      expect(mockAuthService.signUp).toHaveBeenCalledWith(signUpDto);
      expect(result).toEqual({
        accessToken: 'fake-token',
        user: {
          id: '5cf9365f-edf7-4e04-a17b-827464fb6dc0',
          email: 'bernardoa.padilha@gmail.com',
        },
      });
    });
  });
});
