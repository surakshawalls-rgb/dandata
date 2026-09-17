import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecurringDonationsComponent } from './recurring-donations.component';

describe('RecurringDonationsComponent', () => {
  let component: RecurringDonationsComponent;
  let fixture: ComponentFixture<RecurringDonationsComponent>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RecurringDonationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
