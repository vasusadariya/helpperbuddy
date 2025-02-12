import { NextResponse } from "next/server";

export function apiResponse(data: any, status: number = 200) {
  const currentUTCTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
  
  if (status >= 400) {
    return NextResponse.json({
      success: false,
      error: data,
      timestamp: currentUTCTime
    }, { status });
  }

  return NextResponse.json({
    success: true,
    data,
    timestamp: currentUTCTime
  }, { status });
}