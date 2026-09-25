export interface Role {
  id: number;
  name: string;
  description?: string;
  isActive: number;
}

export interface RoleReq {
  name: string;
  description?: string;
  isActive: number;
}
