import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';

import type { Fichaje, Trabajo, UsuarioSesion } from '../models';

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    private readonly http = inject(HttpClient);

    // URL base de nuestro backend Express (coincide con el servers.url de OpenAPI)
    private apiUrl = 'http://localhost:8080/v1';

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

    getUsuariosById(id: number): Observable<any> {
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

    getTrabajoById(id: number): Observable<any> {
        return this.http.get(`${this.apiUrl}/trabajos/${id}`, { withCredentials: true });
    }

    addTrabajo(trabajo: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/trabajos`, trabajo, { withCredentials: true });
    }

    updateTrabajo(id: number, trabajo: any): Observable<any> {
        return this.http.put(`${this.apiUrl}/trabajos/${id}`, trabajo, { withCredentials: true });
    }

    deleteTrabajo(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/trabajos/${id}`, { withCredentials: true });
    }

    // ==========================================
    // --- FICHAJES ---
    // ==========================================

    // El simbolo ? indica que es opcional
    getFichajes(fechaInicio?: string, fechaFin?: string): Observable<any> {
        let params = new HttpParams();
        if (fechaInicio) params = params.set('fechaInicio', fechaInicio);
        if (fechaFin) params = params.set('fechaFin', fechaFin);

        return this.http.get(`${this.apiUrl}/fichajes`, { params, withCredentials: true });
    }

    addFichaje(fichaje: Omit<Fichaje, 'IdUsuario'>): Observable<any> {
        return this.http.post(`${this.apiUrl}/fichajes`, fichaje, { withCredentials: true });
    }

    updateFichaje(id: number, fichaje: any): Observable<any> {
        return this.http.put(`${this.apiUrl}/fichajes/${id}`, fichaje, { withCredentials: true });
    }

    getFichajeActivo(): Observable<any> {
        return this.http.get(`${this.apiUrl}/fichajes/activo`, { withCredentials: true });
    }

    // ==========================================
    // --- APIKEY ---
    // ==========================================

    getApiKeys(): Observable<any> {
        return this.http.get(`${this.apiUrl}/apikey`, { withCredentials: true });
    }
}