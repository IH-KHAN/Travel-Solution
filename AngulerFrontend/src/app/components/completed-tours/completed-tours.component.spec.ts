import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompletedToursComponent } from './completed-tours.component';

describe('CompletedToursComponent', () => {
  let component: CompletedToursComponent;
  let fixture: ComponentFixture<CompletedToursComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CompletedToursComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompletedToursComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
