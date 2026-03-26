import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GoalsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, data: { name: string; target: number; icon?: string }) {
    return this.prisma.goal.create({
      data: { ...data, userId },
    });
  }

  async findAll(userId: string) {
    return this.prisma.goal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // 💰 A MÁGICA: Movimentar dinheiro da Caixinha
  async deposit(id: string, userId: string, amount: number) {
    const goal = await this.prisma.goal.findFirst({ where: { id, userId } });
    if (!goal) throw new NotFoundException('Caixinha não encontrada');

    // 1. Atualiza o saldo da caixinha
    const updatedGoal = await this.prisma.goal.update({
      where: { id },
      data: { current: goal.current + amount },
    });

    // 2. Gera uma TRANSAÇÃO de saída (EXPENSE) para sumir do saldo principal
    await this.prisma.transaction.create({
      data: {
        description: `Guardado: ${goal.name} 🔒`,
        amount: amount,
        type: 'EXPENSE',
        category: 'OTHER',
        date: new Date(),
        userId,
      },
    });

    return updatedGoal;
  }

  async withdraw(id: string, userId: string, amount: number) {
    const goal = await this.prisma.goal.findFirst({ where: { id, userId } });
    if (!goal) throw new NotFoundException('Caixinha não encontrada');
    if (goal.current < amount) throw new BadRequestException('Saldo insuficiente na caixinha');

    // 1. Subtrai da caixinha
    const updatedGoal = await this.prisma.goal.update({
      where: { id },
      data: { current: goal.current - amount },
    });

    // 2. Gera uma TRANSAÇÃO de entrada (INCOME) para o dinheiro voltar ao circulante
    await this.prisma.transaction.create({
      data: {
        description: `Resgate: ${goal.name} 🔓`,
        amount: amount,
        type: 'INCOME',
        category: 'OTHER',
        date: new Date(),
        userId,
      },
    });

    return updatedGoal;
  }

  async remove(id: string, userId: string) {
    const goal = await this.prisma.goal.findFirst({ where: { id, userId } });
    if (!goal) throw new NotFoundException('Caixinha não encontrada');
    
    // Se deletar a caixinha com dinheiro, o dinheiro "some" do sistema. 
    // O ideal seria avisar o usuário ou resgatar tudo antes.
    return this.prisma.goal.delete({ where: { id } });
  }
}