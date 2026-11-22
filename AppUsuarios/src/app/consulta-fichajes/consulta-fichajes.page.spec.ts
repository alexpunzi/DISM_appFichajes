import { provideHttpClient } from '@angular/common/http';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

import type { FichajeListado } from '../models';
import { ApiService } from '../services/api';
import { ConsultaFichajesPage } from './consulta-fichajes.page';

describe('ConsultaFichajesPage', () => {
  let component: ConsultaFichajesPage;
  let fixture: ComponentFixture<ConsultaFichajesPage>;
  let apiServiceMock: { getFichajes: ReturnType<typeof vi.fn> };

  const fichajesEjemplo: FichajeListado[] = [
    {
      IdFichaje: 1,
      IdUsuario: 1,
      NombreUsuario: 'Alex Punzano',
      IdTrabajo: 2,
      NombreTrabajo: 'Mantenimiento',
      FechaHoraEntrada: '2026-11-22T08:00:00.000Z',
      FechaHoraSalida: '2026-11-22T14:00:00.000Z',
      HorasTrabajadas: 6,
      GeolocalizacionLatitud: 38.3452,
      GeolocalizacionLongitud: -0.4815,
    },
    {
      IdFichaje: 2,
      IdUsuario: 1,
      NombreUsuario: 'Alex Punzano',
      IdTrabajo: 3,
      NombreTrabajo: 'Desarrollo',
      FechaHoraEntrada: '2026-11-22T15:00:00.000Z',
      GeolocalizacionLatitud: 38.3452,
      GeolocalizacionLongitud: -0.4815,
    },
  ];

  beforeEach(async () => {
    apiServiceMock = {
      getFichajes: vi.fn().mockReturnValue(of(fichajesEjemplo)),
    };

    await TestBed.configureTestingModule({
      imports: [ConsultaFichajesPage],
      providers: [
        provideHttpClient(),
        { provide: ApiService, useValue: apiServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ConsultaFichajesPage);
    component = fixture.componentInstance;
  });

  it('debe crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('debe cargar los fichajes del día en ngOnInit', () => {
    fixture.detectChanges(); // Ejecuta ngOnInit

    expect(apiServiceMock.getFichajes).toHaveBeenCalled();
    expect(component.fichajes.length).toBe(2);
    expect(component.fichajes[0].NombreTrabajo).toBe('Mantenimiento');
    expect(component.cargando).toBe(false);
  });

  it('debe mostrar mensaje de error en toast si la API falla', () => {
    apiServiceMock.getFichajes.mockReturnValue(throwError(() => new Error('Error de servidor')));

    fixture.detectChanges(); // Ejecuta ngOnInit

    expect(component.fichajes.length).toBe(0);
    expect(component.toastAbierto).toBe(true);
    expect(component.toastMensaje).toContain('No se pudieron cargar los fichajes');
    expect(component.toastColor).toBe('danger');
    expect(component.cargando).toBe(false);
  });

  it('debe completar el evento del ion-refresher al refrescar', () => {
    const completeSpy = vi.fn();
    const mockRefresherEvent = {
      detail: { complete: completeSpy },
    } as unknown as CustomEvent<{ complete: () => void }>;

    component.cargarFichajes(mockRefresherEvent);

    expect(apiServiceMock.getFichajes).toHaveBeenCalled();
    expect(completeSpy).toHaveBeenCalled();
  });
});
