import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompletedTourDetailModalComponent } from './completed-tour-detail-modal.component';

describe('CompletedTourDetailModalComponent', () => {
  let component: CompletedTourDetailModalComponent;
  let fixture: ComponentFixture<CompletedTourDetailModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CompletedTourDetailModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompletedTourDetailModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
