import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { SecretaryDashboardComponent } from './secretary-dashboard';
import { SecretaryService } from '../../services/secretary.service';
import { CourtService } from '../../services/court.service';
import { ConfirmationService } from '../../services/confirmation.service';

describe('SecretaryDashboardComponent', () => {
  let component: SecretaryDashboardComponent;

  let secretary:
    jasmine.SpyObj<SecretaryService>;

  let courtService:
    jasmine.SpyObj<CourtService>;

  let confirmation:
    jasmine.SpyObj<ConfirmationService>;

  const court: any = {
    id: 1,
    name: 'Cancha 1',
    courtType: 'Futsal',
    pricePerHour: 100,
    images: [],
    isActive: true,
  };

  beforeEach(() => {
    secretary =
      jasmine.createSpyObj<SecretaryService>(
        'SecretaryService',
        [
          'getOperationalBoard',
          'quickSearch',
          'authorizeEntry',
          'registerFinalPayment',
          'markNoShow',
          'cancelReservation',
          'rescheduleReservation',
          'getPendingPayments',
          'validatePayment',
          'rejectPayment',
          'createManualReservation',
          'getCurrentShiftSummary',
          'closeShift',
          'searchClients',
          'getReservationDetail',
        ]
      );

    courtService =
      jasmine.createSpyObj<CourtService>(
        'CourtService',
        ['getAllCourts']
      );

    confirmation =
      jasmine.createSpyObj<ConfirmationService>(
        'ConfirmationService',
        ['confirm']
      );

    confirmation.confirm.and.resolveTo(true);

    courtService.getAllCourts
      .and.returnValue(of([court]));

    secretary.getOperationalBoard
      .and.returnValue(of({
        date: '2026-10-10',
        totalReservations: 2,
        confirmedCount: 1,
        pendingValidationCount: 1,
        completedCount: 0,
        courts: [],
      }));

    secretary.quickSearch
      .and.returnValue(of([]));

    secretary.authorizeEntry
      .and.returnValue(of({}));

    secretary.registerFinalPayment
      .and.returnValue(of({}));

    secretary.markNoShow
      .and.returnValue(of({}));

    secretary.cancelReservation
      .and.returnValue(of({}));

    secretary.rescheduleReservation
      .and.returnValue(of({}));

    secretary.getPendingPayments
      .and.returnValue(of([]));

    secretary.validatePayment
      .and.returnValue(of({}));

    secretary.rejectPayment
      .and.returnValue(of({}));

    secretary.createManualReservation
      .and.returnValue(of({
        id: 'RES-1',
      }));

    secretary.getCurrentShiftSummary
      .and.returnValue(of({
        secretaryId: 'S1',
        date: '2026-10-10',
        totalCollected: 500,
        totalCash: 400,
        totalQr: 100,
        transactionsCount: 2,
        payments: [],
      }));

    secretary.closeShift
      .and.returnValue(of({
        difference: 0,
      }));

    secretary.searchClients
      .and.returnValue(of([]));

    secretary.getReservationDetail
      .and.returnValue(of({
        id: 'RES-1',
      }));

    TestBed.configureTestingModule({
      providers: [
        {
          provide: SecretaryService,
          useValue: secretary,
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
        () => new SecretaryDashboardComponent()
      );
  });

  afterEach(() => {
    component.ngOnDestroy();
  });

  // ======================================================
  // CARGA DE CANCHAS
  // ======================================================

  it('carga canchas y selecciona la primera', () => {
    component.loadCourts();

    expect(component.availableCourts().length)
      .toBe(1);

    expect(component.manualForm.courtId)
      .toBe(1);
  });

  it('maneja error cargando canchas', () => {
    courtService.getAllCourts
      .and.returnValue(
        throwError(() => new Error())
      );

    component.loadCourts();

    expect(component.errorMsg())
      .toContain('canchas');
  });

  // ======================================================
  // TABLERO
  // ======================================================

  it('carga tablero operativo', () => {
    component.loadBoardData();

    expect(component.boardData()?.totalReservations)
      .toBe(2);

    expect(component.loading())
      .toBeFalse();
  });

  it('mapea nombres alternativos del backend', () => {
    secretary.getOperationalBoard
      .and.returnValue(of({
        date: '2026-10-10',
        totalReservationsToday: 4,
        confirmedTodayCount: 3,
        courts: [],
      } as any));

    component.loadBoardData();

    expect(component.boardData()?.totalReservations)
      .toBe(4);

    expect(component.boardData()?.confirmedCount)
      .toBe(3);
  });

  it('maneja error del tablero', () => {
    secretary.getOperationalBoard
      .and.returnValue(
        throwError(() => new Error())
      );

    component.loadBoardData();

    expect(component.errorMsg())
      .toContain('tablero');

    expect(component.loading())
      .toBeFalse();
  });

  // ======================================================
  // DETALLE DE COMPROBANTES
  // ======================================================

  it('debe cargar detalle de comprobante', () => {
    secretary.getReservationDetail.and.returnValue(
      of({
        id: 'R1',
        status: 'CONFIRMED',
      } as any)
    );

    component.viewPaymentDetails({
      reservationId: 'R1',
    } as any);

    expect(secretary.getReservationDetail)
      .toHaveBeenCalledWith('R1');

    expect(component.receiptDetailOpen())
      .toBeTrue();

    expect(component.receiptDetailLoading())
      .toBeFalse();

    expect(component.receiptDetail()?.id)
      .toBe('R1');
  });

  it('debe manejar error al cargar detalle', () => {
    secretary.getReservationDetail.and.returnValue(
      throwError(() => new Error())
    );

    component.viewPaymentDetails({
      reservationId: 'R1',
    } as any);

    expect(component.receiptDetailLoading())
      .toBeFalse();

    expect(component.receiptDetailError())
      .toContain('No se pudo cargar');
  });

  it('debe cerrar detalle de comprobante', () => {
    component.receiptDetailOpen.set(true);
    component.receiptDetail.set({
      id: 'R1',
    });

    component.closeReceiptDetails();

    expect(component.receiptDetailOpen())
      .toBeFalse();

    expect(component.receiptDetail())
      .toBeNull();
  });

  // ======================================================
  // BÚSQUEDA DE CLIENTES
  // ======================================================

  it('debe cambiar modo de cliente', () => {
    component.setClientMode('existing');

    expect(component.clientMode())
      .toBe('existing');
  });

  it('debe seleccionar cliente presencial', async () => {
    await component.chooseWalkInClient();

    expect(component.clientMode())
      .toBe('walk-in');

    expect(confirmation.confirm)
      .toHaveBeenCalled();
  });

  it('debe cambiar a existing al escribir cliente', () => {
    component.onClientQueryChange('Juan');

    expect(component.clientMode())
      .toBe('existing');

    expect(component.clientQuery)
      .toBe('Juan');
  });

  it('no debe buscar con menos de 2 caracteres', () => {
    component.clientQuery = 'J';

    component.searchClients();

    expect(secretary.searchClients)
      .not.toHaveBeenCalled();

    expect(component.clientSearchMessage())
      .toContain('2 caracteres');
  });

  it('debe buscar clientes correctamente', () => {
    secretary.searchClients.and.returnValue(
      of([
        {
          id: 'C1',
          name: 'Juan Perez',
        } as any,
      ])
    );

    component.clientQuery = 'Juan';

    component.searchClients();

    expect(secretary.searchClients)
      .toHaveBeenCalledWith('Juan');

    expect(component.clientResults().length)
      .toBe(1);

    expect(component.searchingClients())
      .toBeFalse();

    expect(component.clientSearchMessage())
      .toContain('Selecciona');
  });

  it('debe mostrar mensaje si no encuentra clientes', () => {
    secretary.searchClients.and.returnValue(
      of([])
    );

    component.clientQuery = 'ZZ';

    component.searchClients();

    expect(component.clientResults())
      .toEqual([]);

    expect(component.clientSearchMessage())
      .toContain('No se encontraron');
  });

  it('debe manejar sesión expirada', () => {
    secretary.searchClients.and.returnValue(
      throwError(() => ({
        status: 401,
      }))
    );

    component.clientQuery = 'Juan';

    component.searchClients();

    expect(component.clientSearchMessage())
      .toContain('sesión expiró');
  });

  it('debe manejar error 404', () => {
    secretary.searchClients.and.returnValue(
      throwError(() => ({
        status: 404,
      }))
    );

    component.clientQuery = 'Juan';

    component.searchClients();

    expect(component.clientSearchMessage())
      .toContain('buscador');
  });

  it('debe manejar error de conexión', () => {
    secretary.searchClients.and.returnValue(
      throwError(() => ({
        status: 0,
      }))
    );

    component.clientQuery = 'Juan';

    component.searchClients();

    expect(component.clientSearchMessage())
      .toContain('conectar');
  });

  it('debe seleccionar cliente encontrado', () => {
    const client = {
      id: 'C1',
      name: 'Juan Perez',
    } as any;

    component.selectClient(client);

    expect(component.selectedClient())
      .toEqual(client);

    expect(component.manualForm.clientId)
      .toBe('C1');

    expect(component.clientMode())
      .toBe('existing');
  });

  // ======================================================
  // INICIALIZACIÓN Y TABS
  // ======================================================

  it('ngOnInit debe cargar los cuatro bloques', () => {
    spyOn(component, 'loadCourts');
    spyOn(component, 'loadBoardData');
    spyOn(component, 'loadPendingPayments');
    spyOn(component, 'loadShiftSummary');

    component.ngOnInit();

    expect(component.loadCourts)
      .toHaveBeenCalled();

    expect(component.loadBoardData)
      .toHaveBeenCalled();

    expect(component.loadPendingPayments)
      .toHaveBeenCalled();

    expect(component.loadShiftSummary)
      .toHaveBeenCalled();
  });

  it('debe cargar tablero al seleccionar board', () => {
    spyOn(component, 'loadBoardData');

    component.setTab('board');

    expect(component.activeTab())
      .toBe('board');

    expect(component.loadBoardData)
      .toHaveBeenCalled();
  });

  it('debe cargar pagos al seleccionar validation', () => {
    spyOn(component, 'loadPendingPayments');

    component.setTab('validation');

    expect(component.loadPendingPayments)
      .toHaveBeenCalled();
  });

  it('debe cargar caja al seleccionar cash', () => {
    spyOn(component, 'loadShiftSummary');

    component.setTab('cash');

    expect(component.loadShiftSummary)
      .toHaveBeenCalled();
  });

  it('debe limpiar alertas', () => {
    component.successMsg.set('OK');
    component.errorMsg.set('ERROR');

    component.clearAlerts();

    expect(component.successMsg())
      .toBeNull();

    expect(component.errorMsg())
      .toBeNull();
  });

  it('debe resetear caja al cambiar fecha', () => {
    component.declaredCash.set(500);
    component.shiftNotes.set('Texto');
    component.shiftCloseResult.set({
      ok: true,
    });

    spyOn(component, 'loadBoardData');
    spyOn(component, 'loadShiftSummary');

    component.onDateChange();

    expect(component.declaredCash())
      .toBeNull();

    expect(component.shiftNotes())
      .toBe('');

    expect(component.shiftCloseResult())
      .toBeNull();
  });

  // ======================================================
  // CHECK-IN
  // ======================================================

  it('no busca check-in con texto vacío', () => {
    component.searchQuery.set('   ');

    component.handleQuickSearch();

    expect(secretary.quickSearch)
      .not.toHaveBeenCalled();

    expect(component.searchResults())
      .toEqual([]);
  });

  it('mapea resultado anidado de búsqueda rápida', () => {
    component.searchQuery.set('ABC');

    secretary.quickSearch.and.returnValue(of([
      {
        id: 'X',
        reservation: {
          id: 'R1',
          courtId: 2,
          status: 'CONFIRMED',
          startTime: '10:00',
          endTime: '11:00',
          pendingBalance: 50,
          totalPrice: 100,
          isEntryAuthorized: false,
        },
        client: {
          fullName: 'Juan Perez',
        },
      },
    ]));

    component.handleQuickSearch();

    expect(component.searchResults()[0].id)
      .toBe('X');

    expect(component.searchResults()[0].clientName)
      .toBe('Juan Perez');

    expect(component.searchingCheckin())
      .toBeFalse();
  });

  it('muestra mensaje si búsqueda no tiene resultados', () => {
    component.searchQuery.set('ZZZ');

    secretary.quickSearch
      .and.returnValue(of([]));

    component.handleQuickSearch();

    expect(component.errorMsg())
      .toContain('No se encontraron');
  });

  it('maneja error de búsqueda rápida', () => {
    component.searchQuery.set('ABC');

    secretary.quickSearch
      .and.returnValue(
        throwError(() => new Error())
      );

    component.handleQuickSearch();

    expect(component.errorMsg())
      .toContain('buscar reserva');
  });

  // ======================================================
  // AUTORIZACIÓN
  // ======================================================

  it('autoriza ingreso', async () => {
    spyOn(component, 'loadBoardData');

    await component.authorizeEntry('R1');

    expect(secretary.authorizeEntry)
      .toHaveBeenCalledWith('R1');

    expect(component.loadBoardData)
      .toHaveBeenCalled();

    expect(component.loading())
      .toBeFalse();
  });

  it('no autoriza si usuario cancela confirmación', async () => {
    confirmation.confirm
      .and.resolveTo(false);

    await component.authorizeEntry('R1');

    expect(secretary.authorizeEntry)
      .not.toHaveBeenCalled();
  });

  it('no autoriza si loading está activo', async () => {
    component.loading.set(true);

    await component.authorizeEntry('R1');

    expect(secretary.authorizeEntry)
      .not.toHaveBeenCalled();
  });

  it('maneja error al autorizar ingreso', async () => {
    secretary.authorizeEntry.and.returnValue(
      throwError(() => ({
        error: {
          message: 'Ingreso no permitido',
        },
      }))
    );

    await component.authorizeEntry('R1');

    expect(component.errorMsg())
      .toBe('Ingreso no permitido');
  });

  // ======================================================
  // PAGO FINAL
  // ======================================================

  it('abre modal de pago final usando saldo pendiente', () => {
    component.openFinalPaymentModal({
      id: 'R1',
      pendingBalance: 75,
      totalAmount: 100,
    });

    expect(component.finalPaymentAmount())
      .toBe(75);

    expect(component.finalPaymentMethod())
      .toBe('EFECTIVO');
  });

  it('calcula 75% si no existe saldo pendiente', () => {
    component.openFinalPaymentModal({
      id: 'R1',
      pendingBalance: 0,
      totalAmount: 200,
    });

    expect(component.finalPaymentAmount())
      .toBe(150);
  });

  it('registra pago final', () => {
    component.openFinalPaymentModal({
      id: 'R1',
      pendingBalance: 75,
    });

    spyOn(component, 'loadBoardData');
    spyOn(component, 'loadShiftSummary');

    component.submitFinalPayment();

    expect(secretary.registerFinalPayment)
      .toHaveBeenCalledWith(
        'R1',
        {
          amount: 75,
          paymentMethod: 'EFECTIVO',
        }
      );

    expect(component.activeReservationAction())
      .toBeNull();
  });

  it('no registra pago si no existe acción', () => {
    component.activeReservationAction.set(null);

    component.submitFinalPayment();

    expect(secretary.registerFinalPayment)
      .not.toHaveBeenCalled();
  });

  it('maneja error al registrar pago final', () => {
    secretary.registerFinalPayment.and.returnValue(
      throwError(() => ({
        error: {
          message: 'Pago inválido',
        },
      }))
    );

    component.openFinalPaymentModal({
      id: 'R1',
      pendingBalance: 75,
    });

    component.submitFinalPayment();

    expect(component.errorMsg())
      .toBe('Pago inválido');
  });

  // ======================================================
  // NO SHOW
  // ======================================================

  it('abre y procesa No Show', () => {
    component.openNoShowModal({
      id: 'R1',
    });

    spyOn(component, 'loadBoardData');

    component.submitNoShow();

    expect(secretary.markNoShow)
      .toHaveBeenCalled();

    expect(component.activeReservationAction())
      .toBeNull();
  });

  it('no procesa No Show sin acción', () => {
    component.activeReservationAction.set(null);

    component.submitNoShow();

    expect(secretary.markNoShow)
      .not.toHaveBeenCalled();
  });

  it('maneja error No Show', () => {
    secretary.markNoShow.and.returnValue(
      throwError(() => ({
        error: {
          message: 'No Show falló',
        },
      }))
    );

    component.openNoShowModal({
      id: 'R1',
    });

    component.submitNoShow();

    expect(component.errorMsg())
      .toBe('No Show falló');
  });

  // ======================================================
  // CANCELACIÓN
  // ======================================================

  it('exige motivo para cancelar', () => {
    component.openCancelModal({
      id: 'R1',
    });

    component.actionReason.set('   ');

    component.submitCancel();

    expect(secretary.cancelReservation)
      .not.toHaveBeenCalled();

    expect(component.errorMsg())
      .toContain('motivo');
  });

  it('cancela reserva con motivo', () => {
    component.openCancelModal({
      id: 'R1',
    });

    component.actionReason.set(
      'Solicitud del cliente'
    );

    component.submitCancel();

    expect(secretary.cancelReservation)
      .toHaveBeenCalledWith(
        'R1',
        'Solicitud del cliente'
      );

    expect(component.activeReservationAction())
      .toBeNull();
  });

  it('maneja error al cancelar', () => {
    secretary.cancelReservation.and.returnValue(
      throwError(() => ({
        error: {
          message: 'No se pudo cancelar',
        },
      }))
    );

    component.openCancelModal({
      id: 'R1',
    });

    component.actionReason.set('Motivo');

    component.submitCancel();

    expect(component.errorMsg())
      .toBe('No se pudo cancelar');
  });

  // ======================================================
  // REPROGRAMACIÓN
  // ======================================================

  it('abre modal de reprogramación', () => {
    component.openRescheduleModal({
      id: 'R1',
      reservationDate: '2026-10-12',
      startTime: '18:00',
      endTime: '19:00',
    });

    expect(component.rescheduleDate())
      .toBe('2026-10-12');

    expect(component.rescheduleStartTime())
      .toBe('18:00');
  });

  it('abre reprogramación con valores por defecto', () => {
    component.selectedDate.set('2026-10-15');

    component.openRescheduleModal({
      id: 'R1',
    });

    expect(component.rescheduleDate())
      .toBe('2026-10-15');

    expect(component.rescheduleStartTime())
      .toBe('19:00');

    expect(component.rescheduleEndTime())
      .toBe('20:00');
  });

  it('reprograma reserva', () => {
    component.openRescheduleModal({
      id: 'R1',
      reservationDate: '2026-10-12',
      startTime: '18:00',
      endTime: '19:00',
    });

    component.submitReschedule();

    expect(secretary.rescheduleReservation)
      .toHaveBeenCalledWith(
        'R1',
        jasmine.objectContaining({
          newDate: '2026-10-12',
          newStartTime: '18:00',
          newEndTime: '19:00',
        })
      );
  });

  it('maneja error al reprogramar', () => {
    secretary.rescheduleReservation.and.returnValue(
      throwError(() => ({
        error: {
          message: 'No se pudo reprogramar',
        },
      }))
    );

    component.openRescheduleModal({
      id: 'R1',
      reservationDate: '2026-10-15',
      startTime: '10:00',
      endTime: '11:00',
    });

    component.submitReschedule();

    expect(component.errorMsg())
      .toBe('No se pudo reprogramar');
  });

  it('cierra modal de acción', () => {
    component.openCancelModal({
      id: 'R1',
    });

    component.actionReason.set('Motivo');

    component.closeActionModal();

    expect(component.activeReservationAction())
      .toBeNull();

    expect(component.actionReason())
      .toBe('');
  });

  // ======================================================
  // PAGOS PENDIENTES
  // ======================================================

  it('carga pagos pendientes', () => {
    secretary.getPendingPayments.and.returnValue(of([
      {
        paymentId: 1,
        reservationId: 'R1',
      } as any,
    ]));

    component.loadPendingPayments();

    expect(component.pendingPayments().length)
      .toBe(1);

    expect(component.loading())
      .toBeFalse();
  });

  it('maneja error cargando pagos pendientes', () => {
    secretary.getPendingPayments.and.returnValue(
      throwError(() => new Error())
    );

    component.loadPendingPayments();

    expect(component.errorMsg())
      .toContain('comprobantes');
  });

  it('abre y cierra recibo', () => {
    component.viewReceipt('imagen.png');

    expect(component.selectedReceiptImage())
      .toBe('imagen.png');

    component.closeReceiptModal();

    expect(component.selectedReceiptImage())
      .toBeNull();
  });

  it('valida un pago', async () => {
    spyOn(component, 'loadPendingPayments');
    spyOn(component, 'loadBoardData');

    await component.validatePayment(1);

    expect(secretary.validatePayment)
      .toHaveBeenCalledWith(1);

    expect(component.loadPendingPayments)
      .toHaveBeenCalled();
  });

  it('no valida pago si loading está activo', async () => {
    component.loading.set(true);

    await component.validatePayment(1);

    expect(secretary.validatePayment)
      .not.toHaveBeenCalled();
  });

  it('no valida pago si cancela confirmación', async () => {
    confirmation.confirm.and.resolveTo(false);

    await component.validatePayment(1);

    expect(secretary.validatePayment)
      .not.toHaveBeenCalled();
  });

  it('maneja error al validar pago', async () => {
    secretary.validatePayment.and.returnValue(
      throwError(() => ({
        error: {
          message: 'Comprobante inválido',
        },
      }))
    );

    await component.validatePayment(1);

    expect(component.errorMsg())
      .toBe('Comprobante inválido');
  });

  it('abre y cierra modal de rechazo', () => {
    component.openRejectModal(5);

    expect(component.rejectingPaymentId())
      .toBe(5);

    component.closeRejectModal();

    expect(component.rejectingPaymentId())
      .toBeNull();
  });

  it('exige motivo para rechazar pago', () => {
    component.openRejectModal(5);
    component.rejectionReason.set('');

    component.submitRejectPayment();

    expect(secretary.rejectPayment)
      .not.toHaveBeenCalled();

    expect(component.errorMsg())
      .toContain('motivo');
  });

  it('no rechaza si paymentId es null', () => {
    component.rejectingPaymentId.set(null);

    component.submitRejectPayment();

    expect(secretary.rejectPayment)
      .not.toHaveBeenCalled();
  });

  it('rechaza pago con motivo', () => {
    component.openRejectModal(5);
    component.rejectionReason.set(
      'Comprobante ilegible'
    );

    component.submitRejectPayment();

    expect(secretary.rejectPayment)
      .toHaveBeenCalledWith(
        5,
        'Comprobante ilegible'
      );
  });

  it('maneja error al rechazar pago', () => {
    secretary.rejectPayment.and.returnValue(
      throwError(() => ({
        error: {
          message: 'No se pudo rechazar',
        },
      }))
    );

    component.rejectingPaymentId.set(5);
    component.rejectionReason.set('Ilegible');

    component.submitRejectPayment();

    expect(component.errorMsg())
      .toBe('No se pudo rechazar');
  });

  // ======================================================
  // RESERVA MANUAL
  // ======================================================

  it('impide reserva manual sin cliente seleccionado', async () => {
    component.clientMode.set('existing');
    component.selectedClient.set(null);

    await component.submitManualReservation();

    expect(secretary.createManualReservation)
      .not.toHaveBeenCalled();
  });

  it('no crea reserva si loading está activo', async () => {
    component.loading.set(true);

    await component.submitManualReservation();

    expect(secretary.createManualReservation)
      .not.toHaveBeenCalled();
  });

  it('exige campos obligatorios', async () => {
    component.clientMode.set('walk-in');

    component.manualForm.courtId = 0;

    await component.submitManualReservation();

    expect(component.errorMsg())
      .toContain('campos requeridos');
  });

  it('no crea reserva si cancela confirmación', async () => {
    confirmation.confirm.and.resolveTo(false);

    component.clientMode.set('walk-in');

    component.manualForm = {
      courtId: 1,
      reservationDate: '2026-10-15',
      startTime: '18:00',
      endTime: '19:00',
      origin: 'MANUAL',
      clientId: '',
    };

    await component.submitManualReservation();

    expect(secretary.createManualReservation)
      .not.toHaveBeenCalled();
  });

  it('crea reserva manual presencial', async () => {
    component.clientMode.set('walk-in');

    component.manualForm = {
      courtId: 1,
      reservationDate: '2026-10-15',
      startTime: '18:00',
      endTime: '19:00',
      origin: 'MANUAL',
      clientId: '',
    };

    await component.submitManualReservation();

    expect(secretary.createManualReservation)
      .toHaveBeenCalledWith({
        courtId: 1,
        reservationDate: '2026-10-15',
        startTime: '18:00',
        endTime: '19:00',
        origin: 'MANUAL',
      });
  });

  it('crea reserva manual para cliente existente', async () => {
    component.clientMode.set('existing');

    component.selectedClient.set({
      id: 'C1',
      name: 'Juan',
    } as any);

    component.manualForm = {
      courtId: 1,
      reservationDate: '2026-10-15',
      startTime: '18:00',
      endTime: '19:00',
      origin: 'WHATSAPP',
      clientId: 'C1',
    };

    await component.submitManualReservation();

    expect(secretary.createManualReservation)
      .toHaveBeenCalledWith(
        jasmine.objectContaining({
          clientId: 'C1',
          origin: 'WHATSAPP',
        })
      );
  });

  it('maneja error creando reserva manual', async () => {
    secretary.createManualReservation.and.returnValue(
      throwError(() => ({
        error: {
          message: 'Horario ocupado',
        },
      }))
    );

    component.clientMode.set('walk-in');

    component.manualForm = {
      courtId: 1,
      reservationDate: '2026-10-15',
      startTime: '18:00',
      endTime: '19:00',
      origin: 'MANUAL',
      clientId: '',
    };

    await component.submitManualReservation();

    expect(component.errorMsg())
      .toBe('Horario ocupado');
  });

  // ======================================================
  // CAJA
  // ======================================================

  it('carga resumen de caja', () => {
    component.loadShiftSummary();

    expect(component.shiftSummary()?.totalCash)
      .toBe(400);

    expect(component.shiftSummary()?.totalQr)
      .toBe(100);

    expect(component.shiftLoading())
      .toBeFalse();
  });

  it('mapea nombres alternativos del resumen de caja', () => {
    secretary.getCurrentShiftSummary
      .and.returnValue(of({
        secretaryId: 'S1',
        shiftDate: '2026-10-10',
        totalSystem: 600,
        totalSystemCash: 500,
        totalSystemQr: 100,
        paymentsCount: 3,
        payments: [],
      } as any));

    component.loadShiftSummary();

    expect(component.shiftSummary()?.totalCollected)
      .toBe(600);

    expect(component.shiftSummary()?.transactionsCount)
      .toBe(3);
  });

  it('calcula diferencia de caja', () => {
    component.shiftSummary.set({
      secretaryId: 'S1',
      date: '2026-10-10',
      totalCollected: 500,
      totalCash: 400,
      totalQr: 100,
      transactionsCount: 2,
      payments: [],
    });

    component.declaredCash.set(450);

    expect(component.cashDifference())
      .toBe(50);
  });

  it('retorna null con efectivo negativo', () => {
    component.shiftSummary.set({
      secretaryId: 'S1',
      date: '2026-10-10',
      totalCollected: 500,
      totalCash: 400,
      totalQr: 100,
      transactionsCount: 2,
      payments: [],
    });

    component.declaredCash.set(-1);

    expect(component.cashDifference())
      .toBeNull();
  });

  it('no permite cerrar caja sin resumen', async () => {
    component.shiftSummary.set(null);

    await component.submitCloseShift();

    expect(secretary.closeShift)
      .not.toHaveBeenCalled();

    expect(component.errorMsg())
      .toContain('No hay información');
  });

  it('no permite cerrar caja sin efectivo válido', async () => {
    component.shiftSummary.set({
      secretaryId: 'S1',
      date: '2026-10-10',
      totalCollected: 500,
      totalCash: 400,
      totalQr: 100,
      transactionsCount: 2,
      payments: [],
    });

    component.declaredCash.set(null);

    await component.submitCloseShift();

    expect(secretary.closeShift)
      .not.toHaveBeenCalled();

    expect(component.errorMsg())
      .toContain('efectivo válido');
  });

  it('no cierra caja si loading está activo', async () => {
    component.loading.set(true);

    await component.submitCloseShift();

    expect(secretary.closeShift)
      .not.toHaveBeenCalled();
  });

  it('no cierra caja si cancela confirmación', async () => {
    confirmation.confirm.and.resolveTo(false);

    component.shiftSummary.set({
      secretaryId: 'S1',
      date: '2026-10-10',
      totalCollected: 500,
      totalCash: 400,
      totalQr: 100,
      transactionsCount: 2,
      payments: [],
    });

    component.declaredCash.set(400);

    await component.submitCloseShift();

    expect(secretary.closeShift)
      .not.toHaveBeenCalled();
  });

  it('cierra caja correctamente', async () => {
    component.shiftSummary.set({
      secretaryId: 'S1',
      date: '2026-10-10',
      totalCollected: 500,
      totalCash: 400,
      totalQr: 100,
      transactionsCount: 2,
      payments: [],
    });

    component.declaredCash.set(400);
    component.shiftNotes.set('Correcto');

    await component.submitCloseShift();

    expect(secretary.closeShift)
      .toHaveBeenCalledWith(
        jasmine.objectContaining({
          totalDeclaredCash: 400,
          notes: 'Correcto',
        })
      );

    expect(component.shiftCloseResult())
      .not.toBeNull();
  });

  it('maneja error al cerrar caja', async () => {
    secretary.closeShift.and.returnValue(
      throwError(() => ({
        error: {
          message: 'Error de cierre',
        },
      }))
    );

    component.shiftSummary.set({
      secretaryId: 'S1',
      date: '2026-10-10',
      totalCollected: 500,
      totalCash: 400,
      totalQr: 100,
      transactionsCount: 2,
      payments: [],
    });

    component.declaredCash.set(400);

    await component.submitCloseShift();

    expect(component.errorMsg())
      .toBe('Error de cierre');

    expect(component.loading())
      .toBeFalse();
  });
});