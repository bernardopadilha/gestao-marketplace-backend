/* eslint-disable @typescript-eslint/no-unsafe-call */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Min,
} from 'class-validator';

export enum Category {
  BRINQUEDO = 'BRINQUEDO',
  MOVEL = 'MOVEL',
  PAPELARIA = 'PAPELARIA',
  SAUDE_E_BELEZA = 'SAUDE_E_BELEZA',
  UTENSILIO = 'UTENSILIO',
  VESTUARIO = 'VESTUARIO',
}

export enum Status {
  ANUNCIADO = 'ANUNCIADO',
  VENDIDO = 'VENDIDO',
  CANCELADO = 'CANCELADO',
}

export class CreateProductDto {
  @ApiProperty({
    example: 'Cadeira Gamer',
    description: 'Título do produto',
  })
  @IsString()
  @IsNotEmpty({ message: 'O título é obrigatório' })
  title: string;

  @ApiProperty({
    example: 19990,
    description: 'Preço em centavos (R$199,90)',
    minimum: 0,
  })
  @IsInt({ message: 'O preço deve ser um número inteiro (em centavos)' })
  @Min(0, { message: 'O preço não pode ser negativo' })
  @Type(() => Number)
  price: number;

  @ApiProperty({
    example: 'Cadeira gamer ergonômica com apoio para braços.',
    description: 'Descrição detalhada do produto',
  })
  @IsString()
  @IsNotEmpty({ message: 'A descrição é obrigatória' })
  description: string;

  @ApiProperty({
    enum: Category,
    example: Category.MOVEL,
    description: 'Categoria do produto',
  })
  @IsEnum(Category, { message: 'Categoria inválida' })
  category: Category;

  @ApiPropertyOptional({
    enum: Status,
    example: Status.ANUNCIADO,
    default: Status.ANUNCIADO,
    description: 'Status do produto (opcional)',
  })
  @IsOptional()
  @IsEnum(Status, { message: 'Status inválido' })
  status?: Status;

  @ApiPropertyOptional({
    example: 'https://meusite.com/imagens/produto.png',
    description: 'URL da imagem do produto (opcional)',
  })
  @IsOptional()
  @IsUrl({}, { message: 'A URL da imagem deve ser válida' })
  imageUrl?: string;
}

export class UpdateProductDto {
  @ApiPropertyOptional({
    example: 'Cadeira Gamer',
    description: 'Título do produto',
  })
  @IsString()
  @IsNotEmpty({ message: 'O título é obrigatório' })
  title?: string;

  @ApiPropertyOptional({
    example: 19990,
    description: 'Preço em centavos (R$199,90)',
    minimum: 0,
  })
  @IsInt({ message: 'O preço deve ser um número inteiro (em centavos)' })
  @Min(0, { message: 'O preço não pode ser negativo' })
  @Type(() => Number)
  price?: number;

  @ApiPropertyOptional({
    example: 'Cadeira gamer ergonômica com apoio para braços.',
    description: 'Descrição detalhada do produto',
  })
  @IsString()
  @IsNotEmpty({ message: 'A descrição é obrigatória' })
  description?: string;

  @ApiPropertyOptional({
    enum: Category,
    example: Category.MOVEL,
    description: 'Categoria do produto',
  })
  @IsEnum(Category, { message: 'Categoria inválida' })
  category?: Category;

  @ApiPropertyOptional({
    enum: Status,
    example: Status.ANUNCIADO,
    default: Status.ANUNCIADO,
    description: 'Status do produto (opcional)',
  })
  @IsOptional()
  @IsEnum(Status, { message: 'Status inválido' })
  status?: Status;

  @ApiPropertyOptional({
    example: 'https://meusite.com/imagens/produto.png',
    description: 'URL da imagem do produto (opcional)',
  })
  @IsOptional()
  @IsUrl({}, { message: 'A URL da imagem deve ser válida' })
  imageUrl?: string;
}

export class UpdateStatusProductDto {
  @ApiProperty({
    enum: Status,
    example: Status.VENDIDO,
    description: 'Novo status do produto',
  })
  @IsEnum(Status, { message: 'Status inválido' })
  status: Status;
}

export class FilterProductsDto {
  @ApiPropertyOptional({
    example: Category.BRINQUEDO,
    description: 'Categoria para filtro',
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({
    example: 'Cadeira',
    description: 'Parte do título para filtro',
  })
  @IsOptional()
  @IsString()
  title?: string;
}
