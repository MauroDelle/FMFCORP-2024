import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Observable } from 'rxjs';
import { DatabaseService } from 'src/app/services/database.service';
import { NotificationService } from 'src/app/services/notification.service';
import { ToastService } from 'src/app/services/toast.service';
import { LoadingSpinnerComponent } from 'src/app/spinner/spinner.component';
import { addIcons } from 'ionicons';
import { 
  checkmarkOutline, 
  closeOutline, 
  linkOutline,
  addOutline,
  personAddOutline,
  qrCodeOutline,
  checkmarkCircle,
  personOutline
} from 'ionicons/icons';
import { Mesa } from 'src/app/clases/mesa';
import { connectStorageEmulator } from '@angular/fire/storage';
import { GoBackToolbarComponent } from 'src/app/shared/components/go-back-toolbar/go-back-toolbar.component';

interface Mozo {
  id: string;
  nombre: string;
  apellido: string;
  estado: 'disponible' | 'ocupado';
  mesasAsignadas: string[];
}

@Component({
  selector: 'app-maitre-dashboard',
  templateUrl: './maitre-dashboard.component.html',
  styleUrls: ['./maitre-dashboard.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, LoadingSpinnerComponent, GoBackToolbarComponent]
})
export class MaitreDashboardComponent implements OnInit {
  clientesEnEspera: any[] = [];
  mesasDisponibles: any[] = [];
  clienteSeleccionado: any = null;
  mesaSeleccionada: any = null;
  isLoading: boolean = true;
  showConfirmModal: boolean = false;
  mozosDisponibles: Mozo[] = [];
  mozoAsignado: Mozo | null = null;

  constructor(
    private database: DatabaseService,
    private notificationService: NotificationService,
    private toastService: ToastService
  ) {
    addIcons({
      checkmarkOutline,
      closeOutline,
      linkOutline,
      addOutline,
      personAddOutline,
      qrCodeOutline,
      checkmarkCircle,
      personOutline
    });
  }

  ngOnInit() {
    this.cargarDatos();
  }

  async cargarDatos() {
    this.isLoading = true;
    await Promise.all([
      this.cargarClientesEnEspera(),
      this.cargarMesasDisponibles(),
      this.cargarMozosDisponibles()
    ]);
    this.isLoading = false;
  }

  cargarClientesEnEspera() {
    return new Promise((resolve) => {
      this.database.obtenerTodos('clientes')?.subscribe({
        next: (actions: any) => {
          this.clientesEnEspera = [];
          actions.forEach((action: any) => {
            const cliente = action.payload.doc.data();
            cliente.id = action.payload.doc.id;
            if (cliente.estado === 'esperando-mesa') {
              this.clientesEnEspera.push(cliente);
            }
          });
          resolve(true);
        },
        error: (error) => {
          console.error('Error al cargar clientes:', error);
          /*
          this.toastService.presentToast(
            'Error al cargar la lista de espera',
            'bottom',
            'danger'
          );
          */
          resolve(false);
        }
      });
    });
  }

  cargarMesasDisponibles() {
    return new Promise((resolve) => {
      this.database.obtenerTodos('mesas')?.subscribe({
        next: (actions: any) => {
          this.mesasDisponibles = [];
          actions.forEach((action: any) => {
            const data = action.payload.doc.data();
            const id = action.payload.doc.id;
            
            // Crear objeto mesa con tipado
            const mesa = {
              id,
              numero: data.numero,
              cantidadComensales: data.cantidadComensales,
              tipo: data.tipo,
              estado: data.estado || 'libre',
              clienteId: data.clienteId,
              mozoId: data.mozoId,
              fechaAsignacion: data.fechaAsignacion,
              urlFoto: data.urlFoto
            };
  
            // Verificar si la mesa está disponible (estado libre)
            if (mesa.estado === 'libre') {
              this.mesasDisponibles.push(mesa);
            }
          });
  
          // Ordenar mesas por número
          this.mesasDisponibles.sort((a, b) => 
            parseInt(a.numero) - parseInt(b.numero)
          );

          console.log(this.mesasDisponibles)
  
          resolve(true);
        },
        error: (error) => {
          console.error('Error al cargar mesas:', error);
          /*
          this.toastService.presentToast(
            'Error al cargar mesas disponibles',
            'bottom',
            'danger'
          );
          */
          resolve(false);
        }
      });
    });
  }

  cargarMozosDisponibles() {
    return new Promise((resolve) => {
      this.database.obtenerTodos('usuarios')?.subscribe({
        next: (actions: any) => {
          this.mozosDisponibles = [];
          actions.forEach((action: any) => {
            const usuario = action.payload.doc.data();
            usuario.id = action.payload.doc.id;
            if (usuario.perfil?.toLowerCase() === 'mozo' && usuario.estado !== 'ocupado') {
              this.mozosDisponibles.push({
                id: usuario.id,
                nombre: usuario.nombre,
                apellido: usuario.apellido,
                estado: usuario.estado || 'disponible',
                mesasAsignadas: usuario.mesasAsignadas || []
              });
            }
          });
          resolve(true);
        },
        error: (error) => {
          console.error('Error al cargar mozos:', error);
          /*
          this.toastService.presentToast(
            'Error al cargar mozos disponibles',
            'bottom',
            'danger'
          );
          */
          resolve(false);
        }
      });
    });
  }

  seleccionarCliente(cliente: any) {
    this.clienteSeleccionado = cliente;
  }

  seleccionarMesa(mesa: any) {
    this.mesaSeleccionada = mesa;
  }

  seleccionarMozo(mozo: Mozo) {
    this.mozoAsignado = mozo;
  }

  async verificarMesaDisponible(mesaId: string): Promise<boolean> {
    const mesa = await this.database.obtenerDocumento('mesas', mesaId).toPromise();
    return !mesa?.ocupada;
  }

  async verificarClienteElegible(clienteId: string): Promise<boolean> {
    const cliente = await this.database.obtenerDocumento('clientes', clienteId).toPromise();
    return cliente?.estado === 'esperando-mesa' && !cliente?.mesaAsignada;
  }

  async mostrarAlertaMesaAsignada(numeroMesa: string) {
    this.toastService.presentToast(`Mesa ${numeroMesa} ya asignada. No puede seleccionar otra mesa.`, 'top', 'danger');
  }

  async asignarMesa() {
    console.log("entre")
    if (!this.clienteSeleccionado || !this.mesaSeleccionada) {
      this.toastService.presentToast(
        'Seleccione un cliente y una mesa',
        'bottom',
        'warning'
      );
      return;
    }

    // Verificar disponibilidad de mesa
    const mesaDisponible = await this.verificarMesaDisponible(this.mesaSeleccionada.id);
    if (!mesaDisponible) {
      this.toastService.presentToast(
        'Esta mesa ya no está disponible',
        'bottom',
        'warning'
      );
      await this.cargarMesasDisponibles();
      return;
    }

    // Verificar elegibilidad del cliente
    const clienteElegible = await this.verificarClienteElegible(this.clienteSeleccionado.id);
    if (!clienteElegible) {
      this.toastService.presentToast(
        'Este cliente ya tiene una mesa asignada o no está en espera',
        'bottom',
        'warning'
      );
      await this.cargarClientesEnEspera();
      return;
    }

    this.showConfirmModal = true;
  }

  async confirmarAsignacion() {
    this.isLoading = true;
    this.showConfirmModal = false;

    try {
      // Actualizar estado del cliente
      await this.database.actualizar('clientes', {
        estado: 'asignado',
        mesaAsignada: this.mesaSeleccionada.id
      }, this.clienteSeleccionado.id);

      // Crear objeto mesa con valores seguros
      const mesaData = {
        numero: this.mesaSeleccionada.numero,
        cantidadComensales: this.mesaSeleccionada.cantidadComensales,
        tipo: this.mesaSeleccionada.tipo,
        estado: 'vigente',
        clienteId: this.clienteSeleccionado.id,
        fechaAsignacion: new Date().toISOString(),
        urlFoto: this.mesaSeleccionada.urlFoto || null
      };

      // Solo agregar mozoId si existe un mozo asignado
      if (this.mozoAsignado?.id) {
        Object.assign(mesaData, { mozoId: this.mozoAsignado.id });
      }

      // Actualizar la mesa
      await this.database.actualizar('mesas', mesaData, this.mesaSeleccionada.id);

      // Actualizar el estado del mozo si existe
      if (this.mozoAsignado?.id) {
        const mesasActualizadas = [
          ...(this.mozoAsignado.mesasAsignadas || []),
          this.mesaSeleccionada.id
        ];

        await this.database.actualizar('usuarios', {
          mesasAsignadas: mesasActualizadas,
          estado: mesasActualizadas.length >= 5 ? 'ocupado' : 'disponible'
        }, this.mozoAsignado.id);

        // Notificar al mozo
        this.notificationService.sendNotificationToRole(
          'Nueva Mesa Asignada',
          `Se le ha asignado la mesa ${this.mesaSeleccionada.numero}`,
          'Mozo'
        ).subscribe();
      }

      // Notificar al cliente
      this.notificationService.sendNotificationToRole(
        'Mesa Asignada',
        `Su mesa ${this.mesaSeleccionada.numero} está lista. Por favor escanee el código QR de la mesa.`,
        'Cliente'
      ).subscribe(
        () => {
          this.toastService.presentToast(
            'Mesa asignada exitosamente',
            'bottom',
            'success'
          );
          this.resetearSelecciones();
          this.cargarDatos();
        },
        (error) => {
          console.error('Error al enviar notificación:', error);
        }
      );
    } catch (error) {
      console.error('Error al asignar mesa:', error);
      /*
      this.toastService.presentToast(
        'Error al asignar mesa',
        'bottom',
        'danger'
      );*/
    } finally {
      this.isLoading = false;
    }
  }

  private resetearSelecciones() {
    this.clienteSeleccionado = null;
    this.mesaSeleccionada = null;
    this.mozoAsignado = null;
    this.showConfirmModal = false;
}

  cancelarAsignacion() {
    this.showConfirmModal = false;
  }
}