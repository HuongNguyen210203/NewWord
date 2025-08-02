import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { supabase } from '../supabase.client';

@Injectable({ providedIn: 'root' })
export class GuestGuard implements CanActivate {
  constructor(private router: Router) {}

  async canActivate(route: unknown, state: unknown): Promise<boolean | UrlTree> {
    const { data: sessionData } = await supabase.auth.getUser();
    const user = sessionData.user;

    if (user) {
      // 🔀 Nếu đã đăng nhập, redirect về /home
      return this.router.parseUrl('/home');
    }

    return true;
  }
}
