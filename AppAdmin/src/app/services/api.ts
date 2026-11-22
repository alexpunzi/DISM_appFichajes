import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Trabajo, Fichaje, FichajeListado, UsuarioSesion } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  // URL base de nuestro backend Express (coincide con el servers.url de OpenAPI)
  private apiUrl = 'http://localhost:8080/v1';

  constructor(private http: HttpClient) {}

  // ==========================================
  // --- SESIÓN ---
  // ==========================================

  login(credentials: { Usuario: string; Clave: string }): Observable<UsuarioSesion> {
    return this.http.post<UsuarioSesion>(`${this.apiUrl}/login`, credentials, { withCredentials: true });
  }

  getSession(): Observable<UsuarioSesion | null> {
    return this.http.get<UsuarioSesion | null>(`${this.apiUrl}/session`, { withCredentials: true });
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/logout`, {}, { withCredentials: true });
  }

  // ==========================================
  // --- USUARIOS ---
  // ==========================================

  getUsuarios(): Observable<any> {
    return this.http.get(`${this.apiUrl}/usuarios`, { withCredentials: true });
  }

  getUsuarioById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/usuarios/${id}`, { withCredentials: true });
  }

  addUsuario(usuario: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/usuarios`, usuario, { withCredentials: true });
  }

  updateUsuario(id: number, usuario: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/usuarios/${id}`, usuario, { withCredentials: true });
  }

  deleteUsuario(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/usuarios/${id}`, { withCredentials: true });
  }

  // ==========================================
  // --- TRABAJOS ---
  // ==========================================

  getTrabajos(): Observable<Trabajo[]> {
    return this.http.get<Trabajo[]>(`${this.apiUrl}/trabajos`, { withCredentials: true });
  }

  getTrabajoById(id: number): Observable<Trabajo> {
    return this.http.get<Trabajo>(`${this.apiUrl}/trabajos/${id}`, { withCredentials: true });
  }

  addTrabajo(trabajo: Trabajo): Observable<Trabajo> {
    return this.http.post<Trabajo>(`${this.apiUrl}/trabajos`, trabajo, { withCredentials: true });
  }

  updateTrabajo(id: number, trabajo: Trabajo): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/trabajos/${id}`, trabajo, { withCredentials: true });
  }

  deleteTrabajo(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/trabajos/${id}`, { withCredentials: true });
  }

  // ==========================================
  // --- FICHAJES ---
  // ==========================================

  getFichajes(idUsuario?: number, fechaInicio?: string, fechaFin?: string): Observable<FichajeListado[]> {
    let params = new HttpParams();
    if (idUsuario) params = params.set('idUsuario', idUsuario.toString());
    if (fechaInicio) params = params.set('fechaInicio', fechaInicio);
    if (fechaFin) params = params.set('fechaFin', fechaFin);

    return this.http.get<FichajeListado[]>(`${this.apiUrl}/fichajes`, { params, withCredentials: true });
  }

  addFichaje(fichaje: Fichaje): Observable<{ IdFichaje: number; message: string }> {
    return this.http.post<{ IdFichaje: number; message: string }>(`${this.apiUrl}/fichajes`, fichaje, { withCredentials: true });
  }

  updateFichaje(id: number, fichaje: Fichaje): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/fichajes/${id}`, fichaje, { withCredentials: true });
  }

  getFichajeActivo(): Observable<Fichaje> {
    return this.http.get<Fichaje>(`${this.apiUrl}/fichajes/activo`, { withCredentials: true });
  }

  // ==========================================
  // --- APIKEY ---
  // ==========================================

  getApiKeys(): Observable<any> {
    return this.http.get(`${this.apiUrl}/apikey`, { withCredentials: true });
  }
}