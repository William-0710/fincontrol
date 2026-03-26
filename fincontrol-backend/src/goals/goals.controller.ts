import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { GoalsService } from './goals.service'; // Verifique se o nome está correto aqui
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('goals')
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  private getUserId(req: any) {
    return req.user?.sub || req.user?.userId || req.user?.id;
  }

  @Post()
  create(@Request() req, @Body() data: { name: string; target: number; icon?: string }) {
    return this.goalsService.create(this.getUserId(req), data);
  }

  @Get()
  findAll(@Request() req) {
    return this.goalsService.findAll(this.getUserId(req));
  }

  @Post(':id/deposit')
  deposit(@Request() req, @Param('id') id: string, @Body('amount') amount: number) {
    return this.goalsService.deposit(id, this.getUserId(req), amount);
  }

  @Post(':id/withdraw')
  withdraw(@Request() req, @Param('id') id: string, @Body('amount') amount: number) {
    return this.goalsService.withdraw(id, this.getUserId(req), amount);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.goalsService.remove(id, this.getUserId(req));
  }
}