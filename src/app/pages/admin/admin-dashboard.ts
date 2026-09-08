import { CourtCoverComponent } from '../../components/court-cover/court-cover';
import { ConfirmationService } from '../../services/confirmation.service';
import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  AdminService,
  KpiSummary,
  RevenueReport,
  StaffItem,
  CreateStaffDto,
  CashShiftAuditItem,
  CourtScheduleItem,
} from '../../services/admin.service';
import { ComplexService } from '../../services/complex.service';
import { CourtService } from '../../services/court.service';
import { Complex } from '../../models/complex.model';
import { Court, CourtType } from '../../models/court.model';

type AdminTab = 'analytics' | 'complexes' | 'schedules' | 'staff' | 'audit';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, CourtCoverComponent],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.scss'],
})
export class AdminDashboardComponent implements OnInit {
  private adminService = inject(AdminService);
  private complexService = inject(ComplexService);
  private courtService = inject(CourtService);
  private confirmation = inject(ConfirmationService);

  newCourtCover = signal('');
  selectedCoverCourt = signal<Court | null>(null);
  coverDraft = signal('');

  openCoverModal(court: Court): void {
    this.clearAlerts();
    this.selectedCoverCourt.set(court);
    this.coverDraft.set(court.images?.[0] || '');
  }

  saveCover(): void {
    const court = this.selectedCoverCourt();
    if (!court || this.loading()) return;
    this.loading.set(true);
    this.adminService.updateCourt(court.id, { images: this.coverDraft() ? [this.coverDraft()] : [] }).subscribe({
      next: () => {
        this.loading.set(false);
        this.selectedCoverCourt.set(null);
        this.showSuccess('Portada actualizada.');
        this.loadComplexesAndCourts();
      },
      error: err => {
        this.loading.set(false);
        this.showError(err.error?.message || 'No se pudo guardar la portada.');
      },
    });
  }

  activeTab = signal<AdminTab>('analytics');
  loading = signal<boolean>(false);
  successMsg = signal<string | null>(null);
  errorMsg = signal<string | null>(null);

  // Tab 1: Analítica
  kpiSummary = signal<KpiSummary | null>(null);
  revenueReport = signal<RevenueReport | null>(null);
  occupancyRanking = signal<any[]>([]);
  peakHours = signal<any[]>([]);

  // Tab 2: Complejos y Canchas
  complexes = signal<Complex[]>([]);
  courts = signal<Court[]>([]);
  showNewComplexModal = signal<boolean>(false);
  showNewCourtModal = signal<boolean>(false);
  showEditPriceModal = signal<boolean>(false);
  showQrModal = signal<boolean>(false);

  selectedCourtForPrice = signal<Court | null>(null);
  newCourtPrice = signal<number>(0);
  selectedComplexForQr = signal<Complex | null>(null);
  newQrUrl = signal<string>('');

  newComplexForm = {
    name: '',
    address: '',
    phone: '',
    openingTime: '08:00',
    closingTime: '23:00',
    cancellationPolicy: 'Cancelación permitida con 2 horas de anticipación',
  };

  newCourtForm: {
    complexId: number;
    name: string;
    courtType: CourtType;
    pricePerHour: number;
  } = {
    complexId: 0,
    name: '',
    courtType: 'Futsal',
    pricePerHour: 100,
  };

  // Tab 3: Horarios y Mantenimiento
  selectedCourtForSchedule = signal<number>(0);
  courtSchedules = signal<CourtScheduleItem[]>([]);
  weeklyDays = [
    { dayOfWeek: 1, name: 'Lunes', openTime: '08:00', closeTime: '23:00', isClosed: false },
    { dayOfWeek: 2, name: 'Martes', openTime: '08:00', closeTime: '23:00', isClosed: false },
    { dayOfWeek: 3, name: 'Miércoles', openTime: '08:00', closeTime: '23:00', isClosed: false },
    { dayOfWeek: 4, name: 'Jueves', openTime: '08:00', closeTime: '23:00', isClosed: false },
    { dayOfWeek: 5, name: 'Viernes', openTime: '08:00', closeTime: '23:00', isClosed: false },
    { dayOfWeek: 6, name: 'Sábado', openTime: '08:00', closeTime: '23:00', isClosed: false },
    { dayOfWeek: 7, name: 'Domingo', openTime: '08:00', closeTime: '23:00', isClosed: false },
  ];

