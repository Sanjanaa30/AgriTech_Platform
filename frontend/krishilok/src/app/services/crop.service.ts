// src/app/services/crop.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CropService {
  private apiUrl = 'http://localhost:5000/api/crops';  // Adjust if deployed

  constructor(private http: HttpClient) { }

  // 🌱 Add a new crop
  addCrop(cropData: any) {
    return this.http.post('/api/crops', cropData, { withCredentials: true });
  }


  // 📋 Get all crops for logged-in user
  getCrops(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, { withCredentials: true });
  }

  // ✏️ Update crop by ID
  updateCrop(id: string, crop: any): Observable<any> {
    return this.http.put(`/api/crops/${id}`, crop, { withCredentials: true });
  }


  // 🗑️ Delete crop by ID
  deleteCrop(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { withCredentials: true });
  }
}
