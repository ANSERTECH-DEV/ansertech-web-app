import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent {
  email = '';
  password = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(): void {  
    this.authService.login({email:this.email, password:this.password}).subscribe({
      next: (res:any) => {
        if (res.success && res.data.token){
          this.authService.saveToken(res.data.token);
        }
        this.router.navigate(['/cotizaciones']);
      },
      error: (err) => {
        console.error(err);
        
      }
    });
    // if (this.authService.login({email:this.email, password:this.password})) {
    //   this.router.navigate(['/cotizaciones']);
    // }
  }
}
