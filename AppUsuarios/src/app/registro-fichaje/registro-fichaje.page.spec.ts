import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegistroFichajePage } from './registro-fichaje.page';

describe('RegistroFichajePage', () => {
  let component: RegistroFichajePage;
  let fixture: ComponentFixture<RegistroFichajePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RegistroFichajePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
