import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../components/navbar/navbar';
import { SecretaryService, OperationalBoardOutput, PendingPaymentItem, ShiftSummaryOutput } from '../../services/secretary.service';
import { CourtService } from '../../services/court.service';
import { Court } from '../../models/court.model';

type SecretaryTab = 'board' | 'validation' | 'manual' | 'cash';

@Component({
  selector: 'app-secretary-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './secretary-dashboard.html',
  styleUrls: ['./secretary-dashboard.scss'],
})
export class SecretaryDashboardComponent implements OnInit {
  private secretaryService = inject(SecretaryService);
  private courtService = inject(CourtService);

  activeTab = signal<SecretaryTab>('board');
  loading = signal<boolean>(false);
  successMsg = signal<string | null>(null);
  errorMsg = signal<string | null>(null);

  // Fecha operativa (por defecto hoy)
  selectedDate = signal<string>(new Date().toISOString().split('T')[0]);

  // Tab 1: Tablero Diario & Check-In
  boardData = signal<OperationalBoardOutput | null>(null);
  searchQuery = signal<string>('');
  searchResults = signal<any[]>([]);
  searchingCheckin = signal<boolean>(false);

  // Tab 2: Validación de Anticipos
  pendingPayments = signal<PendingPaymentItem[]>([]);
  selectedReceiptImage = signal<string | null>(null);
  rejectionReason = signal<string>('');
  rejectingPaymentId = signal<number | null>(null);

  // Tab 3: Reserva Manual / WhatsApp
  availableCourts = signal<Court[]>([]);
  manualForm = {
    courtId: 0,
    reservationDate: new Date().toISOString().split('T')[0],
    startTime: '18:00',
    endTime: '19:00',
    origin: 'MANUAL' as 'MANUAL' | 'WHATSAPP',
    clientId: '',
  };

  // Modales de acción rápida para reservas (Cobro saldo restante / Cancelación / Reprogramación)
  activeReservationAction = signal<{
    type: 'finalPayment' | 'cancel' | 'reschedule' | 'noShow';
    reservation: any;
  } | null>(null);

  finalPaymentAmount = signal<number>(0);
  finalPaymentMethod = signal<'CASH' | 'QR'>('CASH');
  actionReason = signal<string>('');
  rescheduleDate = signal<string>('');
  rescheduleStartTime = signal<string>('');
  rescheduleEndTime = signal<string>('');

  // Tab 4: Control de Caja
  shiftSummary = signal<ShiftSummaryOutput | null>(null);
  declaredCash = signal<number>(0);
  shiftNotes = signal<string>('');
  shiftCloseResult = signal<any | null>(null);

  ngOnInit(): void {
    this.loadCourts();
    this.loadBoardData();
    this.loadPendingPayments();
    this.loadShiftSummary();
  }

  setTab(tab: SecretaryTab): void {
    this.activeTab.set(tab);
    this.clearAlerts();
    if (tab === 'board') this.loadBoardData();
    if (tab === 'validation') this.loadPendingPayments();
    if (tab === 'cash') this.loadShiftSummary();
  }

  clearAlerts(): void {
    this.successMsg.set(null);
    this.errorMsg.set(null);
  }

  private showSuccess(msg: string): void {
    this.successMsg.set(msg);
    this.errorMsg.set(null);
    setTimeout(() => this.successMsg.set(null), 5000);
  }

  private showError(msg: string): void {
    this.errorMsg.set(msg);
    this.successMsg.set(null);
  }

  loadCourts(): void {
    this.courtService.getAllCourts().subscribe({
      next: (courts) => {
        this.availableCourts.set(courts);
        if (courts.length > 0 && this.manualForm.courtId === 0) {
          this.manualForm.courtId = courts[0].id;
        }
      },
      error: () => this.showError('No se pudieron cargar las canchas disponibles.'),
    });
  }

  // === TABLERO OPERATIVO ===
  loadBoardData(): void {
    this.loading.set(true);
    this.secretaryService.getOperationalBoard(this.selectedDate()).subscribe({
      next: (data) => {
        this.boardData.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.showError('Error al cargar el tablero operativo del día.');
      },
    });
  }

  onDateChange(): void {
    this.loadBoardData();
    this.loadShiftSummary();
  }

  // === CHECK-IN RÁPIDO ===
  handleQuickSearch(): void {
    const q = this.searchQuery().trim();
    if (!q) {
      this.searchResults.set([]);
      return;
    }

    this.searchingCheckin.set(true);
    this.secretaryService.quickSearch(q).subscribe({
      next: (results) => {
        this.searchResults.set(results);
        this.searchingCheckin.set(false);
        if (results.length === 0) {
          this.showError('No se encontraron reservas con ese criterio.');
        } else {
          this.clearAlerts();
        }
      },
      error: () => {
        this.searchingCheckin.set(false);
        this.showError('Error al buscar reserva para check-in.');
      },
    });
  }

