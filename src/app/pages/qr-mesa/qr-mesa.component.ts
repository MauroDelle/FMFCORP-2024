import { Component, OnInit } from '@angular/core';
import { Router, NavigationExtras, ActivatedRoute } from '@angular/router';
import { first, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { NotificationService } from 'src/app/services/notification.service';
import { DatabaseService } from 'src/app/services/database.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import Swal from 'sweetalert2';
import { IonHeader, IonCardTitle, IonToolbar, IonTitle, IonContent, IonCard, IonButton } from "@ionic/angular/standalone";
import { CommonModule } from '@angular/common';
import { GoBackToolbarComponent } from 'src/app/shared/components/go-back-toolbar/go-back-toolbar.component';

@Component({
  selector: 'app-qr-mesa',
  templateUrl: './qr-mesa.component.html',
  styleUrls: ['./qr-mesa.component.scss'],
  imports: [CommonModule, GoBackToolbarComponent, 
    IonButton, 
    IonCard, 
    IonContent,  
    IonCardTitle, 
    ],
  standalone: true
})
export class QrMesaComponent  implements OnInit {

  constructor(private router: Router, private notificationService: NotificationService, private database:DatabaseService, private afAuth:AngularFireAuth, private activatedRoute: ActivatedRoute) { }
  pedidos:any[]=[];
  uidUsuarioActual:any;
  emailUsuarioActual:any;
  pedidoDelUsuario:any;
  mesas:any[]=[];
  mesaLibre:any;
  uidMesaLibre:any;
  listaEspera:any[]=[];
  clienteEnEspera:boolean=false;
  usuarioVinculado:boolean=true;
  uidListaEspera:string="";
  mesaEscaneada:any;
  mesaEscaneadaLibre:boolean=false;
  uidMesaCliente:string="";

  mesaActualizar:any;
  uidMesaActualizar:any;
tiempoRestante:string="";
  async ngOnInit() {

    this.afAuth.authState.subscribe(user => {
      if (user) {
        this.uidUsuarioActual = user.uid;
        this.emailUsuarioActual = user.email;
        console.log('User UID:', this.uidUsuarioActual);
      } else {
        console.log('No user is logged in');
      }
    });

    this.activatedRoute.queryParams.subscribe(params => {
      if (params['dato']) {
        this.mesaEscaneada = parseInt(params['dato']);
      }
    });

    this.verificarUsuarioVinculado();
    this.verificarClienteEnEspera();
    const pedidosObservable: Observable<any[]> = this.database.obtenerTodos('pedidos')!.pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as any;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    );

    pedidosObservable.subscribe(data => {
      this.pedidos = data;
      for (let item of this.pedidos) {
        if (item.idCliente == this.uidUsuarioActual && item.estado != 'finalizado') {
          this.pedidoDelUsuario = item;
          console.log(this.pedidoDelUsuario);
          this.actualizarTiempoRestante();
          setInterval(() => {
            this.actualizarTiempoRestante();
          }, 1000); // Actualiza cada segundo
      
          break;
        }
      }
    }, error => {
      console.log(error);
    });
    
   
  }

  actualizarTiempoRestante() {
    if (this.pedidoDelUsuario.estado === 'finalizado' || 
        this.pedidoDelUsuario.estado === 'entregado-confirmado') {
        this.tiempoRestante = "0:0s";
      return;
    }

    const ahora = new Date().getTime();
    const fechaPedido = new Date(this.pedidoDelUsuario.fecha).getTime();
    const tiempoPedido = this.pedidoDelUsuario.tiempo * 60 * 1000; // convertir minutos a milisegundos
  
    const tiempoFinal = fechaPedido + tiempoPedido;
    const tiempoRestanteMs = tiempoFinal - ahora;
  
    if (tiempoRestanteMs > 0) {
      const horas = Math.floor((tiempoRestanteMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutos = Math.floor((tiempoRestanteMs % (1000 * 60 * 60)) / (1000 * 60));
      const segundos = Math.floor((tiempoRestanteMs % (1000 * 60)) / 1000);
  
      this.tiempoRestante = `${minutos}:${segundos}s`;
    } else {
      this.tiempoRestante = "Tiempo cumplido";
    }
  }

  async vincularMesa(){
    await this.verificarUsuarioVinculado();
    console.log("this.usuarioVinculado", this.usuarioVinculado);
      if(!this.usuarioVinculado){
        await this.verificarMesaLibre()
        console.log("this.mesaEscaneadaLibre", this.mesaEscaneadaLibre);
        if(this.mesaEscaneadaLibre){
          console.log("this.clienteEnEspera", this.clienteEnEspera);
          if(this.clienteEnEspera){
            
            const mesaActualizada = {
              estado: "ocupada",
              numeroMesa: this.mesaEscaneada
            };
            const listaEsperaActualizada = {
              estado: "asignado",
              idCliente: this.uidUsuarioActual,
              email: this.emailUsuarioActual
            };
            const nuevaMesa = {
              idCliente: this.uidUsuarioActual,
              numeroMesa: this.mesaEscaneada,
              estado: "vigente",
              fecha: new Date().toISOString(),
              encuestaCompleta: false,

            };

            await this.database.crear("mesa-cliente", nuevaMesa);

            await this.database.actualizar("lista-espera", listaEsperaActualizada, this.uidListaEspera);

            await this.database.actualizar("mesas", mesaActualizada, this.uidMesaLibre);

            this.usuarioVinculado=true;
            // Mostrar mensaje de éxito
            Swal.fire({
              title: 'Éxito',
              text: 'Se le ha asignado la mesa: ' + this.mesaEscaneada,
              icon: 'success',
              confirmButtonText: 'Aceptar',
              confirmButtonColor: 'var(--ion-color-primary)',
              heightAuto: false
            });


          }else{
            Swal.fire({
              title: 'Error',
              text: 'Antes de vincularse con una mesa debe ingresar a la lista de espera',
              icon: 'error',
              confirmButtonText: 'Aceptar',
              confirmButtonColor: 'var(--ion-color-primary)',
              heightAuto: false
            });
          }
        }else{
          Swal.fire({
            title: 'Error',
            text: 'La mesa escaneada se encuentra ocupada',
            icon: 'error',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: 'var(--ion-color-primary)',
            heightAuto: false
          });
        }


      }else{
        Swal.fire({
          title: 'Error',
          text: 'Usted ya se encuentra vinculado a una mesa',
          icon: 'error',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: 'var(--ion-color-primary)',
          heightAuto: false
        });
      }



  }


  redireccionar(path:string){
    console.log(path);
    this.router.navigateByUrl(path);
  }

  mostrarPedido(){

    if(this.pedidoDelUsuario){

      Swal.fire({
        title: "Su pedido se encuentra:",
        html: `<div style="font-weight: bold; font-size: 1.2em;">${this.pedidoDelUsuario.estado}</div>`,
        icon: "success",
        confirmButtonText: "Aceptar",
        confirmButtonColor: 'var(--ion-color-primary)',
        heightAuto: false
      });
    }else{
      Swal.fire({
        title: 'Error',
        text: 'Usted aún no realizo el pedido',
        icon: 'error',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: 'var(--ion-color-primary)',
        heightAuto: false
      });
    }

  }

  verificarMesaLibre(): Promise<void> {
    return new Promise((resolve, reject) => {
      const mesasObservable: Observable<any[]> = this.database.obtenerTodos('mesas')!.pipe(
        map(actions => actions.map(a => {
          const data = a.payload.doc.data() as any;
          const id = a.payload.doc.id; // Este es el id del documento en la base de datos
          return { id, ...data }; // Combinamos el id con el resto de los datos
        })),
        first() // Completa el observable después de la primera emisión
      );

      mesasObservable.subscribe(data => {
        this.mesas = data;
        console.log("this.mesas",this.mesas);

        this.mesas.forEach(mesa =>{
          console.log(mesa.numeroMesa, this.mesaEscaneada, mesa.estado)
          if(mesa.numeroMesa == this.mesaEscaneada && mesa.estado=="libre"){
            this.mesaEscaneadaLibre=true;
            this.uidMesaLibre= mesa.id;
          }else if(mesa.numeroMesa == this.mesaEscaneada && mesa.estado=="ocupada"){
            this.mesaEscaneadaLibre=false;
          }
        })

        resolve(); // Resuelve la promesa cuando se haya asignado mesaLibre
      }, error => {
        console.log(error);
        reject(error); // Rechaza la promesa en caso de error
      });
    });
  }



  async mostrarMesasLibres() {
    await this.verificarMesaLibre();

    // Filtrar las mesas con estado "libre"
    const mesasLibres = this.mesas.filter(mesa => mesa.estado === 'libre');

    if (mesasLibres.length === 0) {
      // Si no hay mesas libres, mostrar mensaje de que no hay mesas disponibles
      Swal.fire({
        title: "No hay mesas disponibles",
        text: "Lo sentimos, en este momento no hay mesas libres para asignar.",
        icon: "warning",
        confirmButtonText: "Aceptar",
        confirmButtonColor: 'var(--ion-color-primary)',
        heightAuto: false
      });
      return; // Salir de la función si no hay mesas libres
    }

    console.log(this.mesas);
    console.log(mesasLibres);

    // Construir el contenido HTML para el SweetAlert
    let contenidoHTML = '<ul style="text-align: left; padding-left: 20px;">';
    mesasLibres.forEach(mesa => {
      contenidoHTML += `<li>Mesa número: ${mesa.numeroMesa}</li>`;
    });
    contenidoHTML += '</ul>';

    // Mostrar el SweetAlert con las mesas libres
    Swal.fire({
      title: "Mesas Libres",
      html: contenidoHTML,
      icon: "info",
      confirmButtonText: "Aceptar",
      confirmButtonColor: 'var(--ion-color-primary)',
      heightAuto: false
    });
  }


  async verificarClienteEnEspera() {
    return new Promise((resolve, reject) => {
      const listaEsperaObservable: Observable<any[]> = this.database.obtenerTodos('lista-espera')!.pipe(
        map(actions => actions.map(a => {
          const data = a.payload.doc.data() as any;
          const id = a.payload.doc.id;
          return { id, ...data };
        }))
      );

      listaEsperaObservable.subscribe(data => {
        this.listaEspera = data;
        this.clienteEnEspera = false; // Reiniciar el estado del cliente en espera
        this.listaEspera.forEach(item => {
          console.log(item.idCliente, this.uidUsuarioActual, item.estado);
          if (item.idCliente == this.uidUsuarioActual && item.estado == "pendiente") {
            console.log("entre en coincidencia");
            this.clienteEnEspera = true;
            this.uidListaEspera= item.id;
          }
        });
        resolve(this.clienteEnEspera);
      }, error => {
        console.log(error);
        reject(error);
      });
    });
  }

  verificarUsuarioVinculado(): Promise<void> {
    return new Promise((resolve, reject) => {
      const usuarioVinculadoObservable: Observable<any[]> = this.database.obtenerTodos('mesa-cliente')!.pipe(
        map(actions => actions.map(a => {
          const data = a.payload.doc.data() as any;
          const id = a.payload.doc.id; // Este es el id del documento en la base de datos
          return { id, ...data }; // Combinamos el id con el resto de los datos
        })),
        first() // Completa el observable después de la primera emisión
      );

      usuarioVinculadoObservable.subscribe(data => {
        const usuariosEnMesas = data;
        const usuarioVinculado = usuariosEnMesas.find(item => item.idCliente == this.uidUsuarioActual && item.estado == "vigente");

        if (usuarioVinculado) {
          this.usuarioVinculado = true;
          this.uidMesaCliente = usuarioVinculado.id;
          this.mesaActualizar = usuarioVinculado.numeroMesa;
        } else {
          this.usuarioVinculado = false;
        }

        resolve(); // Resuelve la promesa después de verificar todos los usuarios
      }, error => {
        console.log(error);
        reject(error); // Rechaza la promesa en caso de error
      });
    });
  }

  confirmarRecepcionPedido(){

    console.log(this.pedidoDelUsuario)
    if(this.pedidoDelUsuario && this.pedidoDelUsuario.estado == "entregado"){
      Swal.fire({
        title: 'Tu pedido ya fue entregado',
        icon: 'success',
        confirmButtonText: 'Confirmo Recepción',
        confirmButtonColor: "#52BE80",
        cancelButtonText: 'No recibí nada',
        cancelButtonColor: "#E73E30",
        showCancelButton: true,
        heightAuto: false
      }).then((result) => {
        const pedidoActualizado={
          estado: "entregado-confirmado",
          idCliente: this.pedidoDelUsuario.idCliente,
          items: this.pedidoDelUsuario.items,
          montoTotal:this.pedidoDelUsuario.montoTotal,
          tiempo: this.pedidoDelUsuario.tiempo,
          preciosUnitarios: this.pedidoDelUsuario.preciosUnitarios,
          confirmacionMozo:this.pedidoDelUsuario.confirmacionMozo,
          platos: this.pedidoDelUsuario.platos,
          bebidas: this.pedidoDelUsuario.bebidas,
          fecha:this.pedidoDelUsuario.fecha

        }
        console.log(pedidoActualizado);

        this.database.actualizar("pedidos", pedidoActualizado, this.pedidoDelUsuario.id)
        .then(() => {
          // Actualizar el pedido local para que el timer se detenga en cero
          this.pedidoDelUsuario = pedidoActualizado;
          this.tiempoRestante = "0:0s";
        });
      });

    }else{
      Swal.fire({
        title: 'Error',
        text: 'Usted aún no realizo el pedido',
        icon: 'error',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: 'var(--ion-color-primary)',
        heightAuto: false
      });
    }

  }

  obtenerUidMesaParaActualizar(): Promise<void> {
    return new Promise((resolve, reject) => {
      const mesas: Observable<any[]> = this.database.obtenerTodos('mesas')!.pipe(
        map(actions => actions.map(a => {
          const data = a.payload.doc.data() as any;
          const id = a.payload.doc.id; // Este es el id del documento en la base de datos
          return { id, ...data }; // Combinamos el id con el resto de los datos
        })),
        first() // Completa el observable después de la primera emisión
      );

      mesas.subscribe(data => {
        const mesas = data;
        mesas.forEach(mesa => {
          console.log(mesa.numeroMesa, this.mesaActualizar);
          if (mesa.numeroMesa == this.mesaActualizar) {
            console.log("entre");
            this.uidMesaActualizar = mesa.id;
          }
        });
        resolve(); // Resuelve la promesa después de iterar por todas las mesas
      }, error => {
        console.log(error);
        reject(error); // Rechaza la promesa en caso de error
      });
    });
  }


  async pedirCuenta() {

    await this.verificarUsuarioVinculado();

    await this.obtenerUidMesaParaActualizar();

    console.log(this.mesaActualizar, this.uidMesaActualizar, this.uidMesaCliente);
        if (this.uidMesaActualizar && this.uidMesaCliente) {
          // Actualiza la mesa
          const mesaActualizada = {
            estado: "libre",
            numeroMesa: this.mesaActualizar,
          };

          console.log(mesaActualizada + this.uidMesaActualizar)
          this.database.actualizar("mesas", mesaActualizada, this.uidMesaActualizar);

          // Actualiza el estado de mesa-cliente
          const mesaCliente = {
            estado: "finalizado",
            numeroMesa: this.mesaActualizar,
            idCliente: this.uidUsuarioActual,
          };
          console.log(mesaCliente + this.uidMesaCliente)

          this.database.actualizar("mesa-cliente", mesaCliente, this.uidMesaCliente);

          this.notificationService.sendNotificationToRole(
            'Un cliente solicito la cuenta!',
            'Lo esta esperando en su mesa...',
            'Mozo'
          ).subscribe(
            response => console.log('Notificación a Mozo enviada con éxito', response),
            error => console.error('Error al enviar notificación a Mozo', error)
          );

          this.router.navigateByUrl("pedir-cuenta");
        }
      }


  }