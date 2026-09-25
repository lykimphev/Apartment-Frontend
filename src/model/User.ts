export interface User {
  id: number;
  username: string;
  email?: string;
  fullName?: string;
  isActive: number;
  createdAt: string;
}

export interface RegisterReq {
  username: string;
  email?: string;
  fullName?: string;
  password: string;
}

export interface UserUpdateReq {
  email?: string;
  fullName?: string;
  isActive: number;
}

