import apiClient from "../apis/apiClient";
import type { ApiResponse } from "../apis/apiResponse";
import type { PagedResponse } from "../apis/pagedResponse";
import type { Guest, GuestReq } from "../model/Guest";

const END_POINT = "/Guest";

export const GuestService = {
  // GET /api/Guest
  getGuests: async (
    page: number = 1,
    pageSize: number = 10
  ): Promise<ApiResponse<PagedResponse<Guest>>> => {
    return await apiClient.get(
      `${END_POINT}?page=${page}&pageSize=${pageSize}`
    );
  },

  // GET /api/Guest/all
  getAllGuests: async (): Promise<ApiResponse<Guest[]>> => {
    return await apiClient.get(`${END_POINT}/all`);
  },

  // GET /api/Guest/{id}
  getGuestById: async (id: number): Promise<ApiResponse<Guest>> => {
    return await apiClient.get(`${END_POINT}/${id}`);
  },

  // POST /api/Guest (multipart/form-data)
  createGuest: async (data: GuestReq | FormData): Promise<ApiResponse<Guest>> => {
    let body: FormData;
    if (data instanceof FormData) {
      body = data;
    } else {
      body = new FormData();
      body.append("Name", data.name || "");
      body.append("NameKH", data.nameKH || "");
      body.append("Gender", data.gender || "");
      if (data.dob) body.append("DOB", data.dob);
      body.append("Address", data.address || "");
      body.append("Nationality", data.nationality || "");
      body.append("Phone", data.phone || "");
      body.append("Email", data.email || "");
      body.append("SSN", data.ssn || "");
      body.append("Passport", data.passport || "");
      body.append("Status", data.status || "");
      if (data.image) body.append("Image", data.image);
    }

    return await apiClient.post(`${END_POINT}`, body);
  },

  // PUT /api/Guest/{id} (multipart/form-data)
  updateGuest: async (
    id: number,
    data: GuestReq | FormData
  ): Promise<ApiResponse<Guest>> => {
    let body: FormData;
    if (data instanceof FormData) {
      body = data;
    } else {
      body = new FormData();
      body.append("Name", data.name || "");
      body.append("NameKH", data.nameKH || "");
      body.append("Gender", data.gender || "");
      if (data.dob) body.append("DOB", data.dob);
      body.append("Address", data.address || "");
      body.append("Nationality", data.nationality || "");
      body.append("Phone", data.phone || "");
      body.append("Email", data.email || "");
      body.append("SSN", data.ssn || "");
      body.append("Passport", data.passport || "");
      body.append("Status", data.status || "");
      if (data.image) body.append("Image", data.image);
    }

    return await apiClient.put(`${END_POINT}/${id}`, body);
  },

  // DELETE /api/Guest/{id}
  deleteGuest: async (id: number): Promise<ApiResponse<any>> => {
    return await apiClient.delete(`${END_POINT}/${id}`);
  },
};
