import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatIconModule, MatButtonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  hidePassword = true;
  errorMessage = '';
  sessionExpired = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private apiService: ApiService
  ) { }

  ngOnInit(): void {
    // If already logged in with a valid token, redirect to dashboard
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp && payload.exp > Math.floor(Date.now() / 1000)) {
          this.router.navigate(['/dashboard']);
          return;
        }
      } catch { /* invalid token, stay on login */ }
    }

    // Check if redirected here because of an expired session
    this.route.queryParams.subscribe(params => {
      this.sessionExpired = params['expired'] === 'true';
    });

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;

      this.apiService.create<any>('Users/login', { email, password }).subscribe({
        next: (res) => {
          if (res && res.token) {
            localStorage.setItem('token', res.token);

            // Decode token to extract UserId and UserName for use across the app
            try {
              const payload = JSON.parse(atob(res.token.split('.')[1]));
              const userId = payload['UserId'] || payload['userId'] || '';
              const userName = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name']
                || payload['unique_name'] || payload['name'] || email;
              localStorage.setItem('userId', userId);
              localStorage.setItem('userName', userName);
            } catch { /* keep going even if decode fails */ }

            const userRole = res.role || 'User';
            localStorage.setItem('role', userRole);
            if (userRole === 'Agent') {
              this.router.navigate(['/agent/dashboard']);
            } else {
              this.router.navigate(['/dashboard']);
            }
          }
        },
        error: () => {
          this.errorMessage = 'Invalid email or password. Please try again.';
        }
      });
    }
  }
}
