import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Seat } from './seat';

describe('Seat', () => {
  let component: Seat;
  let fixture: ComponentFixture<Seat>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Seat]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Seat);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
