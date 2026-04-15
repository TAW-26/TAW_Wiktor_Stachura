import { NextResponse } from "next/server";
import { loginUser } from "@/lib/server/auth";
import { handleRouteError, parseJsonBody } from "@/lib/server/http";

type LoginDto = {
  email: string;
  password: string;
};

export async function POST(request: Request) {
  try {
    const body = await parseJsonBody<LoginDto>(request);
    const result = await loginUser(body.email, body.password);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return handleRouteError(error);
  }
}
