export interface signInType {
  email: string;
  password: string;
}

interface signInInside {
  email: string;
  _accessToken: string;
  _refreshToken: string;
  userId: string;
}

export interface signInResponse {
  response: signInInside;
}
