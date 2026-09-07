export interface UploadReceiptDto {
  receiptImageUrl: string;
}

export interface UploadReceiptOutput {
  paymentId: number;
  reservationId: string;
  amount: number;
  paymentType: string;
  paymentMethod: string;
  receiptImageUrl: string | null;
  paymentStatus: string;
  reservationStatus: string;
  createdAt: string | Date;
}
