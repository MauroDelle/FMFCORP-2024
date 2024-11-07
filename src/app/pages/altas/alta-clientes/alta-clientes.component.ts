import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ToastController , IonIcon, IonCol, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonItem, IonInput, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonLabel, IonText, IonAlert, IonSpinner, IonGrid, IonRow, IonFab, IonFabButton } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { cameraOutline } from 'ionicons/icons';

addIcons({
  'camera-outline': cameraOutline
});


@Component({
  selector: 'app-alta-clientes',
  templateUrl: './alta-clientes.component.html',
  styleUrls: ['./alta-clientes.component.scss'],
  standalone: true,
  imports: [IonFabButton, IonFab, IonIcon, IonCol, IonRow, IonGrid, CommonModule, IonSpinner, IonAlert, ReactiveFormsModule, FormsModule, IonText, IonLabel, IonCardContent, IonCardTitle, IonCardHeader, IonCard, IonInput, IonItem, IonButton, IonHeader, IonToolbar, IonTitle, IonContent],
})
export class AltaClientesComponent  implements OnInit {
  form: FormGroup;

  clienteAnonimo: boolean = false;
  mostrarSpinner= false;
  
  constructor(private fb: FormBuilder) { 
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

  scan(){}

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


  tomarFoto(){}

  registrarse(){
    //hacer guardao en firebase
  }

}
