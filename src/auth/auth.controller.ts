import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../_common/guards/jwt-auth.guard';
import { AuthService } from './auth.service';
import { SignInDto, SignUpDto } from './dto/auth-dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-in')
  @ApiOperation({ summary: 'Login' })
  @ApiCreatedResponse({
    description: 'Usuário logado com sucesso',
    example: {
      accessToken:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5MmVjNDQwYi1kYWFiLTQ2MTYtOWE0Yi03ZGEzMDliZDhhMmEiLCJpYXQiOjE3NTU5NzIwNDUsImV4cCI6MTc1NjA1ODQ0NX0.YIoyqiN5bX81B3tFH_4FYPin4_su_YZc_dCuG3t9xQw',
      user: {
        id: '92ec440b-daab-4616-9a4b-7da309bd8a2a',
        email: 'user@email.com',
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Email ou senha inválidos',
    example: {
      message: 'Email ou senha incorretos',
      error: 'Unauthorized',
      statusCode: 401,
    },
  })
  signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto);
  }

  @Post('sign-up')
  @ApiOperation({ summary: 'Cria um novo usuário' })
  @ApiCreatedResponse({
    description: 'Usuário criado com sucesso',
    example: {
      accessToken:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5MmVjNDQwYi1kYWFiLTQ2MTYtOWE0Yi03ZGEzMDliZDhhMmEiLCJpYXQiOjE3NTU5NzIwNDUsImV4cCI6MTc1NjA1ODQ0NX0.YIoyqiN5bX81B3tFH_4FYPin4_su_YZc_dCuG3t9xQw',
      user: {
        id: '92ec440b-daab-4616-9a4b-7da309bd8a2a',
        email: 'user@email.com',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Usuário já existe',
    example: {
      message: 'Este email já é cadastrado',
      error: 'Bad Request',
      statusCode: 400,
    },
  })
  signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('verify-token')
  verifyToken() {
    return {
      valid: true,
    };
  }
}
