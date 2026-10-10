import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { AdminDashboardComponent } from './admin-dashboard';
import { AdminService } from '../../services/admin.service';
import { ComplexService } from '../../services/complex.service';
import { CourtService } from '../../services/court.service';
import { ConfirmationService } from '../../services/confirmation.service';

describe('AdminDashboardComponent', () => {
  let component: AdminDashboardComponent;

  let admin:
    jasmine.SpyObj<AdminService>;

  let courtService:
    jasmine.SpyObj<CourtService>;

  let confirmation:
    jasmine.SpyObj<ConfirmationService>;

  const complex: any = {
    id: 1,
    name: 'Complejo Central',
    location: 'Centro',
    contactInfo: '70000000',
    paymentQrUrl: 'qr.png',
    isActive: true,
  };

  const inactiveComplex: any = {
    ...complex,
    id: 2,
    isActive: false,
  };

  const court: any = {
    id: 10,
    complexId: 1,
    name: 'Cancha 1',
    courtType: 'Futsal',
    type: 'Futsal',
    pricePerHour: 100,
    images: ['portada.png'],
    features: [],
    isActive: true,
  };

  const staff: any = {
    id: 'S1',
    name: 'Secretaria Uno',
    email: 'secretaria@test.com',
    phone: '70000000',
    status: 'ACTIVE',
  };

  beforeEach(() => {
    admin =
      jasmine.createSpyObj<AdminService>(
        'AdminService',
        [
          'getKpiSummary',
          'getRevenueReport',
          'getCourtOccupancy',
          'getPeakHours',

          'getAllComplexes',
          'getAllCourts',
          'createComplex',
          'updateComplex',
          'deactivateComplex',
          'toggleComplex',
          'uploadComplexQr',

          'toggleCourt',
          'updateCourt',
          'updateCourtPrice',
          'createCourt',

          'getCourtSchedules',
          'setWeeklySchedules',
          'scheduleMaintenance',
          'registerImmediateIncident',

          'listStaff',
          'updateStaffStatus',
          'createStaff',

          'getAllReservations',
          'auditCashShifts',
        ]
      );

    courtService =
      jasmine.createSpyObj<CourtService>(
        'CourtService',
        [
          'getAllCourts',
        ]
      );

    confirmation =
      jasmine.createSpyObj<ConfirmationService>(
        'ConfirmationService',
        [
          'confirm',
        ]
      );

    confirmation.confirm.and.resolveTo(true);

    admin.getKpiSummary.and.returnValue(
      of({
        totalRevenue: 1000,
        totalReservations: 10,
        completedReservations: 8,
        cancelledReservations: 1,
        pendingReceivables: 100,
        averageTicket: 100,
        occupancyRate: 75,
      } as any)
    );

    admin.getRevenueReport.and.returnValue(
      of({
        totalRevenue: 1000,
        advancePaymentsTotal: 250,
        finalPaymentsTotal: 750,
        byPaymentMethod: {
          CASH: 500,
          QR: 500,
        },
        byCourt: [],
      } as any)
    );

    admin.getCourtOccupancy.and.returnValue(
      of([
        {
          courtId: 10,
          courtName: 'Cancha 1',
          occupancyRate: 80,
        },
      ] as any)
    );

    admin.getPeakHours.and.returnValue(
      of([
        {
          hour: '18:00',
          reservations: 5,
        },
      ] as any)
    );

    admin.getAllComplexes.and.returnValue(
      of([complex])
    );

    admin.getAllCourts.and.returnValue(
      of([court])
    );

    admin.createComplex.and.returnValue(
      of(complex)
    );

    admin.updateComplex.and.returnValue(
      of(complex)
    );

    admin.deactivateComplex.and.returnValue(
      of({} as any)
    );

    admin.toggleComplex.and.returnValue(
      of({} as any)
    );

    admin.uploadComplexQr.and.returnValue(
      of({} as any)
    );

    admin.toggleCourt.and.returnValue(
      of({} as any)
    );

    admin.updateCourt.and.returnValue(
      of({} as any)
    );

    admin.updateCourtPrice.and.returnValue(
      of({} as any)
    );

    admin.createCourt.and.returnValue(
      of({} as any)
    );

    admin.getCourtSchedules.and.returnValue(
      of([])
    );

    admin.setWeeklySchedules.and.returnValue(
      of([] as any)
    );

    admin.scheduleMaintenance.and.returnValue(
      of({} as any)
    );

    admin.registerImmediateIncident.and.returnValue(
      of({} as any)
    );

    admin.listStaff.and.returnValue(
      of([staff])
    );

    admin.updateStaffStatus.and.returnValue(
      of({} as any)
    );

    admin.createStaff.and.returnValue(
      of({} as any)
    );

    admin.getAllReservations.and.returnValue(
      of([])
    );

    admin.auditCashShifts.and.returnValue(
      of([])
    );

    courtService.getAllCourts.and.returnValue(
      of([court])
    );

    TestBed.configureTestingModule({
      providers: [
        {
          provide: AdminService,
          useValue: admin,
        },
        {
          provide: ComplexService,
          useValue: {},
        },
        {
          provide: CourtService,
          useValue: courtService,
        },
        {
          provide: ConfirmationService,
          useValue: confirmation,
        },
      ],
    });

    component =
      TestBed.runInInjectionContext(
        () => new AdminDashboardComponent()
      );
  });

  // ======================================================
  // INICIALIZACIÓN
  // ======================================================

  it('ngOnInit debe cargar los bloques principales', () => {
    spyOn(component, 'loadAnalytics');
    spyOn(component, 'loadComplexesAndCourts');
    spyOn(component, 'loadStaff');
    spyOn(component, 'loadReservationsAudit');
    spyOn(component, 'loadCashShiftsAudit');

    component.ngOnInit();

    expect(component.loadAnalytics)
      .toHaveBeenCalled();

    expect(component.loadComplexesAndCourts)
      .toHaveBeenCalled();

    expect(component.loadStaff)
      .toHaveBeenCalled();

    expect(component.loadReservationsAudit)
      .toHaveBeenCalled();

    expect(component.loadCashShiftsAudit)
      .toHaveBeenCalled();
  });

  // ======================================================
  // PESTAÑAS
  // ======================================================

  it('cambia a analytics y carga analítica', () => {
    spyOn(component, 'loadAnalytics');

    component.setTab('analytics');

    expect(component.activeTab())
      .toBe('analytics');

    expect(component.loadAnalytics)
      .toHaveBeenCalled();
  });

  it('cambia a complexes', () => {
    spyOn(component, 'loadComplexesAndCourts');

    component.setTab('complexes');

    expect(component.activeTab())
      .toBe('complexes');

    expect(component.loadComplexesAndCourts)
      .toHaveBeenCalled();
  });

  it('cambia a schedules', () => {
    spyOn(component, 'loadCourtSchedules');

    component.setTab('schedules');

    expect(component.loadCourtSchedules)
      .toHaveBeenCalled();
  });

  it('cambia a staff', () => {
    spyOn(component, 'loadStaff');

    component.setTab('staff');

    expect(component.loadStaff)
      .toHaveBeenCalled();
  });

  it('cambia a audit y carga ambas auditorías', () => {
    spyOn(component, 'loadReservationsAudit');
    spyOn(component, 'loadCashShiftsAudit');

    component.setTab('audit');

    expect(component.loadReservationsAudit)
      .toHaveBeenCalled();

    expect(component.loadCashShiftsAudit)
      .toHaveBeenCalled();
  });

  it('limpia alertas', () => {
    component.successMsg.set('OK');
    component.errorMsg.set('ERROR');

    component.clearAlerts();

    expect(component.successMsg())
      .toBeNull();

    expect(component.errorMsg())
      .toBeNull();
  });

  // ======================================================
  // ANALÍTICA
  // ======================================================

  it('carga analítica correctamente', () => {
    component.loadAnalytics();

    expect(component.kpiSummary()?.totalRevenue)
      .toBe(1000);

    expect(component.revenueReport()?.totalRevenue)
      .toBe(1000);

    expect(component.occupancyRanking().length)
      .toBe(1);

    expect(component.peakHours().length)
      .toBe(1);

    expect(component.loading())
      .toBeFalse();
  });

  it('maneja error cargando KPI', () => {
    admin.getKpiSummary.and.returnValue(
      throwError(() => new Error())
    );

    component.loadAnalytics();

    expect(component.loading())
      .toBeFalse();
  });

  it('tolera error de revenue report', () => {
    admin.getRevenueReport.and.returnValue(
      throwError(() => new Error())
    );

    component.loadAnalytics();

    expect(admin.getRevenueReport)
      .toHaveBeenCalled();
  });

  it('tolera error de ocupación', () => {
    admin.getCourtOccupancy.and.returnValue(
      throwError(() => new Error())
    );

    component.loadAnalytics();

    expect(admin.getCourtOccupancy)
      .toHaveBeenCalled();
  });

  it('tolera error de horas pico', () => {
    admin.getPeakHours.and.returnValue(
      throwError(() => new Error())
    );

    component.loadAnalytics();

    expect(admin.getPeakHours)
      .toHaveBeenCalled();
  });

  // ======================================================
  // COMPLEJOS Y CANCHAS
  // ======================================================

  it('carga complejos y canchas', () => {
    spyOn(component, 'loadCourtSchedules');

    component.loadComplexesAndCourts();

    expect(component.complexes().length)
      .toBe(1);

    expect(component.courts().length)
      .toBe(1);

    expect(component.newCourtForm.complexId)
      .toBe(1);

    expect(component.selectedCourtForSchedule())
      .toBe(10);

    expect(component.maintenanceForm.courtId)
      .toBe(10);

    expect(component.immediateIncidentForm.courtId)
      .toBe(10);
  });

  it('usa CourtService cuando falla AdminService al cargar canchas', () => {
    admin.getAllCourts.and.returnValue(
      throwError(() => new Error())
    );

    component.loadComplexesAndCourts();

    expect(courtService.getAllCourts)
      .toHaveBeenCalled();

    expect(component.courts().length)
      .toBe(1);
  });

  // ======================================================
  // FORMULARIO COMPLEJO
  // ======================================================

  it('abre formulario para crear complejo', () => {
    component.openComplexForm();

    expect(component.editingComplexId())
      .toBeNull();

    expect(component.newComplexForm.name)
      .toBe('');

    expect(component.showNewComplexModal())
      .toBeTrue();
  });

  it('abre formulario para editar complejo', () => {
    component.openComplexForm(complex);

    expect(component.editingComplexId())
      .toBe(1);

    expect(component.newComplexForm.name)
      .toBe('Complejo Central');

    expect(component.newComplexForm.location)
      .toBe('Centro');

    expect(component.newComplexForm.contactInfo)
      .toBe('70000000');
  });

  it('rechaza complejo sin nombre', () => {
    component.newComplexForm = {
      name: '',
      location: 'Centro',
      contactInfo: '70000000',
    };

    component.submitNewComplex();

    expect(admin.createComplex)
      .not.toHaveBeenCalled();

    expect(component.errorMsg())
      .toContain('requeridos');
  });

  it('rechaza complejo sin ubicación', () => {
    component.newComplexForm = {
      name: 'Complejo',
      location: '',
      contactInfo: '70000000',
    };

    component.submitNewComplex();

    expect(admin.createComplex)
      .not.toHaveBeenCalled();
  });

  it('crea complejo correctamente', () => {
    component.newComplexForm = {
      name: 'Complejo Norte',
      location: 'Norte',
      contactInfo: '70000000',
    };

    spyOn(component, 'loadComplexesAndCourts');

    component.submitNewComplex();

    expect(admin.createComplex)
      .toHaveBeenCalledWith(
        component.newComplexForm
      );

    expect(component.loading())
      .toBeFalse();

    expect(component.showNewComplexModal())
      .toBeFalse();

    expect(component.loadComplexesAndCourts)
      .toHaveBeenCalled();
  });

  it('actualiza complejo existente', () => {
    component.editingComplexId.set(1);

    component.newComplexForm = {
      name: 'Complejo Editado',
      location: 'Centro',
      contactInfo: '71111111',
    };

    component.submitNewComplex();

    expect(admin.updateComplex)
      .toHaveBeenCalledWith(
        1,
        component.newComplexForm
      );
  });

  it('maneja error al crear complejo', () => {
    admin.createComplex.and.returnValue(
      throwError(() => ({
        error: {
          message: 'Complejo duplicado',
        },
      }))
    );

    component.newComplexForm = {
      name: 'Complejo',
      location: 'Centro',
      contactInfo: '70000000',
    };

    component.submitNewComplex();

    expect(component.errorMsg())
      .toBe('Complejo duplicado');

    expect(component.loading())
      .toBeFalse();
  });

  // ======================================================
  // ESTADO DEL COMPLEJO
  // ======================================================

  it('desactiva complejo activo', async () => {
    component.complexes.set([
      complex,
    ]);

    spyOn(component, 'loadComplexesAndCourts');

    await component.toggleComplex(1);

    expect(admin.deactivateComplex)
      .toHaveBeenCalledWith(1);

    expect(component.loadComplexesAndCourts)
      .toHaveBeenCalled();
  });

  it('activa complejo inactivo', async () => {
    component.complexes.set([
      inactiveComplex,
    ]);

    await component.toggleComplex(2);

    expect(admin.toggleComplex)
      .toHaveBeenCalledWith(2);
  });

  it('no cambia complejo si está loading', async () => {
    component.loading.set(true);

    await component.toggleComplex(1);

    expect(confirmation.confirm)
      .not.toHaveBeenCalled();
  });

  it('no cambia complejo si cancela confirmación', async () => {
    confirmation.confirm.and.resolveTo(false);

    component.complexes.set([
      complex,
    ]);

    await component.toggleComplex(1);

    expect(admin.deactivateComplex)
      .not.toHaveBeenCalled();
  });

  it('maneja error cambiando complejo', async () => {
    admin.deactivateComplex.and.returnValue(
      throwError(() => ({
        error: {
          message: 'No se pudo cambiar',
        },
      }))
    );

    component.complexes.set([
      complex,
    ]);

    await component.toggleComplex(1);

    expect(component.errorMsg())
      .toBe('No se pudo cambiar');
  });

  // ======================================================
  // QR DEL COMPLEJO
  // ======================================================

  it('abre modal QR', () => {
    component.openQrModal(complex);

    expect(component.selectedComplexForQr())
      .toEqual(complex);

    expect(component.newQrUrl())
      .toBe('qr.png');

    expect(component.showQrModal())
      .toBeTrue();
  });

  it('no actualiza QR sin complejo', async () => {
    component.selectedComplexForQr.set(null);
    component.newQrUrl.set('nuevo.png');

    await component.submitQr();

    expect(admin.uploadComplexQr)
      .not.toHaveBeenCalled();
  });

  it('no actualiza QR vacío', async () => {
    component.selectedComplexForQr.set(complex);
    component.newQrUrl.set('   ');

    await component.submitQr();

    expect(admin.uploadComplexQr)
      .not.toHaveBeenCalled();
  });

  it('no actualiza QR si loading está activo', async () => {
    component.loading.set(true);
    component.selectedComplexForQr.set(complex);
    component.newQrUrl.set('nuevo.png');

    await component.submitQr();

    expect(admin.uploadComplexQr)
      .not.toHaveBeenCalled();
  });

  it('no actualiza QR si cancela confirmación', async () => {
    confirmation.confirm.and.resolveTo(false);

    component.selectedComplexForQr.set(complex);
    component.newQrUrl.set('nuevo.png');

    await component.submitQr();

    expect(admin.uploadComplexQr)
      .not.toHaveBeenCalled();
  });

  it('actualiza QR correctamente', async () => {
    component.selectedComplexForQr.set(complex);
    component.newQrUrl.set('nuevo-qr.png');

    spyOn(component, 'loadComplexesAndCourts');

    await component.submitQr();

    expect(admin.uploadComplexQr)
      .toHaveBeenCalledWith(
        1,
        'nuevo-qr.png'
      );

    expect(component.showQrModal())
      .toBeFalse();

    expect(component.loadComplexesAndCourts)
      .toHaveBeenCalled();
  });

  it('maneja error actualizando QR', async () => {
    admin.uploadComplexQr.and.returnValue(
      throwError(() => ({
        error: {
          message: 'QR inválido',
        },
      }))
    );

    component.selectedComplexForQr.set(complex);
    component.newQrUrl.set('nuevo.png');

    await component.submitQr();

    expect(component.errorMsg())
      .toBe('QR inválido');
  });

  // ======================================================
  // ESTADO DE CANCHA
  // ======================================================

  it('cambia estado de cancha', async () => {
    spyOn(component, 'loadComplexesAndCourts');

    await component.toggleCourt(10);

    expect(admin.toggleCourt)
      .toHaveBeenCalledWith(10);

    expect(component.loadComplexesAndCourts)
      .toHaveBeenCalled();
  });

  it('no cambia cancha si loading está activo', async () => {
    component.loading.set(true);

    await component.toggleCourt(10);

    expect(admin.toggleCourt)
      .not.toHaveBeenCalled();
  });

  it('no cambia cancha si cancela confirmación', async () => {
    confirmation.confirm.and.resolveTo(false);

    await component.toggleCourt(10);

    expect(admin.toggleCourt)
      .not.toHaveBeenCalled();
  });

  it('maneja error cambiando cancha', async () => {
    admin.toggleCourt.and.returnValue(
      throwError(() => ({
        error: {
          message: 'No se pudo cambiar cancha',
        },
      }))
    );

    await component.toggleCourt(10);

    expect(component.errorMsg())
      .toBe('No se pudo cambiar cancha');
  });

  // ======================================================
  // PRECIO DE CANCHA
  // ======================================================

  it('abre modal de precio', () => {
    component.openPriceModal(court);

    expect(component.selectedCourtForPrice())
      .toEqual(court);

    expect(component.newCourtPrice())
      .toBe(100);

    expect(component.showEditPriceModal())
      .toBeTrue();
  });

  it('rechaza precio cero', async () => {
    component.selectedCourtForPrice.set(court);
    component.newCourtPrice.set(0);

    await component.submitPriceUpdate();

    expect(admin.updateCourtPrice)
      .not.toHaveBeenCalled();

    expect(component.errorMsg())
      .toContain('precio');
  });

  it('rechaza precio negativo', async () => {
    component.selectedCourtForPrice.set(court);
    component.newCourtPrice.set(-10);

    await component.submitPriceUpdate();

    expect(admin.updateCourtPrice)
      .not.toHaveBeenCalled();
  });

  it('rechaza actualización sin cancha', async () => {
    component.selectedCourtForPrice.set(null);
    component.newCourtPrice.set(100);

    await component.submitPriceUpdate();

    expect(admin.updateCourtPrice)
      .not.toHaveBeenCalled();
  });

  it('no actualiza precio si cancela confirmación', async () => {
    confirmation.confirm.and.resolveTo(false);

    component.selectedCourtForPrice.set(court);
    component.newCourtPrice.set(150);

    await component.submitPriceUpdate();

    expect(admin.updateCourtPrice)
      .not.toHaveBeenCalled();
  });

  it('actualiza precio correctamente', async () => {
    component.selectedCourtForPrice.set(court);
    component.newCourtPrice.set(150);

    spyOn(component, 'loadComplexesAndCourts');

    await component.submitPriceUpdate();

    expect(admin.updateCourtPrice)
      .toHaveBeenCalledWith(
        10,
        150
      );

    expect(component.showEditPriceModal())
      .toBeFalse();
  });

  it('maneja error actualizando precio', async () => {
    admin.updateCourtPrice.and.returnValue(
      throwError(() => ({
        error: {
          message: 'Precio inválido',
        },
      }))
    );

    component.selectedCourtForPrice.set(court);
    component.newCourtPrice.set(150);

    await component.submitPriceUpdate();

    expect(component.errorMsg())
      .toBe('Precio inválido');
  });

  // ======================================================
  // NUEVA CANCHA
  // ======================================================

  it('rechaza nueva cancha sin nombre', () => {
    component.newCourtForm = {
      complexId: 1,
      name: '',
      courtType: 'Futsal',
      pricePerHour: 100,
    };

    component.submitNewCourt();

    expect(admin.createCourt)
      .not.toHaveBeenCalled();

    expect(component.errorMsg())
      .toContain('requeridos');
  });

  it('rechaza nueva cancha sin complejo', () => {
    component.newCourtForm = {
      complexId: 0,
      name: 'Cancha',
      courtType: 'Futsal',
      pricePerHour: 100,
    };

    component.submitNewCourt();

    expect(admin.createCourt)
      .not.toHaveBeenCalled();
  });

  it('crea cancha con portada', () => {
    component.newCourtForm = {
      complexId: 1,
      name: 'Cancha Nueva',
      courtType: 'Futsal',
      pricePerHour: 120,
    };

    component.newCourtCover.set(
      'foto.png'
    );

    spyOn(component, 'loadComplexesAndCourts');

    component.submitNewCourt();

    expect(admin.createCourt)
      .toHaveBeenCalledWith({
        complexId: 1,
        name: 'Cancha Nueva',
        courtType: 'Futsal',
        images: ['foto.png'],
        pricePerHour: 120,
      });

    expect(component.newCourtForm.name)
      .toBe('');

    expect(component.newCourtCover())
      .toBe('');
  });

  it('crea cancha sin portada', () => {
    component.newCourtForm = {
      complexId: 1,
      name: 'Cancha Nueva',
      courtType: 'Futsal',
      pricePerHour: 120,
    };

    component.newCourtCover.set('');

    component.submitNewCourt();

    expect(admin.createCourt)
      .toHaveBeenCalledWith(
        jasmine.objectContaining({
          images: [],
        })
      );
  });

  it('maneja error tipo arreglo creando cancha', () => {
    admin.createCourt.and.returnValue(
      throwError(() => ({
        error: {
          message: [
            'Nombre inválido',
            'Precio inválido',
          ],
        },
      }))
    );

    component.newCourtForm = {
      complexId: 1,
      name: 'Cancha',
      courtType: 'Futsal',
      pricePerHour: 100,
    };

    component.submitNewCourt();

    expect(component.errorMsg())
      .toContain('Nombre inválido');

    expect(component.errorMsg())
      .toContain('Precio inválido');
  });

  it('maneja error simple creando cancha', () => {
    admin.createCourt.and.returnValue(
      throwError(() => ({
        error: {
          message: 'No se pudo crear',
        },
      }))
    );

    component.newCourtForm = {
      complexId: 1,
      name: 'Cancha',
      courtType: 'Futsal',
      pricePerHour: 100,
    };

    component.submitNewCourt();

    expect(component.errorMsg())
      .toBe('No se pudo crear');
  });

  // ======================================================
  // PORTADA DE CANCHA
  // ======================================================

  it('abre modal de portada', () => {
    component.openCoverModal(court);

    expect(component.selectedCoverCourt())
      .toEqual(court);

    expect(component.coverDraft())
      .toBe('portada.png');
  });

  it('abre portada vacía si cancha no tiene imágenes', () => {
    component.openCoverModal({
      ...court,
      images: [],
    });

    expect(component.coverDraft())
      .toBe('');
  });

  it('no guarda portada sin cancha seleccionada', () => {
    component.selectedCoverCourt.set(null);

    component.saveCover();

    expect(admin.updateCourt)
      .not.toHaveBeenCalled();
  });

  it('no guarda portada si loading está activo', () => {
    component.selectedCoverCourt.set(court);
    component.loading.set(true);

    component.saveCover();

    expect(admin.updateCourt)
      .not.toHaveBeenCalled();
  });

  it('guarda portada correctamente', () => {
    component.selectedCoverCourt.set(court);
    component.coverDraft.set('nueva.png');

    spyOn(component, 'loadComplexesAndCourts');

    component.saveCover();

    expect(admin.updateCourt)
      .toHaveBeenCalledWith(
        10,
        {
          images: ['nueva.png'],
        }
      );

    expect(component.selectedCoverCourt())
      .toBeNull();
  });

  it('guarda portada vacía como arreglo vacío', () => {
    component.selectedCoverCourt.set(court);
    component.coverDraft.set('');

    component.saveCover();

    expect(admin.updateCourt)
      .toHaveBeenCalledWith(
        10,
        {
          images: [],
        }
      );
  });

  it('maneja error guardando portada', () => {
    admin.updateCourt.and.returnValue(
      throwError(() => ({
        error: {
          message: 'Portada inválida',
        },
      }))
    );

    component.selectedCoverCourt.set(court);
    component.coverDraft.set('foto.png');

    component.saveCover();

    expect(component.errorMsg())
      .toBe('Portada inválida');
  });

  // ======================================================
  // HORARIOS
  // ======================================================

  it('no carga horarios sin cancha', () => {
    component.selectedCourtForSchedule.set(0);

    component.loadCourtSchedules();

    expect(admin.getCourtSchedules)
      .not.toHaveBeenCalled();
  });

  it('carga horarios de cancha', () => {
    component.selectedCourtForSchedule.set(10);

    admin.getCourtSchedules.and.returnValue(
      of([
        {
          courtId: 10,
          dayOfWeek: 1,
          openTime: '09:00:00',
          closeTime: '21:00:00',
          isClosed: false,
        },
      ] as any)
    );

    component.loadCourtSchedules();

    expect(component.courtSchedules().length)
      .toBe(1);

    expect(component.weeklyDays[0].openTime)
      .toBe('09:00');

    expect(component.weeklyDays[0].closeTime)
      .toBe('21:00');
  });

  it('marca día sin horario como cerrado', () => {
    component.selectedCourtForSchedule.set(10);

    admin.getCourtSchedules.and.returnValue(
      of([])
    );

    component.loadCourtSchedules();

    expect(component.weeklyDays[0].isClosed)
      .toBeTrue();

    expect(component.weeklyDays[0].openTime)
      .toBe('08:00');

    expect(component.weeklyDays[0].closeTime)
      .toBe('23:00');
  });

  it('rechaza horario inválido', async () => {
    component.selectedCourtForSchedule.set(10);

    component.weeklyDays[0].isClosed = false;
    component.weeklyDays[0].openTime = '22:00';
    component.weeklyDays[0].closeTime = '08:00';

    await component.saveWeeklySchedules();

    expect(admin.setWeeklySchedules)
      .not.toHaveBeenCalled();

    expect(component.errorMsg())
      .toContain('horario');
  });

  it('rechaza formato inválido de hora', async () => {
    component.selectedCourtForSchedule.set(10);

    component.weeklyDays[0].isClosed = false;
    component.weeklyDays[0].openTime = '99:00';
    component.weeklyDays[0].closeTime = '20:00';

    await component.saveWeeklySchedules();

    expect(admin.setWeeklySchedules)
      .not.toHaveBeenCalled();
  });

  it('no guarda horarios sin cancha', async () => {
    component.selectedCourtForSchedule.set(0);

    await component.saveWeeklySchedules();

    expect(admin.setWeeklySchedules)
      .not.toHaveBeenCalled();
  });

  it('no guarda horarios si cancela confirmación', async () => {
    confirmation.confirm.and.resolveTo(false);

    component.selectedCourtForSchedule.set(10);

    await component.saveWeeklySchedules();

    expect(admin.setWeeklySchedules)
      .not.toHaveBeenCalled();
  });

  it('guarda horarios correctamente', async () => {
    component.selectedCourtForSchedule.set(10);

    spyOn(component, 'loadCourtSchedules');

    await component.saveWeeklySchedules();

    expect(admin.setWeeklySchedules)
      .toHaveBeenCalledWith(
        10,
        component.weeklyDays
      );

    expect(component.loadCourtSchedules)
      .toHaveBeenCalled();
  });

  it('maneja error guardando horarios', async () => {
    admin.setWeeklySchedules.and.returnValue(
      throwError(() => ({
        error: {
          message: 'Horario ocupado',
        },
      }))
    );

    component.selectedCourtForSchedule.set(10);

    await component.saveWeeklySchedules();

    expect(component.errorMsg())
      .toBe('Horario ocupado');
  });

  // ======================================================
  // MANTENIMIENTO
  // ======================================================

  it('rechaza mantenimiento incompleto', async () => {
    component.maintenanceForm = {
      courtId: 10,
      startDatetime: '',
      endDatetime: '',
      reason: '',
    };

    await component.submitMaintenance();

    expect(admin.scheduleMaintenance)
      .not.toHaveBeenCalled();

    expect(component.errorMsg())
      .toContain('Completa');
  });

  it('no programa mantenimiento si loading está activo', async () => {
    component.loading.set(true);

    await component.submitMaintenance();

    expect(admin.scheduleMaintenance)
      .not.toHaveBeenCalled();
  });

  it('no programa mantenimiento si cancela confirmación', async () => {
    confirmation.confirm.and.resolveTo(false);

    component.maintenanceForm = {
      courtId: 10,
      startDatetime: '2026-10-10T10:00',
      endDatetime: '2026-10-10T12:00',
      reason: 'Pintura',
    };

    await component.submitMaintenance();

    expect(admin.scheduleMaintenance)
      .not.toHaveBeenCalled();
  });

  it('programa mantenimiento correctamente', async () => {
    component.maintenanceForm = {
      courtId: 10,
      startDatetime: '2026-10-10T10:00',
      endDatetime: '2026-10-10T12:00',
      reason: 'Pintura',
    };

    await component.submitMaintenance();

    expect(admin.scheduleMaintenance)
      .toHaveBeenCalledWith(
        10,
        jasmine.objectContaining({
          reason: 'Pintura',
        })
      );
  });

  it('usa motivo por defecto en mantenimiento', async () => {
    component.maintenanceForm = {
      courtId: 10,
      startDatetime: '2026-10-10T10:00',
      endDatetime: '2026-10-10T12:00',
      reason: '',
    };

    await component.submitMaintenance();

    expect(admin.scheduleMaintenance)
      .toHaveBeenCalledWith(
        10,
        jasmine.objectContaining({
          reason: 'Mantenimiento preventivo',
        })
      );
  });

  it('maneja error programando mantenimiento', async () => {
    admin.scheduleMaintenance.and.returnValue(
      throwError(() => ({
        error: {
          message: 'Mantenimiento inválido',
        },
      }))
    );

    component.maintenanceForm = {
      courtId: 10,
      startDatetime: '2026-10-10T10:00',
      endDatetime: '2026-10-10T12:00',
      reason: 'Pintura',
    };

    await component.submitMaintenance();

    expect(component.errorMsg())
      .toBe('Mantenimiento inválido');
  });

  // ======================================================
  // INCIDENTE
  // ======================================================

  it('rechaza incidente sin motivo', async () => {
    component.immediateIncidentForm = {
      courtId: 10,
      reason: '',
      durationHours: 4,
    };

    await component.submitImmediateIncident();

    expect(admin.registerImmediateIncident)
      .not.toHaveBeenCalled();

    expect(component.errorMsg())
      .toContain('motivo');
  });

  it('rechaza incidente sin cancha', async () => {
    component.immediateIncidentForm = {
      courtId: 0,
      reason: 'Lluvia',
      durationHours: 4,
    };

    await component.submitImmediateIncident();

    expect(admin.registerImmediateIncident)
      .not.toHaveBeenCalled();
  });

  it('no registra incidente si cancela confirmación', async () => {
    confirmation.confirm.and.resolveTo(false);

    component.immediateIncidentForm = {
      courtId: 10,
      reason: 'Lluvia',
      durationHours: 4,
    };

    await component.submitImmediateIncident();

    expect(admin.registerImmediateIncident)
      .not.toHaveBeenCalled();
  });

  it('registra incidente correctamente', async () => {
    component.immediateIncidentForm = {
      courtId: 10,
      reason: 'Lluvia',
      durationHours: 3,
    };

    await component.submitImmediateIncident();

    expect(admin.registerImmediateIncident)
      .toHaveBeenCalledWith(
        10,
        {
          reason: 'Lluvia',
          durationHours: 3,
        }
      );
  });

  it('maneja error registrando incidente', async () => {
    admin.registerImmediateIncident.and.returnValue(
      throwError(() => ({
        error: {
          message: 'Incidente inválido',
        },
      }))
    );

    component.immediateIncidentForm = {
      courtId: 10,
      reason: 'Lluvia',
      durationHours: 3,
    };

    await component.submitImmediateIncident();

    expect(component.errorMsg())
      .toBe('Incidente inválido');
  });

  // ======================================================
  // PERSONAL
  // ======================================================

  it('carga personal', () => {
    component.loadStaff();

    expect(component.staffList().length)
      .toBe(1);

    expect(component.staffList()[0].name)
      .toBe('Secretaria Uno');
  });

  it('cambia personal activo a inactivo', async () => {
    spyOn(component, 'loadStaff');

    await component.toggleStaffStatus(staff);

    expect(admin.updateStaffStatus)
      .toHaveBeenCalledWith(
        'S1',
        'INACTIVE'
      );

    expect(component.loadStaff)
      .toHaveBeenCalled();
  });

  it('cambia personal inactivo a activo', async () => {
    await component.toggleStaffStatus({
      ...staff,
      status: 'INACTIVE',
    });

    expect(admin.updateStaffStatus)
      .toHaveBeenCalledWith(
        'S1',
        'ACTIVE'
      );
  });

  it('no cambia personal si loading está activo', async () => {
    component.loading.set(true);

    await component.toggleStaffStatus(staff);

    expect(admin.updateStaffStatus)
      .not.toHaveBeenCalled();
  });

  it('no cambia personal si cancela confirmación', async () => {
    confirmation.confirm.and.resolveTo(false);

    await component.toggleStaffStatus(staff);

    expect(admin.updateStaffStatus)
      .not.toHaveBeenCalled();
  });

  it('maneja error cambiando personal', async () => {
    admin.updateStaffStatus.and.returnValue(
      throwError(() => ({
        error: {
          message: 'No se pudo modificar',
        },
      }))
    );

    await component.toggleStaffStatus(staff);

    expect(component.errorMsg())
      .toBe('No se pudo modificar');
  });

  it('rechaza nuevo personal incompleto', () => {
    component.newStaffForm = {
      email: '',
      password: '',
      name: '',
      phone: '',
    };

    component.submitNewStaff();

    expect(admin.createStaff)
      .not.toHaveBeenCalled();

    expect(component.errorMsg())
      .toContain('completa');
  });

  it('crea nuevo personal', () => {
    component.newStaffForm = {
      email: 'nuevo@test.com',
      password: '123456',
      name: 'Nuevo Personal',
      phone: '70000000',
    };

    spyOn(component, 'loadStaff');

    component.submitNewStaff();

    expect(admin.createStaff)
      .toHaveBeenCalled();

    expect(component.loadStaff)
      .toHaveBeenCalled();

    expect(component.newStaffForm.email)
      .toBe('');

    expect(component.newStaffForm.password)
      .toBe('');
  });

  it('maneja error creando personal', () => {
    admin.createStaff.and.returnValue(
      throwError(() => ({
        error: {
          message: 'Email duplicado',
        },
      }))
    );

    component.newStaffForm = {
      email: 'nuevo@test.com',
      password: '123456',
      name: 'Nuevo Personal',
      phone: '',
    };

    component.submitNewStaff();

    expect(component.errorMsg())
      .toBe('Email duplicado');
  });

  // ======================================================
  // AUDITORÍA
  // ======================================================

  it('carga auditoría de reservas sin filtro', () => {
    admin.getAllReservations.and.returnValue(
      of([
        {
          id: 'R1',
        },
      ])
    );

    component.reservationFilterStatus.set('');

    component.loadReservationsAudit();

    expect(admin.getAllReservations)
      .toHaveBeenCalledWith({
        status: undefined,
      });

    expect(component.auditReservations().length)
      .toBe(1);
  });

  it('carga auditoría de reservas con filtro', () => {
    component.reservationFilterStatus.set(
      'CONFIRMED'
    );

    component.loadReservationsAudit();

    expect(admin.getAllReservations)
      .toHaveBeenCalledWith({
        status: 'CONFIRMED',
      });
  });

  it('carga auditoría de cajas', () => {
    admin.auditCashShifts.and.returnValue(
      of([
        {
          id: 1,
        } as any,
      ])
    );

    component.loadCashShiftsAudit();

    expect(admin.auditCashShifts)
      .toHaveBeenCalled();

    expect(component.cashShiftsAudit().length)
      .toBe(1);
  });
});