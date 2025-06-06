import { IUserPayload } from './IUserPayload';

export interface SuccessRegister {
  message: string;
}

export interface SuccessLogin {
  message: string;
  user?: IUserPayload;
  token?: string;
}

export interface UpdateUserProfile {
  email?: string;
  lastName?: string;
  firstName?: string;
  photo?: string;
  username?: string;
}
