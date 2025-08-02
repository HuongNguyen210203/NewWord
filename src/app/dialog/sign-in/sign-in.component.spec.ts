import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SignInComponent } from './sign-in.component';
import { AuthService } from '../../../Services/auth.service';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

describe('SignInComponent – Sandwich Testing (Updated)', () => {
  let component: SignInComponent;
  let fixture: ComponentFixture<SignInComponent>;
  let mockAuthService: any;
  let mockRouter: any;

  beforeEach(async () => {
    mockAuthService = {
      signIn: jasmine.createSpy()
    };

    mockRouter = {
      navigate: jasmine.createSpy()
    };

    await TestBed.configureTestingModule({
      imports: [
        SignInComponent,
      ],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SignInComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // TOP-DOWN
  it('Đăng nhập thành công với vai trò admin', async () => {
    mockAuthService.signIn.and.returnValue(Promise.resolve('admin'));
    component.email = 'admin@mail.com';
    component.password = '123456';

    await component.handleSignIn();

    expect(mockAuthService.signIn).toHaveBeenCalledWith('admin@mail.com', '123456');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/admin']);
  });

  it('Thiếu mật khẩu → không gọi service', async () => {
    component.email = 'test@mail.com';
    component.password = '';

    await component.handleSignIn();

    expect(mockAuthService.signIn).not.toHaveBeenCalled();
  });

  it('Service trả lỗi → hiển thị alert lỗi', async () => {
    spyOn(window, 'alert');
    mockAuthService.signIn.and.returnValue(Promise.reject({ message: 'Sai mật khẩu' }));

    component.email = 'user@mail.com';
    component.password = 'sai';

    await component.handleSignIn();

    expect(window.alert).toHaveBeenCalledWith('Sai mật khẩu');
  });

  // MIDDLE LAYER
  it('Form đúng → phải gọi service', async () => {
    mockAuthService.signIn.and.returnValue(Promise.resolve('user'));
    component.email = 'user@mail.com';
    component.password = '123456';

    await component.handleSignIn();

    expect(mockAuthService.signIn).toHaveBeenCalled();
  });

  it('Form sai (thiếu email) → không gọi service', async () => {
    component.email = '';
    component.password = 'abc';

    await component.handleSignIn();

    expect(mockAuthService.signIn).not.toHaveBeenCalled();
  });
});

describe('Bottom-Up: AuthService (Full Mocked)', () => {
  class MockAuthService {
    signIn(email: string, password: string): Promise<string> {
      if (email === 'user@mail.com') {
        return Promise.resolve('user');
      }
      if (email === 'error@mail.com') {
        return Promise.reject(new Error('Lỗi Supabase'));
      }
      return Promise.reject(new Error('Không tìm thấy user'));
    }
  }

  let service: MockAuthService;

  beforeEach(() => {
    service = new MockAuthService();
  });

  it('Trả về vai trò user nếu user tồn tại', async () => {
    const role = await service.signIn('user@mail.com', '123456');
    expect(role).toBe('user');
  });

  it('Báo lỗi nếu không tìm thấy user', async () => {
    await expectAsync(service.signIn('nouser@mail.com', 'abc')).toBeRejectedWithError('Không tìm thấy user');
  });

  it('Báo lỗi nếu có lỗi Supabase', async () => {
    await expectAsync(service.signIn('error@mail.com', 'abc')).toBeRejectedWithError('Lỗi Supabase');
  });
});

