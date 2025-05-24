import { Component } from '@angular/core';
import {AuthService} from '../../../Services/auth.service';
import {Router, RouterModule} from '@angular/router';

// Importing Angular Material modules for form field, input, button, and icon
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';


@Component({
  selector: 'app-sign-in',
  imports: [ MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    FormsModule,
    RouterModule,
    ReactiveFormsModule,],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.css',
  standalone: true,
})

export class SignInComponent {
  email = '';
  password = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  async handleSignIn() {
    if (!this.email || !this.password) {
      alert('Vui lòng nhập đầy đủ email và mật khẩu');
      return;
    }

    try {
      const role = await this.authService.signIn(this.email, this.password);

      // Phân quyền: chuyển hướng theo role
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
