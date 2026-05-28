import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/auth";
import {
  deleteFacility,
  getFacilityById,
  updateFacility,
} from "@/lib/server/facility-service";
import { parseJsonBody, toIntId, instrument } from "@/lib/server/http";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  return instrument(_request, "/api/facilities/:id", async () => {
    const facility = await getFacilityById(toIntId(id));
    return NextResponse.json(facility, { status: 200 });
  }, { params: { id } });
}

export async function PUT(request: Request, context: RouteContext) {
  const { id } = await context.params;
  return instrument(request, "/api/facilities/:id", async () => {
    requireAdmin(request);
    const body = await parseJsonBody<{
      name?: string;
      description?: string;
      openTime?: string;
      closeTime?: string;
    }>(request);

    const facility = await updateFacility(toIntId(id), body);
    return NextResponse.json(facility, { status: 200 });
  }, { params: { id } });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  return instrument(_request, "/api/facilities/:id", async () => {
    requireAdmin(_request);
    await deleteFacility(toIntId(id));
    return new NextResponse(null, { status: 204 });
  }, { params: { id } });
}
