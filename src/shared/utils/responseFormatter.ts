type SuccessResponse<T> = {
  success: true;
  message: string;
  data: T;
  statusCode: number;
  timestamp: string;
};

type ErrorResponse = {
  success: false;
  message: string;
  error: unknown;
  statusCode: number;
  timestamp: string;
};

type PaginatedResponse<T> = {
  success: true;
  data: T;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  timestamp: string;
};

class ResponseFormatter {
  static success<T>(
    data: T,
    message: string = "Success",
    statusCode: number = 200
  ): SuccessResponse<T> {
    return {
      success: true,
      message,
      data,
      statusCode,
      timestamp: new Date().toISOString(),
    };
  }

  static error(
    message: string = "Error",
    statusCode: number = 500,
    error: unknown = null
  ): ErrorResponse {
    return {
      success: false,
      message,
      error,
      statusCode,
      timestamp: new Date().toISOString(),
    };
  }

  static validationError(error: unknown = null): ErrorResponse {
    return {
      success: false,
      message: "Validation failed",
      error,
      statusCode: 400,
      timestamp: new Date().toISOString(),
    };
  }

  static paginated<T>(
    data: T,
    page: number,
    limit: number,
    total: number
  ): PaginatedResponse<T> {
    return {
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      timestamp: new Date().toISOString(),
    };
  }
}

export default ResponseFormatter;