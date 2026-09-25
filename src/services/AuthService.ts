import apiClient from "../apis/apiClient";
import type { ApiResponse } from "../apis/apiResponse";
import type { AuthLogin } from "../model/AuthLogin";
import type { User } from "../model/User";
import type { Role } from "../model/Role";

export interface LoginResponse {
  token: string;
  user: User;
  roles: Role[];
}

const END_POINT = "/User/login";

export const AuthService = {
  login: async (data: AuthLogin): Promise<ApiResponse<LoginResponse>> => {
    return await apiClient.post(`${END_POINT}`, data);
  },
};  