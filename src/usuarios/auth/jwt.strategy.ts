import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../usuarios.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SEED')!,
    });
  }

  async validate(payload: { sub: number; email: string }) {
    const usuario = await this.usuarioRepo.findOne({ where: { id: payload.sub } });
    if (!usuario || !usuario.isActive) {
      throw new UnauthorizedException('Token inválido o usuario inactivo');
    }
    const { password: _password, ...usuarioSinPassword } = usuario;
    return usuarioSinPassword; // Esto queda disponible en req.user
  }
}