import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular';
import { ID_USUARIO_PRUEBA } from '../usuario-actual';
import { Fichaje } from '../models';
import { ApiService } from '../services/api';

@Component({
  selector: 'app-consulta-fichajes',
  templateUrl: './consulta-fichajes.page.html',
  styleUrls: ['./consulta-fichajes.page.scss'],
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule],
})
export class ConsultaFichajesPage implements OnInit {
  fichajes: Fichaje[] = [];

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.apiService.getFichajes(ID_USUARIO_PRUEBA).subscribe ({
      next: (fichajes: Fichaje[]) => {
        this.fichajes = fichajes;
      },
      error: (err) => {
        console.error('Error al cargar fichajes:', err);
        alert('No se pudieron cargar los fichajes.')
      }
    });
  }
}
