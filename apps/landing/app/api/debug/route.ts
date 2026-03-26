import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    hasDB: !!process.env.DATABASE_URL,
    hasDirect: !!process.env.DIRECT_URL,
    hasSecret: !!process.env.NEXTAUTH_SECRET,
    hasJWT: !!process.env.JWT_SECRET,
    nodeEnv: process.env.NODE_ENV,
  });
}
