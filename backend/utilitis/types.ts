export type JWTPayloadType = {
  id: string;
  role: string;
};

export type AccessTokenType = {
  accessToken: string;
};
export interface JwtPayload {
  id: string;      
  email: string;
  role: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export type Ids = {
  paymentId: string;
  payerId: string;
  orderId: string;
};