import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, timer} from 'rxjs';
import { filter, map, share, switchMap, tap} from 'rxjs/operators';
import { LocalStorageService } from '../../shared/services/storage.service';
import { RefreshToken, Token, User} from './interface';
import { SimpleToken } from './token';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  private key = 'TOKEN';
  private token: SimpleToken;
  private change$ = new BehaviorSubject<RefreshToken>(this.get());

  constructor(
    private store: LocalStorageService,
  ) {}

  handleToken(strToken: any) {
    // let dataToken = JSON.parse(atob(localStorage['token'].split('.')[1]));
    let dataToken = JSON.parse(atob(strToken.data.token.split('.')[1]));
    let token: Token = {
      email: dataToken.sub,
      role: dataToken.role,
      access_token: strToken.data.token,
      token_type: 'Bearer',
      expires_in: dataToken.exp
    }

    this.set(token);
  }

  set(token: Token, refresh = false) {
    this.token = SimpleToken.create(token);
    this.store.set(this.key, this.token);
    this.change$.next(this.token.clone({ refresh }));

    return this;
  }

  get() {
    if (!this.token) {
      this.token = new SimpleToken(this.store.get(this.key));
    }

    return this.token;
  }

  clear() {
    this.store.remove(this.key);
    this.change$.next(null);
    this.token = null;
  }

  change() {
    return this.change$.pipe(
      filter(token => !token || !token.refresh),
      share()
    );
  }

  refresh() {
    return this.change$.pipe(
      filter(() => !!this.token && this.token.exp > 0),
      switchMap(() => timer(this.token.refreshTime())),
      filter(() => this.valid()),
      map(() => this.token),
      share()
    );
  }

  valid() {
    return !!this.token && this.token.valid();
  }

  headerValue() {
    return this.token.headerValue();
  }
}
