import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';

import {
  CourtCoverComponent,
} from './court-cover';

describe('CourtCoverComponent', () => {
  let component: CourtCoverComponent;
  let fixture:
    ComponentFixture<CourtCoverComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CourtCoverComponent],
    }).compileComponents();

    fixture =
      TestBed.createComponent(
        CourtCoverComponent
      );

    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should do nothing when no file exists', () => {
    const input =
      document.createElement('input');

    const event = {
      target: input,
    } as unknown as Event;

    component.select(event);

    expect(component.error()).toBe('');
  });

  it('should reject invalid file type', () => {
    const file = new File(
      ['abc'],
      'document.txt',
      {
        type: 'text/plain',
      }
    );

    const input =
      document.createElement('input');

    Object.defineProperty(
      input,
      'files',
      {
        value: [file],
      }
    );

    component.select({
      target: input,
    } as unknown as Event);

    expect(component.error()).toContain(
      'Selecciona una imagen'
    );
  });

  it('should reject image larger than 2 MB', () => {
    const content =
      new Uint8Array(
        2 * 1024 * 1024 + 1
      );

    const file = new File(
      [content],
      'large.png',
      {
        type: 'image/png',
      }
    );

    const input =
      document.createElement('input');

    Object.defineProperty(
      input,
      'files',
      {
        value: [file],
      }
    );

    component.select({
      target: input,
    } as unknown as Event);

    expect(component.error()).toContain(
      'hasta 2 MB'
    );
  });
});