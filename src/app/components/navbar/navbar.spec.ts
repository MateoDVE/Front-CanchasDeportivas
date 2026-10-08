import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';

import {
  NavigationEnd,
  Router,
} from '@angular/router';

import {
  Subject,
} from 'rxjs';

import {
  NavbarComponent,
} from './navbar';

import {
  AuthService,
} from '../../services/auth.service';

import {
  ConfirmationService,
} from '../../services/confirmation.service';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture:
    ComponentFixture<NavbarComponent>;

  let routerEvents:
    Subject<any>;

  let routerMock: any;
  let authMock: any;
  let confirmationMock: any;

  beforeEach(async () => {
    routerEvents = new Subject();

    routerMock = {
      url: '/',
      events: routerEvents.asObservable(),
      navigate:
        jasmine
          .createSpy('navigate')
          .and.resolveTo(true),
    };

    authMock = {
      isLoggedIn:
        jasmine
          .createSpy('isLoggedIn')
          .and.returnValue(false),

      currentUser:
        jasmine
          .createSpy('currentUser')
          .and.returnValue(null),

      logout:
        jasmine.createSpy('logout'),
    };

    confirmationMock = {
      confirm:
        jasmine
          .createSpy('confirm')
          .and.resolveTo(true),
    };

    await TestBed.configureTestingModule({
      imports: [NavbarComponent],
      providers: [
        {
          provide: Router,
          useValue: routerMock,
        },
        {
          provide: AuthService,
          useValue: authMock,
        },
        {
          provide:
            ConfirmationService,
          useValue: confirmationMock,
        },
      ],
    }).compileComponents();

    fixture =
      TestBed.createComponent(
        NavbarComponent
      );

    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should detect landing page', () => {
    expect(component.activePage())
      .toBe('landing');
  });

  it('should use currentPage input', () => {
    component.currentPage = 'admin';

    expect(component.activePage())
      .toBe('admin');
  });

  it('should detect admin route', () => {
    routerEvents.next(
      new NavigationEnd(
        1,
        '/admin',
        '/admin'
      )
    );

    expect(component.activePage())
      .toBe('admin');
  });

  it('should navigate to courts', () => {
    component.navigate('courts');

    expect(routerMock.navigate)
      .toHaveBeenCalledWith(
        ['/courts']
      );
  });

  it('should navigate to login', () => {
    component.navigate('login');

    expect(routerMock.navigate)
      .toHaveBeenCalledWith(
        ['/login']
      );
  });

  it('should redirect unauthenticated user to login', () => {
    authMock.isLoggedIn
      .and.returnValue(false);

    component.navigate(
      'my-reservations'
    );

    expect(routerMock.navigate)
      .toHaveBeenCalledWith(
        ['/login'],
        {
          queryParams: {
            returnUrl:
              '/my-reservations',
          },
        }
      );
  });

  it('should navigate authenticated user to reservations', () => {
    authMock.isLoggedIn
      .and.returnValue(true);

    component.navigate(
      'my-reservations'
    );

    expect(routerMock.navigate)
      .toHaveBeenCalledWith(
        ['/my-reservations']
      );
  });

  it('should logout when confirmation is accepted', async () => {
    confirmationMock.confirm
      .and.resolveTo(true);

    component.mobileOpen = true;

    await component.logout();

    expect(component.mobileOpen)
      .toBeFalse();

    expect(authMock.logout)
      .toHaveBeenCalled();
  });

  it('should not logout when confirmation is cancelled', async () => {
    confirmationMock.confirm
      .and.resolveTo(false);

    await component.logout();

    expect(authMock.logout)
      .not.toHaveBeenCalled();
  });

  it('should return initials for two names', () => {
    authMock.currentUser
      .and.returnValue({
        name: 'Juan Perez',
        role: 'CLIENTE',
      });

    expect(component.userInitials())
      .toBe('JP');
  });

  it('should return U when user does not exist', () => {
    authMock.currentUser
      .and.returnValue(null);

    expect(component.userInitials())
      .toBe('U');
  });
});