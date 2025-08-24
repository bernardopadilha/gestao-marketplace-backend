/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiPayloadTooLargeResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../_common/guards/jwt-auth.guard';
import { CreateUserDto } from './dto/user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Cria um novo usuário' })
  @ApiCreatedResponse({
    description: 'Usuário criado com sucesso',
    example: {
      id: 'bc779472-5511-4791-94f0-9150642fe1f0',
      name: 'Bernardo Padilha',
      email: 'bernardoa.padilha@gmail.com',
      phone: '(48) 99158-3678',
      imageUrl:
        'https://minhaimagem.amazonaws.com/users/avatars/userId-1755915844333.png',
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
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Post('/:userId/upload-avatar')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Upload de avatar do usuário em S3' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({
    name: 'userId',
    description: 'ID do usuário',
    example: '1f3e4d2a-9b0c-4d6f-94f2-8a7e38c5678a',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        avatar: {
          type: 'string',
          format: 'binary',
          description: 'Arquivo de imagem do usuário. Max: 2MB',
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Avatar enviado com sucesso',
    example: {
      imageUrl:
        'https://gestao-marketplace.s3.us-east-2.amazonaws.com/users/avatars/462ddbe7-7487-4401-96d9-65021b8b7a1e-1755973729162.png',
    },
  })
  @ApiBadRequestResponse({
    description: 'Arquivo maior que 2MB',
    example: {
      message: 'O arquivo é obirgatório',
      error: 'Bad Request',
      statusCode: 400,
    },
  })
  @ApiPayloadTooLargeResponse({
    description: 'Arquivo inválido ou não informado',
    example: {
      message: 'File too large',
      error: 'Payload Too Large',
      statusCode: 413,
    },
  })
  @ApiNotFoundResponse({
    description: 'Usuário não encontrado',
    example: {
      message: 'Não foi possível encontrar o usuário em nossa base de dados',
      error: 'Not Found',
      statusCode: 404,
    },
  })
  @UseInterceptors(
    FileInterceptor('avatar', {
      limits: { fileSize: 2 * 1024 * 1024 },
    }),
  )
  async uploadAvatar(
    @Param('userId') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.usersService.uploadAvatar(userId, file);
  }

  @Get(':userId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Lista usuário por ID' })
  @ApiOkResponse({
    description: 'Usuário listado com sucesso',
    example: {
      id: 'bc779472-5511-4791-94f0-9150642fe1f0',
      name: 'Bernardo Padilha',
      email: 'bernardoa.padilha@gmail.com',
      phone: '(48) 99158-3678',
      imageUrl:
        'https://minhaimagem.amazonaws.com/users/avatars/userId-1755915844333.png',
    },
  })
  @ApiNotFoundResponse({
    description: 'Usuário não encontrado',
    example: {
      message: 'Não foi possível encontrar o usuário em nossa base de dados',
      error: 'Not Found',
      statusCode: 404,
    },
  })
  findOne(@Param('userId') userId: string) {
    return this.usersService.findOne(userId);
  }

  @Get('/logged/in')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  loggedUser(@Req() req: any) {
    return this.usersService.findOne(req.user.userId as string);
  }
}
