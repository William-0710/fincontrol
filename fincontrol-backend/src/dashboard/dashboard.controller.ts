import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard) // Só utilizadores com sessão iniciada podem aceder
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  getSummary(@Request() req) {
    // Passa o ID do utilizador (retirado do token JWT) para o serviço
    return this.dashboardService.getSummary(req.user.userId);
  }
}