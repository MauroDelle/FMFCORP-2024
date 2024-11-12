import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <div class="spinner-overlay">
      <div class="spinner-container">
        <img src="assets/icon/fmcLogo.png" height="70px"/>
        <p>{{ message }}</p>
      </div>
    </div>
  `,
  styles: [`
    .spinner-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: rgba(0, 0, 0, 0.7);
      z-index: 9999;
    }

    .spinner-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      background: var(--ion-background-color);
      padding: 32px;
      border-radius: 16px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

      img {
        margin-bottom: 16px;
        animation: pulse 1.5s infinite;
      }

      p {
        color: var(--ion-color-dark);
        margin: 0;
        font-weight: 500;
      }
    }

    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.1); }
      100% { transform: scale(1); }
    }
  `]
})
export class LoadingSpinnerComponent {
  @Input() message: string = 'Cargando...';
}