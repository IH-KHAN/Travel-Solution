import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DistrictFormComponent } from './district-form.component';

describe('DistrictFormComponent', () => {
  let component: DistrictFormComponent;
  let fixture: ComponentFixture<DistrictFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DistrictFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DistrictFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
