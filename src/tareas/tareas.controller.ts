import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { TareasService } from './tareas.service';
import { CreateTareaDto, UpdateEstadoTareaDto } from './dto/tarea.dto';
import { JwtAuthGuard } from '../usuarios/auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard) // Todas las rutas de tareas requieren Token JWT
@Controller('tareas')
export class TareasController {
  constructor(private readonly tareasService: TareasService) {}

  @Post()
  create(@Body() createTareaDto: CreateTareaDto, @Req() req: any) {
    return this.tareasService.create(createTareaDto, req.user);
  }

  @Get()
  findAll() {
    return this.tareasService.findAll();
  }

  @Patch(':id/estado')
  actualizarEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEstadoTareaDto,
  ) {
    return this.tareasService.actualizarEstado(id, dto);
  }

  // Requisito 4 (Opcional): Subida de archivos con Multer y UUID
  @Post(':id/archivo')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (_req, file, cb) => {
          const nombreUnico = `${uuidv4()}${extname(file.originalname)}`;
          cb(null, nombreUnico);
        },
      }),
    }),
  )
  subirArchivo(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Debes enviar un archivo en el campo "file"');
    }
    return this.tareasService.adjuntarArchivo(id, file.filename);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.tareasService.remove(id);
  }
}