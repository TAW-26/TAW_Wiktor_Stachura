import { NextResponse } from "next/server";
import { deleteUser, getUserById, updateUser } from "@/lib/server/user-service";
import { handleRouteError, parseJsonBody, toIntId } from "@/lib/server/http";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const user = await getUserById(toIntId(id));
    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await parseJsonBody<{
      email?: string;
      passwordHash?: string;
      role?: "USER" | "ADMIN";
    }>(request);

    const user = await updateUser(toIntId(id), body);
    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    await deleteUser(toIntId(id));
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleRouteError(error);
  }
}
