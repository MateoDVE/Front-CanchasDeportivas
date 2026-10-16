import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';

import { CourtDetailComponent } from './court-detail';
import { CourtService } from '../../services/court.service';
import { ComplexService } from '../../services/complex.service';
import { ReservationService } from '../../services/reservation.service';
import { AuthService } from '../../services/auth.service';

describe('CourtDetailComponent', () => {
  let component: CourtDetailComponent;

  let router: jasmine.SpyObj<Router>;
  let courtService: jasmine.SpyObj<CourtService>;
  let complexService: jasmine.SpyObj<ComplexService>;
  let reservationService: jasmine.SpyObj<ReservationService>;
  let authService: jasmine.SpyObj<AuthService>;

  const court: any = {
    id: 1,
    complexId: 10,
    name: 'Cancha Central',
    courtType: 'Futsal',
    pricePerHour: 100,
    images: ['img1.jpg', 'img2.jpg'],
    isActive: true,
  };

  const complex: any = {
    id: 10,
    name: 'Complejo Central',
    location: 'Av. Principal',
    city: 'Cochabamba',
    contactInfo: '70000000',
    isActive: true,
  };

  const availability: any = {
    isOpen: true,
    slots: [
      {
        startTime: '10:00',
        endTime: '10:30',
        status: 'AVAILABLE',
        isAvailable: true,
      },
      {
        startTime: '10:30',
        endTime: '11:00',
        status: 'AVAILABLE',
        isAvailable: true,
      },
      {
        startTime: '11:00',
        endTime: '11:30',
        status: 'OCCUPIED',
        isAvailable: false,
      },
      {
        startTime: '11:30',
        endTime: '12:00',
        status: 'TEMPORAL_HOLD',
        isAvailable: false,
      },
      {
        startTime: '12:00',
        endTime: '12:30',
        status: 'BLOCKED',
        isAvailable: false,
      },
    ],
  };

  beforeEach(() => {
    router = jasmine.createSpyObj<Router>(
      'Router',
      ['navigate']
    );

    courtService = jasmine.createSpyObj<CourtService>(
      'CourtService',
      [
        'getCourtById',
        'getCourtAvailability',
      ]
    );

    complexService = jasmine.createSpyObj<ComplexService>(
      'ComplexService',
      [
        'getActiveComplexes',
      ]
    );

    reservationService = jasmine.createSpyObj<ReservationService>(
      'ReservationService',
      [
        'createTemporal',
        'navigateToReservation',
      ]
    );

    authService = jasmine.createSpyObj<AuthService>(
      'AuthService',
      [
        'isLoggedIn',
      ]
    );

    courtService.getCourtById.and.returnValue(
      of(court)
    );

    courtService.getCourtAvailability.and.returnValue(
      of(availability)
    );

    complexService.getActiveComplexes.and.returnValue(
      of([complex])
    );

    reservationService.createTemporal.and.returnValue(
      of({
        reservationId: 'R1',
      } as any)
    );

    reservationService.navigateToReservation.and.returnValue(
      of(true)
    );

    authService.isLoggedIn.and.returnValue(true);

    router.navigate.and.returnValue(
      Promise.resolve(true)
    );

    TestBed.configureTestingModule({
      providers: [
        {
          provide: Router,
          useValue: router,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: () => '1',
              },
            },
          },
        },
        {
          provide: CourtService,
          useValue: courtService,
        },
        {
          provide: ComplexService,
          useValue: complexService,
        },
        {
          provide: ReservationService,
          useValue: reservationService,
        },
        {
          provide: AuthService,
          useValue: authService,
        },
      ],
    });

    component = TestBed.runInInjectionContext(
      () => new CourtDetailComponent()
    );
  });

  // ======================================================
  // CREACIÓN
  // ======================================================

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  // ======================================================
  // ngOnInit
  // ======================================================

  it('should load court on init with valid id', () => {
    spyOn(component, 'loadCourt');

    component.ngOnInit();

    expect(component.loadCourt)
      .toHaveBeenCalledWith(1);
  });

  it('should reject invalid court id', () => {
    TestBed.resetTestingModule();

    TestBed.configureTestingModule({
      providers: [
        {
          provide: Router,
          useValue: router,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: () => 'abc',
              },
            },
          },
        },
        {
          provide: CourtService,
          useValue: courtService,
        },
        {
          provide: ComplexService,
          useValue: complexService,
        },
        {
          provide: ReservationService,
          useValue: reservationService,
        },
        {
          provide: AuthService,
          useValue: authService,
        },
      ],
    });

    const invalidComponent =
      TestBed.runInInjectionContext(
        () => new CourtDetailComponent()
      );

    invalidComponent.ngOnInit();

    expect(invalidComponent.loading)
      .toBeFalse();

    expect(invalidComponent.bookingError)
      .toContain('cancha');
  });

  // ======================================================
  // CARGAR CANCHA
  // ======================================================

  it('should load court successfully', () => {
    spyOn(component, 'loadEstablishment');
    spyOn(component, 'loadAvailability');

    component.loadCourt(1);

    expect(component.court)
      .toEqual(court);

    expect(component.loadEstablishment)
      .toHaveBeenCalledWith(10);

    expect(component.loadAvailability)
      .toHaveBeenCalledWith(
        1,
        component.selectedDate
      );
  });

  it('should handle error loading court', () => {
    courtService.getCourtById.and.returnValue(
      throwError(() => new Error())
    );

    component.loadCourt(1);

    expect(component.loading)
      .toBeFalse();

    expect(component.bookingError)
      .toContain('No se pudo cargar');
  });

  // ======================================================
  // COMPLEJO
  // ======================================================

  it('should load establishment', () => {
    component.loadEstablishment(10);

    expect(component.establishment)
      .not.toBeNull();

    expect(component.establishment?.id)
      .toBe(10);

    expect((component.establishment as any).address)
      .toBe('Av. Principal');

    expect(component.loading)
      .toBeFalse();
  });

  it('should show error if complex is not found', () => {
    complexService.getActiveComplexes.and.returnValue(
      of([])
    );

    component.loadEstablishment(10);

    expect(component.establishment)
      .toBeNull();

    expect(component.bookingError)
      .toContain('no está disponible');
  });

  it('should handle error loading complex', () => {
    complexService.getActiveComplexes.and.returnValue(
      throwError(() => new Error())
    );

    component.loadEstablishment(10);

    expect(component.loading)
      .toBeFalse();

    expect(component.bookingError)
      .toContain('No se pudo cargar el complejo');
  });

  // ======================================================
  // DISPONIBILIDAD
  // ======================================================

  it('should load availability and generate time slots', () => {
    component.selectedDate = '2026-10-20';

    component.loadAvailability(
      1,
      '2026-10-20'
    );

    expect(component.serverAvailability)
      .toEqual(availability);

    expect(component.availabilityLoading)
      .toBeFalse();

    expect(component.timeSlots)
      .toContain('10:00');

    expect(component.timeSlots)
      .toContain('10:30');

    expect(component.timeSlots)
      .toContain('11:00');
  });

  it('should reset selected times when loading availability', () => {
    component.selectedStart = '10:00';
    component.selectedEnd = '11:00';

    component.selectedDate = '2026-10-20';

    component.loadAvailability(
      1,
      '2026-10-20'
    );

    expect(component.selectedStart)
      .toBeNull();

    expect(component.selectedEnd)
      .toBeNull();
  });

  it('should ignore response for old date', () => {
    component.selectedDate = '2026-10-20';

    component.loadAvailability(
      1,
      '2026-10-19'
    );

    expect(component.serverAvailability)
      .toBeNull();
  });

  it('should handle availability error', () => {
    courtService.getCourtAvailability.and.returnValue(
      throwError(() => new Error())
    );

    component.selectedDate = '2026-10-20';

    component.loadAvailability(
      1,
      '2026-10-20'
    );

    expect(component.availabilityLoading)
      .toBeFalse();

    expect(component.availabilityError)
      .toContain('No se pudieron cargar');
  });

  // ======================================================
  // MAPA DE DISPONIBILIDAD
  // ======================================================

  it('should map available, occupied and blocked slots', () => {
    component.serverAvailability = availability;

    const result = component.availability;

    expect(result['10:00'])
      .toBe('available');

    expect(result['11:00'])
      .toBe('occupied');

    expect(result['11:30'])
      .toBe('blocked');

    expect(result['12:00'])
      .toBe('occupied');
  });

  it('should return empty availability map when null', () => {
    component.serverAvailability = null;

    expect(component.availability)
      .toEqual({});
  });

  // ======================================================
  // PRECIO
  // ======================================================

  it('should calculate duration', () => {
    component.selectedStart = '10:00';
    component.selectedEnd = '11:30';

    expect(component.duration)
      .toBe(1.5);
  });

  it('should return zero duration without selection', () => {
    component.selectedStart = null;
    component.selectedEnd = null;

    expect(component.duration)
      .toBe(0);
  });

  it('should calculate total price', () => {
    component.court = court;
    component.selectedStart = '10:00';
    component.selectedEnd = '12:00';

    expect(component.totalPrice)
      .toBe(200);
  });

  it('should calculate advance of 25 percent', () => {
    component.court = court;
    component.selectedStart = '10:00';
    component.selectedEnd = '12:00';

    expect(component.advance)
      .toBe(50);
  });

  it('should calculate pending balance', () => {
    component.court = court;
    component.selectedStart = '10:00';
    component.selectedEnd = '12:00';

    expect(component.pendingBalance)
      .toBe(150);
  });

  // ======================================================
  // CALENDARIO
  // ======================================================

  it('should generate calendar days', () => {
    component.calendarYear = 2026;
    component.calendarMonth = 9;

    const days = component.calendarDays;

    expect(days.length)
      .toBeGreaterThan(28);

    expect(days)
      .toContain(1);
  });

  it('should format date', () => {
    const result = component.formatDate(
      new Date(2026, 9, 5)
    );

    expect(result)
      .toBe('2026-10-05');
  });

  it('should select day', () => {
    component.calendarYear = 2030;
    component.calendarMonth = 0;

    component.today = new Date(
      2026,
      0,
      1
    );

    component.court = court;

    spyOn(component, 'loadAvailability');

    component.selectDay(10);

    expect(component.selectedDate)
      .toBe('2030-01-10');

    expect(component.loadAvailability)
      .toHaveBeenCalled();
  });

  it('should not select past day', () => {
    component.calendarYear = 2020;
    component.calendarMonth = 0;

    component.today = new Date(
      2026,
      0,
      1
    );

    const originalDate =
      component.selectedDate;

    component.selectDay(1);

    expect(component.selectedDate)
      .toBe(originalDate);
  });

  it('should detect selected day', () => {
    component.calendarYear = 2030;
    component.calendarMonth = 0;
    component.selectedDate = '2030-01-10';

    expect(component.isSelectedDay(10))
      .toBeTrue();

    expect(component.isSelectedDay(11))
      .toBeFalse();
  });

  it('should detect past day', () => {
    component.today = new Date(
      2026,
      10,
      10
    );

    component.calendarYear = 2026;
    component.calendarMonth = 10;

    expect(component.isPast(1))
      .toBeTrue();

    expect(component.isPast(20))
      .toBeFalse();
  });

  it('should move to next month', () => {
    component.calendarMonth = 5;
    component.calendarYear = 2026;

    component.nextMonth();

    expect(component.calendarMonth)
      .toBe(6);

    expect(component.calendarYear)
      .toBe(2026);
  });

  it('should move from December to January', () => {
    component.calendarMonth = 11;
    component.calendarYear = 2026;

    component.nextMonth();

    expect(component.calendarMonth)
      .toBe(0);

    expect(component.calendarYear)
      .toBe(2027);
  });

  it('should move to previous month', () => {
    component.calendarMonth = 5;
    component.calendarYear = 2026;

    component.prevMonth();

    expect(component.calendarMonth)
      .toBe(4);

    expect(component.calendarYear)
      .toBe(2026);
  });

  it('should move from January to December', () => {
    component.calendarMonth = 0;
    component.calendarYear = 2026;

    component.prevMonth();

    expect(component.calendarMonth)
      .toBe(11);

    expect(component.calendarYear)
      .toBe(2025);
  });

  // ======================================================
  // TIEMPOS
  // ======================================================

  it('should calculate end time', () => {
    expect(
      component.getEndTime(
        '10:00',
        1.5
      )
    ).toBe('11:30');
  });

  it('should return default end time if start is empty', () => {
    expect(
      component.getEndTime('', 1)
    ).toBe('11:00');
  });

  it('should convert time to minutes', () => {
    expect(
      component.timeToMinutes('10:30')
    ).toBe(630);
  });

  it('should return zero for empty time', () => {
    expect(
      component.timeToMinutes('')
    ).toBe(0);
  });

  // ======================================================
  // RANGO DISPONIBLE
  // ======================================================

  it('should return true for complete available range', () => {
    component.serverAvailability = availability;

    expect(
      component.isRangeAvailable(
        '10:00',
        '11:00'
      )
    ).toBeTrue();
  });

  it('should reject range when court is closed', () => {
    component.serverAvailability = {
      ...availability,
      isOpen: false,
    };

    expect(
      component.isRangeAvailable(
        '10:00',
        '11:00'
      )
    ).toBeFalse();
  });

  it('should reject end before start', () => {
    component.serverAvailability = availability;

    expect(
      component.isRangeAvailable(
        '11:00',
        '10:00'
      )
    ).toBeFalse();
  });

  it('should reject range greater than 3 hours', () => {
    component.serverAvailability = availability;

    expect(
      component.isRangeAvailable(
        '08:00',
        '12:00'
      )
    ).toBeFalse();
  });

  it('should reject range not multiple of 30 minutes', () => {
    component.serverAvailability = availability;

    expect(
      component.isRangeAvailable(
        '10:00',
        '10:45'
      )
    ).toBeFalse();
  });

  it('should reject range with occupied slot', () => {
    component.serverAvailability = availability;

    expect(
      component.isRangeAvailable(
        '10:30',
        '11:30'
      )
    ).toBeFalse();
  });

  // ======================================================
  // SELECCIÓN DE HORAS
  // ======================================================

  it('should allow starting on available slot', () => {
    component.serverAvailability = availability;

    expect(
      component.canStartAt('10:00')
    ).toBeTrue();
  });

  it('should reject time while booking is loading', () => {
    component.bookingLoading = true;

    expect(
      component.canSelectTime('10:00')
    ).toBeFalse();
  });

  it('should allow same selected start', () => {
    component.bookingLoading = false;
    component.selectedStart = '10:00';
    component.selectedEnd = null;

    expect(
      component.canSelectTime('10:00')
    ).toBeTrue();
  });

  it('should detect time inside selected range', () => {
    component.selectedStart = '10:00';
    component.selectedEnd = '11:00';

    expect(
      component.isInRange('10:30')
    ).toBeTrue();

    expect(
      component.isInRange('11:30')
    ).toBeFalse();
  });

  it('should clear time range', () => {
    component.selectedStart = '10:00';
    component.selectedEnd = '11:00';

    component.clearTimeRange();

    expect(component.selectedStart)
      .toBeNull();

    expect(component.selectedEnd)
      .toBeNull();
  });

  it('should select start time', () => {
    component.serverAvailability = availability;

    component.selectTime('10:00');

    expect(component.selectedStart)
      .toBe('10:00');

    expect(component.selectedEnd)
      .toBeNull();
  });

  it('should select end time', () => {
    component.serverAvailability = availability;
    component.selectedStart = '10:00';
    component.selectedEnd = null;

    component.selectTime('11:00');

    expect(component.selectedEnd as string | null)
      .toBe('11:00');
  });

  it('should clear selected start when clicked again', () => {
    component.serverAvailability = availability;
    component.selectedStart = '10:00';
    component.selectedEnd = null;

    component.selectTime('10:00');

    expect(component.selectedStart)
      .toBeNull();

    expect(component.selectedEnd)
      .toBeNull();
  });

  // ======================================================
  // IMAGEN
  // ======================================================

  it('should select image', () => {
    component.selectImage(2);

    expect(component.imgIndex)
      .toBe(2);
  });

  // ======================================================
  // TEXTO DE SLOT
  // ======================================================

  it('should return Inicio for selected start', () => {
    component.selectedStart = '10:00';

    expect(
      component.getSlotStatusText('10:00')
    ).toBe('Inicio');
  });

  it('should return Fin for selected end', () => {
    component.selectedStart = '10:00';
    component.selectedEnd = '11:00';

    expect(
      component.getSlotStatusText('11:00')
    ).toBe('Fin');
  });

  it('should return Mantenimiento for blocked slot', () => {
    component.serverAvailability = availability;

    expect(
      component.getSlotStatusText('12:00')
    ).toBe('Mantenimiento');
  });

  it('should return Ocupado for occupied slot', () => {
    component.serverAvailability = availability;

    expect(
      component.getSlotStatusText('11:00')
    ).toBe('Ocupado');
  });

  it('should return En reserva for temporal hold', () => {
    component.serverAvailability = availability;

    expect(
      component.getSlotStatusText('11:30')
    ).toBe('En reserva');
  });

  it('should return Cierre if slot does not exist', () => {
    component.serverAvailability = availability;

    expect(
      component.getSlotStatusText('23:00')
    ).toBe('Cierre');
  });

  // ======================================================
  // NAVEGACIÓN
  // ======================================================

  it('should go back to courts', () => {
    component.goBack();

    expect(router.navigate)
      .toHaveBeenCalledWith(
        ['/courts']
      );
  });

  // ======================================================
  // RESERVA
  // ======================================================

  it('should not continue booking without selected range', () => {
    component.court = court;
    component.selectedStart = null;
    component.selectedEnd = null;

    component.continueBooking();

    expect(reservationService.createTemporal)
      .not.toHaveBeenCalled();
  });

  it('should redirect to login when user is not logged in', () => {
    component.court = court;
    component.selectedStart = '10:00';
    component.selectedEnd = '11:00';
    component.serverAvailability = availability;

    authService.isLoggedIn.and.returnValue(false);

    component.continueBooking();

    expect(router.navigate)
      .toHaveBeenCalledWith(
        ['/login'],
        {
          queryParams: {
            returnUrl: '/court-detail/1',
          },
        }
      );

    expect(reservationService.createTemporal)
      .not.toHaveBeenCalled();
  });

  it('should create temporal reservation', () => {
    component.court = court;
    component.selectedDate = '2026-10-20';
    component.selectedStart = '10:00';
    component.selectedEnd = '11:00';
    component.serverAvailability = availability;

    authService.isLoggedIn.and.returnValue(true);

    component.continueBooking();

    expect(reservationService.createTemporal)
      .toHaveBeenCalledWith({
        courtId: 1,
        date: '2026-10-20',
        startTime: '10:00',
        endTime: '11:00',
      });

    expect(reservationService.navigateToReservation)
      .toHaveBeenCalledWith(
        '/payment',
        'R1'
      );

    expect(component.bookingLoading)
      .toBeFalse();
  });

  it('should handle create temporal error with string message', () => {
    reservationService.createTemporal.and.returnValue(
      throwError(() => ({
        error: {
          message: 'Horario ocupado',
        },
      }))
    );

    component.court = court;
    component.selectedDate = '2026-10-20';
    component.selectedStart = '10:00';
    component.selectedEnd = '11:00';
    component.serverAvailability = availability;

    spyOn(component, 'loadAvailability');

    component.continueBooking();

    expect(component.bookingError)
      .toBe('Horario ocupado');

    expect(component.bookingLoading)
      .toBeFalse();

    expect(component.loadAvailability)
      .toHaveBeenCalled();
  });

  it('should handle create temporal error with array message', () => {
    reservationService.createTemporal.and.returnValue(
      throwError(() => ({
        error: {
          message: [
            'Horario inválido',
            'Cancha no disponible',
          ],
        },
      }))
    );

    component.court = court;
    component.selectedDate = '2026-10-20';
    component.selectedStart = '10:00';
    component.selectedEnd = '11:00';
    component.serverAvailability = availability;

    spyOn(component, 'loadAvailability');

    component.continueBooking();

    expect(component.bookingError)
      .toContain('Horario inválido');

    expect(component.bookingError)
      .toContain('Cancha no disponible');
  });

  it('should use default booking error when backend has no message', () => {
    reservationService.createTemporal.and.returnValue(
      throwError(() => ({
        error: {},
      }))
    );

    component.court = court;
    component.selectedDate = '2026-10-20';
    component.selectedStart = '10:00';
    component.selectedEnd = '11:00';
    component.serverAvailability = availability;

    spyOn(component, 'loadAvailability');

    component.continueBooking();

    expect(component.bookingError)
      .toContain('ya no está disponible');
  });

  it('should handle navigation to payment error', () => {
    reservationService.navigateToReservation.and.returnValue(
      throwError(() => new Error())
    );

    component.court = court;
    component.selectedDate = '2026-10-20';
    component.selectedStart = '10:00';
    component.selectedEnd = '11:00';
    component.serverAvailability = availability;

    component.continueBooking();

    expect(component.bookingError)
      .toContain('No se pudo abrir el pago');
  });

  it('should format selected short date', () => {
    component.selectedDate = '2026-10-20';

    const result =
      component.formattedSelectedDate;

    expect(result)
      .toBeTruthy();
  });

  it('should format selected long date', () => {
    component.selectedDate = '2026-10-20';

    const result =
      component.formattedLongDate;

    expect(result)
      .toBeTruthy();
  });
});