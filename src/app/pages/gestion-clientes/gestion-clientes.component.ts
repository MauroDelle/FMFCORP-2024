import { Component, OnInit } from '@angular/core';
import { DatabaseService } from 'src/app/services/database.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs';
import { Cliente } from 'src/app/clases/cliente';
import { NotificationService } from 'src/app/services/notification.service';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, 
  IonIcon, IonMenu, IonMenuButton, IonList, IonItem, IonLabel, 
  IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonAvatar,
  AlertController, Platform, IonBackButton } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { EmailService } from 'src/app/services/email.service';

@Component({
  selector: 'app-gestion-clientes',
  templateUrl: './gestion-clientes.component.html',
  styleUrls: ['./gestion-clientes.component.scss'],
  standalone: true,
  imports:[
    CommonModule,
    IonHeader, 
    IonToolbar, 
    IonTitle, 
    IonContent,
    IonButtons,
    IonButton,
    IonIcon,
    IonMenu,
    IonMenuButton,
    IonList,
    IonItem,
    IonLabel,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonAvatar,
    IonBackButton,
    IonButtons
  ]
})
export class GestionClientesComponent  implements OnInit {

  clientes: any[] = [];
  idUsuarioSeleccionado: any;
  clientesPendientes: any[] = [];

  constructor(private database: DatabaseService, private notificationSvc: NotificationService, private emailService: EmailService) { }

  ngOnInit() {
    this.cargarClientesPendientes();
  }

  cargarClientesPendientes() {
    // Limpia el array de clientes pendientes antes de agregar los nuevos
    this.clientesPendientes = [];

    const clientesPendientesObservable: Observable<any[]> = this.database.obtenerClientesPendientes()!.pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as any;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    );

    clientesPendientesObservable.subscribe(data => {
      this.clientesPendientes = [];
      this.clientes = data;
      this.clientesPendientes = this.clientes.filter(cliente => cliente.estado === "pendiente");
    }, error => {
      console.log(error);
    });
  }


async gestionarSolicitud(clienteSeleccionado: any, autorizar: boolean) {
  try {
    const idUsuarioSeleccionado = await this.obtenerIdClienteSeleccionado(clienteSeleccionado.dni);
    if (idUsuarioSeleccionado) {
      let nuevoEstado = '';

      if (autorizar) {
        nuevoEstado = 'autorizado';
      } else {
        nuevoEstado = 'rechazado';
      }

      const clienteActualizado = new Cliente(
        clienteSeleccionado.nombre,
        clienteSeleccionado.apellido,
        clienteSeleccionado.dni,
        clienteSeleccionado.email,
        clienteSeleccionado.clave,
        nuevoEstado,
        clienteSeleccionado.anonimo,
        clienteSeleccionado.urlFoto,
        clienteSeleccionado.perfil
      );

      console.log(clienteActualizado)
      console.log(clienteActualizado.toJSON(), idUsuarioSeleccionado);
      await this.database.actualizar("clientes", clienteActualizado.toJSON(), idUsuarioSeleccionado);

      this.emailService.enviarCorreo(clienteActualizado.email, autorizar == true ? 1 : 0 );

      console.log('Cliente actualizado con éxito.');
    } else {
      console.log('No se pudo encontrar el cliente para actualizar.');
    }
  } catch (error) {
    console.error('Error al actualizar el cliente:', error);
  }
}

  obtenerIdClienteSeleccionado(clienteSeleccionadoDni: any): Promise<string | null> {
    const clientesObservable: Observable<any[]> = this.database.obtenerTodos('clientes')!.pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as any;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    );

    return new Promise((resolve, reject) => {
      clientesObservable.subscribe(data => {
        const clienteEncontrado = data.find(cliente => cliente.dni == clienteSeleccionadoDni);
        if (clienteEncontrado) {
          console.log('ID del cliente encontrado:', clienteEncontrado.id);
          resolve(clienteEncontrado.id);
        } else {
          console.log('Cliente con DNI', clienteSeleccionadoDni, 'no encontrado.');
          resolve(null);
        }
      }, error => {
        console.log('Error obteniendo los clientes:', error);
        reject(error);
      });
    });
  }

}
