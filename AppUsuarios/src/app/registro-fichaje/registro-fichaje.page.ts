import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonSelect, IonSelectOption, IonButton, IonSpinner, IonToast } from '@ionic/angular';
import { Fichaje, Trabajo } from '../models';
import { ApiService } from '../services/api';
import { ID_USUARIO_PRUEBA } from '../usuario-actual';
import { GeolocationService } from '../services/geolocation.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-registro-fichaje',
  templateUrl: './registro-fichaje.page.html',
  styleUrls: ['./registro-fichaje.page.scss'],
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonSelectOption, IonItem, IonSelect, IonButton, IonSpinner, IonToast],
})
export class RegistroFichajePage {
  trabajoSeleccionado: number | null = null;
  trabajos: Trabajo[] = [];
  fichajeActivo: Fichaje | null = null;

  cargando = true;
  enviando = false;
  toastAbierto = false;
  toastMensaje = '';
  toastColor: 'success' | 'danger' | 'warning' = 'success';

  constructor(
    private apiService: ApiService,
    private geolocationService: GeolocationService,
    private changeDetector: ChangeDetectorRef,
  ) {}

  ionViewWillEnter() {
    this.cargarEstado();
  }

  mostrarToast(
    mensaje: string,
    color: 'success' | 'danger' | 'warning' = 'success',
  ) {
    this.toastMensaje = mensaje;
    this.toastColor = color;
    this.toastAbierto = true;
  }

  cargarEstado() {
    this.cargando = true;

    this.apiService.getTrabajos().subscribe({
      next: (trabajos) => {
        this.trabajos = trabajos;
        this.cargarFichajeActivo();
      },
      error: (err) => {
        console.error('Error al cargar trabajos:', err);
        this.cargando = false;
        this.mostrarToast('No se pudieron cargar los trabajos.', 'danger');
        this.changeDetector.markForCheck();
      },
    });
  }

  cargarFichajeActivo() {
    this.apiService.getFichajeActivo(ID_USUARIO_PRUEBA)
      .pipe(finalize(() => {
        this.cargando = false;
        this.changeDetector.markForCheck();
      }))
      .subscribe({
        next: (fichaje) => {
          this.fichajeActivo = fichaje?.IdFichaje ? fichaje : null;
        },
        error: (err) => {
          console.error('Error al cargar el fichaje activo:', err);
          this.fichajeActivo = null;
          this.mostrarToast('No se pudo comprobar el fichaje activo.', 'danger');
        },
      });
  }

  async registrarFichaje(): Promise<void> {
    if (this.trabajoSeleccionado === null || this.enviando) {
      return;
    }

    this.enviando = true;

    let coordenadas;
    try {
      coordenadas = await this.geolocationService.obtenerCoordenadas();
    } catch (error) {
      console.error('Error al obtener la ubicación:', error);

      const permisoDenegado =
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 1;

      this.mostrarToast(
        permisoDenegado
          ? 'Necesitas permitir el acceso a la ubicación para fichar.'
          : 'No se pudo obtener tu ubicación.',
        permisoDenegado ? 'warning' : 'danger',
      );
      this.enviando = false;
      this.changeDetector.markForCheck();
      return;
    }

    this.apiService.addFichaje({
      IdUsuario: ID_USUARIO_PRUEBA,
      IdTrabajo: this.trabajoSeleccionado,
      GeolocalizacionLatitud: coordenadas.latitud,
      GeolocalizacionLongitud: coordenadas.longitud,
    }).subscribe({
      next: () => {
        this.enviando = false;
        this.mostrarToast('Fichaje iniciado.', 'success');
        this.changeDetector.markForCheck();
        this.cargarEstado();
      },
      error: (err) => {
        console.error('Error al registrar fichaje:', err);
        this.enviando = false;
        this.mostrarToast('No se pudo registrar el fichaje.', 'danger');
        this.changeDetector.markForCheck();
      },
    });
  }

  get nombreTrabajoActivo(): string {
    const idTrabajo = this.fichajeActivo?.IdTrabajo;
    return this.trabajos.find((trabajo) => trabajo.IdTrabajo === idTrabajo)?.Nombre
      ?? 'Trabajo no encontrado';
  }

  finalizarFichaje(): void {
    const idFichaje = this.fichajeActivo?.IdFichaje;

    if (idFichaje == null || this.enviando) {
      return;
    }

    this.enviando = true;

    this.apiService.updateFichaje(idFichaje, {}).subscribe({
      next: () => {
        this.enviando = false;
        this.mostrarToast('Fichaje finalizado.', 'success');
        this.cargarEstado();
        this.changeDetector.markForCheck();
      },
      error: (err) => {
        console.error('Error al finalizar el fichaje:', err);
        this.enviando = false;
        this.mostrarToast('No se pudo finalizar el fichaje.', 'danger');
        this.changeDetector.markForCheck();
      },
    });
  }
}
