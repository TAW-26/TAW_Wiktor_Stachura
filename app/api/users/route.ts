import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/auth";
import { createUser, listUsers } from "@/lib/server/user-service";
import { parseJsonBody, instrument } from "@/lib/server/http";

type CreateUserDto = {
  email: string;
  passwordHash: string;
  role?: "USER" | "ADMIN";
};

export async function GET(request: Request) {
  return instrument(request, "/api/users", async () => {
    requireAdmin(request);
    const users = await listUsers();
    return NextResponse.json(users, { status: 200 });
  });
}

export async function POST(request: Request) {
  return instrument(request, "/api/users", async () => {
    requireAdmin(request);
    const body = await parseJsonBody<CreateUserDto>(request);
    const user = await createUser(body);
    return NextResponse.json(user, { status: 201 });
  });
}
