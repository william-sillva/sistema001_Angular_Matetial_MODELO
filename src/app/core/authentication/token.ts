import { capitalize, now, timeLeft } from '@core/authentication/helpers';
import { RefreshToken, Token } from '@core/authentication/interface';

export class SimpleToken implements RefreshToken {
  refresh = false;
  email = '';
  accessToken = '';
  tokenType = '';
  exp = 0;

  constructor(attributes: any) {
    Object.assign(this, attributes || {});
  }

  public static create(token: Token) {
    const email = token.email || '';
    const accessToken = token.access_token || '';
    const role = token.role || '';
    const tokenType = token.token_type || 'Bearer';
    const expiresIn = token.expires_in || 0;
    const exp = expiresIn <= 0 ? 0 : now() + expiresIn * 1000;

    return new SimpleToken({ email, accessToken, role, tokenType, exp });
  }

  valid() {
    return !!this.accessToken && !this.isExpired();
  }

  isExpired() {
    return this.exp !== 0 && this.exp - now() < 0;
  }

  headerValue() {
    return !!this.accessToken ? [capitalize(this.tokenType), this.accessToken].join(' ') : '';
  }

  refreshTime() {
    return timeLeft(this.exp - 5000);
  }

  clone(attributes: any = {}) {
    return new SimpleToken(Object.assign({}, this, attributes));
  }
}
