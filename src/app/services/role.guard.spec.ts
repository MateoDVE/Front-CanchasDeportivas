import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { firstValueFrom, of, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { roleGuard } from './role.guard';

describe('Protección de páginas', () => {
  let auth: any;
  beforeEach(() => {
    auth = { isLoggedIn: () => true, getProfile: jasmine.createSpy().and.returnValue(of({ role: 'CLIENTE', status: 'ACTIVE' })) };
    TestBed.configureTestingModule({ providers: [provideRouter([]), { provide: AuthService, useValue: auth }] });
  });
  async function run(roles?: string[]): Promise<any> {
    const result = TestBed.runInInjectionContext(() => roleGuard({ data: { roles } } as any, { url: '/admin' } as any));
    return result && typeof (result as any).subscribe === 'function' ? firstValueFrom(result as any) : result;
  }
  it('redirige sin sesión', async () => {
    auth.isLoggedIn = () => false;
    expect(TestBed.inject(Router).serializeUrl(await run())).toContain('/login');
    expect(auth.getProfile).not.toHaveBeenCalled();
  });
  it('consulta el rol real al servidor y bloquea a un cliente en admin', async () => {
    expect(TestBed.inject(Router).serializeUrl(await run(['ADMIN']))).toBe('/my-reservations');
  });
  it('rechaza sesión vencida y cuenta sin verificar', async () => {
    auth.getProfile.and.returnValue(throwError(() => ({ status: 401 })));
    expect(TestBed.inject(Router).serializeUrl(await run())).toContain('/login');
    auth.getProfile.and.returnValue(of({ status: 'PENDING_VERIFICATION', role: 'CLIENTE' }));
    expect(TestBed.inject(Router).serializeUrl(await run())).toContain('/login');
  });
  it('permite rol autorizado', async () => { expect(await run(['CLIENTE'])).toBeTrue(); });
});
