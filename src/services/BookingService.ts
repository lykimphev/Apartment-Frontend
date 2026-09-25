import apiClient from "../apis/apiClient";
import type { ApiResponse } from "../apis/apiResponse";
import type { PagedResponse } from "../apis/pagedResponse";
import type { BookingReq, BookingRes } from "../model/Booking";

const END_POINT = "/Booking";

export const BookingService = {
  // GET /api/Booking?page=1&pageSize=10
  getBookings: async (
    page: number = 1,
    pageSize: number = 10
  ): Promise<ApiResponse<PagedResponse<BookingRes>>> => {
    return await apiClient.get(`${END_POINT}?page=${page}&pageSize=${pageSize}`);
  },

  // GET /api/Booking/{id}
  getBookingById: async (id: number): Promise<ApiResponse<BookingRes>> => {
    return await apiClient.get(`${END_POINT}/${id}`);
  },

  // POST /api/Booking
  createBooking: async (data: BookingReq): Promise<ApiResponse<BookingRes>> => {
    return await apiClient.post(`${END_POINT}`, data);
  },

  // PUT /api/Booking/{id}
  updateBooking: async (
    id: number,
    data: BookingReq
  ): Promise<ApiResponse<BookingRes>> => {
    return await apiClient.put(`${END_POINT}/${id}`, data);
  },

  // DELETE /api/Booking/{id}
  deleteBooking: async (id: number): Promise<ApiResponse<any>> => {
    return await apiClient.delete(`${END_POINT}/${id}`);
  },
};
