export interface UserTokenPayload {
  sub: string;
  email: string;
  name?: string;
  picture?: string;
  [key: string]: unknown;
}

export interface AuthTokens {
  accessToken: string;
  user: UserTokenPayload;
}
