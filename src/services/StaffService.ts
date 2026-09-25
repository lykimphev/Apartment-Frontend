import apiClient from "../apis/apiClient";
import type { ApiResponse } from "../apis/apiResponse";
import type { PagedResponse } from "../apis/pagedResponse";
import type { StaffRes, StaffReq } from "../model/Staff";

const END_POINT = "/Staff";

export const StaffService = {
  getStaffs: async (
    page: number = 1,
    pageSize: number = 10
  ): Promise<ApiResponse<PagedResponse<StaffRes>>> => {
    return await apiClient.get(`${END_POINT}?page=${page}&pageSize=${pageSize}`);
  },

  getAllStaffs: async (): Promise<ApiResponse<StaffRes[]>> => {
    return await apiClient.get(`${END_POINT}/all`);
  },

  getStaffById: async (id: number): Promise<ApiResponse<StaffRes>> => {
    return await apiClient.get(`${END_POINT}/${id}`);
  },

  createStaff: async (data: StaffReq | FormData): Promise<ApiResponse<StaffRes>> => {
    let body: FormData;
    if (data instanceof FormData) {
      body = data;
    } else {
      body = new FormData();
      if (data.positionId && data.positionId > 0) body.append("PositionId", data.positionId.toString());
      body.append("Name", data.name || "");
      if (data.nameKh) body.append("NameKh", data.nameKh);
      if (data.sex) body.append("Sex", data.sex);
      if (data.dob) body.append("Dob", data.dob);
      if (data.phone) body.append("Phone", data.phone);
      if (data.address) body.append("Address", data.address);
      if (data.email) body.append("Email", data.email);
      if (data.identityNo) body.append("IdentityNo", data.identityNo);
      if (data.status) body.append("Status", data.status);
      if (data.createBy) body.append("CreateBy", data.createBy.toString());
      if (data.photo) body.append("Photo", data.photo);
    }
    return await apiClient.post(`${END_POINT}`, body);
  },

  updateStaff: async (id: number, data: StaffReq | FormData): Promise<ApiResponse<StaffRes>> => {
    let body: FormData;
    if (data instanceof FormData) {
      body = data;
    } else {
      body = new FormData();
      if (data.positionId && data.positionId > 0) body.append("PositionId", data.positionId.toString());
      body.append("Name", data.name || "");
      if (data.nameKh) body.append("NameKh", data.nameKh);
      if (data.sex) body.append("Sex", data.sex);
      if (data.dob) body.append("Dob", data.dob);
      if (data.phone) body.append("Phone", data.phone);
      if (data.address) body.append("Address", data.address);
      if (data.email) body.append("Email", data.email);
      if (data.identityNo) body.append("IdentityNo", data.identityNo);
      if (data.status) body.append("Status", data.status);
      if (data.createBy) body.append("CreateBy", data.createBy.toString());
      if (data.photo) body.append("Photo", data.photo);
    }
    return await apiClient.put(`${END_POINT}/${id}`, body);
  },

  deleteStaff: async (id: number): Promise<ApiResponse<any>> => {
    return await apiClient.delete(`${END_POINT}/${id}`);
  },
};
