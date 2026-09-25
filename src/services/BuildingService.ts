import apiClient from "../apis/apiClient";
import type { ApiResponse } from "../apis/apiResponse";
import type { PagedResponse } from "../apis/pagedResponse";
import type { Building } from "../model/Building";

const END_POINT = "/Building";
export const BuildingService ={
    //Get All Building with Pages
    getBuildings: async (
        page: number,
        pageSize: number,
    ): Promise<ApiResponse<PagedResponse<Building>>> => {
        return await apiClient.get (
            `${END_POINT}?page=${page}&pageSize=${pageSize}`,
        );
    },

    postBuilding: async (data: Building): Promise<ApiResponse<Building>> => {
        return await apiClient.post(`${END_POINT}`,data);
    },

    putBuilding: async (data: Building): Promise<ApiResponse<Building>> => {
        return await apiClient.put(`${END_POINT}/${data.id}`, data);
    },
    
    
    deleteBuilding: async (id: number): Promise<ApiResponse<Building>> => {
    return await apiClient.delete(`${END_POINT}/${id}`);
    },
};