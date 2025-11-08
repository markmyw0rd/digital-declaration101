import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "../../../lib/jwt";
export async function POST(req: NextRequest){
  const token = await req.text();
  const { envId, role } = verifyToken<{envId:string,role:string}>(token);
  return NextResponse.json({ envId, role });
}
