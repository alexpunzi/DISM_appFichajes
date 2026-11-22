import { Injectable } from '@angular/core';

export interface Coordenadas {
  latitud: number;
  longitud: number;
}

@Injectable({ providedIn: 'root' })
export class GeolocationService {
  obtenerCoordenadas(): Promise<Coordenadas> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Este navegador no admite geolocalización'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        ({ coords }) => resolve({
          latitud: coords.latitude,
          longitud: coords.longitude,
        }),
        (error) => reject(error),
        { timeout: 10000 },
      );
    });
  }
}