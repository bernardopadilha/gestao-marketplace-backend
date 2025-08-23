import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
} from '@nestjs/common';
import {
  type CreateProductDto,
  type FilterProductsDto,
  type UpdateProductDto,
  type UpdateStatusProductDto,
} from './dto/product.dto';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post(':userId')
  create(
    @Param('userId') userId: string,
    @Body() createProductDto: CreateProductDto,
  ) {
    return this.productsService.create(userId, createProductDto);
  }

  @Post('/:productId/upload-image')
  uploadProductImage(
    @Param('productId') productId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.productsService.uploadProductImage(productId, file);
  }

  @Get('all/:userId')
  findAll(
    @Param('userId') userId: string,
    @Query() filters: FilterProductsDto,
  ) {
    return this.productsService.findAll(userId, filters);
  }

  @Get(':productId')
  findOne(@Param('productId') productId: string) {
    return this.productsService.findOne(productId);
  }

  @Patch(':productId')
  update(
    @Param('productId') productId: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(productId, updateProductDto);
  }

  @Patch(':productId')
  remove(
    @Param('productId') productId: string,
    @Body() updateStatusProductDto: UpdateStatusProductDto,
  ) {
    return this.productsService.updateStatusProduct(
      productId,
      updateStatusProductDto,
    );
  }
}
