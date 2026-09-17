import { TestBed } from '@angular/core/testing';

import { RecurringDonation } from './recurring-donation';

describe('RecurringDonation', () => {
  let service: RecurringDonation;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RecurringDonation);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
