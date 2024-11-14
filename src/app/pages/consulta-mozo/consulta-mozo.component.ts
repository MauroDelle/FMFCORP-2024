import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { DatabaseService } from 'src/app/services/database.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AuthService } from 'src/app/services/auth.service';
import { Router, ActivatedRoute, Data } from '@angular/router';
import { Observable, map, switchMap, forkJoin } from 'rxjs';
import { NotificationService } from 'src/app/services/notification.service';
import { CommonModule } from '@angular/common';
import { 
  IonToolbar, IonContent, IonButton, 
  IonIcon, IonList, IonItem, IonLabel, 
  IonCard, IonCardTitle, IonFooter, IonInput, IonListHeader, IonBadge, IonHeader, IonTitle } from '@ionic/angular/standalone';
import { LoadingSpinnerComponent } from 'src/app/spinner/spinner.component';
import { FormsModule } from '@angular/forms';
import { GoBackToolbarComponent } from 'src/app/shared/components/go-back-toolbar/go-back-toolbar.component';
import { addIcons } from 'ionicons';
import { send } from 'ionicons/icons';

@Component({
  selector: 'app-consulta-mozo',
  templateUrl: './consulta-mozo.component.html',
  styleUrls: ['./consulta-mozo.component.scss'],
  standalone: true,
  imports: [CommonModule,
    IonHeader,
    IonTitle,
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
    FormsModule]
})
export class ConsultaMozoComponent  implements OnInit {
  @ViewChild('contenedorDeMensajes') contenedorDeMensajes!: ElementRef;

  usuarioLogeado: any;
  nuevoMensaje: string = "";
  mensajes: any[] = [];
  email: any = "";
  info: string = "";
  mostrarChat = false;
  usuarioLogeadoBool: boolean = true;
  consultaId: string = ''; // ID de la consulta actual
  usuarios:any[]=[];
  consultas:any[]=[];
  idConsulta:string="";
  consultasDelUsuario:any = [];
  perfilUsuarioActual:string="";
  mesasVigentes:any[]=[];
  consultaActual:any;
  esMozo: boolean = false;
  isLoading:boolean = true;


  constructor(
    private authService: AuthService,
    private firestore: AngularFirestore,
    private router: ActivatedRoute,
    private database: DatabaseService,
    private notificationSvc: NotificationService
  ) {
    addIcons({
      'send': send
    });
  }


  ngOnInit() {
    this.isLoading = true;
    this.usuarioLogeado = this.authService.loggedUser;

    //obtengo las mesas que se encuentran actualmente con comensales, busco estado==vigente
    const numerosMesas: Observable<any[]> = this.database.obtenerTodos('mesa-cliente')!.pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as any;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    );

    numerosMesas.subscribe(
      data => {
        const mesas = data;
        mesas.forEach(item => {
          if (item.estado === 'vigente') {
            this.mesasVigentes.push(item);
          }
        });
      },
      error => {
        console.log(error);
      }
    );

    const consultasObservable: Observable<any[]> = this.database.obtenerTodos('consultas')!.pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as any;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))

    );

    consultasObservable.subscribe(data => {
      this.consultas=data;
    }, error => {
      console.log(error);
    });

    //obtengo perfil del usuario actualmente loggeado
    const usuarios: Observable<any[]> = this.database.obtenerTodos('usuarios')!.pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as any;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    );

    usuarios.subscribe(data => {
      this.usuarios = data;
      const usuarioEncontrado = this.usuarios.find(item => item.email == this.usuarioLogeado.email);
      if (usuarioEncontrado) {
        this.perfilUsuarioActual = usuarioEncontrado.perfil;
        this.esMozo= usuarioEncontrado.perfil.toLowerCase() === 'mozo' ? true : false;
      }else{

        const menuObservable: Observable<any[]> = this.database.obtenerTodos('consultas')!.pipe(
          map(actions => actions.map(a => {
            const data = a.payload.doc.data() as any;
            const id = a.payload.doc.id;
            return { id, ...data };
          }))
        );

        if(!this.perfilUsuarioActual){
          this.mostrarChat=true;
          this.perfilUsuarioActual= "Cliente";

        menuObservable.subscribe(data => {
          this.consultas = data;
          this.consultas.forEach(item => {
            if (item.idCliente == this.usuarioLogeado.uid) {
              this.consultasDelUsuario = item.consultas?.mensajes || [];  // Inicializa como un array si está indefinido
              this.idConsulta = item.id;
              this.consultaActual= item;
              return;
            }
          });
        }, error => {
          console.log(error);
          });
        }
      }
      this.isLoading = false;
    }, error => {
      console.log(error);
    });
    
  }

  enviarMensaje() {
    if (this.nuevoMensaje === "" || !this.usuarioLogeado || !this.usuarioLogeado.uid) return;

    const mensaje = {
      emisorUid: this.usuarioLogeado.uid,
      texto: this.nuevoMensaje,
      timestamp: new Date().toISOString()  // Usar ISO string para la fecha
    };

    if (this.consultasDelUsuario.length === 0) {
      // Crear un nuevo documento si no existe uno para el usuario
      const nuevaConsulta = {
        idCliente: this.usuarioLogeado.uid,
        consultas: { mensajes: [mensaje] }  // Inicializar con el nuevo mensaje
      };

      this.database.crear('consultas', nuevaConsulta).then(() => {
        this.notificationSvc.sendNotificationToRole('Nueva consulta realizada!', mensaje.texto, 'Mozo').subscribe(
          response => console.log('Notificación a Mozo enviada con éxito', response),
          error => console.error('Error al enviar notificación a Mozo', error)
        );
      }).catch(error => {
        console.log('Error al crear el documento:', error);
      });
    } else {
      this.consultasDelUsuario.push(mensaje);

      const actualizacionConsulta = {
        idCliente: this.consultaActual.idCliente,
        consultas: {
          mensajes: this.consultasDelUsuario
        }
      };

      this.database.actualizar('consultas', actualizacionConsulta, this.idConsulta).then(() => {
        this.notificationSvc.sendNotificationToRole('Nueva consulta realizada!', mensaje.texto, 'Mozo').subscribe(
          response => console.log('Notificación a Mozo enviada con éxito', response),
          error => console.error('Error al enviar notificación a Mozo', error)
        );
      }).catch(error => {
        console.log('Error al actualizar el documento:', error);
      });
    }

    this.nuevoMensaje = "";
  }

  scrollToTheLastItem() {
    try {
      this.contenedorDeMensajes.nativeElement.scrollTop = this.contenedorDeMensajes.nativeElement.scrollHeight;
    } catch (err) { }
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

  vincularChatConConsultaDelUsuario(mesaSeleccionada:any){
    this.consultas.forEach(item => {
      if (item.idCliente == mesaSeleccionada.idCliente) {
        this.consultasDelUsuario = item.consultas?.mensajes || [];  // Inicializa como un array si está indefinido
        this.idConsulta = item.id;
        this.consultaActual=item;
        return;
      }
    });

    this.mostrarChat=true;
  }
}
