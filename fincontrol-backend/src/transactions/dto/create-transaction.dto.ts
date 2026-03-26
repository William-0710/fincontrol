import { IsNotEmpty, IsNumber, IsString, IsDateString, IsEnum, IsOptional } from 'class-validator';
import { Category } from '@prisma/client'; // Importamos as categorias diretamente do Prisma

export class CreateTransactionDto {
  @IsString()
  @IsNotEmpty({ message: 'A descrição é obrigatória' })
  description: string;

  @IsNumber()
  @IsNotEmpty({ message: 'O valor é obrigatório' })
  amount: number;

  @IsString()
  @IsNotEmpty({ message: 'O tipo (INCOME/EXPENSE) é obrigatório' })
  type: string;

  @IsDateString()
  @IsNotEmpty({ message: 'A data é obrigatória' })
  date: string;

  // --- NOVO CAMPO DE CATEGORIA ---
  @IsEnum(Category, { message: 'Categoria inválida' })
  @IsNotEmpty({ message: 'A categoria é obrigatória' })
  category: Category;
}