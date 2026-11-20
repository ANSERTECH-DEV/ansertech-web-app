import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent {
  /** Nombre que se muestra arriba a la derecha: users.full_name; si no hay, el correo. */
  displayName = 'Usuario';
  initials = 'U';
  email = '';

  constructor(private authService: AuthService, private router: Router) {
    const user = this.authService.getUser();
    this.email = user?.email ?? '';
    this.displayName = user?.fullName?.trim() || user?.email || 'Usuario';
    this.initials = MenuComponent.toInitials(user?.fullName?.trim() || user?.email || 'Usuario');
  }

  /** "Rony Piero Ticona Luque" → "RL" (primera y última palabra); "ana@x.pe" → "A". */
  static toInitials(text: string): string {
    const base = text.includes('@') ? text.split('@')[0] : text;
    const words = base.split(/[\s._-]+/).filter(Boolean);
    if (words.length === 0) return 'U';
    const first = words[0][0];
    const last = words.length > 1 ? words[words.length - 1][0] : '';
    return (first + (text.includes('@') ? '' : last)).toUpperCase();
  }

  /**
   * Logs out the current user and redirects to the login page.
   *
   * Calls the authentication service to clear the stored token,
   * then navigates to the '/login' route.
   */
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
