import { NextResponse } from "next/server";
import { createJwtForUser, registerUser } from "@/lib/server/auth";
import { parseJsonBody, instrument } from "@/lib/server/http";

type RegisterDto = {
  email: string;
  password: string;
};

export async function POST(request: Request) {
  return instrument(request, "/api/auth/register", async () => {
    const body = await parseJsonBody<RegisterDto>(request);
    const user = await registerUser(body);

    const token = createJwtForUser({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return NextResponse.json({ token, user }, { status: 201 });
  });
}
