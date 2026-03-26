import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getSummary(userId: string) {
    // Pede à base de dados para agrupar as transações por 'type' e somar o 'amount'
    const aggregations = await this.prisma.transaction.groupBy({
      by: ['type'],
      where: { userId },
      _sum: {
        amount: true,
      },
    });

    let income = 0;
    let expense = 0;

    // Organiza os resultados
    aggregations.forEach((agg) => {
      if (agg.type === 'INCOME') {
        income = Number(agg._sum.amount) || 0;
      } else if (agg.type === 'EXPENSE') {
        expense = Number(agg._sum.amount) || 0;
      }
    });

    // Calcula o saldo final e devolve o resumo
    return {
      balance: income - expense,
      income,
      expense,
    };
  }
}