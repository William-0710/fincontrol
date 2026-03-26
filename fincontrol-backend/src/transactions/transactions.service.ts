import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, data: CreateTransactionDto) {
    return this.prisma.transaction.create({
      data: {
        ...data,
        userId,
      },
    });
  }

  async findAll(userId: string, search?: string, type?: string, period?: string, page: number = 1, limit: number = 5) {
    const now = new Date();
    let dateFilter: any = undefined;

    if (period && period !== 'ALL') {
      if (period === '7DAYS') {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);
        dateFilter = { gte: sevenDaysAgo };
      } else {
        const month = parseInt(period);
        const firstDay = new Date(now.getFullYear(), month, 1);
        const lastDay = new Date(now.getFullYear(), month + 1, 0, 23, 59, 59);
        dateFilter = { gte: firstDay, lte: lastDay };
      }
    }

    const whereCondition: any = {
      userId,
    };

    if (search) {
      whereCondition.description = { contains: search, mode: 'insensitive' };
    }

    if (type && type !== 'ALL') {
      whereCondition.type = type;
    }

    if (dateFilter) {
      whereCondition.date = dateFilter;
    }

    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where: whereCondition,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { date: 'desc' },
      }),
      this.prisma.transaction.count({ where: whereCondition }),
    ]);

    return {
      data: transactions,
      meta: {
        total,
        page,
        limit,
        lastPage: Math.ceil(total / limit) || 1,
      },
    };
  }

  async findOne(id: string, userId: string) {
    const transaction = await this.prisma.transaction.findFirst({
      where: { id, userId },
    });
    if (!transaction) throw new NotFoundException('Transação não encontrada');
    return transaction;
  }

  // 🚀 NOVO MÉTODO: UPDATE
  async update(id: string, userId: string, data: Partial<CreateTransactionDto>) {
    // Reutiliza o findOne para garantir que a transação existe e pertence ao usuário
    await this.findOne(id, userId); 

    return this.prisma.transaction.update({
      where: { id },
      data: {
        description: data.description,
        amount: data.amount,
        type: data.type,
        category: data.category,
        date: data.date,
      },
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId); 
    return this.prisma.transaction.delete({ where: { id } });
  }
}