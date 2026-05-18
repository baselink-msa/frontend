export type ApiResponse<T> = {
  success: true;
  data: T;
  message?: string;
};

export type ApiErrorResponse = {
  success: false;
  error: {
    code: string;
    message: string;
  };
};

export type ApiResult<T> = ApiResponse<T> | ApiErrorResponse;

export type UserRole = 'USER' | 'ADMIN';
