import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class TareasGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Cliente conectado por Socket.IO: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Cliente desconectado: ${client.id}`);
  }

  // Evento opcional por si un cliente envía un mensaje de prueba desde Postman
  @SubscribeMessage('mensaje')
  handleMensaje(client: Socket, payload: any) {
    console.log(`Mensaje recibido de ${client.id}:`, payload);
    this.server.emit('mensaje', {
      remitente: client.id,
      texto: 'Mensaje recibido en el servidor Kanban',
      data: payload,
    });
  }

  notificarCambioTablero(evento: string, data: any) {
    this.server.emit(evento, data);
  }
}