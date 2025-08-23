/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { BadRequestException, Injectable } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { S3Service } from '../_common/s3/s3.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrUpdateUserDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private s3Service: S3Service,
  ) {}

  async uploadAvatar(userId: string, file: Express.Multer.File) {
    await this.findOne(userId);

    const fileName = `${userId}-${Date.now()}.${file.originalname.split('.').pop()}`;
    const folder = 'users/avatars';

    const imageUrl = await this.s3Service.uploadFile(
      file.buffer,
      fileName,
      folder,
      file.mimetype,
    );

    await this.prisma.user.update({
      where: { id: userId },
      data: { imageUrl },
    });

    return { imageUrl };
  }

  async create(createUserDto: CreateOrUpdateUserDto) {
    const { name, email, phone, password } = createUserDto;

    const findUser = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (findUser) throw new BadRequestException('Este email já é cadastrado');

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await this.prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
      },
    });

    return user;
  }

  async findOne(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user)
      throw new BadRequestException(
        'Não foi possível encontrar o usuário em nossa base de dados',
      );

    return user;
  }
}
