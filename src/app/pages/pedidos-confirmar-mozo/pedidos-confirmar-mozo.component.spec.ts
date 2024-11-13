import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PedidosConfirmarMozoComponent } from './pedidos-confirmar-mozo.component';

describe('PedidosConfirmarMozoComponent', () => {
  let component: PedidosConfirmarMozoComponent;
  let fixture: ComponentFixture<PedidosConfirmarMozoComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PedidosConfirmarMozoComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PedidosConfirmarMozoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
