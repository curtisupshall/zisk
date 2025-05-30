export interface SessionResponse {
  ok: boolean,
  userCtx: {
    name: string,
    roles: string[]
  },
  info: {
    authentication_handlers: string[],
    authenticated: string
  }
}

export interface UserClaims {
  name: string
  roles: string[]
}

export interface RefreshTokenClaims {
  name: string
}

export interface Credentials {
  username: string
  password: string;
}

export interface CouchDBUserDocument {
  _id: string;
  _rev: string;
  name: string;
  roles: string[];
  type: string;
  refreshTokens?: string[];
  [key: string]: any;
}
