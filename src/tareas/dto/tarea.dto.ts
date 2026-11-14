import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { EstadoTarea } from '../tareas.entity';

export class CreateTareaDto {
  @IsString()
  @MinLength(3)
  titulo: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsEnum(EstadoTarea)
  estado?: EstadoTarea;
}

export class UpdateEstadoTareaDto {
  @IsEnum(EstadoTarea)
  estado: EstadoTarea;
}