import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/auth";
import { createFacility, listFacilities } from "@/lib/server/facility-service";
import { parseJsonBody, instrument } from "@/lib/server/http";

type CreateFacilityDto = {
  name: string;
  description?: string;
  openTime: string;
  closeTime: string;
};

export async function GET() {
  return instrument(undefined, "/api/facilities", async () => {
    const facilities = await listFacilities();
    return NextResponse.json(facilities, { status: 200 });
  });
}

export async function POST(request: Request) {
  return instrument(request, "/api/facilities", async () => {
    requireAdmin(request);
    const body = await parseJsonBody<CreateFacilityDto>(request);
    const facility = await createFacility(body);
    return NextResponse.json(facility, { status: 201 });
  });
}
