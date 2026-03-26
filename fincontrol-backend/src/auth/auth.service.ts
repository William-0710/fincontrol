import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(data: any) {
    // 1. Verifica se o e-mail já existe
    const userExists = await this.usersService.findByEmail(data.email);
    if (userExists) {
      throw new BadRequestException('Este e-mail já está em uso.');
    }

    // 2. Criptografa a senha
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // 3. Salva no banco de dados
    const user = await this.usersService.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
    });

    // 4. Remove a senha do retorno por segurança
    const { password, ...result } = user;
    return result;
  }

  async login(data: any) {
    // 1. Busca o usuário
    const user = await this.usersService.findByEmail(data.email);
    if (!user) throw new UnauthorizedException('E-mail ou senha incorretos.');

    // 2. Compara a senha digitada com a criptografada
    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) throw new UnauthorizedException('E-mail ou senha incorretos.');

    // 3. Gera o Token JWT
    const payload = { sub: user.id, email: user.email };
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: { id: user.id, name: user.name, email: user.email }
    };
  }
}