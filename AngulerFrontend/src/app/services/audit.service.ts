import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

export interface AuditDTO {
  auditId: number;
  changedBy: number;
  userName: string;
  action: string;
  changedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuditService {
  private endpoint = 'Audits';

  constructor(private api: ApiService) {}

  getAudits(): Observable<AuditDTO[]> {
    return this.api.getAll<AuditDTO>(this.endpoint);
  }

  getAudit(id: number): Observable<AuditDTO> {
    return this.api.getById<AuditDTO>(this.endpoint, id);
  }

  deleteAudit(id: number): Observable<any> {
    return this.api.delete(this.endpoint, id);
  }

  deleteAudits(ids: number[]): Observable<any> {
    return this.api.create<any>(`${this.endpoint}/bulk-delete`, ids);
  }
}
