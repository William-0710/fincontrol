import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'minha-senha-super-secreta-123', // A mesma do auth.module
    });
  }

  async validate(payload: any) {
    // O que retornarmos aqui ficará disponível no 'req.user' de todas as rotas protegidas
    return { userId: payload.sub, email: payload.email };
  }
}