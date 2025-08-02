// import { TestBed } from '@angular/core/testing';
// import { CanActivateFn } from '@angular/router';
//
// import { guestGuardGuard } from './guest-guard.guard';
//
// describe('guestGuardGuard', () => {
//   const executeGuard: CanActivateFn = (...guardParameters) =>
//       TestBed.runInInjectionContext(() => guestGuardGuard(...guardParameters));
//
//   beforeEach(() => {
//     TestBed.configureTestingModule({});
//   });
//
//   it('should be created', () => {
//     expect(executeGuard).toBeTruthy();
//   });
// });
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { GuestGuard } from './guest-guard.guard';

describe('GuestGuard', () => {
  let guard: GuestGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GuestGuard]
    });
    guard = TestBed.inject(GuestGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should allow or block access depending on logic', async () => {
    const route = {} as ActivatedRouteSnapshot;
    const state = {} as RouterStateSnapshot;

    const result = guard.canActivate(route, state);

    await expectAsync(result).toBeResolved(); // hoặc .toBeResolvedTo(true/false)
  });
});
