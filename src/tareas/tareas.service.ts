import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tarea } from './tareas.entity';
import { CreateTareaDto, UpdateEstadoTareaDto } from './dto/tarea.dto';
import { Usuario } from '../usuarios/usuarios.entity';
import { TareasGateway } from './tareas.gateway';

@Injectable()
export class TareasService {
  constructor(
    @InjectRepository(Tarea)
    private readonly tareaRepo: Repository<Tarea>,
    private readonly tareasGateway: TareasGateway,
  ) {}

  private limpiarCreador(tarea: Tarea) {
    if (tarea.creadoPor) {
      const { password: _password, ...creadorLimpio } = tarea.creadoPor;
      return { ...tarea, creadoPor: creadorLimpio };
    }
    return tarea;
  }

  async create(createTareaDto: CreateTareaDto, usuario: Usuario) {
    const nuevaTarea = this.tareaRepo.create({
      ...createTareaDto,
      creadoPor: usuario,
    });

    const guardada = await this.tareaRepo.save(nuevaTarea);
    const respuesta = this.limpiarCreador(guardada);

    // Emitir evento en tiempo real por Socket.IO
    this.tareasGateway.notificarCambioTablero('tarea-creada', respuesta);

    return { ok: true, tarea: respuesta };
  }

  async findAll() {
    const tareas = await this.tareaRepo.find({
      order: { fechaCreacion: 'DESC' },
    });

    const limpias = tareas.map((t) => this.limpiarCreador(t));

    return { ok: true, tareas: limpias };
  }

  async actualizarEstado(id: number, dto: UpdateEstadoTareaDto) {
    const tarea = await this.tareaRepo.findOne({ where: { id } });
    if (!tarea) throw new NotFoundException(`Tarea #${id} no encontrada`);

    tarea.estado = dto.estado;
    const actualizada = await this.tareaRepo.save(tarea);
    const respuesta = this.limpiarCreador(actualizada);

    // Emitir evento en tiempo real por Socket.IO
    this.tareasGateway.notificarCambioTablero('tarea-actualizada', respuesta);

    return { ok: true, tarea: respuesta };
  }

  async adjuntarArchivo(id: number, nombreArchivo: string) {
    const tarea = await this.tareaRepo.findOne({ where: { id } });
    if (!tarea) throw new NotFoundException(`Tarea #${id} no encontrada`);

    tarea.archivoAdjunto = `/uploads/${nombreArchivo}`;
    const actualizada = await this.tareaRepo.save(tarea);
    const respuesta = this.limpiarCreador(actualizada);

    // Emitir evento en tiempo real por Socket.IO
    this.tareasGateway.notificarCambioTablero('archivo-adjuntado', respuesta);

    return {
      ok: true,
      mensaje: 'Archivo subido y vinculado con éxito',
      ruta: tarea.archivoAdjunto,
      tarea: respuesta,
    };
  }

  async remove(id: number) {
    const tarea = await this.tareaRepo.findOne({ where: { id } });
    if (!tarea) throw new NotFoundException(`Tarea #${id} no encontrada`);

    await this.tareaRepo.remove(tarea);
    this.tareasGateway.notificarCambioTablero('tarea-eliminada', { id });

    return { ok: true, mensaje: `Tarea #${id} eliminada` };
  }
}