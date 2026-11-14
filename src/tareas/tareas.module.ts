import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TareasService } from './tareas.service';
import { TareasController } from './tareas.controller';
import { TareasGateway } from './tareas.gateway';
import { Tarea } from './tareas.entity';
import { UsuariosModule } from '../usuarios/usuarios.module';

@Module({
  imports: [TypeOrmModule.forFeature([Tarea]), UsuariosModule],
  controllers: [TareasController],
  providers: [TareasService, TareasGateway],
})
export class TareasModule {}