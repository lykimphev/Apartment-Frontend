import apiClient from "../apis/apiClient";
import type { ApiResponse } from "../apis/apiResponse";
import type { UserRole, AssignRoleReq, AssignRolesReq } from "../model/UserRole";

const END_POINT = "/user-roles";

export const UserRoleService = {
  getUserRoles: async (userId: number): Promise<ApiResponse<UserRole>> => {
    return await apiClient.get(`${END_POINT}/${userId}`);
  },

  assignRole: async (data: AssignRoleReq): Promise<ApiResponse<any>> => {
    return await apiClient.post(`${END_POINT}/assign`, data);
  },

  assignRoles: async (data: AssignRolesReq): Promise<ApiResponse<any>> => {
    return await apiClient.post(`${END_POINT}/assign-multiple`, data);
  },

  removeRole: async (data: AssignRoleReq): Promise<ApiResponse<any>> => {
    return await apiClient.delete(`${END_POINT}/remove`, { data });
  },

  removeRoles: async (data: AssignRolesReq): Promise<ApiResponse<any>> => {
    return await apiClient.delete(`${END_POINT}/remove-multiple`, { data });
  },
};
