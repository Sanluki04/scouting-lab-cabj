import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Usuario } from './usuarios.entity';
import { RegisterDto, LoginDto } from './dto/auth.dto';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    private readonly jwtService: JwtService,
  ) {}

  async registrar(registerDto: RegisterDto) {
    const emailNormalizado = registerDto.email.trim().toLowerCase();

    const existe = await this.usuarioRepository.findOne({
      where: { email: emailNormalizado },
    });
    if (existe) {
      throw new BadRequestException('El email ya está registrado');
    }

    const passwordHash = await bcrypt.hash(registerDto.password, 10);

    const nuevoUsuario = this.usuarioRepository.create({
      nombre: registerDto.nombre.trim(),
      email: emailNormalizado,
      password: passwordHash,
    });

    const guardado = await this.usuarioRepository.save(nuevoUsuario);

    const payload = { sub: guardado.id, email: guardado.email };
    const token = await this.jwtService.signAsync(payload);

    return {
      usuario: {
        id: guardado.id,
        nombre: guardado.nombre,
        email: guardado.email,
      },
      token,
    };
  }

  async login(loginDto: LoginDto) {
    const emailNormalizado = loginDto.email.trim().toLowerCase();

    const usuario = await this.usuarioRepository.findOne({
      where: { email: emailNormalizado },
    });
    if (!usuario) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    const passwordValida = await bcrypt.compare(
      loginDto.password,
      usuario.password,
    );
    if (!passwordValida) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    const payload = { sub: usuario.id, email: usuario.email };
    const token = await this.jwtService.signAsync(payload);

    return {
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
      },
      token,
    };
  }

  async findAll() {
    return this.usuarioRepository.find({
      select: {
        id: true,
        nombre: true,
        email: true,
      },
      order: { id: 'ASC' },
    });
  }

  async remove(id: number, solicitanteId?: number) {
    // El primer usuario registrado (id === 1) es el Director / Admin de la Secretaría
    const primerScout = await this.usuarioRepository.find({
      select: { id: true, email: true },
      order: { id: 'ASC' },
      take: 1,
    });
    const adminId = primerScout[0]?.id;

    if (solicitanteId && adminId && solicitanteId !== adminId) {
      throw new ForbiddenException(
        'Solo el Administrador de la Secretaría Técnica puede dar de baja scouts',
      );
    }

    const usuario = await this.usuarioRepository.findOne({ where: { id } });
    if (!usuario) {
      throw new NotFoundException(`Scout con ID ${id} no encontrado`);
    }

    // Desvincular sus fichas para que no se pierdan y pasen a figurar como "EX SCOUTER"
    await this.usuarioRepository.manager.query(
      'UPDATE tareas SET creadoPorId = NULL WHERE creadoPorId = ?',
      [id],
    );

    await this.usuarioRepository.remove(usuario);
    return { mensaje: 'Scout dado de baja; sus fichas quedaron como EX SCOUTER', id };
  }
}