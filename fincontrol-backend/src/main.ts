import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 🚀 CONFIGURAÇÃO DE CORS PARA PRODUÇÃO
  app.enableCors({
    // 1. Diga exatamente quem pode acessar (Substitua pela sua URL real da Vercel)
    origin: [
      'https://fincontrol-mu-lyart.vercel.app/login', // Sua URL de Produção (SEM a barra '/' no final)
      'http://localhost:3000'                   // Mantém funcionando na sua máquina local
    ],
    // 2. Quais métodos HTTP são permitidos (incluindo o OPTIONS do preflight)
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    // 3. Permite o envio de tokens e cookies entre domínios diferentes
    credentials: true,
    // 4. Quais cabeçalhos o frontend pode enviar
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  // O Railway injeta a porta automaticamente na variável process.env.PORT
  await app.listen(process.env.PORT || 3333);
}
bootstrap();