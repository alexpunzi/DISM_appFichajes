import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonSelect, IonSelectOption } from '@ionic/angular';
import { Trabajo } from '../models';
import { ApiService } from '../services/api';

@Component({
  selector: 'app-registro-fichaje',
  templateUrl: './registro-fichaje.page.html',
  styleUrls: ['./registro-fichaje.page.scss'],
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonSelectOption, IonItem, IonSelect],
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
}
