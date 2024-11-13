import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Barcode, BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { IonIcon, IonCol, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonItem, IonInput, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonLabel, IonText, IonAlert, IonSpinner, IonGrid, IonRow, IonFab, IonFabButton, IonToggle } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { cameraOutline } from 'ionicons/icons';
import { Cliente } from 'src/app/clases/cliente';
import { AuthService } from 'src/app/services/auth.service';
import { DatabaseService } from 'src/app/services/database.service';
import { FirestoreService } from 'src/app/services/firestore.service';
import { StorageService } from 'src/app/services/storage.service';
import { ToastService } from 'src/app/services/toast.service';
import { Capacitor } from '@capacitor/core';
import { LoadingSpinnerComponent } from 'src/app/spinner/spinner.component';
import { GoBackToolbarComponent } from 'src/app/shared/components/go-back-toolbar/go-back-toolbar.component';

addIcons({
  'camera-outline': cameraOutline
});

@Component({
  selector: 'app-alta-clientes',
  templateUrl: './alta-clientes.component.html',
  styleUrls: ['./alta-clientes.component.scss'],
  standalone: true,
  imports: [
    IonToggle, 
    LoadingSpinnerComponent, 
    GoBackToolbarComponent, 
    ReactiveFormsModule, 
    FormsModule, 
    IonFabButton, 
    IonFab, 
    IonIcon, 
    CommonModule,  
    ReactiveFormsModule, 
    FormsModule, 
    IonLabel, 
    IonCard, 
    IonInput, 
    IonItem, 
    IonButton, 
    IonContent
  ],

})
export class AltaClientesComponent  implements OnInit {
  form: FormGroup;

  clienteAnonimo: boolean = false;
  mostrarSpinner= false;
  fotoUrl: any = '';
  photoUrl: any = '';
  barcodes: Barcode[] = [];
  informacionQr: string | null = null;
  isLoading:boolean = false;

  constructor(private fb: FormBuilder, private firesoreService: FirestoreService, private toastService: ToastService, private storageService: StorageService, private databaseService: DatabaseService, private authService: AuthService) { 
    this.form = this.fb.group(
      {
        nombre: ['', [Validators.required, Validators.pattern(/^[a-zA-Z\s]*$/)]],
        apellido: ['', [Validators.required, Validators.pattern(/^[a-zA-Z\s]*$/)]],
        dni: ['', [Validators.required, Validators.pattern(/^\d{1,10}$/)]],
        email: ['', [Validators.required, Validators.email]],
        clave: ['', [Validators.required, Validators.minLength(6)]],
        confirmarClave: ['', [Validators.required]]
      },{ validators: this.passwordMatchValidator }
    );
  }

  ngOnInit() {

  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const clave = control.get('clave');
    const confirmarClave = control.get('confirmarClave');
    if (!clave || !confirmarClave) return null;
    return clave.value === confirmarClave.value ? null : { passwordMismatch: true };
  }

  async scan(): Promise<void> {
    const { barcodes } = await BarcodeScanner.scan();
    console.log("scan",barcodes);
    if (barcodes.length > 0) {
      this.informacionQr = barcodes[0].rawValue; // Asignar la información del primer código QR escaneado
      this.fillForm(this.informacionQr); // Rellenar el formulario con la información del QR
    }
    this.barcodes.push(...barcodes);
  }

  async requestPermissions(): Promise<boolean> {
    const { camera } = await BarcodeScanner.requestPermissions();
    return camera === 'granted' || camera === 'limited';
  }

  fillForm(informacionQr: string): void {
    console.log("informacionQr",informacionQr);
    try {
      const qrData = informacionQr.split('@');
      if (qrData.length >= 5) {
        // Cambiado a 5 para asegurar que hay suficiente información
        this.form.patchValue({
          apellido: qrData[1].trim(),
          nombre: qrData[2].trim(),
          dni: qrData[4].trim(),
        });
      } else {
        throw new Error('Formato de QR incorrecto');
      }
    } catch (error) {
      console.error('Error parsing QR data', error);
    }
  }

  toggleAnonimo(event: any) {
    this.clienteAnonimo = event.detail.checked;
    this.updateFormValidators();
  }

  updateFormValidators() {
    if (this.clienteAnonimo) {
      this.form.get('apellido')?.clearValidators();
      this.form.get('dni')?.clearValidators();
      this.form.get('email')?.clearValidators();
      this.form.get('clave')?.clearValidators();
      this.form.get('confirmarClave')?.clearValidators();
      this.form.clearValidators(); // Eliminar los validadores a nivel de formulario
    } else {
      this.form.get('apellido')?.setValidators([Validators.required, Validators.pattern(/^[a-zA-Z\s]*$/)]);
      this.form.get('dni')?.setValidators([Validators.required, Validators.pattern(/^\d{1,10}$/)]);
      this.form.get('email')?.setValidators([Validators.required, Validators.email]);
      this.form.get('clave')?.setValidators([Validators.required, Validators.minLength(6)]);
      this.form.get('confirmarClave')?.setValidators([Validators.required]);
      this.form.setValidators(this.passwordMatchValidator); // Agregar validador a nivel de formulario
    }
    this.form.get('apellido')?.updateValueAndValidity();
    this.form.get('dni')?.updateValueAndValidity();
    this.form.get('email')?.updateValueAndValidity();
    this.form.get('clave')?.updateValueAndValidity();
    this.form.get('confirmarClave')?.updateValueAndValidity();
    this.form.updateValueAndValidity(); // Actualizar validadores a nivel de formulario
  }

