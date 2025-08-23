/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { type SignInDto, type SignUpDto } from './dto/auth-dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private userService: UsersService,
  ) {}

  async signIn(signInDto: SignInDto) {
    const { email, password } = signInDto;

    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) throw new UnauthorizedException('Email ou senha incorretos');

    const isPasswordValid = await bcrypt.compare(
      password,
      String(user.password),
    );

    if (!isPasswordValid)
      throw new UnauthorizedException('Email ou senha incorretos');

    const token = this.jwtService.sign({ sub: user.id });

    return {
      accessToken: token,
      user: {
        id: user.id,
        email: user.email,
      },
    };
  }

  async signUp(signUpDto: SignUpDto) {
    const { name, email, phone, password } = signUpDto;

    const user = await this.userService.create({
      name,
      phone,
      email,
      password,
    });

    const token = this.jwtService.sign({ sub: user.id });

    return {
      accessToken: token,
      user: {
        id: user.id,
        email: user.email,
      },
    };
  }
}
