import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // Isto torna o Prisma disponível em todo o projeto sem ter de importar o módulo repetidamente
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}