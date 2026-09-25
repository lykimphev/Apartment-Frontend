import apiClient from "../apis/apiClient";
import type { ApiResponse } from "../apis/apiResponse";
import type { PagedResponse } from "../apis/pagedResponse";
import type { RoomDetailReq, RoomDetailRes } from "../model/RoomDetail";

const END_POINT = "/RoomDetail";

export const RoomDetailService = {
  getRoomDetails: async (
    page: number = 1,
    pageSize: number = 10
  ): Promise<ApiResponse<PagedResponse<RoomDetailRes>>> => {
    return await apiClient.get(`${END_POINT}?page=${page}&pageSize=${pageSize}`);
  },

  getAllRoomDetails: async (): Promise<ApiResponse<RoomDetailRes[]>> => {
    return await apiClient.get(`${END_POINT}/all`);
  },

  getRoomDetailById: async (id: number): Promise<ApiResponse<RoomDetailRes>> => {
    return await apiClient.get(`${END_POINT}/${id}`);
  },

  postRoomDetail: async (data: RoomDetailReq): Promise<ApiResponse<RoomDetailRes>> => {
    return await apiClient.post(`${END_POINT}`, data);
  },

  putRoomDetail: async (
    id: number,
    data: RoomDetailReq
  ): Promise<ApiResponse<RoomDetailRes>> => {
    return await apiClient.put(`${END_POINT}/${id}`, data);
  },

  deleteRoomDetail: async (id: number): Promise<ApiResponse<any>> => {
    return await apiClient.delete(`${END_POINT}/${id}`);
  },
};
