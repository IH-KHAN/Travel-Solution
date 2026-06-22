import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

export interface RefundDTO {
  refundId: number;
  bookingId?: number;
  bookingType?: string;
  userId?: number;
  refundAmount: number;
  status?: string;
  reason?: string;
  createdAt: string;
}

export interface RefundUpdateDTO {
  refundId: number;
  bookingId?: number;
  bookingType?: string;
  userId?: number;
  refundAmount: number;
  status?: string;
  reason?: string;
}

@Injectable({
  providedIn: 'root'
})
export class RefundService {
  private endpoint = 'Refunds';

  constructor(private api: ApiService) {}

  getRefunds(): Observable<RefundDTO[]> {
    return this.api.getAll<RefundDTO>(this.endpoint);
  }

  getRefund(id: number): Observable<RefundDTO> {
    return this.api.getById<RefundDTO>(this.endpoint, id);
  }

  getRefundsByUser(userId: number): Observable<RefundDTO[]> {
    return this.api.getAll<RefundDTO>(`${this.endpoint}/User/${userId}`);
  }

  updateRefund(id: number, data: RefundUpdateDTO): Observable<RefundDTO> {
    return this.api.update<RefundDTO>(this.endpoint, id, data);
  }

  createRefund(data: any): Observable<RefundDTO> {
    return this.api.create<RefundDTO>(this.endpoint, data);
  }

  deleteRefund(id: number): Observable<any> {
    return this.api.delete(this.endpoint, id);
  }
}
