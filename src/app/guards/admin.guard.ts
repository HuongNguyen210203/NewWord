// src/app/guards/admin.guard.ts
import { Injectable } from '@angular/core';
import {
  CanActivate,
  Router,
  UrlTree
} from '@angular/router';
import { supabase } from '../supabase.client';

@Injectable({
  providedIn: 'root',
})
export class AdminGuard implements CanActivate {
  constructor(private router: Router) {}

  async canActivate(): Promise<boolean | UrlTree> {
    const { data: sessionData } = await supabase.auth.getUser();
    const user = sessionData.user;

    if (!user) {
      return this.router.parseUrl('/signin');
    }

    const { data, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (error || !data || data.role !== 'admin') {
      alert('❌ You do not have access to admin pages.');
      return this.router.parseUrl('/home');
    }

    return true;
  }
}
