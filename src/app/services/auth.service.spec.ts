import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let router: jasmine.SpyObj<Router>;

  const user: any = {
    id: '1',
    name: 'Juan Perez',
    email: 'juan@test.com',
    phone: '70000000',
    ci: '123456',
    role: 'CLIENTE',
    status: 'ACTIVE',
    createdAt: '2026-10-08',
  };

  beforeEach(() => {
    localStorage.clear();

    router = jasmine.createSpyObj(
      'Router',
      ['navigate']
    );

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: Router,
          useValue: router,
        },
      ],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should login and store session', () => {
    const dto = {
      email: 'juan@test.com',
      password: '123456',
    };

    const response = {
      accessToken: 'TOKEN123',
      user,
    };

    service.login(dto).subscribe(result => {
      expect(result).toEqual(response);
      expect(service.token()).toBe('TOKEN123');
      expect(service.currentUser()).toEqual(user);
      expect(service.isLoggedIn()).toBeTrue();
    });

    const req = httpMock.expectOne(
      `${environment.apiUrl}/auth/login`
    );

    expect(req.request.method).toBe('POST');

    req.flush(response);

    expect(
      localStorage.getItem('access_token')
    ).toBe('TOKEN123');
  });

  it('should register user', () => {
    const dto = {
      name: 'Juan Perez',
      email: 'juan@test.com',
      phone: '70000000',
      ci: '123456',
      password: '123456',
    };

    service.register(dto).subscribe(result => {
      expect(result).toEqual(user);
    });

    const req = httpMock.expectOne(
      `${environment.apiUrl}/auth/register`
    );

    expect(req.request.method).toBe('POST');

    req.flush(user);
  });

  it('should get profile and store it', () => {
    service.getProfile().subscribe(result => {
      expect(result).toEqual(user);
      expect(service.currentUser()).toEqual(user);
    });

    const req = httpMock.expectOne(
      `${environment.apiUrl}/auth/me`
    );

    expect(req.request.method).toBe('GET');

    req.flush(user);

    expect(
      JSON.parse(
        localStorage.getItem('user_profile')!
      )
    ).toEqual(user);
  });

  it('should logout', () => {
    localStorage.setItem(
      'access_token',
      'TOKEN'
    );

    localStorage.setItem(
      'user_profile',
      JSON.stringify(user)
    );

    service.token.set('TOKEN');
    service.currentUser.set(user);

    service.logout();

    expect(service.token()).toBeNull();
    expect(service.currentUser()).toBeNull();
    expect(service.isLoggedIn()).toBeFalse();

    expect(
      localStorage.getItem('access_token')
    ).toBeNull();

    expect(router.navigate)
      .toHaveBeenCalledWith(['/login']);
  });
});