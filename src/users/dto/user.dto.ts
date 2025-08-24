/* eslint-disable @typescript-eslint/no-unsafe-call */
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: 'João Silva',
    description: 'Nome do usuário',
  })
  @IsString()
  @IsNotEmpty({ message: 'O campo name é obrigatório' })
  name: string;

  @ApiProperty({
    example: '(99) 99999-9999',
    description: 'Telefone do usuário',
  })
  @IsString()
  @IsNotEmpty({ message: 'O campo name é obrigatório' })
  phone: string;

  @ApiProperty({
    example: 'user@email.com',
    description: 'E-mail do usuário para login',
  })
  @IsNotEmpty({ message: 'O campo email é obrigatório' })
  @IsEmail({}, { message: 'E-mail inválido' })
  email: string;

  @ApiProperty({
    example: 'Senha@123',
    description:
      'Senha do usuário. Deve ter pelo menos 8 caracteres, com letra maiúscula, minúscula, número e caractere especial.',
    minLength: 8,
  })
  @IsString()
  @IsNotEmpty({ message: 'O campo senha é obrigatório' })
  @MinLength(8, { message: 'A senha deve ter pelo menos 8 caracteres' })
  @Matches(/[A-Z]/, {
    message: 'A senha deve conter pelo menos uma letra maiúscula',
  })
  @Matches(/[a-z]/, {
    message: 'A senha deve conter pelo menos uma letra minúscula',
  })
  @Matches(/[0-9]/, { message: 'A senha deve conter pelo menos um número' })
  @Matches(/[^A-Za-z0-9]/, {
    message: 'A senha deve conter pelo menos um caractere especial',
  })
  password: string;
}
