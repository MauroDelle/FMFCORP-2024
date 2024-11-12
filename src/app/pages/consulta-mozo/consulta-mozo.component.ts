import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { DatabaseService } from 'src/app/services/database.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AuthService } from 'src/app/services/auth.service';
import { Router, ActivatedRoute, Data } from '@angular/router';
import { Observable, map, switchMap, forkJoin } from 'rxjs';
import { NotificationService } from 'src/app/services/notification.service';
import { CommonModule } from '@angular/common';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, 
  IonIcon, IonMenu, IonMenuButton, IonList, IonItem, IonLabel, 
  IonCard, IonCardHeader, IonCardTitle, IonFooter, IonInput, IonBackButton, IonListHeader, IonAvatar, IonBadge } from '@ionic/angular/standalone';
import { LoadingSpinnerComponent } from 'src/app/spinner/spinner.component';
import { FormsModule } from '@angular/forms';
import { Mesa } from 'src/app/clases/mesa';
import { addIcons } from 'ionicons';
import { paperPlane } from 'ionicons/icons';
import { GoBackToolbarComponent } from 'src/app/shared/components/go-back-toolbar/go-back-toolbar.component';

@Component({
  selector: 'app-consulta-mozo',
  templateUrl: './consulta-mozo.component.html',
  styleUrls: ['./consulta-mozo.component.scss'],
  standalone: true,
  imports:[
    CommonModule,
    IonToolbar, 
    IonContent,
    IonButton,
    IonIcon,
    IonList,
    IonItem,
    IonLabel,
    IonCard,
    IonCardTitle,
    IonFooter, 
    IonInput,
    FormsModule,
    IonListHeader, 
    IonBadge,
    GoBackToolbarComponent,
    LoadingSpinnerComponent,
  ]
})
export class ConsultaMozoComponent  implements OnInit {

  @ViewChild('contenedorDeMensajes') contenedorDeMensajes!: ElementRef;

  usuarioLogeado: any;
  nuevoMensaje: string = "";
  mesasVigentes: Mesa[] = [];
  mostrarChat = false;
  perfilUsuarioActual: string = "";
  consultasDelUsuario: any[] = [];
  idConsulta: string = "";
  consultaActual: any;
  esMozo: boolean = false;
  isLoading: boolean = false;

  constructor(
    private authService: AuthService,
    private database: DatabaseService,
    private notificationSvc: NotificationService
  ) {
    addIcons({
      'paper-plane': paperPlane
    });
  }

  ngOnInit() {
    this.usuarioLogeado = this.authService.loggedUser;
    this.obtenerPerfilUsuario();
    this.cargarMesasVigentes();
    this.cargarConsultasCliente();
  }

  private obtenerPerfilUsuario() {
    this.database.obtenerTodos('usuarios')!.pipe(
      map(actions => actions.map(a => ({
        id: a.payload.doc.id,
        ...a.payload.doc.data() as any
      })))
    ).subscribe(usuarios => {
      const usuario = usuarios.find(u => u.email === this.usuarioLogeado.email);
      if (usuario) {
        this.perfilUsuarioActual = usuario.perfil;
        this.esMozo = usuario.perfil.toLowerCase() === 'mozo';
      } else {
        // Si no se encuentra en usuarios, asumimos que es un cliente
        this.perfilUsuarioActual = 'Cliente';
        this.esMozo = false;
        this.cargarConsultasCliente();
      }
    });
  }

  private cargarMesasVigentes() {
    this.database.obtenerTodos('mesas')!.pipe(
      map(actions => actions.map(a => {
        const data:any = a.payload.doc.data();
        // Crear una nueva instancia de Mesa con los datos
        return new Mesa(
          data['numero'],
          data['cantidadComensales'],
          data['tipo'],
          data['estado'],
          data['clienteId'],
          data['mozoId'],
          data['fechaAsignacion'] ? new Date(data['fechaAsignacion']) : undefined,
          data['urlFoto']
        );
      }))
    ).subscribe(mesas => {
      this.mesasVigentes = mesas
      .filter(mesa => mesa.estado === 'vigente' && mesa.clienteId !== null)
      .sort((a, b) => {
        const numeroA = parseInt(a.numero);
        const numeroB = parseInt(b.numero);
        return numeroB - numeroA; 
      });
    });
  }

  private cargarConsultasCliente() {
    this.isLoading = true;
    return this.database.obtenerTodos('consultas')!.subscribe(actions => {
      const consultas = actions.map(a => ({
        id: a.payload.doc.id,
        ...a.payload.doc.data() as any
      }));

      console.log('Todas las consultas:', consultas);
      
      const consultaUsuario = consultas.find(c => c.idCliente === this.usuarioLogeado.uid);
      
      if (consultaUsuario) {
        console.log('Consulta encontrada:', consultaUsuario);
        this.consultasDelUsuario = consultaUsuario.consultas?.mensajes || [];
        this.idConsulta = consultaUsuario.id;
        this.consultaActual = consultaUsuario;
        this.mostrarChat = true;
      }
      this.isLoading = false;
    }, error => {
      console.error('Error cargando consultas:', error);
      this.isLoading = false;
    });
  }

    // Modificamos la creación de consulta nueva
    private crearNuevaConsulta(clienteId: string) {
      const nuevaConsulta = {
        idCliente: clienteId,
        consultas: {
          mensajes: [] // Inicializamos con array vacío
        },
        fechaCreacion: new Date().toISOString()
      };
  
      this.database.crear('consultas', nuevaConsulta).then(doc => {
        this.idConsulta = doc.id;
        this.consultasDelUsuario = [];
        this.consultaActual = nuevaConsulta;
        console.log('Nueva consulta creada:', this.consultaActual); // Debug
      });
    }

