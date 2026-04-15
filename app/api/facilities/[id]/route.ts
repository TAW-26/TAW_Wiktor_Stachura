import { NextResponse } from "next/server";
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
    return handleRouteError(error);
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
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
    return handleRouteError(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    await deleteFacility(toIntId(id));
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleRouteError(error);
  }
}
