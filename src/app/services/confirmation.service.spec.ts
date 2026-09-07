import { ConfirmationService } from './confirmation.service';

describe('ConfirmationService', () => {
  let service: ConfirmationService;
  beforeEach(() => service = new ConfirmationService());

  it('does not authorize an action when cancelled', async () => {
    const result = service.confirm({ title: 'Cerrar caja', message: 'Revisa el monto.' });
    service.answer(false);
    expect(await result).toBeFalse();
    expect(service.request()).toBeNull();
  });

  it('authorizes only the pending request and ignores duplicate clicks', async () => {
    const first = service.confirm({ title: 'Primera acción', message: 'Confirmar.' });
    const duplicate = service.confirm({ title: 'Segunda acción', message: 'Confirmar.' });
    expect(await duplicate).toBeFalse();
    expect(service.request()?.title).toBe('Primera acción');
    service.answer(true);
    expect(await first).toBeTrue();
    service.answer(true);
    expect(service.request()).toBeNull();
  });

  it('accepts another request after cancellation', async () => {
    const first = service.confirm({ title: 'Primera acción', message: '' });
    service.answer(false);
    await first;
    const second = service.confirm({ title: 'Segunda acción', message: '' });
    service.answer(true);
    expect(await second).toBeTrue();
  });
});
