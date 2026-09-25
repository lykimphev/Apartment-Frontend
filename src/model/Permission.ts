export interface Permission {
  id: number;
  name: string;
  description?: string;
}

export interface PermissionReq {
  name: string;
  description?: string;
}

export interface AssignRolePermissionsReq {
  roleId: number;
  permissionIds: number[];
}
