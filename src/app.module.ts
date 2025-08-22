/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { S3Module } from './_common/s3/s3.module';
import config from './_config';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProductsModule } from './products/products.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
      envFilePath: ['.env', '.env.local'],
    }),
    ProductsModule,
    AuthModule,
    UsersModule,
    PrismaModule,
    S3Module,
  ],
})
export class AppModule {}
