import type { Position } from "./Position";

export interface StaffRes {
  id: number;
  positionId?: number;
  position?: Position;
  name: string;
  nameKh?: string;
  sex?: string;
  dob?: string;
  phone?: string;
  address?: string;
  email?: string;
  identityNo?: string;
  photo?: string;
  status?: string;
  createDate?: string;
  createBy?: number;
}

export interface StaffReq {
  positionId?: number;
  name: string;
  nameKh?: string;
  sex?: string;
  dob?: string;
  phone?: string;
  address?: string;
  email?: string;
  identityNo?: string;
  photo?: File | null;
  status?: string;
  createBy?: number;
}
