import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/server/auth";
import { deleteUser, getUserById, updateUser } from "@/lib/server/user-service";
import { handleRouteError, parseJsonBody, toIntId } from "@/lib/server/http";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const auth = requireAuth(_request);
    const { id } = await context.params;
    const targetId = toIntId(id);

    if (auth.role !== "ADMIN" && auth.id !== targetId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const user = await getUserById(targetId);
    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    const { id: _id } = await context.params;
    return handleRouteError(error, { route: "/api/users/:id", method: "GET", params: { id: _id } });
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const auth = requireAuth(request);
    const { id } = await context.params;
    const targetId = toIntId(id);

    if (auth.role !== "ADMIN" && auth.id !== targetId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await parseJsonBody<{
      email?: string;
      passwordHash?: string;
      role?: "USER" | "ADMIN";
    }>(request);

    if (auth.role !== "ADMIN" && body.role) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const user = await updateUser(targetId, body);
    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    const { id: _id } = await context.params;
    return handleRouteError(error, { route: "/api/users/:id", method: "PUT", params: { id: _id } });
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const auth = requireAuth(request);
    if (auth.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await context.params;
    await deleteUser(toIntId(id));
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    const { id: _id } = await context.params;
    return handleRouteError(error, { route: "/api/users/:id", method: "DELETE", params: { id: _id } });
  }
}
