import apiClient from "../apis/apiClient";
import type { ApiResponse } from "../apis/apiResponse";
import type { Role, RoleReq } from "../model/Role";

const END_POINT = "/Role";

export const RoleService = {
  getRoles: async (): Promise<ApiResponse<Role[]>> => {
    return await apiClient.get(`${END_POINT}`);
  },

  getRoleById: async (id: number): Promise<ApiResponse<Role>> => {
    return await apiClient.get(`${END_POINT}/${id}`);
  },

  createRole: async (data: RoleReq): Promise<ApiResponse<Role>> => {
    return await apiClient.post(`${END_POINT}`, data);
  },

  updateRole: async (
    id: number,
    data: RoleReq
  ): Promise<ApiResponse<string>> => {
    return await apiClient.put(`${END_POINT}/${id}`, data);
  },

  deleteRole: async (id: number): Promise<ApiResponse<any>> => {
    return await apiClient.delete(`${END_POINT}/${id}`);
  },
};
