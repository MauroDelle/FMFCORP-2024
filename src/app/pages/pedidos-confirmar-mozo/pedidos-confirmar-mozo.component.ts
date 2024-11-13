import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonText, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonLabel, IonButton } from "@ionic/angular/standalone";
import { DatabaseService } from 'src/app/services/database.service';
import { NotificationService } from 'src/app/services/notification.service';
import Swal from 'sweetalert2';
import { AgruparProductosPipe } from "../../pipes/agrupar-productos.pipe";

@Component({
  selector: 'app-pedidos-confirmar-mozo',
  templateUrl: './pedidos-confirmar-mozo.component.html',
  styleUrls: ['./pedidos-confirmar-mozo.component.scss'],
  standalone: true,
  imports: [CommonModule, IonButton, IonLabel, IonCardContent, IonCardTitle, IonCardHeader, IonCard, IonText, IonContent, IonTitle, IonToolbar, IonHeader, AgruparProductosPipe]
})
export class PedidosConfirmarMozoComponent  implements OnInit {
  pedidos?: any[];

  constructor(private database: DatabaseService, private notificationService: NotificationService) { }

  ngOnInit() {
    this.cargarPedidosPorConfirmar();
  }

  cargarPedidosPorConfirmar() {
    this.database.obtenerPedidosParaElMozo(['pendiente', 'realizando', 'listo'])?.subscribe((pedidos) => {
      if (pedidos) {
        this.pedidos = pedidos.map(pedido => {
          const data: any = pedido.payload.doc.data(); // asegúrate de que data sea de tipo any
          const id = pedido.payload.doc.id;
          return { id, ...data };
        });
        console.log(this.pedidos);
      }
    });
  }

  confirmarPedido(idPedido: string) {
    this.database.actualizar2('pedidos', { confirmacionMozo: true }, idPedido)
      .then(() => {
        Swal.fire({
          heightAuto: false,
          icon: 'success',
          title: 'Pedido confirmado',
          text: 'El pedido ha sido confirmado correctamente.',
          confirmButtonText: 'OK'
        });

        // Actualizar la lista de pedidos después de confirmar
        this.cargarPedidosPorConfirmar();

        // Obtener el pedido confirmado
        const pedidoConfirmado = this.pedidos?.find(pedido => pedido.id === idPedido);

        console.log(pedidoConfirmado);

        // Verificar si el pedido contiene platos y enviar notificación al cocinero
        if (pedidoConfirmado.platos && pedidoConfirmado.platos.length > 0) {
          this.notificationService.sendNotificationToRole(
            'Nuevo pedido de cocina!',
            'Hay nuevos platos para preparar.',
            'Cocinero'
          ).subscribe(
            response => console.log('Notificación a Cocinero enviada con éxito', response),
            error => console.error('Error al enviar notificación a Cocinero', error)
          );
        }

        // Verificar si el pedido contiene bebidas y enviar notificación al bartender
        if (pedidoConfirmado.bebidas && pedidoConfirmado.bebidas.length > 0) {
          this.notificationService.sendNotificationToRole(
            'Nuevo pedido de bar!',
            'Se necesitan preparar nuevas bebidas.',
            'Bartender'
          ).subscribe(
            response => console.log('Notificación a Bartender enviada con éxito', response),
            error => console.error('Error al enviar notificación a Bartender', error)
          );
        }

      })
      .catch(error => {
        Swal.fire({
          heightAuto: false,
          icon: 'error',
          title: 'Error',
          text: 'Hubo un error al confirmar el pedido.',
          confirmButtonText: 'OK'
        });
        console.error('Error al confirmar pedido:', error);
      });
  }

  entregarPedido(idPedido: string) {
    this.database.actualizar2('pedidos', { estado: 'entregado' }, idPedido)
      .then(() => {
        Swal.fire({
          heightAuto: false,
          icon: 'success',
          title: 'Pedido entregado',
          text: 'El pedido ha sido entregado correctamente.',
          confirmButtonText: 'OK'
        });

        // Actualizar la lista de pedidos después de confirmar
        this.cargarPedidosPorConfirmar();

      })
      .catch(error => {
        Swal.fire({
          heightAuto: false,
          icon: 'error',
          title: 'Error',
          text: 'Hubo un error al entregar el pedido.',
          confirmButtonText: 'OK'
        });
        console.error('Error al entregar pedido:', error);
      });
  }
}
