import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import * as joi from 'joi';
import { UsuariosModule } from './usuarios/usuarios.module';
import { TareasModule } from './tareas/tareas.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: joi.object({
        PORT: joi.number().default(3000),
        DB_HOST: joi.string().required(),
        DB_PORT: joi.number().default(3306),
        DB_USER: joi.string().required(),
        DB_PASS: joi.string().allow('').optional(),
        DATABASE: joi.string().required(),
        JWT_SEED: joi.string().required(),
      }),
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASS'),
        database: configService.get<string>('DATABASE'),
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),

    // Servir archivos subidos (/uploads) y el frontend (/)
    ServeStaticModule.forRoot(
      {
        rootPath: join(__dirname, '..', 'uploads'),
        serveRoot: '/uploads',
      },
      {
        rootPath: join(__dirname, '..', 'public'),
        exclude: ['/api/{*test}'],
      },
    ),

    UsuariosModule,
    TareasModule,
  ],
})
export class AppModule {}