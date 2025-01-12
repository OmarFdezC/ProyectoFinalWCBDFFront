import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from './auth.service';

export interface Inventory {
  inventory_id: number;
  product_id: number;
  quantity: number;
  lastUpdated: Date | string;  // Permite tanto Date como string
}
interface ApiResponse {
  estado: number;
  msg: string;
  inventories: Inventory | Inventory[];
  links: Array<{
    rel: string;
    href: string;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private apiUrl = 'https://proyectofinalwcbdf.onrender.com/api/v1/inventory';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred';
    if (error.status === 404) {
      // Manejar específicamente el error 404
      return throwError(() => ({
        status: 404,
        message: 'No se encontraron registros de inventario',
        error: error.error
      }));
    }
    console.error('Error details:', error);
    return throwError(() => ({
      status: error.status,
      message: errorMessage,
      error: error.error
    }));
  }

  getInventories(): Observable<ApiResponse> {
    const headers = new HttpHeaders(this.authService.getAuthHeaders());
    
    return this.http.get<ApiResponse>(this.apiUrl, { headers }).pipe(
      map(response => {
        // Si la respuesta es exitosa pero no hay inventarios, crear una respuesta vacía válida
        if (!response.inventories) {
          return {
            estado: 200,
            msg: 'No hay inventarios disponibles',
            inventories: [],
            links: []
          };
        }
        return response;
      }),
      catchError(this.handleError)
    );
  }

  createInventory(inventory: Partial<Inventory>): Observable<ApiResponse> {
    const headers = new HttpHeaders({
      ...this.authService.getAuthHeaders(),
      'Content-Type': 'application/json'
    });
    
    return this.http.post<ApiResponse>(this.apiUrl, inventory, { headers }).pipe(
      map(response => {
        console.log('Create response:', response);
        return response;
      }),
      catchError(this.handleError)
    );
  }

  updateInventory(id: number, inventory: Partial<Inventory>): Observable<ApiResponse> {
    const headers = new HttpHeaders({
      ...this.authService.getAuthHeaders(),
      'Content-Type': 'application/json'
    });
    
    return this.http.put<ApiResponse>(`${this.apiUrl}/${id}`, inventory, { headers }).pipe(
      map(response => {
        console.log('Update response:', response);
        return response;
      }),
      catchError(this.handleError)
    );
  }

  deleteInventory(id: number): Observable<ApiResponse> {
    const headers = new HttpHeaders(this.authService.getAuthHeaders());
    
    return this.http.delete<ApiResponse>(`${this.apiUrl}/${id}`, { headers }).pipe(
      map(response => {
        console.log('Delete response:', response);
        return response;
      }),
      catchError(this.handleError)
    );
  }
}