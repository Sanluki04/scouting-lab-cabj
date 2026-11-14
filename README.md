# ⚽ Scouting Lab CABJ — Secretaría Técnica & Mercado de Pases

Aplicación Full Stack desarrollada como Trabajo Final de Backend en **NestJS**, orientada a la gestión colaborativa en tiempo real de la **Secretaría Técnica del Club Atlético Boca Juniors**.

El sistema permite a un cuerpo técnico de hasta **5 scouts** proponer posibles refuerzos, analizar cotizaciones y contratos, adjuntar informes técnicos o fotografías, y gestionar el avance de las negociaciones sincronizando todos los cambios en vivo entre los integrantes conectados.

---

## 🎯 ¿Para qué sirve?

Centraliza el seguimiento del mercado de pases del club en un tablero editorial compartido:
1. **Ojeo / Seguimiento (`PENDIENTE`):** Los scouts cargan jugadores analizados con su club actual, cotización estimada, vigencia contractual, características técnicas e informes en PDF o imagen.
2. **En Negociación (`EN_PROGRESO`):** Cuando el club avanza por un objetivo, cualquier integrante del equipo mueve la ficha a negociación activa y todos los scouts conectados ven la actualización al instante sin recargar la página.
3. **Refuerzo Confirmado (`COMPLETADA`):** Registra los fichajes cerrados e incorporados al plantel.

---

## ⚙️ Arquitectura y Tecnologías (Backend)

El servidor está construido con **NestJS** y **TypeScript**, cumpliendo con una arquitectura modular y los siguientes pilares técnicos:

- **Persistencia Relacional (TypeORM + MySQL):** Modelado de entidades `Usuario` y `Tarea` (fichas de jugadores) con relación `@ManyToOne` y manejo seguro de bajas (`onDelete: 'SET NULL'`), asegurando que si un scout es dado de baja, sus fichas propuestas permanezcan en el historial del club bajo la etiqueta **`EX SCOUTER`**.
- **Autenticación y Seguridad (JWT + bcrypt):** Registro e inicio de sesión con contraseñas encriptadas (`bcrypt`), normalización de correos y protección de rutas mediante `JwtAuthGuard` y estrategia Passport JWT.
- **Validación de Datos (Joi + class-validator):**
  - Validación estricta de variables de entorno al iniciar la aplicación con **Joi** (`DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET`, `PORT`).
  - Validación automática de DTOs de entrada mediante `ValidationPipe` global.
- **Carga de Archivos (Multer):** Subida de fotografías de jugadores e informes técnicos en PDF asociados a cada ficha (`/api/tareas/:id/archivo`), servidos como archivos estáticos desde `/uploads`.
- **Tiempo Real (Socket.IO):** Gateway de WebSockets (`TareasGateway`) que emite eventos en vivo (`tarea-creada`, `tarea-actualizada`, `archivo-adjuntado`, `tarea-eliminada`) a todos los clientes conectados.
- **Servidor Estático Integrado (`ServeStaticModule`):** El propio backend sirve la interfaz web desde `public/` sin necesidad de levantar un servidor frontend separado.

---

## 🖥️ Funcionalidades de la Interfaz Web (`public/`)

- **Identidad Editorial Deportiva:** Diseño minimalista en tonos azul oscuro, blanco y oro (`#f5b800`) adaptado a la Secretaría Técnica de Boca Juniors.
- **Formulario Inteligente de Alta:**
  - Formateo automático en vivo de cotizaciones (ej. escribir `8m` o `8000000` se formatea como `$ 8.000.000`).
  - Conversión automática de vigencia contractual (ej. `2a` → `2 años`, `6m` → `6 meses`, `1a 6m` → `1 año y 6 meses`).
  - Carga simultánea de archivo/PDF al momento de proponer el jugador.
- **Filtros Combinables:** Filtrado rápido por etapa del mercado (*Todos*, *Seguimiento*, *Negociación*, *Refuerzos*), por línea/posición (*Arqueros*, *Defensores*, *Mediocampistas*, *Delanteros*) y buscador en tiempo real por nombre, club, características o scout.
- **Gestión de Scouts y Rol Administrador:**
  - Modal **`Scouts (X/5)`** para visualizar a los compañeros del cuerpo técnico.
  - El primer usuario registrado actúa como **Administrador / Director**, siendo el único autorizado (validado tanto en frontend como en backend) para dar de baja cuentas de scouts.

---

## 🚀 Cómo levantar y conectarse al proyecto

### 1. Requisitos previos
- **Node.js** (v18 o superior)
- **Docker** (para levantar la base de datos MySQL)

### 2. Clonar el repositorio e instalar dependencias

    git clone https://github.com/Sanluki04/scouting-lab-cabj.git
    cd scouting-lab-cabj
    npm install

### 3. Configurar variables de entorno
Copiá el archivo de plantilla `.env.template` a `.env` y completá los valores de conexión:

    cp .env.template .env

Ejemplo de configuración en `.env`:

    PORT=3000
    DB_HOST=localhost
    DB_PORT=3306
    DB_USER=root
    DB_PASSWORD=root
    DB_NAME=kanban_db
    JWT_SECRET=clave_secreta_super_segura_cabj

### 4. Levantar la base de datos MySQL con Docker

    docker run -d --name mysql-kanban -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=kanban_db -p 3306:3306 mysql:8

### 5. Iniciar el servidor NestJS

    npm run start:dev

TypeORM creará automáticamente las tablas `usuarios` y `tareas` al conectarse.

### 6. Ingresar a la aplicación
Abrí el navegador y entrá a:
- **Aplicación Web:** http://localhost:3000
- **Prefijo API REST:** http://localhost:3000/api

> **💡 Tip para probar tiempo real (Socket.IO):** Registrá el primer usuario (que quedará como Administrador), abrí una segunda ventana o pestaña en modo incógnito, registrá un segundo scout y probá crear o mover un jugador de etapa para ver cómo se actualiza en vivo en ambas pantallas.