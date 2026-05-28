import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/auth";
import {
  deleteFacility,
  getFacilityById,
  updateFacility,
} from "@/lib/server/facility-service";
import { handleRouteError, parseJsonBody, toIntId } from "@/lib/server/http";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const facility = await getFacilityById(toIntId(id));
    return NextResponse.json(facility, { status: 200 });
  } catch (error) {
    const { id: _id } = await context.params;
    return handleRouteError(error, { route: "/api/facilities/:id", method: "GET", params: { id: _id } });
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    requireAdmin(request);
    const { id } = await context.params;
    const body = await parseJsonBody<{
      name?: string;
      description?: string;
      openTime?: string;
      closeTime?: string;
    }>(request);

    const facility = await updateFacility(toIntId(id), body);
    return NextResponse.json(facility, { status: 200 });
  } catch (error) {
    const { id: _id } = await context.params;
    return handleRouteError(error, { route: "/api/facilities/:id", method: "PUT", params: { id: _id } });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    requireAdmin(_request);
    const { id } = await context.params;
    await deleteFacility(toIntId(id));
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    const { id: _id } = await context.params;
    return handleRouteError(error, { route: "/api/facilities/:id", method: "DELETE", params: { id: _id } });
  }
}
