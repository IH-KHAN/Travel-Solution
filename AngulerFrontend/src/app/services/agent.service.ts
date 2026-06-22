import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AgentService {
  private apiUrl = 'http://localhost:5246/api/Agent'; 

  constructor(private http: HttpClient) { }

  getAssignedPackages(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/AgentAssignedPackages/${userId}`);
  }

  getPackageTravellers(packageId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/GetPackageTravellers/${packageId}`);
  }

  updateTravellerPresence(updates: any[]): Observable<any> {
    return this.http.put(`${this.apiUrl}/UpdateTravellerPresence`, updates);
  }

  completeActivity(activityId: number, data: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/AgentCompleteActivity/${activityId}`, data);
  }

  addUnplannedActivity(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/AgentAddUnplanned`, data);
  }

  assignAgent(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/AssignAgent`, data);
  }
}
