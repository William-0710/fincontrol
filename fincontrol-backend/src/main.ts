import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Ativa o CORS para permitir que o Frontend (Next.js) comunique com a API
  app.enableCors();

  // Ativa a validação de dados em toda a aplicação
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Remove automaticamente campos extra que não estejam no DTO
    forbidNonWhitelisted: true, // Dá erro se o utilizador enviar campos que não existem
  }));

  await app.listen(3333)
}
bootstrap();