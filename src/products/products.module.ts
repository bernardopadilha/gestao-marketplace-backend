import { Module } from '@nestjs/common';
import { S3Module } from 'src/_common/s3/s3.module';
import { PrismaModule } from 'src/prisma/prisma.module';

import { UsersModule } from 'src/users/users.module';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

@Module({
  imports: [PrismaModule, S3Module, UsersModule],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
