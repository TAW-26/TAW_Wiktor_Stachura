import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/auth";
import { createFacility, listFacilities } from "@/lib/server/facility-service";
import { handleRouteError, parseJsonBody } from "@/lib/server/http";

type CreateFacilityDto = {
  name: string;
  description?: string;
  openTime: string;
  closeTime: string;
};

export async function GET() {
  try {
    const facilities = await listFacilities();
    return NextResponse.json(facilities, { status: 200 });
  } catch (error) {
    return handleRouteError(error, { route: "/api/facilities", method: "GET" });
  }
}

export async function POST(request: Request) {
  try {
    requireAdmin(request);
    const body = await parseJsonBody<CreateFacilityDto>(request);
    const facility = await createFacility(body);
    return NextResponse.json(facility, { status: 201 });
  } catch (error) {
    return handleRouteError(error, { route: "/api/facilities", method: "POST" });
  }
}
