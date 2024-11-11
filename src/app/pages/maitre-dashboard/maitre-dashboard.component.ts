import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Observable } from 'rxjs';
import { DatabaseService } from 'src/app/services/database.service';
import { NotificationService } from 'src/app/services/notification.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-maitre-dashboard',
  templateUrl: './maitre-dashboard.component.html',
  styleUrls: ['./maitre-dashboard.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class MaitreDashboardComponent implements OnInit {
  clientesEnEspera: any[] = [];
  mesasDisponibles: any[] = [];
  clienteSeleccionado: any = null;
  mesaSeleccionada: any = null;

  constructor(
    private database: DatabaseService,
    private notificationService: NotificationService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.cargarClientesEnEspera();
    this.cargarMesasDisponibles();
  }

  cargarClientesEnEspera() {
    this.database.obtenerTodos('clientes')?.subscribe(
      (actions:any) => {
        this.clientesEnEspera = [];
        actions.forEach((action: any) => {
          const cliente = action.payload.doc.data();
          cliente.id = action.payload.doc.id;
          if (cliente.estado === 'esperando') {
            this.clientesEnEspera.push(cliente);
          }
        });
      },
      (error:any) => {
        console.error('Error al cargar clientes:', error);
        this.toastService.presentToast(
          'Error al cargar la lista de espera',
          'bottom',
          'danger'
        );
      }
    );
  }

  cargarMesasDisponibles() {
    this.database.obtenerTodos('mesas')?.subscribe(
      (actions:any) => {
        this.mesasDisponibles = [];
        actions.forEach((action: any) => {
          const mesa = action.payload.doc.data();
          mesa.id = action.payload.doc.id;
          if (!mesa.ocupada) {
            this.mesasDisponibles.push(mesa);
          }
        });
      },
      (error:any) => {
        console.error('Error al cargar mesas:', error);
        this.toastService.presentToast(
          'Error al cargar mesas disponibles',
          'bottom',
          'danger'
        );
      }
    );
  }

  seleccionarCliente(cliente: any) {
    this.clienteSeleccionado = cliente;
  }

  seleccionarMesa(mesa: any) {
    this.mesaSeleccionada = mesa;
  }

  async asignarMesa() {
    if (!this.clienteSeleccionado || !this.mesaSeleccionada) {
      this.toastService.presentToast(
        'Seleccione un cliente y una mesa',
        'bottom',
        'warning'
      );
      return;
    }

    try {
      // Actualizar estado del cliente
      await this.database.actualizar('clientes', {
        estado: 'asignado',
        mesaAsignada: this.mesaSeleccionada.id
      }, this.clienteSeleccionado.id);

      // Actualizar estado de la mesa
      await this.database.actualizar('mesas', {
        ocupada: true,
        clienteId: this.clienteSeleccionado.id
      }, this.mesaSeleccionada.id);

      // Enviar notificación al cliente
      this.notificationService.sendNotificationToRole(
        'Mesa Asignada',
        'Su mesa está lista. Por favor escanee el código QR de la mesa.',
        'Cliente'
      ).subscribe(
        () => {
          this.toastService.presentToast(
            'Mesa asignada exitosamente',
            'bottom',
            'success'
          );
          this.clienteSeleccionado = null;
          this.mesaSeleccionada = null;
        },
        (error:any) => {
          console.error('Error al enviar notificación:', error);
        }
      );
    } catch (error) {
      console.error('Error al asignar mesa:', error);
      this.toastService.presentToast(
        'Error al asignar mesa',
        'bottom',
        'danger'
      );
    }
  }
}