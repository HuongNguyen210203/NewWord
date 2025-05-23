import { Component } from '@angular/core';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {AuthService} from '../../../Services/auth.service';
import {RouterModule} from '@angular/router';

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

  constructor(private authService: AuthService) {}

  async handleSignUp() {
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
      // Bạn có thể chuyển hướng đến trang login tại đây
    } catch (error: any) {
      alert(error.message || 'Đã xảy ra lỗi khi đăng ký');
    }
  }
}
