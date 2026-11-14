import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Usuario } from '../usuarios/usuarios.entity';

export enum EstadoTarea {
  PENDIENTE = 'PENDIENTE',
  EN_PROGRESO = 'EN_PROGRESO',
  COMPLETADA = 'COMPLETADA',
}

@Entity('tareas')
export class Tarea {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 150 })
  titulo: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({
    type: 'enum',
    enum: EstadoTarea,
    default: EstadoTarea.PENDIENTE,
  })
  estado: EstadoTarea;

  @Column({ type: 'varchar', length: 255, nullable: true })
  archivoAdjunto: string | null;

  @CreateDateColumn()
  fechaCreacion: Date;

  @ManyToOne(() => Usuario, {
    eager: true,
    nullable: true,
    onDelete: 'SET NULL',
  })
  creadoPor: Usuario | null;
}