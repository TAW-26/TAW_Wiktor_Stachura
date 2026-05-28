import { NextResponse } from "next/server";
import { getFacilityDailyAvailability } from "@/lib/server/facility-service";
import { toIntId, instrument } from "@/lib/server/http";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { id } = await context.params;
  return instrument(request, "/api/facilities/:id/availability", async () => {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date");
    const date = dateParam ? new Date(dateParam) : new Date();

    if (Number.isNaN(date.getTime())) {
      return NextResponse.json({ error: "Invalid date query parameter" }, { status: 400 });
    }

    const availability = await getFacilityDailyAvailability(toIntId(id), date);
    return NextResponse.json(availability, { status: 200 });
  }, { params: { id } });
}
