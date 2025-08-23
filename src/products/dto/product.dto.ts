/* eslint-disable @typescript-eslint/no-unsafe-call */
import { PartialType } from '@nestjs/mapped-types';
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
  @IsString()
  @IsNotEmpty({ message: 'O título é obrigatório' })
  title: string;

  @IsInt({ message: 'O preço deve ser um número inteiro (em centavos)' })
  @Min(0, { message: 'O preço não pode ser negativo' })
  @Type(() => Number)
  price: number;

  @IsString()
  @IsNotEmpty({ message: 'A descrição é obrigatória' })
  description: string;

  @IsEnum(Category, { message: 'Categoria inválida' })
  category: Category;

  @IsOptional()
  @IsEnum(Status, { message: 'Status inválido' })
  status?: Status;

  @IsOptional()
  @IsUrl({}, { message: 'A URL da imagem deve ser válida' })
  imageUrl?: string;
}

export class UpdateProductDto extends PartialType(CreateProductDto) {}

export class UpdateStatusProductDto {
  @IsEnum(Status, { message: 'Status inválido' })
  status: Status;
}

export class FilterProductsDto {
  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  title?: string;
}
