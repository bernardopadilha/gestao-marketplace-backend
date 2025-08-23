/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, NotFoundException } from '@nestjs/common';
import { S3Service } from '../_common/s3/s3.service';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import type {
  CreateProductDto,
  UpdateProductDto,
  UpdateStatusProductDto,
} from './dto/product.dto';

interface FindAllProductsParams {
  category?: string;
  title?: string;
}

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private s3Service: S3Service,
    private usersService: UsersService,
  ) {}

  async uploadProductImage(productId: string, file: Express.Multer.File) {
    await this.findOne(productId);

    const fileName = `${productId}-${Date.now()}.${file.originalname.split('.').pop()}`;
    const folder = 'products/images';

    const imageUrl = await this.s3Service.uploadFile(
      file.buffer,
      fileName,
      folder,
      file.mimetype,
    );

    await this.prisma.products.update({
      where: { id: productId },
      data: { imageUrl },
    });

    return { imageUrl };
  }

  async create(userId: string, createProductDto: CreateProductDto) {
    await this.usersService.findOne(userId);

    const { title, price, status, category, imageUrl, description } =
      createProductDto;

    return await this.prisma.products.create({
      data: {
        title,
        price,
        status,
        category,
        imageUrl,
        description,
        userId,
      },
    });
  }

  async findAll(userId: string, params: FindAllProductsParams = {}) {
    const { category, title } = params;

    const where: any = {
      userId,
    };

    if (category) {
      where.category = {
        contains: category,
        mode: 'insensitive',
      };
    }

    if (title) {
      where.name = {
        contains: title,
        mode: 'insensitive',
      };
    }

    return await this.prisma.products.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(productId: string) {
    const product = await this.prisma.products.findUnique({
      where: {
        id: productId,
      },
    });

    if (!product) {
      throw new NotFoundException('Produto não encontrado');
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    await this.findOne(id);

    const { title, price, status, imageUrl, category, description } =
      updateProductDto;

    return await this.prisma.products.update({
      where: { id },
      data: {
        title,
        price,
        status,
        imageUrl,
        category,
        description,
      },
    });
  }

  async updateStatusProduct(id: string, { status }: UpdateStatusProductDto) {
    await this.findOne(id);

    return await this.prisma.products.update({
      where: { id },
      data: { status },
    });
  }
}
