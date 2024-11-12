import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PedidosPendientesBarmanComponent } from './pedidos-pendientes-barman.component';

describe('PedidosPendientesBarmanComponent', () => {
  let component: PedidosPendientesBarmanComponent;
  let fixture: ComponentFixture<PedidosPendientesBarmanComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PedidosPendientesBarmanComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PedidosPendientesBarmanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
