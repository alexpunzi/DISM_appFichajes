import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, type OnInit } from '@angular/core';
import {
  IonContent,
  IonHeader,
  IonItem,
  IonList,
  IonRefresher,
  IonRefresherContent,
  IonSpinner,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { finalize } from 'rxjs';

import type { FichajeListado } from '../models';
import { ApiService } from '../services/api';
import { ID_USUARIO_PRUEBA } from '../usuario-actual';

@Component({
  selector: 'app-consulta-fichajes',
  templateUrl: './consulta-fichajes.page.html',
  styleUrls: ['./consulta-fichajes.page.scss'],
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonItem,
    IonList,
    IonRefresher,
    IonRefresherContent,
    IonSpinner,
    CommonModule,
  ],
})
export class ConsultaFichajesPage implements OnInit {
  fichajes: FichajeListado[] = [];
  cargando = true;

  private readonly apiService = inject(ApiService);
  private readonly changeDetector = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.cargarFichajes();
  }

  cargarFichajes(event?: CustomEvent<{ complete: () => void }>): void {
    this.cargando = true;

    const hoy = new Date();
    const fechaHoy = [
      hoy.getFullYear(),
      String(hoy.getMonth() + 1).padStart(2, '0'),
      String(hoy.getDate()).padStart(2, '0'),
    ].join('-');

    this.apiService
      .getFichajes(ID_USUARIO_PRUEBA, fechaHoy, fechaHoy)
      .pipe(
        finalize(() => {
          this.cargando = false;
          event?.detail.complete();
          this.changeDetector.markForCheck();
        }),
      )
      .subscribe({
        next: (fichajes: FichajeListado[]) => {
          this.fichajes = fichajes;
          this.changeDetector.markForCheck();
        },
        error: (err) => {
          console.error('Error al cargar fichajes:', err);
          alert('No se pudieron cargar los fichajes.');
        },
      });
  }
}
