export interface Trabajo {
  IdTrabajo?: number;
  Nombre: string;
}

export interface UsuarioSesion {
  IdUsuario: number;
  Nombre: string;
  Usuario: string;
}

export interface Fichaje {
  IdFichaje?: number;
  FechaHoraEntrada?: string;
  FechaHoraSalida?: string;
  HorasTrabajadas?: number;
  IdTrabajo?: number;
  IdUsuario?: number;
  GeolocalizacionLatitud?: number;
  GeolocalizacionLongitud?: number;
}

export interface FichajeListado extends Fichaje {
    NombreUsuario: string | null;
    NombreTrabajo: string | null;
}

export interface FiltrosFichajes {
  idUsuario?: number | string;
  fechaInicio?: string;
  fechaFin?: string;
}