import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, inject, type OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonBadge,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonMenuButton,
  IonRefresher,
  IonRefresherContent,
  IonRow,
  IonSpinner,
  IonTitle,
  IonToast,
  IonToolbar,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  briefcaseOutline,
  locationOutline,
  personOutline,
  refreshOutline,
  searchOutline,
  timeOutline,
} from 'ionicons/icons';
import * as L from 'leaflet';
import { finalize } from 'rxjs';

import type { FichajeListado } from '../models';
import { ApiService } from '../services/api';

@Component({
  selector: 'app-consulta-fichajes',
  templateUrl: './consulta-fichajes.page.html',
  styleUrls: ['./consulta-fichajes.page.scss'],
  imports: [
    FormsModule,
    IonBadge,
    IonButton,
    IonButtons,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonCol,
    IonContent,
    IonGrid,
    IonHeader,
    IonIcon,
    IonInput,
    IonItem,
    IonLabel,
    IonList,
    IonMenuButton,
    IonRefresher,
    IonRefresherContent,
    IonRow,
    IonSpinner,
    IonTitle,
    IonToast,
    IonToolbar,
    CommonModule,
  ],
})
export class ConsultaFichajesPage implements OnInit, OnDestroy {
  fichajes: FichajeListado[] = [];
  cargando = true;
  toastAbierto = false;
  toastMensaje = '';
  toastColor: 'success' | 'danger' | 'warning' = 'danger';

  filtros = {
    fechaInicio: '',
    fechaFin: '',
  };

  // Mapas Leaflet activos, indexados por IdFichaje, para destruirlos al recargar
  private mapas: Record<number, L.Map> = {};
  // Observadores de tamaño: recalculan cada mapa cuando su contenedor cambia de tamaño
  private observadores: ResizeObserver[] = [];

  private readonly apiService = inject(ApiService);
  private readonly changeDetector = inject(ChangeDetectorRef);

  constructor() {
    addIcons({
      personOutline,
      briefcaseOutline,
      timeOutline,
      locationOutline,
      searchOutline,
      refreshOutline,
    });
  }

  ngOnInit(): void {
    this.cargarFichajes();
  }

  ngOnDestroy(): void {
    this.limpiarMapas();
  }

  mostrarToast(
    mensaje: string,
    color: 'success' | 'danger' | 'warning' = 'danger',
  ): void {
    this.toastMensaje = mensaje;
    this.toastColor = color;
    this.toastAbierto = true;
    this.changeDetector.markForCheck();
  }

  /** Indica si el fichaje tiene coordenadas válidas para pintar el mapa. */
  tieneGps(fichaje: FichajeListado): boolean {
    const lat = Number(fichaje.GeolocalizacionLatitud);
    const lng = Number(fichaje.GeolocalizacionLongitud);
    return !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;
  }

  cargarFichajes(event?: CustomEvent<{ complete: () => void }>): void {
    this.cargando = true;

    const fInicio = this.filtros.fechaInicio || undefined;
    const fFin = this.filtros.fechaFin || undefined;

    this.apiService
      .getFichajes({
        fechaInicio: fInicio,
        fechaFin: fFin,
      })
      .pipe(
        finalize(() => {
          this.cargando = false;
          event?.detail.complete();
          this.changeDetector.markForCheck();
        }),
      )
      .subscribe({
        next: (fichajes: FichajeListado[]) => {
          this.limpiarMapas();
          this.fichajes = Array.isArray(fichajes) ? [...fichajes] : [];
          this.changeDetector.detectChanges();

          // Esperar a que el DOM cree los contenedores antes de pintar los mapas
          setTimeout(() => this.inicializarMapas(), 200);
        },
        error: (err) => {
          console.error('Error al cargar fichajes:', err);
          this.mostrarToast('No se pudieron cargar los fichajes.', 'danger');
        },
      });
  }

  limpiarFiltros(): void {
    this.filtros = {
      fechaInicio: '',
      fechaFin: '',
    };
    this.cargarFichajes();
  }

  /** Crea un mapa Leaflet por fichaje con GPS válido. */
  inicializarMapas(): void {
    const iconoMarcador = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
    });

    this.fichajes.forEach((fichaje) => {
      if (!fichaje.IdFichaje || !this.tieneGps(fichaje)) {
        return;
      }

      const lat = Number(fichaje.GeolocalizacionLatitud);
      const lng = Number(fichaje.GeolocalizacionLongitud);
      const idContenedor = `map-${fichaje.IdFichaje}`;

      if (!document.getElementById(idContenedor)) {
        return;
      }

      const mapa = L.map(idContenedor, {
        center: [lat, lng],
        zoom: 15,
        scrollWheelZoom: false,
        zoomControl: true,
        attributionControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap',
      }).addTo(mapa);

      L.marker([lat, lng], { icon: iconoMarcador })
        .addTo(mapa)
        .bindPopup(`<b>${fichaje.NombreUsuario || 'Usuario ' + fichaje.IdUsuario}</b><br>GPS: ${lat}, ${lng}`);

      this.mapas[fichaje.IdFichaje] = mapa;

      // Leaflet solo pide los tiles del tamaño que tenía al crearse.
      // Si el contenedor cambia después, hay que recalcular el mapa.
      const contenedor = document.getElementById(idContenedor);
      if (contenedor) {
        const observador = new ResizeObserver(() => mapa.invalidateSize());
        observador.observe(contenedor);
        this.observadores.push(observador);
      }
      setTimeout(() => mapa.invalidateSize(), 300);
    });
  }

  private limpiarMapas(): void {
    this.observadores.forEach((observador) => observador.disconnect());
    this.observadores = [];
    Object.values(this.mapas).forEach((mapa) => mapa.remove());
    this.mapas = {};
  }
}
