import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-sign-in',
  template: `
    <form (ngSubmit)="handleSignIn()">
      <input [(ngModel)]="email" name="email"/>
      <input [(ngModel)]="password" name="password"/>
      <button type="submit">Sign In</button>
    </form>
  `,
  imports: [
    FormsModule
  ],
  standalone: true
})
export class FakeSignInComponent {
  email = '';
  password = '';

  constructor(public authService: any, public router: Router) {}

  async handleSignIn() {
    if (!this.email || !this.password) {
      alert('Vui lòng nhập đầy đủ email và mật khẩu');
      return;
    }

    try {
      const role = await this.authService.signIn(this.email, this.password);
      if (role === 'admin') {
        this.router.navigate(['/admin']);
      } else {
        this.router.navigate(['/home']);
      }
    } catch (error: any) {
      alert(error.message || 'Đăng nhập thất bại');
    }
  }
}
