import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent {
  constructor(private authService: AuthService, private router: Router) {}

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
