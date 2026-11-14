import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post('auth/register')
  registrar(@Body() registerDto: RegisterDto) {
    return this.usuariosService.registrar(registerDto);
  }

  @Post('auth/login')
  login(@Body() loginDto: LoginDto) {
    return this.usuariosService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.usuariosService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const solicitanteId = req.user?.id || req.user?.sub;
    return this.usuariosService.remove(id, solicitanteId);
  }
}