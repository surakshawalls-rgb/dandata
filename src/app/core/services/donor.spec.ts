import { TestBed } from '@angular/core/testing';

import { Donor } from './donor';

describe('Donor', () => {
  let service: Donor;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Donor);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
