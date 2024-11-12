export interface Mensaje {
    emisorUid: string;
    texto: string;
    timestamp: string;
    tipo: 'cliente' | 'mozo';
  }
  
export interface Consulta {
    id?: string;
    mesaId: string;
    clienteId: string;
    mozoId?: string;
    estado: 'activa' | 'cerrada';
    mensajes: Mensaje[];
    fechaCreacion: string;
    fechaUltimoMensaje?: string;
  }