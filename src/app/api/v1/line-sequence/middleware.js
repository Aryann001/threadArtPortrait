import { NextResponse } from "next/server";

export function middleware(req) {
  if (req.method === "POST") {
    req.headers.set("Content-Length", "100mb"); // Increase limit
  }
  return NextResponse.next();
}