  // Autorizar ingreso a cancha
  authorizeEntry(reservationId: string): void {
    this.loading.set(true);
    this.secretaryService.authorizeEntry(reservationId).subscribe({
      next: () => {
        this.loading.set(false);
        this.showSuccess('✅ Ingreso autorizado exitosamente. Cancha habilitada.');
        this.loadBoardData();
        if (this.searchResults().length > 0) {
          this.handleQuickSearch();
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.showError(err.error?.message || 'No se pudo autorizar el ingreso.');
      },
    });
  }

  // Abrir modal de cobro restante (75%)
  openFinalPaymentModal(reservation: any): void {
    this.activeReservationAction.set({
      type: 'finalPayment',
      reservation,
    });
    this.finalPaymentAmount.set(reservation.pendingBalance || reservation.totalAmount * 0.75);
    this.finalPaymentMethod.set('CASH');
  }

  submitFinalPayment(): void {
    const action = this.activeReservationAction();
    if (!action) return;

    this.loading.set(true);
    this.secretaryService
      .registerFinalPayment(action.reservation.id, {
        amount: Number(this.finalPaymentAmount()),
        paymentMethod: this.finalPaymentMethod(),
      })
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.showSuccess('✅ Pago restante registrado con éxito.');
          this.closeActionModal();
          this.loadBoardData();
          this.loadShiftSummary();
          if (this.searchResults().length > 0) this.handleQuickSearch();
        },
        error: (err) => {
          this.loading.set(false);
          this.showError(err.error?.message || 'Error al registrar el pago restante.');
        },
      });
  }

  // Abrir modal No-Show
  openNoShowModal(reservation: any): void {
    this.activeReservationAction.set({
      type: 'noShow',
      reservation,
    });
    this.actionReason.set('Cliente no se presentó tras tolerancia de 15 minutos.');
  }

  submitNoShow(): void {
    const action = this.activeReservationAction();
    if (!action) return;

    this.loading.set(true);
    this.secretaryService.markNoShow(action.reservation.id, this.actionReason()).subscribe({
      next: () => {
        this.loading.set(false);
        this.showSuccess('⚠️ Reserva marcada como No-Show y turno liberado.');
        this.closeActionModal();
        this.loadBoardData();
        if (this.searchResults().length > 0) this.handleQuickSearch();
      },
      error: (err) => {
        this.loading.set(false);
        this.showError(err.error?.message || 'Error al procesar No-Show.');
      },
    });
  }

  // Abrir modal Cancelar
  openCancelModal(reservation: any): void {
    this.activeReservationAction.set({
      type: 'cancel',
      reservation,
    });
    this.actionReason.set('');
  }

  submitCancel(): void {
    const action = this.activeReservationAction();
    if (!action) return;

    if (!this.actionReason().trim()) {
      this.showError('Por favor especifica un motivo de cancelación.');
      return;
    }

    this.loading.set(true);
    this.secretaryService.cancelReservation(action.reservation.id, this.actionReason()).subscribe({
      next: () => {
        this.loading.set(false);
        this.showSuccess('Reserva cancelada correctamente.');
        this.closeActionModal();
        this.loadBoardData();
      },
      error: (err) => {
        this.loading.set(false);
        this.showError(err.error?.message || 'Error al cancelar la reserva.');
      },
    });
  }

  // Abrir modal Reprogramar
  openRescheduleModal(reservation: any): void {
    this.activeReservationAction.set({
      type: 'reschedule',
      reservation,
    });
    this.rescheduleDate.set(reservation.reservationDate || this.selectedDate());
    this.rescheduleStartTime.set(reservation.startTime || '19:00');
    this.rescheduleEndTime.set(reservation.endTime || '20:00');
    this.actionReason.set('Solicitud de reprogramación');
  }

  submitReschedule(): void {
    const action = this.activeReservationAction();
    if (!action) return;

    this.loading.set(true);
    this.secretaryService
      .rescheduleReservation(action.reservation.id, {
        newDate: this.rescheduleDate(),
        newStartTime: this.rescheduleStartTime(),
        newEndTime: this.rescheduleEndTime(),
        reason: this.actionReason(),
      })
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.showSuccess('✅ Reserva reprogramada con éxito.');
          this.closeActionModal();
          this.loadBoardData();
        },
        error: (err) => {
          this.loading.set(false);
          this.showError(err.error?.message || 'Error al reprogramar la reserva.');
        },
      });
  }

  closeActionModal(): void {
    this.activeReservationAction.set(null);
    this.actionReason.set('');
  }

  // === BANDEJA DE VALIDACIÓN DE COMPROBANTES ===
  loadPendingPayments(): void {
    this.loading.set(true);
    this.secretaryService.getPendingPayments().subscribe({
      next: (payments) => {
        this.pendingPayments.set(payments);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.showError('Error al obtener los comprobantes pendientes de validación.');
      },
    });
  }

  viewReceipt(imageUrl: string): void {
    this.selectedReceiptImage.set(imageUrl);
  }

  closeReceiptModal(): void {
    this.selectedReceiptImage.set(null);
  }

  validatePayment(paymentId: number): void {
    this.loading.set(true);
    this.secretaryService.validatePayment(paymentId).subscribe({
      next: () => {
        this.loading.set(false);
        this.showSuccess('✅ Comprobante validado. La reserva ha sido confirmada.');
        this.loadPendingPayments();
        this.loadBoardData();
      },
      error: (err) => {
        this.loading.set(false);
        this.showError(err.error?.message || 'Error al validar el comprobante.');
      },
    });
  }

  openRejectModal(paymentId: number): void {
    this.rejectingPaymentId.set(paymentId);
    this.rejectionReason.set('');
  }

  closeRejectModal(): void {
    this.rejectingPaymentId.set(null);
    this.rejectionReason.set('');
  }

  submitRejectPayment(): void {
    const paymentId = this.rejectingPaymentId();
    if (!paymentId) return;

    if (!this.rejectionReason().trim()) {
      this.showError('Debes ingresar el motivo de rechazo del comprobante.');
      return;
    }

    this.loading.set(true);
    this.secretaryService.rejectPayment(paymentId, this.rejectionReason()).subscribe({
      next: () => {
        this.loading.set(false);
        this.showSuccess('Comprobante rechazado. Se notificó al cliente.');
        this.closeRejectModal();
        this.loadPendingPayments();
        this.loadBoardData();
      },
      error: (err) => {
        this.loading.set(false);
        this.showError(err.error?.message || 'Error al rechazar el comprobante.');
      },
    });
  }

  // === RESERVA MANUAL / WHATSAPP ===
  submitManualReservation(): void {
    if (!this.manualForm.courtId || !this.manualForm.reservationDate || !this.manualForm.startTime || !this.manualForm.endTime) {
      this.showError('Por favor completa todos los campos requeridos para la reserva manual.');
      return;
    }

    this.loading.set(true);
    this.secretaryService
      .createManualReservation({
        courtId: Number(this.manualForm.courtId),
        reservationDate: this.manualForm.reservationDate,
        startTime: this.manualForm.startTime,
        endTime: this.manualForm.endTime,
        origin: this.manualForm.origin,
        clientId: this.manualForm.clientId ? this.manualForm.clientId : undefined,
      })
      .subscribe({
        next: (res) => {
          this.loading.set(false);
          this.showSuccess(`✅ Reserva manual creada exitosamente (ID: ${res.id || 'Generada'}).`);
          this.setTab('board');
        },
        error: (err) => {
          this.loading.set(false);
          this.showError(err.error?.message || 'Conflicto de horario o error al crear reserva manual.');
        },
      });
  }

  // === CONTROL Y CIERRE DE CAJA ===
  loadShiftSummary(): void {
    this.secretaryService.getCurrentShiftSummary(this.selectedDate()).subscribe({
      next: (summary) => {
        this.shiftSummary.set(summary);
      },
      error: () => {
        // En caso de que no haya turno abierto todavía
      },
    });
  }

  submitCloseShift(): void {
    const summary = this.shiftSummary();
    if (!summary) {
      this.showError('No hay información de turno disponible para cerrar.');
      return;
    }

    if (this.declaredCash() < 0) {
      this.showError('El efectivo declarado no puede ser negativo.');
      return;
    }

    this.loading.set(true);
    this.secretaryService
      .closeShift({
        totalDeclaredCash: Number(this.declaredCash()),
        notes: this.shiftNotes(),
        date: this.selectedDate(),
      })
      .subscribe({
        next: (result) => {
          this.loading.set(false);
          this.shiftCloseResult.set(result);
          this.showSuccess('✅ Cierre de caja realizado y registrado correctamente.');
          this.loadShiftSummary();
        },
        error: (err) => {
          this.loading.set(false);
          this.showError(err.error?.message || 'Error al procesar el cierre de caja.');
        },
      });
  }
}
