import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TransactionsModule } from './transactions/transactions.module';
import { PrismaModule } from './prisma/prisma.module';
import { GoalsModule } from './goals/goals.module';

@Module({
  imports: [
    PrismaModule, 
    AuthModule, 
    UsersModule, 
    TransactionsModule, 
    GoalsModule // 👈 ADICIONE AQUI
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}