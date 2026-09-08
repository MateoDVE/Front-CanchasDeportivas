import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AdminDashboardComponent } from './admin-dashboard';
import { AdminService, StaffItem } from '../../services/admin.service';
import { ComplexService } from '../../services/complex.service';
import { CourtService } from '../../services/court.service';
import { ConfirmationService } from '../../services/confirmation.service';

describe('Admin staff status', () => {
  let component: AdminDashboardComponent;
  let api: jasmine.SpyObj<AdminService>;
  let confirmation: jasmine.SpyObj<ConfirmationService>;
  const member = { id: 'staff', name: 'Secretaria', status: 'ACTIVE' } as StaffItem;
  beforeEach(() => {
    api = jasmine.createSpyObj('AdminService', ['updateStaffStatus', 'listStaff']);
    api.updateStaffStatus.and.returnValue(of({ ...member, status: 'INACTIVE' }));
    api.listStaff.and.returnValue(of([{ ...member, status: 'INACTIVE' }]));
    confirmation = jasmine.createSpyObj('ConfirmationService', ['confirm']);
    confirmation.confirm.and.resolveTo(true);
    TestBed.configureTestingModule({ providers: [
      { provide: AdminService, useValue: api },
      { provide: ComplexService, useValue: {} },
      { provide: CourtService, useValue: {} },
      { provide: ConfirmationService, useValue: confirmation },
    ] });
    component = TestBed.runInInjectionContext(() => new AdminDashboardComponent());
  });
  it('deactivates an active member using the API enum and refreshes the list', async () => {
    await component.toggleStaffStatus(member);
    expect(api.updateStaffStatus).toHaveBeenCalledWith('staff', 'INACTIVE');
    expect(component.staffList()[0].status).toBe('INACTIVE');
  });
  it('reactivates an inactive member', async () => {
    await component.toggleStaffStatus({ ...member, status: 'INACTIVE' });
    expect(api.updateStaffStatus).toHaveBeenCalledWith('staff', 'ACTIVE');
  });
  it('does not change status when confirmation is cancelled', async () => {
    confirmation.confirm.and.resolveTo(false);
    await component.toggleStaffStatus(member);
    expect(api.updateStaffStatus).not.toHaveBeenCalled();
  });
});
