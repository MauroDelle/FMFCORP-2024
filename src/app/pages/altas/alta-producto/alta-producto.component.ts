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


@Component({
  selector: 'app-alta-producto',
  templateUrl: './alta-producto.component.html',
  styleUrls: ['./alta-producto.component.scss'],
  standalone  : true,
  imports: [IonicModule, // Keeps all Ionic components in one import
    CommonModule,
    ReactiveFormsModule,
    FormsModule]
})
export class AltaProductoComponent  implements OnInit {

  public isLoading: boolean = false;
  public rutasImagen: Array<string> = [];
  public fotosGuardadas: number = 0;

  private validatorResponse: string|null = '';

  constructor(
    public fb: FormBuilder,
    private database: DatabaseService,
    private validatorsService: ValidatorsService,
    private storage: AngularFireStorage
  ) { }
  
  public myForm: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30), Validators.pattern(/^[a-zA-ZÀ-ÿ\u00f1\u00d1]+(\s*[a-zA-ZÀ-ÿ\u00f1\u00d1]*)*$/)]], //Expresión regular para evitar números, puntos y comas, aceptar espacios, letras con tíldes y la ñ.
    descripcion: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(200)]],
    precio: ['', [Validators.required, Validators.min(1)]],
    tiempo: ['', [Validators.required, Validators.min(1)]],
    tipo: [null, [Validators.required]],
  });
  
  resetData() {
    this.myForm.reset();
    this.fotosGuardadas = 0;
    this.rutasImagen = [];
  }

  ngOnInit() {
    this.fotosGuardadas = 0;
    this.rutasImagen = [];
  }

  isValidField(field: string) {
    return this.validatorsService.isValidField(this.myForm, field);
  }

  getErrorByField(field: string) {
    this.validatorResponse = this.validatorsService.getErrorByField(this.myForm, field);
    if(this.validatorResponse == `Ingrese un email valido`) {
      this.validatorResponse = `No se permiten números ni caracteres especiales`;
    }
    return this.validatorResponse;
  }

  async takePhoto() {
    if(this.fotosGuardadas < 3)
    {
      const image = await Camera.getPhoto({
        quality: 100,
        promptLabelHeader: 'Seleccione una opción',
        promptLabelPhoto: 'Elegir desde la galería',
        promptLabelPicture: 'Tomar una foto',
        resultType: CameraResultType.Uri,
        allowEditing: false,
      });

      this.savePhoto(image);
    }
    else
    {
      Swal.fire({
        title: "Error",
        text: "Solo tres fotos por producto.",
        icon: "error",
        confirmButtonText: "Aceptar",
        confirmButtonColor: 'var(--ion-color-primary)',
        heightAuto: false
      });
    }
  }

  async savePhoto(file : any) {
    console.log("Entro en savePhoto");
    if(file)
    {
      console.log("Detecto file: ", file);

      if(file.format == 'jpg' || file.format == 'jpeg' || file.format == 'png' || file.format == 'jfif')
      {
        this.isLoading = true;

        const response = await fetch(file.webPath!);
        const blob = await response.blob();

        const path = 'menu/' + this.myForm.value.nombre + '_' + (this.fotosGuardadas + 1) + '.' + file.format;
        
        const uploadTask = await this.storage.upload(path, blob);

        const url = await uploadTask.ref.getDownloadURL(); 
        this.rutasImagen.push(url);
        this.fotosGuardadas++;

        console.log("Url: ", url);

        this.isLoading = false;
      }
      else
      {
        Swal.fire({
          title: "Error",
          text: "Formato de archivo incompatible.",
          icon: "error",
          confirmButtonText: "Aceptar",
          confirmButtonColor: 'var(--ion-color-primary)',
          heightAuto: false
        });
      }
    }
    else
    {
      Swal.fire({
        title: "Error",
        text: "Ninguna foto fue seleccionada.",
        icon: "error",
        confirmButtonText: "Aceptar",
        confirmButtonColor: 'var(--ion-color-primary)',
        heightAuto: false
      });
    }
  }

  register() {
    const { nombre, descripcion, precio, tiempo, tipo } = this.myForm.value;
    const producto = {
      nombre: nombre,
      descripcion: descripcion,
      precio: precio,
      tiempo: tiempo,
      tipo: tipo,
      imagenes: this.rutasImagen
    }

    this.database.crear("menu", producto)
    .then((docRef) => {
      console.log("Documento escrito con ID: ", docRef.id);

      Swal.fire({
        title: "Éxito",
        text: "El producto ha sido creado exitosamente.",
        icon: "success",
        confirmButtonText: "Aceptar",
        confirmButtonColor: 'var(--ion-color-primary)',
        heightAuto: false
      });

      this.resetData();
    })
    .catch((error) => {
      console.error("Error al dar de alta el producto:", error);
      Swal.fire({
        title: "Error",
        text: "Hubo un problema al dar de alta el producto. Por favor, inténtelo de nuevo.",
        icon: "error",
        confirmButtonText: "Aceptar",
        confirmButtonColor: 'var(--ion-color-primary)',
        heightAuto: false
      });
    });

    this.isLoading = false;
  }

  async onSubmit() {
    if (this.myForm.valid) {
      this.register();
    }
  }

}
