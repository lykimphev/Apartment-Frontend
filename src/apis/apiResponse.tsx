export interface ApiResponse<T> {
  success: boolean;
  statuscode: number;
  message: string;
  data: T;
}