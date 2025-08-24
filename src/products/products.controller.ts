import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
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
import {
  CreateProductDto,
  UpdateProductDto,
  type FilterProductsDto,
} from './dto/product.dto';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post(':userId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Cria um novo produto' })
  @ApiParam({
    name: 'userId',
    description: 'ID do usuário',
    example: '1f3e4d2a-9b0c-4d6f-94f2-8a7e38c5678a',
  })
  @ApiOkResponse({
    description: 'Produto criado com sucesso',
    example: {
      id: 'd6e77244-207b-4981-bc0c-c0325945dc4d',
      title: 'Cadeira Gamer',
      price: 19990,
      description: 'Cadeira gamer ergonômica com apoio para braços.',
      category: 'MOVEL',
      status: 'ANUNCIADO',
      imageUrl: 'https://meusite.com/imagens/produto.png',
      userId: '462ddbe7-7487-4401-96d9-65021b8b7a1e',
      createdAt: '2025-08-23T18:33:12.912Z',
      updatedAt: '2025-08-23T18:33:12.912Z',
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
  create(
    @Param('userId') userId: string,
    @Body() createProductDto: CreateProductDto,
  ) {
    return this.productsService.create(userId, createProductDto);
  }

  @Post('/:productId/upload-image')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Upload de imagem de produto em S3' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({
    name: 'productId',
    description: 'ID do produto',
    example: '1f3e4d2a-9b0c-4d6f-94f2-8a7e38c5678a',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        productImage: {
          type: 'string',
          format: 'binary',
          description: 'Arquivo de imagem do usuário. Max: 2MB',
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Imagem de produto enviado com sucesso',
    example: {
      imageUrl:
        'https://minhaimagem.amazonaws.com/products/images/productId-1755973729162.png',
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
    description: 'Produto não encontrado',
    example: {
      message: 'Produto não encontrado',
      error: 'Not Found',
      statusCode: 404,
    },
  })
  @UseInterceptors(
    FileInterceptor('productImage', {
      limits: { fileSize: 2 * 1024 * 1024 },
    }),
  )
  uploadProductImage(
    @Param('productId') productId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.productsService.uploadProductImage(productId, file);
  }

  @Get('all/:userId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Lista todos os produto de um usuário' })
  @ApiParam({
    name: 'userId',
    description: 'ID do usuário',
    example: '1f3e4d2a-9b0c-4d6f-94f2-8a7e38c5678a',
  })
  @ApiOkResponse({
    description: 'Produtos listados com sucesso',
    example: [
      {
        id: 'd6e77244-207b-4981-bc0c-c0325945dc4d',
        title: 'Cadeira Gamer',
        price: 19990,
        description: 'Cadeira gamer ergonômica com apoio para braços.',
        category: 'MOVEL',
        status: 'ANUNCIADO',
        imageUrl:
          'https://gestao-marketplace.s3.us-east-2.amazonaws.com/products/images/d6e77244-207b-4981-bc0c-c0325945dc4d-1755974355875.png',
        userId: '462ddbe7-7487-4401-96d9-65021b8b7a1e',
        createdAt: '2025-08-23T18:33:12.912Z',
        updatedAt: '2025-08-23T18:39:17.425Z',
      },
    ],
  })
  @ApiNotFoundResponse({
    description: 'Usuário não encontrado',
    example: {
      message: 'Não foi possível encontrar o usuário em nossa base de dados',
      error: 'Not Found',
      statusCode: 404,
    },
  })
  findAll(
    @Param('userId') userId: string,
    @Query() filters: FilterProductsDto,
  ) {
    return this.productsService.findAll(userId, filters);
  }

  @Get(':productId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Lista um produto pelo ID' })
  @ApiParam({
    name: 'productId',
    description: 'ID do produto',
    example: '1f3e4d2a-9b0c-4d6f-94f2-8a7e38c5678a',
  })
  @ApiOkResponse({
    description: 'Produto listado com sucesso',
    example: {
      id: 'd6e77244-207b-4981-bc0c-c0325945dc4d',
      title: 'Cadeira Gamer',
      price: 19990,
      description: 'Cadeira gamer ergonômica com apoio para braços.',
      category: 'MOVEL',
      status: 'ANUNCIADO',
      imageUrl:
        'https://gestao-marketplace.s3.us-east-2.amazonaws.com/products/images/d6e77244-207b-4981-bc0c-c0325945dc4d-1755974355875.png',
      userId: '462ddbe7-7487-4401-96d9-65021b8b7a1e',
      createdAt: '2025-08-23T18:33:12.912Z',
      updatedAt: '2025-08-23T18:39:17.425Z',
    },
  })
  @ApiNotFoundResponse({
    description: 'Produto não encontrado',
    example: {
      message: 'Produto não encontrado',
      error: 'Not Found',
      statusCode: 404,
    },
  })
  findOne(@Param('productId') productId: string) {
    return this.productsService.findOne(productId);
  }

  @Patch(':productId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Atualiza um produto' })
  @ApiParam({
    name: 'productId',
    description: 'ID do produto',
    example: '1f3e4d2a-9b0c-4d6f-94f2-8a7e38c5678a',
  })
  @ApiOkResponse({
    description: 'Usuário atualizado com sucesso',
    example: {
      id: 'd6e77244-207b-4981-bc0c-c0325945dc4d',
      title: 'Cadeira Gamer',
      price: 19990,
      description: 'Cadeira gamer ergonômica com apoio para braços.',
      category: 'MOVEL',
      status: 'ANUNCIADO',
      imageUrl: 'https://meusite.com/imagens/produto.png',
      userId: '462ddbe7-7487-4401-96d9-65021b8b7a1e',
      createdAt: '2025-08-23T18:33:12.912Z',
      updatedAt: '2025-08-23T18:49:29.663Z',
    },
  })
  @ApiNotFoundResponse({
    description: 'Produto não encontrado',
    example: {
      message: 'Produto não encontrado',
      error: 'Not Found',
      statusCode: 404,
    },
  })
  update(
    @Param('productId') productId: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(productId, updateProductDto);
  }
}
