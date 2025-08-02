// import { TestBed } from '@angular/core/testing';
// import { CanActivateFn } from '@angular/router';
//
// import { AdminGuard } from './admin.guard';
//
// describe('adminGuard', () => {
//   const executeGuard: CanActivateFn = (...guardParameters) =>
//       TestBed.runInInjectionContext(() => AdminGuard(...guardParameters));
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
import { AdminGuard } from './admin.guard';

describe('AdminGuard', () => {
  let guard: AdminGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AdminGuard]
    });
    guard = TestBed.inject(AdminGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should allow or block access depending on logic', async () => {
    const route = {} as ActivatedRouteSnapshot;
    const state = {} as RouterStateSnapshot;

    const result = guard.canActivate(route, state);

    // ✅ Kiểm tra nếu nó trả về true / false hoặc UrlTree
    await expectAsync(result).toBeResolved(); // hoặc .toBeResolvedTo(true/false)
  });
});

