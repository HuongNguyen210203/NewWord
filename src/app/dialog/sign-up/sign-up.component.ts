import { Component } from '@angular/core';
import {AuthService} from '../../../Services/auth.service';
import {RouterModule} from '@angular/router';
import { Router } from '@angular/router';
//Material Imports
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

@Component({
  selector: 'app-sign-up',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    FormsModule,
    RouterModule,
    ReactiveFormsModule,
  ],
  standalone:true,
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.css'
})
export class SignUpComponent {
  email = '';
  password = '';
  rePassword = '';
  name = '';
  birth = '';

  constructor(
    private authService: AuthService,
    private router: Router) {}
  async handleSignUp() {
    this.email = this.email.trim(); // ✅ loại bỏ khoảng trắng đầu/cuối

    // ✅ Kiểm tra định dạng email cơ bản
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      alert('Email không hợp lệ');
      return;
    }

    if (!this.email || !this.password || !this.rePassword) {
      alert('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    if (this.password !== this.rePassword) {
      alert('Mật khẩu không khớp');
      return;
    }

    try {
      await this.authService.signUp(this.email, this.password, this.name, this.birth);
      alert('Đăng ký thành công!');
      // Chuyển đến trang đăng nhập sau khi đăng ký
      this.router.navigate(['/signin']);
    } catch (error: any) {
      console.error('Đăng ký lỗi:', error);
      if (error.message.includes('is invalid') || error.message.includes('already registered')) {
        alert('Email đã được đăng ký hoặc không hợp lệ.');
      } else {
        alert(error.message || 'Đã xảy ra lỗi khi đăng ký');
      }
    }
  }
}
