import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@core/authentication/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { filter } from 'rxjs/operators';
import { AuthSignin } from '@core/authentication/models';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private auth: AuthService,
    private toaster: ToastrService
  ) {}

  ngOnInit() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(8)]],
      rememberMe: [false],
    });
  }

  get username() {
    return this.loginForm.get('username');
  }

  get password() {
    return this.loginForm.get('password');
  }

  get email() {
    return this.loginForm.get('email');
  }

  get rememberMe() {
    return this.loginForm.get('rememberMe');
  }

  login() {
    const authSignin: AuthSignin = this.loginForm.value;

    this.auth
      .login(authSignin)
      .pipe(filter(authenticated => authenticated))
      .subscribe(
        () => this.router.navigateByUrl('/'),
        (error: HttpErrorResponse) => {}
      );
  }

}
