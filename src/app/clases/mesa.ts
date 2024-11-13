// export class Mesa {
//     id?: string;
//     numero: string;
//     cantidadComensales: number;
//     tipo: string; // 'VIP' | 'Discapacitados' | 'Estándar'
//     estado: string; // 'libre' | 'ocupada' | 'reservada' | 'vigente'
//     clienteId?: string; // ID del cliente asignado a la mesa
//     mozoId?: string; // ID del mozo asignado
//     fechaAsignacion?: Date;
//     urlFoto?: string;

//     constructor(
//         numero: string,
//         cantidadComensales: number,
//         tipo: string,
//         estado: string = 'libre',
//         clienteId?: string,
//         mozoId?: string,
//         fechaAsignacion?: Date,
//         urlFoto?: string
//     ) {
//         this.numero = numero;
//         this.cantidadComensales = cantidadComensales;
//         this.tipo = tipo;
//         this.estado = estado;
//         this.clienteId = clienteId;
//         this.mozoId = mozoId;
//         this.fechaAsignacion = fechaAsignacion;
//         this.urlFoto = urlFoto;
//     }

//     toJSON() {
//         return {
//             numero: this.numero,
//             cantidadComensales: this.cantidadComensales,
//             tipo: this.tipo,
//             estado: this.estado,
//             clienteId: this.clienteId,
//             mozoId: this.mozoId,
//             fechaAsignacion: this.fechaAsignacion,
//             urlFoto: this.urlFoto
//         };
//     }
// }