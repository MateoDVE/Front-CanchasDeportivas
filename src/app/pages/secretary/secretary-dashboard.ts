import { ConfirmationService } from '../../services/confirmation.service';
import { Component, OnInit, OnDestroy, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClientSearchResult, SecretaryService, OperationalBoardOutput, PendingPaymentItem, ShiftSummaryOutput } from '../../services/secretary.service';
import { CourtService } from '../../services/court.service';
import { Court, SlotAvailability } from '../../models/court.model';

type SecretaryTab = 'board' | 'validation' | 'manual' | 'cash';

@Component({
  selector: 'app-secretary-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './secretary-dashboard.html',
  styleUrls: ['./secretary-dashboard.scss', './secretary-cash.scss'],
})
export class SecretaryDashboardComponent implements OnInit, OnDestroy {
  private secretaryService = inject(SecretaryService);
  private courtService = inject(CourtService);
  private confirmation = inject(ConfirmationService);

  activeTab = signal<SecretaryTab>('board');
  loading = signal<boolean>(false);
  successMsg = signal<string | null>(null);
  errorMsg = signal<string | null>(null);

  // Fecha operativa (por defecto hoy)
  selectedDate = signal<string>(this.todayInBolivia());
  private boardRequestVersion = 0;
  private checkinRequestVersion = 0;

  todayInBolivia(): string {
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/La_Paz' }).format(new Date());
  }

