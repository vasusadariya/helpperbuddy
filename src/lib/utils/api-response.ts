import { NextResponse } from "next/server";

interface ErrorResponse {
  success: false;
  error: { message: string; code?: number; details?: unknown };
  timestamp: string;
}

interface SuccessResponse<T> {
  success: true;
  data: T;
  timestamp: string;
}

export function apiResponse<T>(data: T, status: number = 200) {
  const currentUTCTime = new Date().toISOString().slice(0, 19).replace('T', ' ');

  if (status >= 400) {
    const errorResponse: ErrorResponse = {
      success: false,
      error: {
        message: data instanceof Error ? data.message : String(data),
        details: data
      },
      timestamp: currentUTCTime
    };
    return NextResponse.json(errorResponse, { status });
  }

  const successResponse: SuccessResponse<T> = {
    success: true,
    data,
    timestamp: currentUTCTime
  };
  return NextResponse.json(successResponse, { status });
}