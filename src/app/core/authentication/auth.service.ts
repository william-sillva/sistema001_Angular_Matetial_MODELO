import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable, of} from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map, share, switchMap, tap } from 'rxjs/operators';
import { TokenService } from './token.service';
import {ResponseDefault, Token, User} from './interface';
import { guest } from './user';
import {AuthSignin} from '@core/authentication/models';
import { environment as env } from '../../../../src/environments/environment';
import {Router} from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private readonly PATH: string = 'auth';
  private readonly ADMIN: string = 'ROLE_ADMIN';
  private user$ = new BehaviorSubject<User>(guest);
  private readonly PATH_GET_USER_EMAIL = 'users/getuserbyemail';

  constructor(
    private http: HttpClient,
    private token: TokenService,
    private router: Router) {

    this.token
      .change()
      .subscribe(
        data => {
          if (data && data.accessToken) {
            this.handleDataUser();
          }
          // this.user$.next(Object.assign({}, guest, user));
        }
      );

    this.token
      .refresh()
      .pipe(switchMap(() => this.refresh()))
      .subscribe();
  }

  check() {
    return this.token.valid();
  }

  // login(email: string, password: string, rememberMe = false) {
  //  let token = this.http.post(env.baseUrl.concat(this.PATH), authSignin);
  //  return token;
  // }

  login(authSignin: AuthSignin): Observable<any> {
    return this.http
      .post<Token>(env.baseUrl.concat(this.PATH), authSignin)
      .pipe(
        tap(data => this.token.handleToken(data)),
        map(() => this.check())
      );
  }

  refresh() {
    return this.http.post<Token>('/auth/refresh', {}).pipe(
      tap(token => this.token.set(token, true)),
      map(() => this.check())
    );
  }

  logout() {
    this.token.clear();
    this.router.navigateByUrl('/auth/login').then();

    // return this.http.post('/auth/logout', {}).pipe(
    //   tap(() => this.token.clear()),
    //   map(() => !this.check())
    // );
  }

  user() {
    return this.user$.pipe(share());
  }

  getUser() {
    return this.http
      .post<ResponseDefault>(
        env.baseApiUrl.concat(this.PATH_GET_USER_EMAIL),
        {'email': this.token.get().email});
  }

  handleDataUser() {
    this.getUser()
      .subscribe(result => {
        if (result.data) {
          let userLogged = result.data;
          let userReq = {
            id: userLogged.id,
            name: userLogged.name,
            email: userLogged.email,
            avatar: this.getAvatar(userLogged),
          }

          this.user$.next(Object.assign({}, guest, userReq));
        }
      });
  }

  getAvatar(user) {
    let avatarString = './assets/images/avatar-default.jpg';
    if (this.ADMIN === user.profile) {
      avatarString = './assets/images/avatars/avatar-3.jpg';
    }

    return avatarString;
  }
}
