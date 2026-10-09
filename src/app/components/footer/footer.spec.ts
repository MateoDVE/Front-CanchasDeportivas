import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';

import {
  provideRouter,
  Router,
} from '@angular/router';

import { FooterComponent } from './footer';

describe('FooterComponent', () => {
  let component: FooterComponent;
  let fixture: ComponentFixture<FooterComponent>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FooterComponent],
      providers: [
        provideRouter([]),
      ],
    }).compileComponents();

    fixture =
      TestBed.createComponent(FooterComponent);

    component = fixture.componentInstance;
    router = TestBed.inject(Router);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should contain current year', () => {
    expect(component.year)
      .toBe(new Date().getFullYear());
  });

  it('should navigate to landing', () => {
    const spy = spyOn(
      router,
      'navigate'
    ).and.resolveTo(true);

    component.navigate('landing');

    expect(spy)
      .toHaveBeenCalledWith(['/']);
  });

  it('should not navigate for unknown page', () => {
    const spy = spyOn(
      router,
      'navigate'
    ).and.resolveTo(true);

    component.navigate('unknown');

    expect(spy)
      .not.toHaveBeenCalled();
  });
});