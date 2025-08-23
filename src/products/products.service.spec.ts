/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { S3Service } from '../_common/s3/s3.service';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import {
  Category,
  CreateProductDto,
  Status,
  UpdateProductDto,
  UpdateStatusProductDto,
} from './dto/product.dto';
import { ProductsService } from './products.service';

describe('ProductsService', () => {
  let service: ProductsService;
  let prismaService: PrismaService;
  let s3Service: S3Service;
  let usersService: UsersService;

  const mockProduct = {
    id: 'product-id-123',
    title: 'Boneca Barbie',
    description: 'Boneca Barbie com acessórios',
    price: 4999,
    category: Category.BRINQUEDO,
    status: Status.ANUNCIADO,
    imageUrl: 'https://example.com/boneca.jpg',
    userId: 'user-id-123',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaService = {
    products: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockS3Service = {
    uploadFile: jest.fn(),
  };

  const mockUsersService = {
    findOne: jest.fn(),
  };

  const mockUser = {
    id: 'user-id-123',
    name: 'João Silva',
    email: 'joao@example.com',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: S3Service,
          useValue: mockS3Service,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    prismaService = module.get<PrismaService>(PrismaService);
    s3Service = module.get<S3Service>(S3Service);
    usersService = module.get<UsersService>(UsersService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const userId = 'user-id-123';
    const createProductDto: CreateProductDto = {
      title: 'Boneca Barbie',
      description: 'Boneca Barbie com acessórios',
      price: 4999,
      category: Category.BRINQUEDO,
      status: Status.ANUNCIADO,
      imageUrl: 'https://example.com/boneca.jpg',
    };

    beforeEach(() => {
      mockUsersService.findOne.mockResolvedValue(mockUser);
    });

    it('deve criar um produto com sucesso', async () => {
      const expectedProduct = { ...mockProduct, userId };
      mockPrismaService.products.create.mockResolvedValue(expectedProduct);

      const result = await service.create(userId, createProductDto);

      expect(usersService.findOne).toHaveBeenCalledWith(userId);
      expect(prismaService.products.create).toHaveBeenCalledWith({
        data: {
          title: createProductDto.title,
          price: createProductDto.price,
          status: createProductDto.status,
          category: createProductDto.category,
          imageUrl: createProductDto.imageUrl,
          description: createProductDto.description,
          userId,
        },
      });
      expect(result).toEqual(expectedProduct);
    });

    it('deve lançar NotFoundException quando usuário não existe', async () => {
      mockUsersService.findOne.mockRejectedValue(
        new NotFoundException('Usuário não encontrado'),
      );

      await expect(service.create(userId, createProductDto)).rejects.toThrow(
        new NotFoundException('Usuário não encontrado'),
      );

      expect(usersService.findOne).toHaveBeenCalledWith(userId);
      expect(prismaService.products.create).not.toHaveBeenCalled();
    });

    it('deve chamar findOne do usuário antes de criar produto', async () => {
      const expectedProduct = { ...mockProduct, userId };
      mockPrismaService.products.create.mockResolvedValue(expectedProduct);

      await service.create(userId, createProductDto);

      expect(usersService.findOne).toHaveBeenCalledTimes(1);
      expect(usersService.findOne).toHaveBeenCalledWith(userId);
      expect(prismaService.products.create).toHaveBeenCalledTimes(1);
    });

    it('deve chamar create com os parâmetros corretos', async () => {
      const expectedProduct = { ...mockProduct, userId };
      mockPrismaService.products.create.mockResolvedValue(expectedProduct);

      await service.create(userId, createProductDto);

      expect(prismaService.products.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('findAll', () => {
    const userId = '28f62a11-b2f3-4735-8e69-f5d1387a2562';

    it('deve retornar todos os produtos sem filtros', async () => {
      const products = [mockProduct];
      mockPrismaService.products.findMany.mockResolvedValue(products);

      const result = await service.findAll(userId);

      expect(prismaService.products.findMany).toHaveBeenCalledWith({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(products);
    });

    it('deve retornar produtos filtrados por categoria', async () => {
      const products = [mockProduct];
      const filters = { category: 'BRINQUEDO' };
      mockPrismaService.products.findMany.mockResolvedValue(products);

      const result = await service.findAll(userId, filters);

      expect(prismaService.products.findMany).toHaveBeenCalledWith({
        where: {
          userId,
          category: {
            contains: 'BRINQUEDO',
            mode: 'insensitive',
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(products);
    });

    it('deve retornar produtos filtrados por título', async () => {
      const products = [mockProduct];
      const filters = { title: 'Barbie' };
      mockPrismaService.products.findMany.mockResolvedValue(products);

      const result = await service.findAll(userId, filters);

      expect(prismaService.products.findMany).toHaveBeenCalledWith({
        where: {
          userId,
          name: {
            contains: 'Barbie',
            mode: 'insensitive',
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(products);
    });

    it('deve retornar produtos por título e categoria', async () => {
      const products = [mockProduct];
      const filters = { title: 'Barbie', category: 'BRINQUEDO' };
      mockPrismaService.products.findMany.mockResolvedValue(products);

      const result = await service.findAll(userId, filters);

      expect(prismaService.products.findMany).toHaveBeenCalledWith({
        where: {
          userId,
          category: {
            contains: 'BRINQUEDO',
            mode: 'insensitive',
          },
          name: {
            contains: 'Barbie',
            mode: 'insensitive',
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(products);
    });

    it('deve chamar findMany com parâmetros corretos quando não há filtros', async () => {
      mockPrismaService.products.findMany.mockResolvedValue([]);

      await service.findAll(userId);

      expect(prismaService.products.findMany).toHaveBeenCalledTimes(1);
      expect(prismaService.products.findMany).toHaveBeenCalledWith({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findOne', () => {
    const productId = 'product-id-123';

    it('deve retornar um produto quando encontrado', async () => {
      mockPrismaService.products.findUnique.mockResolvedValue(mockProduct);

      const result = await service.findOne(productId);

      expect(prismaService.products.findUnique).toHaveBeenCalledWith({
        where: { id: productId },
      });
      expect(result).toEqual(mockProduct);
    });

    it('deve lançar NotFoundException quando produto não é encontrado', async () => {
      mockPrismaService.products.findUnique.mockResolvedValue(null);

      await expect(service.findOne(productId)).rejects.toThrow(
        new NotFoundException('Produto não encontrado'),
      );

      expect(prismaService.products.findUnique).toHaveBeenCalledWith({
        where: { id: productId },
      });
    });

    it('deve chamar findUnique com o ID correto', async () => {
      mockPrismaService.products.findUnique.mockResolvedValue(mockProduct);

      await service.findOne(productId);

      expect(prismaService.products.findUnique).toHaveBeenCalledTimes(1);
      expect(prismaService.products.findUnique).toHaveBeenCalledWith({
        where: { id: productId },
      });
    });
  });

  describe('update', () => {
    const productId = 'product-id-123';
    const updateProductDto: UpdateProductDto = {
      title: 'Boneca Barbie Deluxe',
      price: 5999,
    };

    beforeEach(() => {
      mockPrismaService.products.findUnique.mockResolvedValue(mockProduct);
    });

    it('deve atualizar um produto com sucesso', async () => {
      const updatedProduct = { ...mockProduct, ...updateProductDto };
      mockPrismaService.products.update.mockResolvedValue(updatedProduct);

      const result = await service.update(productId, updateProductDto);

      expect(prismaService.products.findUnique).toHaveBeenCalledWith({
        where: { id: productId },
      });
      expect(prismaService.products.update).toHaveBeenCalledWith({
        where: { id: productId },
        data: {
          title: updateProductDto.title,
          price: updateProductDto.price,
          status: undefined,
          imageUrl: undefined,
          category: undefined,
          description: undefined,
        },
      });
      expect(result).toEqual(updatedProduct);
    });

    it('deve atualizar categoria do produto', async () => {
      const updateDto: UpdateProductDto = {
        category: Category.MOVEL,
      };
      const updatedProduct = { ...mockProduct, category: Category.MOVEL };
      mockPrismaService.products.update.mockResolvedValue(updatedProduct);

      const result = await service.update(productId, updateDto);

      expect(prismaService.products.update).toHaveBeenCalledWith({
        where: { id: productId },
        data: {
          title: undefined,
          price: undefined,
          status: undefined,
          imageUrl: undefined,
          category: Category.MOVEL,
          description: undefined,
        },
      });
      expect(result.category).toBe(Category.MOVEL);
    });

    it('deve atualizar todos os campos fornecidos', async () => {
      const completeUpdateDto: UpdateProductDto = {
        title: 'Novo Título',
        description: 'Nova descrição',
        price: 6999,
        category: Category.MOVEL,
        status: Status.VENDIDO,
        imageUrl: 'https://example.com/nova-imagem.jpg',
      };
      const updatedProduct = { ...mockProduct, ...completeUpdateDto };
      mockPrismaService.products.update.mockResolvedValue(updatedProduct);

      const result = await service.update(productId, completeUpdateDto);

      expect(prismaService.products.update).toHaveBeenCalledWith({
        where: { id: productId },
        data: {
          title: completeUpdateDto.title,
          price: completeUpdateDto.price,
          status: completeUpdateDto.status,
          imageUrl: completeUpdateDto.imageUrl,
          category: completeUpdateDto.category,
          description: completeUpdateDto.description,
        },
      });
      expect(result).toEqual(updatedProduct);
    });

    it('deve lançar NotFoundException quando produto não existe', async () => {
      mockPrismaService.products.findUnique.mockResolvedValue(null);

      await expect(service.update(productId, updateProductDto)).rejects.toThrow(
        new NotFoundException('Produto não encontrado'),
      );

      expect(prismaService.products.findUnique).toHaveBeenCalledWith({
        where: { id: productId },
      });
      expect(prismaService.products.update).not.toHaveBeenCalled();
    });
  });

  describe('updateStatusProduct', () => {
    const productId = 'product-id-123';

    beforeEach(() => {
      mockPrismaService.products.findUnique.mockResolvedValue(mockProduct);
    });

    it('deve marcar produto como vendido', async () => {
      const updateStatusDto: UpdateStatusProductDto = {
        status: Status.VENDIDO,
      };
      const updatedProduct = { ...mockProduct, status: Status.VENDIDO };
      mockPrismaService.products.update.mockResolvedValue(updatedProduct);

      const result = await service.updateStatusProduct(
        productId,
        updateStatusDto,
      );

      expect(prismaService.products.findUnique).toHaveBeenCalledWith({
        where: { id: productId },
      });
      expect(prismaService.products.update).toHaveBeenCalledWith({
        where: { id: productId },
        data: { status: Status.VENDIDO },
      });
      expect(result).toEqual(updatedProduct);
      expect(result.status).toBe(Status.VENDIDO);
    });

    it('deve cancelar produto', async () => {
      const updateStatusDto: UpdateStatusProductDto = {
        status: Status.CANCELADO,
      };
      const updatedProduct = { ...mockProduct, status: Status.CANCELADO };
      mockPrismaService.products.update.mockResolvedValue(updatedProduct);

      const result = await service.updateStatusProduct(
        productId,
        updateStatusDto,
      );

      expect(prismaService.products.update).toHaveBeenCalledWith({
        where: { id: productId },
        data: { status: Status.CANCELADO },
      });
      expect(result.status).toBe(Status.CANCELADO);
    });

    it('deve reativar produto para anunciado', async () => {
      const updateStatusDto: UpdateStatusProductDto = {
        status: Status.ANUNCIADO,
      };
      const updatedProduct = { ...mockProduct, status: Status.ANUNCIADO };
      mockPrismaService.products.update.mockResolvedValue(updatedProduct);

      const result = await service.updateStatusProduct(
        productId,
        updateStatusDto,
      );

      expect(prismaService.products.update).toHaveBeenCalledWith({
        where: { id: productId },
        data: { status: Status.ANUNCIADO },
      });
      expect(result.status).toBe(Status.ANUNCIADO);
    });

    it('deve lançar NotFoundException quando produto não existe', async () => {
      const updateStatusDto: UpdateStatusProductDto = {
        status: Status.VENDIDO,
      };
      mockPrismaService.products.findUnique.mockResolvedValue(null);

      await expect(
        service.updateStatusProduct(productId, updateStatusDto),
      ).rejects.toThrow(new NotFoundException('Produto não encontrado'));

      expect(prismaService.products.findUnique).toHaveBeenCalledWith({
        where: { id: productId },
      });
      expect(prismaService.products.update).not.toHaveBeenCalled();
    });

    it('deve chamar os métodos com os parâmetros corretos', async () => {
      const updateStatusDto: UpdateStatusProductDto = {
        status: Status.VENDIDO,
      };
      const updatedProduct = { ...mockProduct, status: Status.VENDIDO };
      mockPrismaService.products.update.mockResolvedValue(updatedProduct);

      await service.updateStatusProduct(productId, updateStatusDto);

      expect(prismaService.products.findUnique).toHaveBeenCalledTimes(1);
      expect(prismaService.products.update).toHaveBeenCalledTimes(1);
      expect(prismaService.products.update).toHaveBeenCalledWith({
        where: { id: productId },
        data: { status: Status.VENDIDO },
      });
    });
  });
});
