import apiClient from "../apis/apiClient";
import type { ApiResponse } from "../apis/apiResponse";
import type { PagedResponse } from "../apis/pagedResponse";
import type { RoomTypeReq, RoomTypeRes } from "../model/RoomType";

const END_POINT = "/Roomtype";

export const RoomTypeService = {
  getRoomTypes: async (
    page: number = 1,
    pageSize: number = 10
  ): Promise<ApiResponse<PagedResponse<RoomTypeRes>>> => {
    return await apiClient.get(`${END_POINT}?page=${page}&pageSize=${pageSize}`);
  },

  getAllRoomTypes: async (): Promise<ApiResponse<RoomTypeRes[]>> => {
    return await apiClient.get(`${END_POINT}/all`);
  },

  getRoomTypeById: async (id: number): Promise<ApiResponse<RoomTypeRes>> => {
    return await apiClient.get(`${END_POINT}/${id}`);
  },

  postRoomType: async (data: RoomTypeReq): Promise<ApiResponse<RoomTypeRes>> => {
    return await apiClient.post(`${END_POINT}`, data);
  },

  putRoomType: async (id: number, data: RoomTypeReq): Promise<ApiResponse<RoomTypeRes>> => {
    return await apiClient.put(`${END_POINT}/${id}`, data);
  },

  deleteRoomType: async (id: number): Promise<ApiResponse<any>> => {
    return await apiClient.delete(`${END_POINT}/${id}`);
  },
};
