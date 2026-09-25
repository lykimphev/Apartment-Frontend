import type { Role } from "./Role";

export interface UserRole {
  userId: number;
  username: string;
  fullName?: string;
  email?: string;
  roles: Role[];
}

export interface AssignRoleReq {
  userId: number;
  roleId: number;
}

export interface AssignRolesReq {
  userId: number;
  roleIds: number[];
}
