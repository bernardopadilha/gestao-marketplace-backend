/* eslint-disable @typescript-eslint/no-floating-promises */
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

import { apiReference } from '@scalar/nestjs-api-reference';

const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || '0.0.0.0';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'https://gestao-marketplace-frontend.vercel.app',
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Gestão Marketplace')
    .setDescription('Desafio para vaga full-stack ZEINE')
    .setVersion('1.0.0')
    .setContact(
      'Bernardo Padilha',
      'https://www.bernardopadilha.com.br/',
      'bernardoa.padilha@gmailcom',
    )
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    })
    .build();

  const document = SwaggerModule.createDocument(app, config);
  app.use(
    '/docs',

    apiReference({
      content: document,
    }),
  );

  await app.listen(PORT, () => {
    console.log(`🦁 NestJS listening at http://${HOST}:${PORT}/`);
    console.log(`📚 NestJS docs at http://${HOST}:${PORT}/docs`);
  });
}
bootstrap();