  selectDate(date: string): void {
    const parsed = new Date(`${date}T12:00:00Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) return;
    this.selectedDate.set(date);
    this.onDateChange();
  }

  moveDate(days: number): void {
    const date = new Date(`${this.selectedDate()}T12:00:00Z`);
    date.setUTCDate(date.getUTCDate() + days);
    this.selectDate(date.toISOString().slice(0, 10));
  }

  // Tab 1: Tablero Diario & Check-In
  boardData = signal<OperationalBoardOutput | null>(null);
  searchQuery = signal<string>('');
  searchResults = signal<any[]>([]);
  searchingCheckin = signal<boolean>(false);

  // Tab 2: Validación de Anticipos
  pendingPayments = signal<PendingPaymentItem[]>([]);
  receiptDetail = signal<any | null>(null);
  receiptDetailOpen = signal(false);
  receiptDetailLoading = signal(false);
  receiptDetailError = signal('');
  private receiptDetailRequest?: { unsubscribe(): void };

  viewPaymentDetails(payment: PendingPaymentItem): void {
    this.receiptDetailRequest?.unsubscribe();
    this.receiptDetail.set(null);
    this.receiptDetailOpen.set(true);
    this.receiptDetailLoading.set(true);
    this.receiptDetailError.set('');
    this.receiptDetailRequest = this.secretaryService.getReservationDetail(payment.reservationId).subscribe({
      next: detail => { this.receiptDetail.set(detail); this.receiptDetailLoading.set(false); },
      error: () => { this.receiptDetailError.set('No se pudo cargar el detalle. Cierra e intenta nuevamente.'); this.receiptDetailLoading.set(false); },
    });
  }
  closeReceiptDetails(): void {
    this.receiptDetailRequest?.unsubscribe();
    this.receiptDetailOpen.set(false);
    this.receiptDetail.set(null);
  }
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

  clientMode = signal<'walk-in' | 'existing'>('walk-in');
  private clientSearchTimer?: ReturnType<typeof setTimeout>;
  clientQuery = '';
  clientResults = signal<ClientSearchResult[]>([]);
  selectedClient = signal<ClientSearchResult | null>(null);
  searchingClients = signal(false);
  clientSearchMessage = signal('');
  private clientSearchVersion = 0;

  ngOnDestroy(): void {
    this.rescheduleHoursVersion++;
    this.boardRequestVersion++;
    this.checkinRequestVersion++;
    this.receiptDetailRequest?.unsubscribe();
    clearTimeout(this.clientSearchTimer);
    this.clientSearchVersion++;
  }

  setClientMode(mode: 'walk-in' | 'existing'): void {
    this.onClientQueryChange('');
    this.clientMode.set(mode);
    this.clearAlerts();
  }

  async chooseWalkInClient(): Promise<void> {
    this.setClientMode('walk-in');
    await this.confirmation.confirm({
      title: 'Cliente presencial seleccionado',
      message: 'La reserva se registrará a nombre de Cliente presencial. No necesitas buscar un cliente ni ingresar un ID. Puedes continuar con el registro de la reserva.',
      confirmText: 'Entendido',
      cancelText: 'Cerrar',
    });
  }

  onClientQueryChange(query: string): void {
    clearTimeout(this.clientSearchTimer);
    this.clientQuery = query;
    if (query.trim()) this.clientMode.set('existing');
    this.clientSearchVersion++;
    this.searchingClients.set(false);
    this.clientResults.set([]);
    this.selectedClient.set(null);
    this.manualForm.clientId = '';
    this.clientSearchMessage.set('');
    if (query.trim().length >= 2) {
      this.clientSearchTimer = setTimeout(() => this.searchClients(), 300);
    }
  }

  searchClients(): void {
    clearTimeout(this.clientSearchTimer);
    const query = this.clientQuery.trim();
    if (query.length < 2) {
      this.clientSearchMessage.set('Escribe al menos 2 caracteres para buscar.');
      return;
    }
    const version = ++this.clientSearchVersion;
    this.searchingClients.set(true);
    this.clientSearchMessage.set('');
    this.secretaryService.searchClients(query).subscribe({
      next: clients => {
        if (version !== this.clientSearchVersion) return;
        this.clientResults.set(clients);
        this.searchingClients.set(false);
        this.clientSearchMessage.set(clients.length ? 'Selecciona el cliente correcto.' : 'No se encontraron clientes. Puedes registrar como cliente presencial.');
      },
      error: (error) => {
        if (version !== this.clientSearchVersion) return;
        this.searchingClients.set(false);
        this.clientSearchMessage.set(error.status === 401 ? 'Tu sesión expiró. Vuelve a iniciar sesión.' :
          error.status === 404 ? 'El backend no tiene disponible el buscador. Reinicia el servidor actualizado.' :
          error.status === 0 ? 'No se pudo conectar con el servidor.' : 'No se pudo buscar. Intenta nuevamente.');
      },
    });
  }

  selectClient(client: ClientSearchResult): void {
    clearTimeout(this.clientSearchTimer);
    this.clientMode.set('existing');
    this.clientSearchVersion++;
    this.searchingClients.set(false);
    this.selectedClient.set(client);
    this.manualForm.clientId = client.id;
    this.clientResults.set([]);
    this.clientSearchMessage.set('');
  }

  // Modales de acción rápida para reservas (Cobro saldo restante / Cancelación / Reprogramación)
  activeReservationAction = signal<{
    type: 'finalPayment' | 'cancel' | 'reschedule' | 'noShow';
    reservation: any;
  } | null>(null);

  finalPaymentAmount = signal<number>(0);
  finalPaymentMethod = signal<'EFECTIVO' | 'QR'>('EFECTIVO');
  actionReason = signal<string>('');
  rescheduleDate = signal<string>('');
  rescheduleStartTime = signal<string>('');
  rescheduleEndTime = signal<string>('');

  rescheduleSlots = signal<SlotAvailability[]>([]);
  rescheduleHoursLoading = signal(false);
  rescheduleHoursError = signal('');
  rescheduleSubmitting = signal(false);
  private rescheduleHoursVersion = 0;
  rescheduleStarts = computed(() => this.rescheduleSlots().filter(slot => slot.isAvailable &&
    new Date(`${this.rescheduleDate()}T${slot.startTime}:00-04:00`).getTime() > Date.now()).map(slot => slot.startTime));
  rescheduleEnds = computed(() => {
    const slots = this.rescheduleSlots();
    const index = slots.findIndex(slot => slot.startTime === this.rescheduleStartTime());
    const ends: string[] = [];
    if (index < 0) return ends;
    let next = this.rescheduleStartTime();
    for (const slot of slots.slice(index)) {
      if (!slot.isAvailable || slot.startTime !== next) break;
      ends.push(slot.endTime);
      next = slot.endTime;
    }
    return ends;
  });

  private rescheduleNotice(title: string, message: string, danger = false): void {
    void this.confirmation.confirm({ title, message, danger, acknowledgeOnly: true, confirmText: 'Entendido' });
  }

  changeRescheduleStart(time: string): void {
    this.rescheduleStartTime.set(time);
    this.rescheduleEndTime.set('');
  }

  loadRescheduleHours(): void {
    const version = ++this.rescheduleHoursVersion;
    this.rescheduleStartTime.set('');
    this.rescheduleEndTime.set('');
    this.rescheduleSlots.set([]);
    this.rescheduleHoursError.set('');
    this.rescheduleHoursLoading.set(false);
    const action = this.activeReservationAction();
    const date = this.rescheduleDate();
    if (!action || action.type !== 'reschedule') return;
    if (!date || date < this.todayInBolivia()) {
      this.rescheduleHoursError.set('Selecciona hoy o una fecha futura.');
      return;
    }
    this.rescheduleHoursLoading.set(true);
    this.secretaryService.getRescheduleAvailability(action.reservation.id, date).subscribe({
      next: data => {
        if (version !== this.rescheduleHoursVersion) return;
        this.rescheduleSlots.set(data.slots || []);
        this.rescheduleHoursLoading.set(false);
        if (!this.rescheduleStarts().length) this.rescheduleHoursError.set(data.isOpen ? 'No hay horarios disponibles para esta fecha. Selecciona otro día.' : 'La cancha no atiende en esta fecha. Selecciona otro día.');
      },
      error: err => {
        if (version !== this.rescheduleHoursVersion) return;
        this.rescheduleHoursLoading.set(false);
        const message = this.rescheduleErrorMessage(err, 'No se pudieron consultar los horarios. Intenta nuevamente.');
        this.rescheduleHoursError.set(message);
        this.rescheduleNotice('No se pudieron cargar los horarios', message, true);
      },
    });
  }

  private rescheduleErrorMessage(error: any, fallback: string): string {
    const message = error?.error?.message;
    return Array.isArray(message) ? message.join('\n') : typeof message === 'string' ? message : fallback;
  }

  // Tab 4: Control de Caja
  shiftSummary = signal<ShiftSummaryOutput | null>(null);
  declaredCash = signal<number | null>(null);
  shiftLoading = signal(false);
  private shiftRequestVersion = 0;
  cashDifference = computed(() => {
    const amount = this.declaredCash();
    const summary = this.shiftSummary();
    if (amount === null || !Number.isFinite(amount) || amount < 0 || !summary) return null;
    return Math.round((amount - Number(summary.totalCash)) * 100) / 100;
  });
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
    const version = ++this.boardRequestVersion;
    this.boardData.set(null);
    this.loading.set(true);
    this.secretaryService.getOperationalBoard(this.selectedDate()).subscribe({
      next: (data: any) => {
        if (version !== this.boardRequestVersion) return;
        if (data) {
          const mapped: OperationalBoardOutput = {
            date: data.date,
            totalReservations: data.totalReservations ?? data.totalReservationsToday ?? 0,
            confirmedCount: data.confirmedCount ?? data.confirmedTodayCount ?? 0,
            pendingValidationCount: data.pendingValidationCount ?? 0,
            completedCount: data.completedCount ?? 0,
            courts: data.courts || [],
          };
          this.boardData.set(mapped);
        }
        this.loading.set(false);
      },
      error: (err) => {
        if (version !== this.boardRequestVersion) return;
        this.loading.set(false);
        this.showError('Error al cargar el tablero operativo del día.');
      },
    });
  }

  onDateChange(): void {
    this.clearAlerts();
    this.searchResults.set([]);
    this.activeReservationAction.set(null);
    this.handleQuickSearch();
    this.declaredCash.set(null);
    this.shiftNotes.set('');
    this.shiftCloseResult.set(null);
    this.loadBoardData();
    this.loadShiftSummary();
  }

  // === CHECK-IN RÁPIDO ===
  handleQuickSearch(): void {
    const version = ++this.checkinRequestVersion;
    this.searchingCheckin.set(false);
    const q = this.searchQuery().trim();
    if (!q) {
      this.searchResults.set([]);
      return;
    }

    this.searchingCheckin.set(true);
    this.secretaryService.quickSearch(q, this.selectedDate()).subscribe({
      next: (results: any[]) => {
        if (version !== this.checkinRequestVersion) return;
        const mapped = (results || []).map((item) => {
          if (item.reservation) {
            return {
              id: item.id || item.reservation.id,
              clientName: item.clientName || item.client?.fullName || 'Cliente',
              status: item.status || item.reservation.status,
              courtName: item.courtName || `Cancha ${item.reservation.courtId}`,
              reservationDate: item.reservationDate || item.reservation.reservationDate,
              startTime: item.startTime || item.reservation.startTime,
              endTime: item.endTime || item.reservation.endTime,
              pendingBalance: item.pendingBalance ?? item.reservation.pendingBalance ?? 0,
              isAuthorized: item.isAuthorized ?? item.reservation.isEntryAuthorized ?? false,
              totalAmount: item.totalAmount ?? item.reservation.totalPrice ?? 0,
            };
          }
          return item;
        });
        this.searchResults.set(mapped);
        this.searchingCheckin.set(false);
        if (mapped.length === 0) {
          this.showError('No se encontraron reservas con ese criterio.');
        } else {
          this.clearAlerts();
        }
      },
      error: () => {
        if (version !== this.checkinRequestVersion) return;
        this.searchingCheckin.set(false);
        this.showError('Error al buscar reserva para check-in.');
      },
    });
  }

  // Autorizar ingreso a cancha
  async authorizeEntry(reservationId: string): Promise<void> {
    if (this.loading()) return;
    if (!await this.confirmation.confirm({ title: 'Autorizar ingreso', message: 'Se autorizará el ingreso para la reserva ' + reservationId + '.', confirmText: 'Autorizar ingreso' })) return;
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
    this.finalPaymentMethod.set('EFECTIVO');
  }

  submitFinalPayment(): void {
    const action = this.activeReservationAction();
    if (!action) return;

    this.loading.set(true);
    this.secretaryService
      .registerFinalPayment(action.reservation.id, {
        amount: Number(this.finalPaymentAmount()),
        paymentMethod: this.finalPaymentMethod() === ('CASH' as any) ? 'EFECTIVO' : this.finalPaymentMethod(),
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

  // Una reserva confirmada puede reprogramarse una única vez.
  canReschedule(reservation: { status: string; parentReservationId?: string | null; canBeRescheduled?: boolean; isAuthorized?: boolean; isEntryAuthorized?: boolean }): boolean {
    return reservation.status === 'CONFIRMED'
      && !reservation.parentReservationId
      && !reservation.isAuthorized
      && !reservation.isEntryAuthorized
      && reservation.canBeRescheduled !== false;
  }

  openRescheduleModal(reservation: any): void {
    if (!this.canReschedule(reservation)) {
      this.rescheduleNotice('No se puede reprogramar', reservation.parentReservationId ? 'Esta reserva ya fue reprogramada. Solo se permite una reprogramación.' : 'Solo se pueden reprogramar reservas confirmadas sin ingreso autorizado.', true);
      return;
    }
    this.activeReservationAction.set({ type: 'reschedule', reservation });
    const date = reservation.reservationDate || this.selectedDate();
    this.rescheduleDate.set(date < this.todayInBolivia() ? this.todayInBolivia() : date);
    this.actionReason.set('Solicitud de reprogramación');
    this.loadRescheduleHours();
  }

  async submitReschedule(): Promise<void> {
    const action = this.activeReservationAction();
    if (!action || action.type !== 'reschedule' || this.rescheduleSubmitting()) return;
    const date = this.rescheduleDate();
    const start = this.rescheduleStartTime();
    const end = this.rescheduleEndTime();
    if (this.rescheduleHoursLoading() || !this.rescheduleStarts().includes(start) || !this.rescheduleEnds().includes(end) || new Date(`${date}T${start}:00-04:00`).getTime() <= Date.now()) {
      this.rescheduleNotice('Selecciona un horario válido', 'Elige una fecha futura y horas disponibles. La duración mínima es de 30 minutos y todos los bloques deben estar libres.', true);
      return;
    }
    if (date === (action.reservation.reservationDate || this.selectedDate()) && start === action.reservation.startTime?.slice(0, 5) && end === action.reservation.endTime?.slice(0, 5)) {
      this.rescheduleNotice('El horario no cambió', 'Selecciona una fecha o un horario diferente al original.', true);
      return;
    }
    this.rescheduleSubmitting.set(true);
    const accepted = await this.confirmation.confirm({
      title: 'Confirmar reprogramación',
      message: `La reserva se trasladará al ${date}, de ${start} a ${end}. Se aplicará la tarifa vigente y se conservarán los pagos validados. Esta es la única reprogramación permitida.`,
      confirmText: 'Reprogramar reserva',
      cancelText: 'Volver',
    });
    if (!accepted) { this.rescheduleSubmitting.set(false); return; }
    this.secretaryService.rescheduleReservation(action.reservation.id, {
      newDate: date, newStartTime: start, newEndTime: end, reason: this.actionReason(),
    }).subscribe({
      next: () => {
        this.rescheduleSubmitting.set(false);
        this.closeActionModal();
        this.rescheduleNotice('Reserva reprogramada', `Se creó la nueva reserva para el ${date}, de ${start} a ${end}. Los pagos validados se trasladaron y el horario anterior quedó liberado. Esta reserva ya no puede volver a reprogramarse.`);
        this.loadBoardData();
        if (this.searchQuery().trim()) this.handleQuickSearch();
      },
      error: err => {
        this.rescheduleSubmitting.set(false);
        const message = this.rescheduleErrorMessage(err, 'No se pudo confirmar la reprogramación. Revisa la reserva y vuelve a intentarlo.');
        this.showError(message);
        this.rescheduleNotice('No se pudo reprogramar', message, true);
      },
    });
  }

  closeActionModal(): void {
    if (this.rescheduleSubmitting()) return;
    this.rescheduleHoursVersion++;
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

  async validatePayment(paymentId: number): Promise<void> {
    if (this.loading()) return;
    if (!await this.confirmation.confirm({ title: 'Validar comprobante', message: 'Confirma que verificaste el pago del comprobante #' + paymentId + '. La reserva quedará confirmada.', confirmText: 'Validar pago' })) return;
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
  async submitManualReservation(): Promise<void> {
    if (this.loading()) return;
    if (this.clientMode() === 'existing' && !this.selectedClient()) {
      this.showError('Selecciona un cliente de la búsqueda o pulsa Usar cliente presencial.');
      return;
    }
    if (!this.manualForm.courtId || !this.manualForm.reservationDate || !this.manualForm.startTime || !this.manualForm.endTime) {
      this.showError('Por favor completa todos los campos requeridos para la reserva manual.');
      return;
    }

    const clientName = this.clientMode() === 'walk-in' ? 'Cliente presencial' : this.selectedClient()!.name;
    if (!await this.confirmation.confirm({
      title: 'Registrar reserva directa',
      message: 'Cliente: ' + clientName + '\nFecha: ' + this.manualForm.reservationDate +
        '\nHorario: ' + this.manualForm.startTime + ' – ' + this.manualForm.endTime,
      confirmText: 'Registrar reserva',
    })) return;
    this.loading.set(true);
    this.secretaryService
      .createManualReservation({
        courtId: Number(this.manualForm.courtId),
        reservationDate: this.manualForm.reservationDate,
        startTime: this.manualForm.startTime,
        endTime: this.manualForm.endTime,
        origin: this.manualForm.origin,
        ...(this.clientMode() === 'existing' ? { clientId: this.selectedClient()!.id } : {}),
      })
      .subscribe({
        next: (res) => {
          this.loading.set(false);
          this.showSuccess(`✅ Reserva manual creada exitosamente (ID: ${res.id || 'Generada'}).`);
          this.setClientMode('walk-in');
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
    const version = ++this.shiftRequestVersion;
    this.shiftLoading.set(true);
    this.shiftSummary.set(null);
    this.secretaryService.getCurrentShiftSummary(this.selectedDate()).subscribe({
      next: (summary: any) => {
        if (version !== this.shiftRequestVersion) return;
        this.shiftLoading.set(false);
        if (summary) {
          const mapped: ShiftSummaryOutput = {
            secretaryId: summary.secretaryId,
            date: summary.date || summary.shiftDate,
            totalCollected: summary.totalCollected ?? summary.totalSystem ?? 0,
            totalCash: summary.totalCash ?? summary.totalSystemCash ?? 0,
            totalQr: summary.totalQr ?? summary.totalSystemQr ?? 0,
            transactionsCount: summary.transactionsCount ?? summary.paymentsCount ?? (summary.payments?.length || 0),
            payments: summary.payments || [],
          };
          this.shiftSummary.set(mapped);
        }
      },
      error: () => {
        if (version !== this.shiftRequestVersion) return;
        this.shiftLoading.set(false);
        this.shiftSummary.set(null);
      },
    });
  }

  async submitCloseShift(): Promise<void> {
    if (this.loading() || this.shiftLoading() || this.shiftCloseResult()) return;
    const summary = this.shiftSummary();
    if (!summary) {
      this.showError('No hay información de turno disponible para cerrar.');
      return;
    }

    if (this.cashDifference() === null) {
      this.showError('Ingresa un monto de efectivo válido, igual o mayor que cero.');
      return;
    }

    if (!await this.confirmation.confirm({ title: 'Cerrar caja', message: 'Se registrará el cierre del ' + this.selectedDate() + ' con Bs ' + this.declaredCash() + ' de efectivo declarado. Revisa el monto antes de continuar.', confirmText: 'Cerrar caja', danger: this.cashDifference() !== 0 })) return;
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
