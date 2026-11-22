import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Trabajo, Fichaje, FichajeListado } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  // URL base de nuestro backend Express (coincide con el servers.url de OpenAPI)
  private apiUrl = 'http://localhost:8080/v1';

  constructor(private http: HttpClient) {}

  // ==========================================
  // --- USUARIOS ---
  // ==========================================

  getUsuarios(): Observable<any> {
    return this.http.get(`${this.apiUrl}/usuarios`);
  }

  getUsuarioById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/usuarios/${id}`);
  }

  addUsuario(usuario: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/usuarios`, usuario);
  }

  updateUsuario(id: number, usuario: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/usuarios/${id}`, usuario);
  }

  deleteUsuario(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/usuarios/${id}`);
  }

  // ==========================================
  // --- TRABAJOS ---
  // ==========================================

  getTrabajos(): Observable<Trabajo[]> {
    return this.http.get<Trabajo[]>(`${this.apiUrl}/trabajos`);
  }

  getTrabajoById(id: number): Observable<Trabajo> {
    return this.http.get<Trabajo>(`${this.apiUrl}/trabajos/${id}`);
  }

  addTrabajo(trabajo: Trabajo): Observable<Trabajo> {
    return this.http.post<Trabajo>(`${this.apiUrl}/trabajos`, trabajo);
  }

  updateTrabajo(id: number, trabajo: Trabajo): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/trabajos/${id}`, trabajo);
  }

  deleteTrabajo(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/trabajos/${id}`);
  }

  // ==========================================
  // --- FICHAJES ---
  // ==========================================

  getFichajes(idUsuario?: number, fechaInicio?: string, fechaFin?: string): Observable<FichajeListado[]> {
    let params = new HttpParams();
    if (idUsuario) params = params.set('idUsuario', idUsuario.toString());
    if (fechaInicio) params = params.set('fechaInicio', fechaInicio);
    if (fechaFin) params = params.set('fechaFin', fechaFin);

    return this.http.get<FichajeListado[]>(`${this.apiUrl}/fichajes`, { params });
  }

  addFichaje(fichaje: Fichaje): Observable<{ IdFichaje: number; message: string }> {
    return this.http.post<{ IdFichaje: number; message: string }>(`${this.apiUrl}/fichajes`, fichaje);
  }

  updateFichaje(id: number, fichaje: Fichaje): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/fichajes/${id}`, fichaje);
  }

  getFichajeActivo(idUsuario: number): Observable<Fichaje> {
    return this.http.get<Fichaje>(`${this.apiUrl}/fichajes/activo/${idUsuario}`);
  }

  // ==========================================
  // --- APIKEY ---
  // ==========================================

  getApiKeys(): Observable<any> {
    return this.http.get(`${this.apiUrl}/apikey`);
  }
}