  maintenanceForm = {
    courtId: 0,
    startDatetime: '',
    endDatetime: '',
    reason: '',
  };

  immediateIncidentForm = {
    courtId: 0,
    reason: '',
    durationHours: 4,
  };

  // Tab 4: Personal
  staffList = signal<StaffItem[]>([]);
  showNewStaffModal = signal<boolean>(false);
  newStaffForm: CreateStaffDto = {
    email: '',
    password: '',
    name: '',
    phone: '',
    ci: '',
  };

  // Tab 5: Auditoría de Reservas & Cajas
  auditReservations = signal<any[]>([]);
  reservationFilterStatus = signal<string>('');
  cashShiftsAudit = signal<CashShiftAuditItem[]>([]);

  ngOnInit(): void {
    this.loadAnalytics();
    this.loadComplexesAndCourts();
    this.loadStaff();
    this.loadReservationsAudit();
    this.loadCashShiftsAudit();
  }

  setTab(tab: AdminTab): void {
    this.activeTab.set(tab);
    this.clearAlerts();
    if (tab === 'analytics') this.loadAnalytics();
    if (tab === 'complexes') this.loadComplexesAndCourts();
    if (tab === 'schedules') this.loadCourtSchedules();
    if (tab === 'staff') this.loadStaff();
    if (tab === 'audit') {
      this.loadReservationsAudit();
      this.loadCashShiftsAudit();
    }
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

  // === TAB 1: ANALÍTICA ===
  loadAnalytics(): void {
    this.loading.set(true);
    this.adminService.getKpiSummary().subscribe({
      next: (kpis) => {
        this.kpiSummary.set(kpis);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });

    this.adminService.getRevenueReport().subscribe({
      next: (rev) => this.revenueReport.set(rev),
      error: () => {},
    });

    this.adminService.getCourtOccupancy().subscribe({
      next: (occ) => this.occupancyRanking.set(occ),
      error: () => {},
    });

    this.adminService.getPeakHours().subscribe({
      next: (peaks) => this.peakHours.set(peaks),
      error: () => {},
    });
  }

  // === TAB 2: COMPLEJOS Y CANCHAS ===
  loadComplexesAndCourts(): void {
    this.complexService.getActiveComplexes().subscribe({
      next: (comps) => {
        this.complexes.set(comps);
        if (comps.length > 0 && this.newCourtForm.complexId === 0) {
          this.newCourtForm.complexId = comps[0].id;
        }
      },
    });

    this.adminService.getAllCourts().subscribe({
      next: (courts) => {
        this.courts.set(courts);
        if (courts.length > 0 && this.selectedCourtForSchedule() === 0) {
          this.selectedCourtForSchedule.set(courts[0].id);
          this.maintenanceForm.courtId = courts[0].id;
          this.immediateIncidentForm.courtId = courts[0].id;
          this.loadCourtSchedules();
        }
      },
      error: () => {
        this.courtService.getAllCourts().subscribe({
          next: (courts) => this.courts.set(courts),
          error: () => {},
        });
      },
    });
  }

  async toggleComplex(complexId: number): Promise<void> {
    if (this.loading()) return;
    if (!await this.confirmation.confirm({ title: 'Cambiar estado del complejo', message: 'Se cambiará la disponibilidad de ' + (this.complexes().find(c => c.id === complexId)?.name || 'este complejo') + '.', confirmText: 'Cambiar estado', danger: true })) return;
    this.loading.set(true);
    this.adminService.toggleComplex(complexId).subscribe({
      next: () => {
        this.loading.set(false);
        this.showSuccess('Estado del complejo actualizado.');
        this.loadComplexesAndCourts();
      },
      error: (err) => {
        this.loading.set(false);
        this.showError(err.error?.message || 'Error al cambiar estado del complejo.');
      },
    });
  }

  submitNewComplex(): void {
    if (!this.newComplexForm.name || !this.newComplexForm.address) {
      this.showError('Nombre y dirección del complejo son requeridos.');
      return;
    }

    this.loading.set(true);
    this.adminService.createComplex(this.newComplexForm).subscribe({
      next: () => {
        this.loading.set(false);
        this.showSuccess('✅ Complejo deportivo creado exitosamente.');
        this.showNewComplexModal.set(false);
        this.loadComplexesAndCourts();
      },
      error: (err) => {
        this.loading.set(false);
        this.showError(err.error?.message || 'Error al crear el complejo.');
      },
    });
  }

  openQrModal(complex: Complex): void {
    this.selectedComplexForQr.set(complex);
    this.newQrUrl.set(complex.paymentQrUrl || '');
    this.showQrModal.set(true);
  }

  async submitQr(): Promise<void> {
    if (this.loading()) return;
    const comp = this.selectedComplexForQr();
    if (!comp || !this.newQrUrl().trim()) return;

    if (!await this.confirmation.confirm({ title: 'Actualizar QR de pago', message: 'Se reemplazará el QR de pago de ' + comp.name + '. Verifica que corresponde a la cuenta correcta.', confirmText: 'Actualizar QR' })) return;
    this.loading.set(true);
    this.adminService.uploadComplexQr(comp.id, this.newQrUrl().trim()).subscribe({
      next: () => {
        this.loading.set(false);
        this.showSuccess('✅ Código QR de pago actualizado con éxito.');
        this.showQrModal.set(false);
        this.loadComplexesAndCourts();
      },
      error: (err) => {
        this.loading.set(false);
        this.showError(err.error?.message || 'Error al actualizar el código QR.');
      },
    });
  }

  async toggleCourt(courtId: number): Promise<void> {
    if (this.loading()) return;
    if (!await this.confirmation.confirm({ title: 'Cambiar estado de la cancha', message: 'Se cambiará la disponibilidad de ' + (this.courts().find(c => c.id === courtId)?.name || 'esta cancha') + '.', confirmText: 'Cambiar estado', danger: true })) return;
    this.loading.set(true);
    this.adminService.toggleCourt(courtId).subscribe({
      next: () => {
        this.loading.set(false);
        this.showSuccess('Estado de la cancha actualizado.');
        this.loadComplexesAndCourts();
      },
      error: (err) => {
        this.loading.set(false);
        this.showError(err.error?.message || 'Error al cambiar estado de la cancha.');
      },
    });
  }

  openPriceModal(court: Court): void {
    this.selectedCourtForPrice.set(court);
    this.newCourtPrice.set(court.pricePerHour);
    this.showEditPriceModal.set(true);
  }

  async submitPriceUpdate(): Promise<void> {
    if (this.loading()) return;
    const court = this.selectedCourtForPrice();
    if (!court || this.newCourtPrice() <= 0) {
      this.showError('Ingresa un precio por hora válido.');
      return;
    }

    if (!await this.confirmation.confirm({ title: 'Actualizar precio', message: court.name + ': el nuevo precio será Bs ' + this.newCourtPrice() + ' por hora.', confirmText: 'Actualizar precio' })) return;
    this.loading.set(true);
    this.adminService.updateCourtPrice(court.id, Number(this.newCourtPrice())).subscribe({
      next: () => {
        this.loading.set(false);
        this.showSuccess(`✅ Precio por hora de ${court.name} actualizado a Bs ${this.newCourtPrice()}.`);
        this.showEditPriceModal.set(false);
        this.loadComplexesAndCourts();
      },
      error: (err) => {
        this.loading.set(false);
        this.showError(err.error?.message || 'Error al actualizar el precio.');
      },
    });
  }

  submitNewCourt(): void {
    if (!this.newCourtForm.name?.trim() || !this.newCourtForm.complexId) {
      this.showError('Nombre y complejo son requeridos para la cancha.');
      return;
    }

    this.loading.set(true);
    this.adminService
      .createCourt({
        complexId: Number(this.newCourtForm.complexId),
        name: this.newCourtForm.name.trim(),
        courtType: this.newCourtForm.courtType,
        images: this.newCourtCover() ? [this.newCourtCover()] : [],
        pricePerHour: Number(this.newCourtForm.pricePerHour),
      })
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.showSuccess('✅ Nueva cancha registrada con éxito.');
          this.showNewCourtModal.set(false);
          this.newCourtForm.name = '';
          this.newCourtCover.set('');
          this.newCourtForm.courtType = 'Futsal';
          this.newCourtForm.pricePerHour = 100;
          this.loadComplexesAndCourts();
        },
        error: (err) => {
          this.loading.set(false);
          const msg = Array.isArray(err.error?.message)
            ? err.error.message.join(', ')
            : (err.error?.message || 'Error al registrar la cancha.');
          this.showError(msg);
        },
      });
  }


  // === TAB 3: HORARIOS Y MANTENIMIENTO ===
  loadCourtSchedules(): void {
    const courtId = this.selectedCourtForSchedule();
    if (!courtId) return;

    this.adminService.getCourtSchedules(courtId).subscribe({
      next: (schedules) => {
        if (courtId !== this.selectedCourtForSchedule()) return;
        this.courtSchedules.set(schedules);
        this.weeklyDays = this.weeklyDays.map(day => {
          const schedule = schedules.find(sch => sch.dayOfWeek === day.dayOfWeek);
          return {
            ...day,
            openTime: schedule?.openTime?.slice(0, 5) || '08:00',
            closeTime: schedule?.closeTime?.slice(0, 5) || '23:00',
            isClosed: !schedule,
          };
        });
      },
      error: () => {},
    });
  }

  async saveWeeklySchedules(): Promise<void> {
    if (this.loading()) return;
    const courtId = this.selectedCourtForSchedule();
    if (!courtId) return;

    const invalidDay = this.weeklyDays.find(day => !day.isClosed &&
      (!/^([01]\d|2[0-3]):[0-5]\d$/.test(day.openTime) ||
       !/^([01]\d|2[0-3]):[0-5]\d$/.test(day.closeTime) || day.openTime >= day.closeTime));
    if (invalidDay) {
      this.showError('Revisa el horario de ' + invalidDay.name + ': la apertura debe ser anterior al cierre y ambas horas son obligatorias.');
      return;
    }
    if (!await this.confirmation.confirm({ title: 'Guardar horarios', message: 'Se actualizarán los horarios semanales de la cancha seleccionada.', confirmText: 'Guardar horarios' })) return;
    this.loading.set(true);
    this.adminService.setWeeklySchedules(courtId, this.weeklyDays).subscribe({
      next: () => {
        this.loading.set(false);
        this.showSuccess('✅ Horarios semanales guardados correctamente.');
        this.loadCourtSchedules();
      },
      error: (err) => {
        this.loading.set(false);
        this.showError(err.error?.message || 'Error al guardar horarios.');
      },
    });
  }

  async submitMaintenance(): Promise<void> {
    if (this.loading()) return;
    if (!this.maintenanceForm.courtId || !this.maintenanceForm.startDatetime || !this.maintenanceForm.endDatetime) {
      this.showError('Completa todos los campos para programar mantenimiento.');
      return;
    }

    if (!await this.confirmation.confirm({ title: 'Programar mantenimiento', message: 'La cancha quedará bloqueada desde ' + this.maintenanceForm.startDatetime + ' hasta ' + this.maintenanceForm.endDatetime + '.', confirmText: 'Bloquear cancha', danger: true })) return;
    this.loading.set(true);
    this.adminService
      .scheduleMaintenance(Number(this.maintenanceForm.courtId), {
        startDatetime: new Date(this.maintenanceForm.startDatetime).toISOString(),
        endDatetime: new Date(this.maintenanceForm.endDatetime).toISOString(),
        reason: this.maintenanceForm.reason || 'Mantenimiento preventivo',
      })
      .subscribe({
        next: (res) => {
          this.loading.set(false);
          this.showSuccess('Mantenimiento guardado. Solo se bloqueará el intervalo indicado.');
        },
        error: (err) => {
          this.loading.set(false);
          this.showError(err.error?.message || 'Error al programar mantenimiento.');
        },
      });
  }

  async submitImmediateIncident(): Promise<void> {
    if (this.loading()) return;
    if (!this.immediateIncidentForm.courtId || !this.immediateIncidentForm.reason) {
      this.showError('Ingresa el motivo del incidente inmediato.');
      return;
    }

    if (!await this.confirmation.confirm({ title: 'Bloquear por incidente', message: 'Se bloquearán únicamente las próximas ' + this.immediateIncidentForm.durationHours + ' horas. Motivo: ' + this.immediateIncidentForm.reason, confirmText: 'Registrar incidente', danger: true })) return;
    this.loading.set(true);
    this.adminService
      .registerImmediateIncident(Number(this.immediateIncidentForm.courtId), {
        reason: this.immediateIncidentForm.reason,
        durationHours: Number(this.immediateIncidentForm.durationHours),
      })
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.showSuccess('Incidente guardado. Los horarios posteriores al bloqueo siguen disponibles.');
        },
        error: (err) => {
          this.loading.set(false);
          this.showError(err.error?.message || 'Error al registrar incidente.');
        },
      });
  }

  // === TAB 4: PERSONAL (SECRETARIAS) ===
  loadStaff(): void {
    this.adminService.listStaff().subscribe({
      next: (staff) => this.staffList.set(staff),
      error: () => {},
    });
  }

  async toggleStaffStatus(member: StaffItem): Promise<void> {
    if (this.loading()) return;
    const newStatus = member.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    if (!await this.confirmation.confirm({ title: 'Cambiar acceso del personal', message: member.name + (newStatus === 'INACTIVE' ? ' quedará inactivo y no podrá iniciar sesión.' : ' quedará activo y podrá iniciar sesión.'), confirmText: 'Cambiar estado', danger: newStatus === 'INACTIVE' })) return;
    this.loading.set(true);
    this.adminService.updateStaffStatus(member.id, newStatus).subscribe({
      next: () => {
        this.loading.set(false);
        this.showSuccess(`Estado de ${member.name} cambiado a ${newStatus}.`);
        this.loadStaff();
      },
      error: (err) => {
        this.loading.set(false);
        this.showError(err.error?.message || 'Error al modificar estado del personal.');
      },
    });
  }

  submitNewStaff(): void {
    if (!this.newStaffForm.email || !this.newStaffForm.password || !this.newStaffForm.name || !this.newStaffForm.ci) {
      this.showError('Por favor completa todos los campos del personal (Email, Clave, Nombre, CI).');
      return;
    }

    this.loading.set(true);
    this.adminService.createStaff(this.newStaffForm).subscribe({
      next: () => {
        this.loading.set(false);
        this.showSuccess('✅ Cuenta de personal creada con éxito.');
        this.showNewStaffModal.set(false);
        this.loadStaff();
        this.newStaffForm = { email: '', password: '', name: '', phone: '', ci: '' };
      },
      error: (err) => {
        this.loading.set(false);
        this.showError(err.error?.message || 'Error al crear cuenta de personal.');
      },
    });
  }

  // === TAB 5: AUDITORÍA DE RESERVAS Y CAJAS ===
  loadReservationsAudit(): void {
    this.adminService
      .getAllReservations({
        status: this.reservationFilterStatus() || undefined,
      })
      .subscribe({
        next: (reservations) => this.auditReservations.set(reservations),
        error: () => {},
      });
  }

  loadCashShiftsAudit(): void {
    this.adminService.auditCashShifts().subscribe({
      next: (shifts) => this.cashShiftsAudit.set(shifts),
      error: () => {},
    });
  }
}
