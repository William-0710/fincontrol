import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  // 🛡️ Função Sênior para garantir que sempre vamos achar o ID do usuário no Token
  private getUserId(req: any): string {
    return req.user?.sub || req.user?.userId || req.user?.id;
  }

  @Post()
  create(@Request() req, @Body() createTransactionDto: CreateTransactionDto) {
    const userId = this.getUserId(req);
    return this.transactionsService.create(userId, createTransactionDto);
  }

  @Get()
  findAll(
    @Request() req,
    @Query('search') search?: string,
    @Query('type') type?: string,
    @Query('period') period?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNumber = page ? parseInt(page) : 1;
    const limitNumber = limit ? parseInt(limit) : 5;
    const userId = this.getUserId(req);
    
    return this.transactionsService.findAll(userId, search, type, period, pageNumber, limitNumber);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.transactionsService.findOne(id, this.getUserId(req));
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.transactionsService.remove(id, this.getUserId(req));
  }
}