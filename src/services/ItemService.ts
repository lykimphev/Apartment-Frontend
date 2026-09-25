import apiClient from "../apis/apiClient";
import type { ApiResponse } from "../apis/apiResponse";
import type { PagedResponse } from "../apis/pagedResponse";
import type { ItemReq, ItemRes } from "../model/Item";

const END_POINT = "/Item";

export const ItemService = {
  getItems: async (
    page: number = 1,
    pageSize: number = 10
  ): Promise<ApiResponse<PagedResponse<ItemRes>>> => {
    return await apiClient.get(`${END_POINT}?page=${page}&pageSize=${pageSize}`);
  },

  getAllItems: async (): Promise<ApiResponse<ItemRes[]>> => {
    return await apiClient.get(`${END_POINT}/all`);
  },

  getItemById: async (id: number): Promise<ApiResponse<ItemRes>> => {
    return await apiClient.get(`${END_POINT}/${id}`);
  },

  postItem: async (data: ItemReq): Promise<ApiResponse<ItemRes>> => {
    return await apiClient.post(`${END_POINT}`, data);
  },

  putItem: async (id: number, data: ItemReq): Promise<ApiResponse<ItemRes>> => {
    return await apiClient.put(`${END_POINT}/${id}`, data);
  },

  deleteItem: async (id: number): Promise<ApiResponse<any>> => {
    return await apiClient.delete(`${END_POINT}/${id}`);
  },
};
