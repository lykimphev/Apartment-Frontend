import apiClient from "../apis/apiClient";
import type { ApiResponse } from "../apis/apiResponse";
import type { PagedResponse } from "../apis/pagedResponse";
import type { User, RegisterReq, UserUpdateReq } from "../model/User";

const END_POINT = "/User";

export const UserService = {
  getUsers: async (
    page: number = 1,
    pageSize: number = 10
  ): Promise<ApiResponse<PagedResponse<User>>> => {
    return await apiClient.get(
      `${END_POINT}?page=${page}&pageSize=${pageSize}`
    );
  },

  getAllUsers: async (): Promise<ApiResponse<User[]>> => {
    return await apiClient.get(`${END_POINT}/all`);
  },

  getUserById: async (id: number): Promise<ApiResponse<User>> => {
    return await apiClient.get(`${END_POINT}/${id}`);
  },

  register: async (data: RegisterReq): Promise<ApiResponse<User>> => {
    return await apiClient.post(`${END_POINT}/register`, data);
  },

  updateUser: async (id: number, data: UserUpdateReq): Promise<ApiResponse<User>> => {
    return await apiClient.put(`${END_POINT}/${id}`, data);
  },

  toggleStatus: async (id: number): Promise<ApiResponse<User>> => {
    return await apiClient.put(`${END_POINT}/${id}/toggle-status`);
  },
};