  async tomarFoto(){
    try {
      this.isLoading = true;
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
      });

      if (image && image.webPath) {
        const photoUrl = Capacitor.convertFileSrc(image.webPath);
        const response = await fetch(photoUrl);
        const blob = await response.blob();
        const file = new File([blob], `image_${new Date().getTime()}.jpeg`, {
          type: 'image/jpeg',
        });
        this.fotoUrl = file
        this.photoUrl = photoUrl;
      }
    } catch (error) {
      console.error('Error al tomar la foto:', error);
      alert('Ocurrió un error al tomar la foto.');
    }finally{
      this.isLoading = false;
    }
  }

  convertirABase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Extraer solo la parte Base64 (sin el prefijo data:image/jpeg;base64,)
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  }
  

  
  async guardarImagen() {
    try {
      const nombreArchivo =  this.form.value.dni + this.form.value.nombre + this.form.value.apellido;
      const fotoBase64 = this.fotoUrl;
      const dataURL = `data:image/jpeg;base64,${fotoBase64}`;

      const urlDescarga = await this.storageService.uploadImages('fotosPerfil',nombreArchivo,this.fotoUrl);

      if (!urlDescarga) {
        this.toastService.presentToast('No se pudo obtener la URL de descarga de la imagen', 'top', 'danger');
        return false;
      }

      console.log("urlDescarga",urlDescarga);
      return urlDescarga;
    } catch (error) {
      console.error('Error al guardar la imagen:', error);
      return false;
    }
  }

  async verificarUsuarioExistente(dni: any): Promise<boolean> {
    try {
      const response = await this.firesoreService.getClienteByDni(dni);
      console.log("response getClienteByDni", response);
  
      // Retorna true si la respuesta tiene al menos un cliente, false de lo contrario
      return !!(response && response.length > 0);
    } catch (error) {
      console.error("Error al verificar usuario existente:", error);
      return false;
    }
  }

  async verificarEmailExistente(email: string): Promise<boolean> {
    try {
      const response = await this.databaseService.obtenerClientePorEmail(email);
  
      return response == null;
    } catch (error) {
      console.error("Error al verificar usuario existente:", error);
      return false;
    }
  }
  
  async registrarse() {
    if (this.form.invalid) {
      return;
    }

    this.mostrarSpinner=true;

    if (!this.clienteAnonimo && await this.verificarUsuarioExistente(this.form.value.dni)) {
      this.toastService.presentToast('Ya hay un usuario registrado con ese DNI', 'top', 'danger');
    } else if(!this.clienteAnonimo && !(await this.verificarEmailExistente(this.form.value.email))){
      this.toastService.presentToast('Ya hay un usuario registrado con ese CORREO', 'top', 'danger');
    }else {

      const imagenGuardada = await this.guardarImagen();

      const { nombre, apellido, dni, email, clave } = this.form.value;
      const nuevoUsuario = new Cliente(
        nombre,
        this.clienteAnonimo ? '' : apellido,
        this.clienteAnonimo ? '' : dni,
        this.clienteAnonimo ? '' : email,
        this.clienteAnonimo ? '' : clave,
        this.clienteAnonimo ? 'autorizado' : 'pendiente',
        this.clienteAnonimo,
        imagenGuardada ? imagenGuardada.toString() : '' ,
        "Cliente"
      );

      if (imagenGuardada) {
        this.databaseService.crear('clientes', nuevoUsuario.toJSON()).then((docRef) => {
          console.log('Documento escrito con ID: ', docRef.id);

          if (this.clienteAnonimo) {
            this.authService.registerAnonymous(docRef.id, nuevoUsuario.toJSON());
          } else {
            this.authService.register(email, clave, docRef.id);
          }
        }).catch((error: any) => {
          this.mostrarSpinner=false;
          console.error('Error al crear el usuario:', error);
          this.toastService.presentToast('Hubo un problema al crear el usuario. Por favor, inténtelo de nuevo.', 'top', 'danger');
        });
      } else {
        this.mostrarSpinner=false;
        console.error('No se pudo guardar la imagen, abortando creación de usuario.');
        this.toastService.presentToast('No se pudo guardar la imagen, abortando creación de usuario.', 'top', 'danger');
      }
    }
    this.mostrarSpinner=false;
  }
}
