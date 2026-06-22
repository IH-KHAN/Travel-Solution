import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HotelBookingDetailComponent } from './hotel-booking-detail.component';

describe('HotelBookingDetailComponent', () => {
  let component: HotelBookingDetailComponent;
  let fixture: ComponentFixture<HotelBookingDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HotelBookingDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HotelBookingDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
