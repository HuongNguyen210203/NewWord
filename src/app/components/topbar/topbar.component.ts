import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatToolbar } from '@angular/material/toolbar';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { supabase } from '../../supabase.client';
import {Router} from '@angular/router';
import {UserService} from '../../../Services/user.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [MatToolbar, MatIconButton, MatIcon],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.css'
})
export class TopbarComponent implements OnInit {

  constructor ( private  router: Router,
                private userService: UserService) {}
  @Output() menuClick = new EventEmitter<void>();
  avatarUrl: string = 'https://via.placeholder.com/40';

  async ngOnInit() {
    // 👇 Subscribe avatar khi có thay đổi từ profile
    this.userService.avatarUrl$.subscribe(url => {
      this.avatarUrl = url;
    });

    // 👇 Load avatar ban đầu từ Supabase
    const { data: authData, error } = await supabase.auth.getUser();
    if (error || !authData.user) return;

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('avatar_url')
      .eq('id', authData.user.id)
      .maybeSingle();

    if (!userError && userData?.avatar_url) {
      this.userService.setAvatarUrl(userData.avatar_url); // 🔄 Đẩy avatar vào BehaviorSubject
    }
  }


  onMenuClick() {
    this.menuClick.emit();
  }

  goToHome() {
    this.router.navigate(['/home']);
  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }


}
