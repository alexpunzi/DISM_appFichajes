import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonSelect, IonSelectOption, IonButton } from '@ionic/angular';
import { Trabajo } from '../models';
import { ApiService } from '../services/api';
import { ID_USUARIO_PRUEBA } from '../usuario-actual';

@Component({
  selector: 'app-registro-fichaje',
  templateUrl: './registro-fichaje.page.html',
  styleUrls: ['./registro-fichaje.page.scss'],
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonSelectOption, IonItem, IonSelect, IonButton],
})
export class RegistroFichajePage implements OnInit {
  trabajoSeleccionado: number | null = null;
  trabajos: Trabajo[] = [];

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.apiService.getTrabajos().subscribe({
      next: (trabajos) => {
        this.trabajos = trabajos;
      },
      error: (err) => {
        console.error('Error al cargar trabajos:', err);
        alert('No se pudieron cargar los trabajos.');
      },
    });
  }

  registrarFichaje() {
    if (this.trabajoSeleccionado === null) {
      alert('Selecciona un trabajo');
      return;
    }

    this.apiService.addFichaje({
      IdUsuario: ID_USUARIO_PRUEBA,
      IdTrabajo: this.trabajoSeleccionado,
    }).subscribe({
      next: () => alert('Fichaje iniciado.'),
      error: (err) => {
        console.error('Error al registrar fichaje:', err);
        alert('No se pudo registrar el fichaje');
      }
    })
  }
}
