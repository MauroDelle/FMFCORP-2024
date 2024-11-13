import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
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
import { ValidatorsService } from 'src/app/services/validators.service';
import { PhotoStorageService } from 'src/app/services/photo-storage.service';
import Swal from 'sweetalert2';
import { LoadingSpinnerComponent } from 'src/app/spinner/spinner.component';
import { GoBackToolbarComponent } from 'src/app/shared/components/go-back-toolbar/go-back-toolbar.component';
import { IonicModule } from '@ionic/angular';



@Component({
  selector: 'app-alta-mesa',
  templateUrl: './alta-mesa.component.html',
  styleUrls: ['./alta-mesa.component.scss'],
  standalone: true,
  imports: [ CommonModule,
    FormsModule,
    ReactiveFormsModule,
    LoadingSpinnerComponent,
    GoBackToolbarComponent,
    IonicModule],
})
export class AltaMesaComponent {

  private fb = inject(FormBuilder);
  private validatorsService = inject(ValidatorsService);
  private photoService = inject(PhotoStorageService);
  private database = inject(DatabaseService);

  public isLoading: boolean = false;

  rutaImagen?: string;
  imagenAFile: any;

  public myForm: FormGroup = this.fb.group({
    numero: ['', [Validators.required, Validators.min(1)]],
    cantidadComensales: ['', [Validators.required, Validators.min(1)]],
    tipo: [null, [Validators.required]],
  });


  isValidField(field: string) {
    return this.validatorsService.isValidField(this.myForm, field);
  }

  getErrorByField(field: string) {
    return this.validatorsService.getErrorByField(this.myForm, field);
  }

  async takePhoto() {
    try {
      this.isLoading = true;

      const downloadUrl = await this.photoService.takePhoto();
      this.rutaImagen = downloadUrl;
      console.log('Returned download URL:', downloadUrl);

      this.isLoading = false;

    } catch (error) {
      console.error('Error taking photo:', error);
      this.isLoading = false;
    }
  }

  register() {
    const { numero, cantidadComensales, tipo } = this.myForm.value;
    const mesa = {
      numero: numero,
      cantidadComensales: cantidadComensales,
      tipo: tipo,
      imagen: this.rutaImagen
    }

    this.database.crear("mesas", mesa)
    .then((docRef) => {
      console.log("Documento escrito con ID: ", docRef.id);

      Swal.fire({
        title: "Éxito",
        text: "La mesa ha sido creada exitosamente.",
        icon: "success",
        confirmButtonText: "Aceptar",
        confirmButtonColor: 'var(--ion-color-primary)',
        heightAuto: false
      });

    })
    .catch((error) => {
      console.error("Error al dar de alta la mesa:", error);
      Swal.fire({
        title: "Error",
        text: "Hubo un problema al dar de alta la mesa. Por favor, inténtelo de nuevo.",
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
