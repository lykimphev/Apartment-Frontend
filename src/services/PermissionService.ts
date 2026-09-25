import apiClient from "../apis/apiClient";
import type { ApiResponse } from "../apis/apiResponse";
import type {
  Permission,
  PermissionReq,
  AssignRolePermissionsReq,
} from "../model/Permission";

const END_POINT = "/Permission";

export const PermissionService = {
  // GET /api/Permission
  getAll: async (): Promise<ApiResponse<Permission[]>> => {
    return await apiClient.get(END_POINT);
  },

  // GET /api/Permission/{id}
  getById: async (id: number): Promise<ApiResponse<Permission>> => {
    return await apiClient.get(`${END_POINT}/${id}`);
  },

  // POST /api/Permission
  create: async (data: PermissionReq): Promise<ApiResponse<Permission>> => {
    return await apiClient.post(END_POINT, data);
  },

  // PUT /api/Permission/{id}
  update: async (
    id: number,
    data: PermissionReq
  ): Promise<ApiResponse<Permission>> => {
    return await apiClient.put(`${END_POINT}/${id}`, data);
  },

  // DELETE /api/Permission/{id}
  delete: async (id: number): Promise<ApiResponse<object>> => {
    return await apiClient.delete(`${END_POINT}/${id}`);
  },

  // GET /api/Permission/role/{roleId}
  getByRole: async (roleId: number): Promise<ApiResponse<Permission[]>> => {
    return await apiClient.get(`${END_POINT}/role/${roleId}`);
  },

  // POST /api/Permission/assign-to-role
  assignToRole: async (
    data: AssignRolePermissionsReq
  ): Promise<ApiResponse<object>> => {
    return await apiClient.post(`${END_POINT}/assign-to-role`, data);
  },
};