  vincularChatConConsultaDelUsuario(mesa: Mesa) {
    // Nos suscribimos a los cambios en tiempo real
    return this.database.obtenerTodos('consultas')!.subscribe(actions => {
      const consultas = actions.map(a => ({
        id: a.payload.doc.id,
        ...a.payload.doc.data() as any
      }));

      console.log('Buscando consulta para clienteId:', mesa.clienteId);
      const consultaEncontrada = consultas.find(c => c.idCliente === mesa.clienteId);

      if (consultaEncontrada) {
        console.log('Consulta encontrada:', consultaEncontrada);
        
        // Actualizamos el estado del componente
        this.consultasDelUsuario = consultaEncontrada.consultas?.mensajes || [];
        this.idConsulta = consultaEncontrada.id;
        this.consultaActual = consultaEncontrada;
        this.mostrarChat = true;

        // Actualizar última lectura
        if (mesa.id) {
          this.ultimasLecturas[mesa.id] = new Date().toISOString();
        }

        console.log('Mensajes cargados:', this.consultasDelUsuario);
      } else {
        console.log('No se encontró consulta, creando nueva...');
        this.crearNuevaConsulta(mesa.clienteId!);
      }
    });
  }

  // Modificamos enviarMensaje para manejar mejor la actualización
  enviarMensaje() {
    if (!this.nuevoMensaje.trim() || !this.usuarioLogeado?.uid) return;

    const mensaje = {
      emisorUid: this.usuarioLogeado.uid,
      texto: this.nuevoMensaje.trim(),
      timestamp: new Date().toISOString()
    };

    if (!this.idConsulta || !this.consultaActual) {
      const nuevaConsulta = {
        idCliente: this.usuarioLogeado.uid,
        consultas: {
          mensajes: [mensaje]
        },
        fechaCreacion: new Date().toISOString()
      };

      this.database.crear('consultas', nuevaConsulta)
        .then((docRef) => {
          console.log('Nueva consulta creada con ID:', docRef.id);
          this.idConsulta = docRef.id;
          this.consultasDelUsuario = [mensaje];
          this.consultaActual = nuevaConsulta;
          this.enviarNotificacion(mensaje.texto);
          this.scrollToTheLastItem();
        })
        .catch(error => console.error('Error al crear consulta:', error));
    } else {
      const mensajesActualizados = [...(this.consultasDelUsuario || []), mensaje];
      
      const actualizacionConsulta = {
        idCliente: this.consultaActual.idCliente,
        consultas: {
          mensajes: mensajesActualizados
        },
        fechaUltimaActualizacion: new Date().toISOString()
      };

      this.database.actualizar('consultas', actualizacionConsulta, this.idConsulta)
        .then(() => {
          console.log('Consulta actualizada con nuevo mensaje');
          this.consultasDelUsuario = mensajesActualizados;
          this.enviarNotificacion(mensaje.texto);
          this.scrollToTheLastItem();
        })
        .catch(error => console.error('Error al actualizar consulta:', error));
    }

    this.nuevoMensaje = "";
  }

  private enviarNotificacion(mensaje: string) {
    const destinatario = this.perfilUsuarioActual.toLowerCase() === 'cliente' ? 'Mozo' : 'Cliente';
    const titulo = `Nueva consulta de ${this.perfilUsuarioActual}`;
    
    this.notificationSvc.sendNotificationToRole(titulo, mensaje, destinatario).subscribe(
      response => console.log(`Notificación enviada a ${destinatario}`, response),
      error => console.error(`Error al enviar notificación a ${destinatario}`, error)
    );
  }

  obtenerEstadoMesa(mesa: Mesa): string {
    if (this.tieneMensajesNuevos(mesa)) {
      return 'Nuevos mensajes';
    }
    return 'Consulta activa';
  }

  
    private ultimasLecturas: any = {};  // Almacena localmente última lectura por mesa
  
    tieneMensajesNuevos(mesa: Mesa): boolean {
      try {
        // Si no hay consulta actual para esta mesa, no hay mensajes nuevos
        if (!this.consultaActual?.consultas?.mensajes?.length) {
          return false;
        }
  
        // Obtener el timestamp del último mensaje
        const mensajes = this.consultaActual.consultas.mensajes;
        const ultimoMensaje = mensajes[mensajes.length - 1];
        
        // Si no tenemos registro de última lectura para esta mesa, es nuevo
        if(mesa.id){
          if (!this.ultimasLecturas[mesa.id]) {
            return true;
          }else{
            return new Date(ultimoMensaje.timestamp) > new Date(this.ultimasLecturas[mesa.id]);
          }
        }
    
        return false;
      } catch (error) {
        console.error('Error verificando mensajes nuevos:', error);
        return false;
      }
    }
  
    // Llamar a esta función después de cada actualización de mensajes
  ngAfterViewChecked() {
    this.scrollToTheLastItem();
  }

  // Mejorar el scroll
  scrollToTheLastItem() {
    try {
      if (this.contenedorDeMensajes) {
        setTimeout(() => {
          const element = this.contenedorDeMensajes.nativeElement;
          element.scrollTo({
            top: element.scrollHeight,
            behavior: 'smooth'
          });
        }, 100);
      }
    } catch (err) {
      console.error('Error en scroll:', err);
    }
  }

  esUsuarioLogeado(emisorUid: string): boolean {
    return this.usuarioLogeado && this.usuarioLogeado.uid === emisorUid;
  }

  formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);

    // Formatear la fecha
    const fecha = date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    // Formatear la hora
    const hora = date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });

    return `${fecha} - ${hora}`;
  }
}
