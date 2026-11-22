import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular';

@Component({
  selector: 'app-registro-fichaje',
  templateUrl: './registro-fichaje.page.html',
  styleUrls: ['./registro-fichaje.page.scss'],
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule],
})
export class RegistroFichajePage implements OnInit {
  constructor() {}

  ngOnInit() {}
}
