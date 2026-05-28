import { NextResponse } from "next/server";
import { loginUser } from "@/lib/server/auth";
import { handleRouteError, parseJsonBody } from "@/lib/server/http";
import { withTiming } from "@/lib/server/monitoring";

type LoginDto = {
  email: string;
  password: string;
};

export async function POST(request: Request) {
  try {
    const body = await parseJsonBody<LoginDto>(request);
    const result = await withTiming("auth.login", () => loginUser(body.email, body.password), { email: body.email });
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return handleRouteError(error, { route: "/api/auth/login", method: "POST" });
  }
}
