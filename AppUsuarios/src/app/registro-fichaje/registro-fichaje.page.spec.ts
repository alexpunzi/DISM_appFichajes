import { provideHttpClient } from '@angular/common/http';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';

import type { Fichaje, Trabajo } from '../models';
import { ApiService } from '../services/api';
import { GeolocationService } from '../services/geolocation.service';
import { RegistroFichajePage } from './registro-fichaje.page';

describe('RegistroFichajePage', () => {
  let component: RegistroFichajePage;
  let fixture: ComponentFixture<RegistroFichajePage>;
  let apiServiceMock: {
    getTrabajos: ReturnType<typeof vi.fn>;
    getFichajeActivo: ReturnType<typeof vi.fn>;
    addFichaje: ReturnType<typeof vi.fn>;
    updateFichaje: ReturnType<typeof vi.fn>;
  };
  let geolocationServiceMock: {
    obtenerCoordenadas: ReturnType<typeof vi.fn>;
  };

  const listaTrabajos: Trabajo[] = [
    { IdTrabajo: 1, Nombre: 'Oficina Central' },
    { IdTrabajo: 2, Nombre: 'Soporte Técnico' },
  ];

  const fichajeActivoEjemplo: Fichaje = {
    IdFichaje: 10,
    IdUsuario: 1,
    IdTrabajo: 2,
    FechaHoraEntrada: '2026-11-22T09:00:00.000Z',
    GeolocalizacionLatitud: 38.3452,
    GeolocalizacionLongitud: -0.4815,
  };

  beforeEach(async () => {
    apiServiceMock = {
      getTrabajos: vi.fn().mockReturnValue(of(listaTrabajos)),
      getFichajeActivo: vi.fn().mockReturnValue(of({})),
      addFichaje: vi.fn().mockReturnValue(of({ IdFichaje: 11, message: 'Fichaje iniciado' })),
      updateFichaje: vi.fn().mockReturnValue(of({ message: 'Fichaje cerrado' })),
    };

    geolocationServiceMock = {
      obtenerCoordenadas: vi.fn().mockResolvedValue({ latitud: 38.3452, longitud: -0.4815 }),
    };

    await TestBed.configureTestingModule({
      imports: [RegistroFichajePage],
      providers: [
        provideHttpClient(),
        { provide: ApiService, useValue: apiServiceMock },
        { provide: GeolocationService, useValue: geolocationServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegistroFichajePage);
    component = fixture.componentInstance;
  });

  it('debe crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('debe cargar los trabajos y comprobar que no hay fichaje activo al entrar', () => {
    component.ionViewWillEnter();

    expect(apiServiceMock.getTrabajos).toHaveBeenCalled();
    expect(apiServiceMock.getFichajeActivo).toHaveBeenCalled();
    expect(component.trabajos.length).toBe(2);
    expect(component.fichajeActivo).toBeNull();
    expect(component.cargando).toBe(false);
  });

  it('debe detectar un fichaje activo y mostrar el nombre del trabajo asignado', () => {
    apiServiceMock.getFichajeActivo.mockReturnValue(of(fichajeActivoEjemplo));

    component.ionViewWillEnter();

    expect(component.fichajeActivo).toEqual(fichajeActivoEjemplo);
    expect(component.nombreTrabajoActivo).toBe('Soporte Técnico');
  });

  it('debe registrar un nuevo fichaje con geolocalización cuando no hay fichaje activo', async () => {
    component.ionViewWillEnter();
    component.trabajoSeleccionado = 1;

    await component.registrarFichaje();

    expect(geolocationServiceMock.obtenerCoordenadas).toHaveBeenCalled();
    expect(apiServiceMock.addFichaje).toHaveBeenCalledWith({
      IdTrabajo: 1,
      GeolocalizacionLatitud: 38.3452,
      GeolocalizacionLongitud: -0.4815,
    });
    expect(component.toastAbierto).toBe(true);
    expect(component.toastColor).toBe('success');
    expect(component.toastMensaje).toContain('Fichaje iniciado');
  });

  it('debe mostrar advertencia si el usuario rechaza los permisos de geolocalización al fichar', async () => {
    component.ionViewWillEnter();
    component.trabajoSeleccionado = 1;
    geolocationServiceMock.obtenerCoordenadas.mockRejectedValue({ code: 1, message: 'User denied' });

    await component.registrarFichaje();

    expect(geolocationServiceMock.obtenerCoordenadas).toHaveBeenCalled();
    expect(apiServiceMock.addFichaje).not.toHaveBeenCalled();
    expect(component.toastAbierto).toBe(true);
    expect(component.toastColor).toBe('warning');
    expect(component.toastMensaje).toContain('Necesitas permitir el acceso a la ubicación');
  });

  it('debe finalizar el fichaje activo llamando a updateFichaje', () => {
    apiServiceMock.getFichajeActivo.mockReturnValue(of(fichajeActivoEjemplo));
    component.ionViewWillEnter();

    component.finalizarFichaje();

    expect(apiServiceMock.updateFichaje).toHaveBeenCalledWith(10, {});
    expect(component.toastAbierto).toBe(true);
    expect(component.toastColor).toBe('success');
    expect(component.toastMensaje).toContain('Fichaje finalizado');
  });
});
