import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { MyReservationsComponent } from './my-reservations';
import { ReservationService } from '../../services/reservation.service';
import { AuthService } from '../../services/auth.service';

describe('MyReservationsComponent', () => {
  let component: MyReservationsComponent;

  let reservationService:
    jasmine.SpyObj<ReservationService>;

  let router:
    jasmine.SpyObj<Router>;

  let authService: any;

  const confirmed: any = {
    id: '123456789',
    courtId: 1,
    courtName: 'Cancha Central',
    status: 'CONFIRMED',
    reservationDate: '2030-01-10',
    startTime: '10:00',
    endTime: '11:00',
    totalPrice: 100,
    createdAt: '2030-01-01T10:00:00',
    secondsRemaining: 0,
  };

  const temporal: any = {
    ...confirmed,
    id: 'TEMPORAL123',
    status: 'TEMPORAL',
    secondsRemaining: 300,
  };

  const pending: any = {
    ...confirmed,
    id: 'PENDING123',
    status: 'PENDING_VALIDATION',
  };

  const completed: any = {
    ...confirmed,
    id: 'COMPLETED123',
    status: 'COMPLETED',
    reservationDate: '2029-12-10',
    createdAt: '2029-12-01T10:00:00',
  };

  const cancelled: any = {
    ...confirmed,
    id: 'CANCELLED123',
    status: 'CANCELLED',
    reservationDate: '2029-11-10',
  };

  const expired: any = {
    ...confirmed,
    id: 'EXPIRED123',
    status: 'EXPIRED',
    reservationDate: '2029-10-10',
  };

  beforeEach(() => {
    reservationService =
      jasmine.createSpyObj<ReservationService>(
        'ReservationService',
        [
          'getMyReservations',
          'navigateToReservation',
        ]
      );

    router =
      jasmine.createSpyObj<Router>(
        'Router',
        [
          'navigate',
        ]
      );

    authService = {
      currentUser: jasmine
        .createSpy('currentUser')
        .and.returnValue({
          id: 'U1',
          name: 'Juan Perez',
        }),

      isLoggedIn: jasmine
        .createSpy('isLoggedIn')
        .and.returnValue(true),
    };

    reservationService.getMyReservations
      .and.returnValue(of({
        upcoming: [
          confirmed,
          temporal,
          pending,
        ],
        history: [
          completed,
          cancelled,
          expired,
        ],
      }));

      reservationService.navigateToReservation
        .and.returnValue(of(true));

    router.navigate
      .and.returnValue(Promise.resolve(true));

    TestBed.configureTestingModule({
      providers: [
        {
          provide: Router,
          useValue: router,
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

    component =
      TestBed.runInInjectionContext(
        () => new MyReservationsComponent()
      );
  });

  // ======================================================
  // INICIALIZACIÓN
  // ======================================================

  it('ngOnInit carga reservas si el usuario está autenticado', () => {
    spyOn(component, 'loadReservations');

    authService.isLoggedIn.and.returnValue(true);

    component.ngOnInit();

    expect(component.loadReservations)
      .toHaveBeenCalled();

    expect(router.navigate)
      .not.toHaveBeenCalledWith(
        ['/login'],
        jasmine.anything()
      );
  });

  it('ngOnInit redirige a login si el usuario no está autenticado', () => {
    authService.isLoggedIn.and.returnValue(false);

    spyOn(component, 'loadReservations');

    component.ngOnInit();

    expect(router.navigate)
      .toHaveBeenCalledWith(
        ['/login'],
        {
          queryParams: {
            returnUrl: '/my-reservations',
          },
        }
      );

    expect(component.loadReservations)
      .not.toHaveBeenCalled();
  });

  // ======================================================
  // CARGA DE RESERVAS
  // ======================================================

  it('carga reservas correctamente', () => {
    component.loadReservations();

    expect(reservationService.getMyReservations)
      .toHaveBeenCalled();

    expect(component.reservations.length)
      .toBe(6);

    expect(component.loading)
      .toBeFalse();

    expect(component.errorMessage)
      .toBe('');
  });

  it('combina upcoming e history', () => {
    reservationService.getMyReservations
      .and.returnValue(of({
        upcoming: [confirmed],
        history: [completed],
      }));

    component.loadReservations();

    expect(component.reservations.length)
      .toBe(2);

    expect(component.reservations[0].id)
      .toBe(confirmed.id);

    expect(component.reservations[1].id)
      .toBe(completed.id);
  });

  it('maneja error cargando reservas', () => {
    reservationService.getMyReservations
      .and.returnValue(
        throwError(() => new Error('error'))
      );

    component.loadReservations();

    expect(component.loading)
      .toBeFalse();

    expect(component.errorMessage)
      .toContain('No se pudieron cargar');
  });

  // ======================================================
  // USUARIO E INICIALES
  // ======================================================

  it('devuelve iniciales de nombre y apellido', () => {
    authService.currentUser.and.returnValue({
      name: 'Juan Perez',
    });

    expect(component.userInitials())
      .toBe('JP');
  });

  it('devuelve dos primeras letras para nombre simple', () => {
    authService.currentUser.and.returnValue({
      name: 'Juan',
    });

    expect(component.userInitials())
      .toBe('JU');
  });

  it('devuelve U si usuario no tiene nombre', () => {
    authService.currentUser.and.returnValue({
      name: '',
    });

    expect(component.userInitials())
      .toBe('U');
  });

  it('devuelve U si usuario es null', () => {
    authService.currentUser.and.returnValue(null);

    expect(component.userInitials())
      .toBe('U');
  });

  // ======================================================
  // CONTADORES
  // ======================================================

  it('calcula total de reservas', () => {
    component.reservations = [
      confirmed,
      temporal,
      completed,
    ];

    expect(component.totalCount)
      .toBe(3);
  });

  it('calcula reservas activas', () => {
    component.reservations = [
      confirmed,
      temporal,
      pending,
      completed,
      cancelled,
    ];

    expect(component.activeCount)
      .toBe(3);
  });

  it('calcula historial', () => {
    component.reservations = [
      confirmed,
      temporal,
      pending,
      completed,
      cancelled,
      expired,
    ];

    expect(component.historyCount)
      .toBe(3);
  });

  // ======================================================
  // FECHAS INVÁLIDAS
  // ======================================================

  it('invalidDates devuelve false sin fechas', () => {
    component.dateFrom = '';
    component.dateTo = '';

    expect(component.invalidDates)
      .toBeFalse();
  });

  it('invalidDates devuelve false con rango válido', () => {
    component.dateFrom = '2026-10-01';
    component.dateTo = '2026-10-10';

    expect(component.invalidDates)
      .toBeFalse();
  });

  it('invalidDates devuelve true con rango inválido', () => {
    component.dateFrom = '2026-10-20';
    component.dateTo = '2026-10-10';

    expect(component.invalidDates)
      .toBeTrue();
  });

  it('visibleReservations devuelve vacío si fechas son inválidas', () => {
    component.reservations = [
      confirmed,
    ];

    component.dateFrom = '2030-02-01';
    component.dateTo = '2030-01-01';

    expect(component.visibleReservations)
      .toEqual([]);
  });

  // ======================================================
  // FILTROS
  // ======================================================

  it('filtro all devuelve todas las reservas', () => {
    component.reservations = [
      confirmed,
      temporal,
      completed,
    ];

    component.activeFilter = 'all';

    expect(component.visibleReservations.length)
      .toBe(3);
  });

  it('filtra confirmadas', () => {
    component.reservations = [
      confirmed,
      temporal,
      completed,
    ];

    component.changeFilter('confirmed');

    expect(component.visibleReservations.length)
      .toBe(1);

    expect(component.visibleReservations[0].status)
      .toBe('CONFIRMED');
  });

  it('filtra pendientes de validación', () => {
    component.reservations = [
      confirmed,
      pending,
      temporal,
    ];

    component.changeFilter('pending');

    expect(component.visibleReservations.length)
      .toBe(1);

    expect(component.visibleReservations[0].status)
      .toBe('PENDING_VALIDATION');
  });

  it('filtra temporales', () => {
    component.reservations = [
      confirmed,
      temporal,
      pending,
    ];

    component.changeFilter('temporal');

    expect(component.visibleReservations.length)
      .toBe(1);

    expect(component.visibleReservations[0].status)
      .toBe('TEMPORAL');
  });

  it('filtra finalizadas', () => {
    component.reservations = [
      {
        ...completed,
        status: 'COMPLETED',
      },
      {
        ...completed,
        id: 'FIN',
        status: 'FINISHED',
      },
      {
        ...completed,
        id: 'NOSHOW',
        status: 'NO_SHOW',
      },
      {
        ...completed,
        id: 'REPRO',
        status: 'REPROGRAMMED',
      },
      confirmed,
    ];

    component.changeFilter('finished');

    expect(component.visibleReservations.length)
      .toBe(4);
  });

  it('filtra canceladas y expiradas', () => {
    component.reservations = [
      cancelled,
      expired,
      confirmed,
    ];

    component.changeFilter('cancelled');

    expect(component.visibleReservations.length)
      .toBe(2);
  });

  it('filtro desconocido retorna reservas', () => {
    component.reservations = [
      confirmed,
    ];

    component.activeFilter = 'unknown';

    expect(component.visibleReservations.length)
      .toBe(1);
  });

  // ======================================================
  // BÚSQUEDA
  // ======================================================

  it('filtra por nombre de cancha', () => {
    component.reservations = [
      confirmed,
      {
        ...confirmed,
        id: '2',
        courtName: 'Cancha Sur',
      },
    ];

    component.search = 'central';

    expect(component.visibleReservations.length)
      .toBe(1);

    expect(component.visibleReservations[0].courtName)
      .toBe('Cancha Central');
  });

  it('filtra por código de reserva', () => {
    component.reservations = [
      confirmed,
      {
        ...confirmed,
        id: 'ZZZZ9999',
      },
    ];

    component.search = '12345678';

    expect(component.visibleReservations.length)
      .toBe(1);

    expect(component.visibleReservations[0].id)
      .toBe('123456789');
  });

  it('retorna vacío si búsqueda no coincide', () => {
    component.reservations = [
      confirmed,
    ];

    component.search = 'otra cosa';

    expect(component.visibleReservations)
      .toEqual([]);
  });

  // ======================================================
  // FILTRO POR FECHAS
  // ======================================================

  it('filtra desde una fecha', () => {
    component.reservations = [
      {
        ...confirmed,
        id: 'A',
        reservationDate: '2030-01-01',
      },
      {
        ...confirmed,
        id: 'B',
        reservationDate: '2030-02-01',
      },
    ];

    component.dateFrom = '2030-01-15';

    expect(component.visibleReservations.length)
      .toBe(1);

    expect(component.visibleReservations[0].id)
      .toBe('B');
  });

  it('filtra hasta una fecha', () => {
    component.reservations = [
      {
        ...confirmed,
        id: 'A',
        reservationDate: '2030-01-01',
      },
      {
        ...confirmed,
        id: 'B',
        reservationDate: '2030-02-01',
      },
    ];

    component.dateTo = '2030-01-15';

    expect(component.visibleReservations.length)
      .toBe(1);

    expect(component.visibleReservations[0].id)
      .toBe('A');
  });

  it('filtra usando rango completo', () => {
    component.reservations = [
      {
        ...confirmed,
        id: 'A',
        reservationDate: '2030-01-01',
      },
      {
        ...confirmed,
        id: 'B',
        reservationDate: '2030-01-15',
      },
      {
        ...confirmed,
        id: 'C',
        reservationDate: '2030-02-01',
      },
    ];

    component.dateFrom = '2030-01-10';
    component.dateTo = '2030-01-20';

    expect(component.visibleReservations.length)
      .toBe(1);

    expect(component.visibleReservations[0].id)
      .toBe('B');
  });

  // ======================================================
  // ORDENAMIENTO
  // ======================================================

  it('ordena por precio descendente', () => {
    component.reservations = [
      {
        ...confirmed,
        id: 'A',
        totalPrice: 100,
      },
      {
        ...confirmed,
        id: 'B',
        totalPrice: 300,
      },
      {
        ...confirmed,
        id: 'C',
        totalPrice: 200,
      },
    ];

    component.sortOrder = 'price';

    const result =
      component.visibleReservations;

    expect(result[0].totalPrice)
      .toBe(300);

    expect(result[1].totalPrice)
      .toBe(200);

    expect(result[2].totalPrice)
      .toBe(100);
  });

  it('ordena por fecha descendente', () => {
    component.reservations = [
      {
        ...confirmed,
        id: 'A',
        reservationDate: '2030-01-01',
      },
      {
        ...confirmed,
        id: 'B',
        reservationDate: '2030-02-01',
      },
    ];

    component.sortOrder = 'date-desc';

    const result =
      component.visibleReservations;

    expect(result[0].id)
      .toBe('B');

    expect(result[1].id)
      .toBe('A');
  });

  it('ordena por fecha de creación reciente', () => {
    component.reservations = [
      {
        ...confirmed,
        id: 'A',
        createdAt: '2030-01-01T10:00:00',
      },
      {
        ...confirmed,
        id: 'B',
        createdAt: '2030-02-01T10:00:00',
      },
    ];

    component.sortOrder = 'recent';

    const result =
      component.visibleReservations;

    expect(result[0].id)
      .toBe('B');
  });

  it('prioriza reservas activas en upcoming', () => {
    component.reservations = [
      completed,
      confirmed,
    ];

    component.sortOrder = 'upcoming';

    const result =
      component.visibleReservations;

    expect(result[0].status)
      .toBe('CONFIRMED');
  });

  // ======================================================
  // CÓDIGO
  // ======================================================

  it('formatCode retorna vacío con id vacío', () => {
    expect(component.formatCode(''))
      .toBe('');
  });

  it('formatCode convierte código corto a mayúsculas', () => {
    expect(component.formatCode('abc'))
      .toBe('ABC');
  });

  it('formatCode limita código largo a 8 caracteres', () => {
    expect(component.formatCode('abcdefghijk'))
      .toBe('ABCDEFGH');
  });

  // ======================================================
  // FECHA
  // ======================================================

  it('formatDate retorna vacío si no hay fecha', () => {
    expect(component.formatDate(''))
      .toBe('');
  });

  it('formatDate retorna fecha original si es inválida', () => {
    const invalid =
      'fecha-totalmente-invalida';

    expect(component.formatDate(invalid))
      .toBe(invalid);
  });

  it('formatDate devuelve texto formateado para fecha válida', () => {
    const result =
      component.formatDate('2026-10-10');

    expect(result)
      .toBeTruthy();

    expect(result.length)
      .toBeGreaterThan(0);
  });

  // ======================================================
  // BADGES
  // ======================================================

  it('devuelve badge CONFIRMED', () => {
    expect(
      component
        .getStatusBadge('CONFIRMED')
        .label
    ).toBe('Confirmada');
  });

  it('devuelve badge PENDING_VALIDATION', () => {
    expect(
      component
        .getStatusBadge(
          'PENDING_VALIDATION'
        )
        .label
    ).toBe('En validación');
  });

  it('devuelve badge TEMPORAL', () => {
    expect(
      component
        .getStatusBadge('TEMPORAL')
        .label
    ).toBe('Bloqueo temporal');
  });

  it('devuelve badge CANCELLED', () => {
    expect(
      component
        .getStatusBadge('CANCELLED')
        .label
    ).toBe('Cancelada');
  });

  it('devuelve badge EXPIRED', () => {
    expect(
      component
        .getStatusBadge('EXPIRED')
        .label
    ).toBe('Expirada');
  });

  it('devuelve badge COMPLETED', () => {
    expect(
      component
        .getStatusBadge('COMPLETED')
        .label
    ).toBe('Finalizada');
  });

  it('devuelve badge FINISHED', () => {
    expect(
      component
        .getStatusBadge('FINISHED')
        .label
    ).toBe('Finalizada');
  });

  it('devuelve badge por defecto', () => {
    expect(
      component
        .getStatusBadge('OTRO')
        .label
    ).toBe('OTRO');
  });

  // ======================================================
  // ABRIR RESERVA
  // ======================================================

  it('abre reserva TEMPORAL vigente en payment', () => {
    component.openReservation({
      ...temporal,
      secondsRemaining: 120,
    });

    expect(
      reservationService
        .navigateToReservation
    ).toHaveBeenCalledWith(
      '/payment',
      temporal.id
    );
  });

  it('abre reserva temporal vencida en booking-confirmation', () => {
    component.openReservation({
      ...temporal,
      secondsRemaining: 0,
    });

    expect(
      reservationService
        .navigateToReservation
    ).toHaveBeenCalledWith(
      '/booking-confirmation',
      temporal.id
    );
  });

  it('abre reserva confirmada en booking-confirmation', () => {
    component.openReservation(
      confirmed
    );

    expect(
      reservationService
        .navigateToReservation
    ).toHaveBeenCalledWith(
      '/booking-confirmation',
      confirmed.id
    );
  });

  it('maneja error al abrir reserva', () => {
    reservationService
      .navigateToReservation
      .and.returnValue(
        throwError(() => new Error())
      );

    component.openReservation(
      confirmed
    );

    expect(component.errorMessage)
      .toContain('No se pudo abrir');
  });

  // ======================================================
  // NAVEGACIÓN
  // ======================================================

  it('navega a nueva reserva', () => {
    component.newReservation();

    expect(router.navigate)
      .toHaveBeenCalledWith(
        ['/courts']
      );
  });

  it('navega al detalle de cancha', () => {
    component.goDetail(5);

    expect(router.navigate)
      .toHaveBeenCalledWith(
        [
          '/court-detail',
          5,
        ]
      );
  });
});