import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, 
  IonIcon, IonMenu, IonMenuButton, IonList, IonItem, IonLabel, 
  IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonAvatar,
  AlertController, Platform, IonBackButton, IonFab, IonFabButton, IonCardContent, IonInput, IonFooter } from '@ionic/angular/standalone';
import { Pedido } from 'src/app/clases/pedido';
import { DatabaseService } from 'src/app/services/database.service';
import Swal from 'sweetalert2';
import { map, Observable } from 'rxjs';
import { RouterModule } from '@angular/router';
import { GoBackToolbarComponent } from 'src/app/shared/components/go-back-toolbar/go-back-toolbar.component';
  
@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
  standalone: true,
  imports:[
    CommonModule,
    GoBackToolbarComponent,
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
    IonButtons,
    IonFab,
    IonFabButton,
    IonCardContent,
    IonInput,
    IonFooter,
    RouterModule
  ]
})
export class MenuComponent  implements OnInit {

  constructor(private database:DatabaseService, private afAuth: AngularFireAuth, private router: Router) { }

  selectedCardIndex: number | null = null;

  cantidades: { [key: number]: number } = {}; // Estructura para almacenar las cantidades

  menu:any[] = [];
  idClienteActual:string="";
  pedidoParcial:any[]=[];
  pedidoCompleto:any[]=[];
  montoTotal:number=0;
  tiemposPlatos:any[]=[];
  tiempoTotalPedido:any;
  mostrarPedido:boolean=false;
  principales:any[]=[];
  bebidas:any[]=[];
  guarniciones:any[]=[];
  postres:any[]=[];
  preciosUnitarios:any[]=[];

  pedidoPlatos:any[]=[];
  pedidoBebidas:any[]=[];

  preciosUnitariosPlatos:any[]=[];
  preciosUnitariosBebidas:any[]=[];
  ngOnInit() {

    this.afAuth.authState.subscribe(user => {
      if (user) {
        this.idClienteActual = user.uid;
        console.log('ID del usuario actual:', this.idClienteActual);
      } else {
        console.log('No hay usuario autenticado.');
      }
    });


    const menuObservable: Observable<any[]> = this.database.obtenerTodos('menu')!.pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as any;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    );

    menuObservable.subscribe(data => {
      this.menu = data;
      this.menu.forEach(item => {
        if (item.tipo === "principal") {
          this.principales.push(item);
        } else if (item.tipo === "guarnicion") {
          this.guarniciones.push(item);
        } else if (item.tipo === "bebida") {
          this.bebidas.push(item);
        }else if(item.tipo =="postre"){
          this.postres.push(item);

        }
      });
    }, error => {
      console.log(error);
    });
  }
  actualizarCantidad(index: number, event: any) {
    const cantidad = event.target.value;
    this.cantidades[index] = cantidad;
  }

  agregarPlatoAlPedido(tipo:string,platoSeleccionado:string, precioPlato:string, tiempoPlato:string, index:number){
    const cantidad = this.cantidades[index] || 0;
    console.log(cantidad);
    for(let i =0; i < cantidad! ; i++){
      
      this.pedidoParcial.push(platoSeleccionado);
      this.montoTotal+= parseInt(precioPlato);
      this.preciosUnitarios.push(precioPlato);
      if(tipo== 'plato'){
        this.pedidoPlatos.push(platoSeleccionado);
        this.preciosUnitariosPlatos.push(precioPlato);
      }else{
        this.pedidoBebidas.push(platoSeleccionado);

        this.preciosUnitariosBebidas.push(precioPlato);
      }
    }

    console.log(this.preciosUnitarios, this.montoTotal)
    this.tiemposPlatos.push(parseInt(tiempoPlato));
    console.log(this.pedidoParcial);
    this.tiempoTotalPedido= Math.max(...this.tiemposPlatos);
    console.log(this.pedidoPlatos);
    console.log(this.pedidoBebidas);

    console.log(this.pedidoParcial);


  }

  finalizarPedido(){
    this.pedidoCompleto = this.pedidoParcial;
    this.verificarMayorTiempo();
    const fecha= new Date().toISOString();
    const nuevoPedido= new Pedido(this.idClienteActual, this.pedidoCompleto,  this.pedidoPlatos, this.pedidoBebidas, this.montoTotal, this.tiempoTotalPedido, "pendiente", this.preciosUnitarios, false, fecha, this.preciosUnitariosBebidas, this.preciosUnitariosPlatos);
    this.database.crear("pedidos", nuevoPedido.toJSON())
        .then((docRef) => {
          // Operación exitosa
          console.log("Documento escrito con ID: ", docRef.id);

          Swal.fire({
            position: "top-end",
            icon: "success",
            title: "Pedido creado con éxito!",
            showConfirmButton: false,
            timer: 1500,
            heightAuto:false
          });

          this.router.navigateByUrl('qr-mesa');
        })
        .catch((error) => {
          // Ocurrió un error
          console.error("Error al crear el usuario:", error);

          Swal.fire({
            icon: "error",
            title: "Ocurrió un error al realizar el pedido",
            confirmButtonColor: "red",
            heightAuto:false
          }).then((result) => {
            if (result.isConfirmed) {
              this.router.navigateByUrl('qr-mesa');
            }
          });


        });

  }

  verificarMayorTiempo(){

    if (this.tiemposPlatos.length === 0) {
      return 0; // O cualquier otro valor por defecto si el array está vacío
    }
    this.tiempoTotalPedido= Math.max(...this.tiemposPlatos);
    return;

  }

  verPedido(){

    let contenidoHTML = '<ul style="text-align: left; padding-left: 20px;">'; // Añadir estilo para alinear a la izquierda y pegar a las viñetas
    this.pedidoParcial.forEach(item => {
      contenidoHTML += `<li>${item}</li>`;
    });
    contenidoHTML += '</ul>';
    contenidoHTML += `<p><strong>Total: $${this.montoTotal.toFixed(2)}</strong></p>`; // Añadir el monto total debajo de la lista


    Swal.fire({
      title: "Tu pedido:",
      heightAuto: false,
      confirmButtonText: "Volver",
      confirmButtonColor: 'var(--ion-color-primary)',
      html: contenidoHTML // Aquí se inserta el contenido del array
    });

  }

  mostrarInputCantidad(index: number) {
    this.selectedCardIndex = index;
  }

}
