export interface CustomResponse<T = void> {
  success: boolean;
  message?: string;
  data?: T;
}
