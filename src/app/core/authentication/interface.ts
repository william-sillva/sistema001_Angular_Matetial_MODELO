export interface User {
  [propName: string]: any;
  id: number | string | null;
  name?: string;
  email?: string;
  avatar?: string;
}

export interface Token {
  email?: string;
  access_token?: string;
  role?: string;
  token_type?: string;
  expires_in?: number;
}

export interface RefreshToken {
  refresh: boolean;
  email: string;
  accessToken: string;
  tokenType: string;
  exp: number;
  refreshTime: () => number;
  valid: () => boolean;
}

export interface ResponseDefault {
  data?: any,
  errors?: any
}
