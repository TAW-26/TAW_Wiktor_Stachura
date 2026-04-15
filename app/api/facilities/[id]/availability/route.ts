import { NextResponse } from "next/server";
import { getFacilityDailyAvailability } from "@/lib/server/facility-service";
import { handleRouteError, toIntId } from "@/lib/server/http";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date");
    const date = dateParam ? new Date(dateParam) : new Date();

    if (Number.isNaN(date.getTime())) {
      return NextResponse.json({ error: "Invalid date query parameter" }, { status: 400 });
    }

    const availability = await getFacilityDailyAvailability(toIntId(id), date);
    return NextResponse.json(availability, { status: 200 });
  } catch (error) {
    return handleRouteError(error);
  }
}
