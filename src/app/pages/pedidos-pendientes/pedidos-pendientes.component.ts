import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Barcode, BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { IonIcon, IonCol, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonItem, IonInput, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonLabel, IonText, IonAlert, IonSpinner, IonGrid, IonRow, IonFab, IonFabButton } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { cameraOutline } from 'ionicons/icons';
import { Cliente } from 'src/app/clases/cliente';
import { AuthService } from 'src/app/services/auth.service';
import { DatabaseService } from 'src/app/services/database.service';
import { FirestoreService } from 'src/app/services/firestore.service';
import { StorageService } from 'src/app/services/storage.service';
import { ToastService } from 'src/app/services/toast.service';
import { Capacitor } from '@capacitor/core';
import Swal from 'sweetalert2';
import { ValidatorsService } from 'src/app/services/validators.service';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { IonicModule } from '@ionic/angular';
import { NotificationService } from 'src/app/services/notification.service';
import { AgruparProductosPipe } from 'src/app/pipes/agrupar-productos.pipe';
import { GoBackToolbarComponent } from 'src/app/shared/components/go-back-toolbar/go-back-toolbar.component';

@Component({
  selector: 'app-pedidos-pendientes',
  templateUrl: './pedidos-pendientes.component.html',
  styleUrls: ['./pedidos-pendientes.component.scss'],
  standalone: true,
  imports: [IonicModule, // Keeps all Ionic components in one import
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    GoBackToolbarComponent,
    AgruparProductosPipe]
})
export class PedidosPendientesComponent  implements OnInit {

  pedidos?: any[];

  constructor(
    private database: DatabaseService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.cargarPedidosPendientes();
  }

  cargarPedidosPendientes() {
    this.database
      .obtenerPedidosPorEstados(['pendiente', 'realizando'], true)
      ?.subscribe((pedidos) => {
        if (pedidos) {
          this.pedidos = pedidos
            .map((pedido) => {
              const data: any = pedido.payload.doc.data();
              const id = pedido.payload.doc.id;
              return { id, ...data };
            })
            .filter((pedido) => pedido.platos && pedido.platos.length > 0); // Filtrar pedidos con al menos un plato
          console.log(this.pedidos);
        }
      });
  }

  async aceptarPedido(pedidoId: string) {
    const dataPedido = {
      estado: 'realizando',
      confirmacionCocinero: true,  // Confirmación del cocinero
      terminoCocinero: false,      // Inicialmente no ha terminado
    };

    this.database.actualizar2('pedidos', dataPedido, pedidoId)
      .then(() => {
        Swal.fire({
          icon: 'success',
          title: 'Pedido aceptado',
          text: 'El pedido ha sido aceptado correctamente.',
          confirmButtonText: 'OK',
          heightAuto: false
        });
        this.cargarPedidosPendientes();
      })
      .catch((error) => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Hubo un error al aceptar el pedido.',
          confirmButtonText: 'OK',
          heightAuto: false

        });
        console.error('Error al aceptar pedido:', error);
      });
  }

  async terminarPedido(pedidoId: string) {
    // Actualiza la variable terminoCocinero a true para indicar que el cocinero ha terminado
    const dataPedido = {
      terminoCocinero: true,
    };

    this.database.actualizar2('pedidos', dataPedido, pedidoId)
      .then(() => {

        this.verificarTerminacionPedido(pedidoId); // Verifica si ambos han confirmado y terminado para actualizar el estado a 'listo'
      })
      .catch((error) => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Hubo un error al actualizar el estado del pedido por el cocinero.',
          confirmButtonText: 'OK',
          heightAuto: false
        });
        console.error('Error al terminar pedido por el cocinero:', error);
      });
  }

  private verificarTerminacionPedido(pedidoId: string) {
    // Obtener el pedido actual
    this.database.obtenerDocumento('pedidos', pedidoId)
      .subscribe((pedido: any) => {
        if (pedido) {
          const confirmacionCocinero = pedido.confirmacionCocinero || false;
          const confirmacionBartender = pedido.confirmacionBartender || false;
          const terminoCocinero = pedido.terminoCocinero || false;
          const terminoBartender = pedido.terminoBartender || false;

          // Verificar si ambos han confirmado y terminado
          if (confirmacionCocinero && confirmacionBartender && terminoCocinero && terminoBartender) {
            // Ambos han confirmado y terminado, actualizar el estado a 'listo'
            this.database.actualizar2('pedidos', { estado: 'listo' }, pedidoId)
              .then(() => {
                Swal.fire({
                  icon: 'success',
                  title: 'Pedido listo',
                  text: 'El pedido está listo para ser entregado.',
                  confirmButtonText: 'OK',
                  heightAuto: false
                });
                this.cargarPedidosPendientes();

                this.notificationService.sendNotificationToRole(
                  'Hay un nuevo pedido listo!',
                  'Esta listo para ser entregado a la mesa...',
                  'Mozo'
                ).subscribe(
                  response => console.log('Notificación a Mozo enviada con éxito', response),
                  error => console.error('Error al enviar notificación a Mozo', error)
                );
              })
              .catch((error) => {
                Swal.fire({
                  icon: 'error',
                  title: 'Error',
                  text: 'Hubo un error al marcar el pedido como listo.',
                  confirmButtonText: 'OK',
                  heightAuto: false
                });
                console.error('Error al marcar pedido como listo:', error);
              });
          } else {
            Swal.fire({
              icon: 'success',
              title: 'Pedido terminado por el cocinero',
              text: 'El cocinero ha terminado su parte del pedido.',
              confirmButtonText: 'OK',
              heightAuto: false
            });
          }

        }
      });
  }

}
