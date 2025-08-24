/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import {
  Category,
  CreateProductDto,
  FilterProductsDto,
  Status,
  UpdateProductDto,
} from './dto/product.dto';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

describe('ProductsController', () => {
  let controller: ProductsController;
  let service: ProductsService;

  const mockProduct = {
    id: 'product-id-123',
    title: 'Boneca Barbie',
    description: 'Boneca Barbie com acessórios',
    price: 4999,
    category: Category.BRINQUEDO,
    status: Status.ANUNCIADO,
    imageUrl: 'https://example.com/boneca.jpg',
    userId: 'user-id-123',
    user: {
      id: 'user-id-123',
      name: 'João Silva',
      email: 'joao@example.com',
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockProductsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    updateStatusProduct: jest.fn(),
    uploadProductImage: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
    service = module.get<ProductsService>(ProductsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const userId = '630d2eef-66a9-4056-8caa-bdf50ae3101f';
    const createProductDto: CreateProductDto = {
      title: 'Boneca Barbie',
      description: 'Boneca Barbie com acessórios',
      price: 4999,
      category: Category.BRINQUEDO,
      status: Status.ANUNCIADO,
      imageUrl: 'https://example.com/boneca.jpg',
    };

    it('deve criar um produto com sucesso', async () => {
      const expectedProduct = { ...mockProduct, userId };
      mockProductsService.create.mockResolvedValue(expectedProduct);

      const result = await controller.create(userId, createProductDto);

      expect(service.create).toHaveBeenCalledWith(userId, createProductDto);
      expect(result).toEqual(expectedProduct);
    });

    it('deve chamar o service com os dados corretos', async () => {
      mockProductsService.create.mockResolvedValue(mockProduct);

      await controller.create(userId, createProductDto);

      expect(service.create).toHaveBeenCalledTimes(1);
      expect(service.create).toHaveBeenCalledWith(userId, createProductDto);
    });
  });

  describe('uploadProductImage', () => {
    const productId = 'product-id-123';
    const mockFile = {
      originalname: 'test-image.jpg',
      buffer: Buffer.from('fake image'),
    } as Express.Multer.File;

    it('deve fazer upload da imagem com sucesso', async () => {
      const expectedResponse = {
        imageUrl:
          'https://s3.amazonaws.com/bucket/products/images/product-id-123-1234567890.jpg',
      };
      mockProductsService.uploadProductImage.mockResolvedValue(
        expectedResponse,
      );

      const result = await controller.uploadProductImage(productId, mockFile);

      expect(service.uploadProductImage).toHaveBeenCalledWith(
        productId,
        mockFile,
      );
      expect(result).toEqual(expectedResponse);
    });

    it('deve chamar o service com os parâmetros corretos', async () => {
      const expectedResponse = { imageUrl: 'https://example.com/image.jpg' };
      mockProductsService.uploadProductImage.mockResolvedValue(
        expectedResponse,
      );

      await controller.uploadProductImage(productId, mockFile);

      expect(service.uploadProductImage).toHaveBeenCalledTimes(1);
      expect(service.uploadProductImage).toHaveBeenCalledWith(
        productId,
        mockFile,
      );
    });

    it('deve lidar com diferentes tipos de arquivo', async () => {
      const pngFile: Express.Multer.File = {
        ...mockFile,
        originalname: 'test-image.png',
        mimetype: 'image/png',
      };
      const expectedResponse = { imageUrl: 'https://example.com/image.png' };
      mockProductsService.uploadProductImage.mockResolvedValue(
        expectedResponse,
      );

      const result = await controller.uploadProductImage(productId, pngFile);

      expect(service.uploadProductImage).toHaveBeenCalledWith(
        productId,
        pngFile,
      );
      expect(result).toEqual(expectedResponse);
    });

    it('deve propagar erros do service', async () => {
      const serviceError = new Error('Upload failed');
      mockProductsService.uploadProductImage.mockRejectedValue(serviceError);

      await expect(
        controller.uploadProductImage(productId, mockFile),
      ).rejects.toThrow(serviceError);

      expect(service.uploadProductImage).toHaveBeenCalledWith(
        productId,
        mockFile,
      );
    });
  });

  describe('findAll', () => {
    const userId = '28f62a11-b2f3-4735-8e69-f5d1387a2562';

    it('deve retornar todos os produtos sem filtros', async () => {
      const products = [mockProduct];
      const filters: FilterProductsDto = {};

      mockProductsService.findAll.mockResolvedValue(products);

      const result = await controller.findAll(userId, filters);

      expect(service.findAll).toHaveBeenCalledWith(userId, filters);
      expect(result).toEqual(products);
    });

    it('deve retornar produtos filtrados por categoria', async () => {
      const products = [mockProduct];
      const filters: FilterProductsDto = {
        status: Category.BRINQUEDO,
      };

      mockProductsService.findAll.mockResolvedValue(products);

      const result = await controller.findAll(userId, filters);

      expect(service.findAll).toHaveBeenCalledWith(userId, filters);
      expect(result).toEqual(products);
    });

    it('deve retornar produtos filtrados por título', async () => {
      const products = [mockProduct];
      const filters: FilterProductsDto = {
        title: 'Barbie',
      };

      mockProductsService.findAll.mockResolvedValue(products);

      const result = await controller.findAll(userId, filters);

      expect(service.findAll).toHaveBeenCalledWith(userId, filters);
      expect(result).toEqual(products);
    });

    it('deve retornar produtos com múltiplos filtros', async () => {
      const products = [mockProduct];
      const filters: FilterProductsDto = {
        title: 'Barbie',
        status: Category.BRINQUEDO,
      };

      mockProductsService.findAll.mockResolvedValue(products);

      const result = await controller.findAll(userId, filters);

      expect(service.findAll).toHaveBeenCalledWith(userId, filters);
      expect(result).toEqual(products);
    });
  });

  describe('findOne', () => {
    const productId = 'product-id-123';

    it('deve retornar um produto específico', async () => {
      mockProductsService.findOne.mockResolvedValue(mockProduct);

      const result = await controller.findOne(productId);

      expect(service.findOne).toHaveBeenCalledWith(productId);
      expect(result).toEqual(mockProduct);
    });

    it('deve chamar o service com o ID correto', async () => {
      mockProductsService.findOne.mockResolvedValue(mockProduct);

      await controller.findOne(productId);

      expect(service.findOne).toHaveBeenCalledTimes(1);
      expect(service.findOne).toHaveBeenCalledWith(productId);
    });
  });

  describe('update', () => {
    const productId = 'product-id-123';
    const updateProductDto: UpdateProductDto = {
      title: 'Boneca Barbie Deluxe',
      price: 5999,
    };

    it('deve atualizar um produto com sucesso', async () => {
      const updatedProduct = { ...mockProduct, ...updateProductDto };
      mockProductsService.update.mockResolvedValue(updatedProduct);

      const result = await controller.update(productId, updateProductDto);

      expect(service.update).toHaveBeenCalledWith(productId, updateProductDto);
      expect(result).toEqual(updatedProduct);
    });

    it('deve atualizar categoria do produto', async () => {
      const updateDto: UpdateProductDto = {
        category: Category.MOVEL,
      };
      const updatedProduct = { ...mockProduct, category: Category.MOVEL };
      mockProductsService.update.mockResolvedValue(updatedProduct);

      const result = await controller.update(productId, updateDto);

      expect(service.update).toHaveBeenCalledWith(productId, updateDto);
      expect(result.category).toBe(Category.MOVEL);
    });

    it('deve chamar o service com os parâmetros corretos', async () => {
      const updatedProduct = { ...mockProduct, ...updateProductDto };
      mockProductsService.update.mockResolvedValue(updatedProduct);

      await controller.update(productId, updateProductDto);

      expect(service.update).toHaveBeenCalledTimes(1);
      expect(service.update).toHaveBeenCalledWith(productId, updateProductDto);
    });
  });
});
