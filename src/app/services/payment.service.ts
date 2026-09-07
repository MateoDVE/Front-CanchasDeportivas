import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { UploadReceiptOutput } from '../models/payment.model';

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  private http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  uploadReceipt(reservationId: string, receiptImageUrl: string): Observable<UploadReceiptOutput> {
    return this.http.post<UploadReceiptOutput>(
      `${this.baseUrl}/payments/${reservationId}/receipt`,
      { receiptImageUrl },
    );
  }
}
