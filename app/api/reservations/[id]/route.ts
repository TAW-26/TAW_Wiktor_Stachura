import { NextResponse } from "next/server";
import {
  cancelReservation,
  deleteReservation,
  getReservationById,
  updateReservationTime,
} from "@/lib/server/reservation-service";
import { handleRouteError, parseJsonBody, toIntId } from "@/lib/server/http";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const reservation = await getReservationById(toIntId(id));
    return NextResponse.json(reservation, { status: 200 });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await parseJsonBody<{ startTime: string; endTime: string }>(request);

    const reservation = await updateReservationTime(
      toIntId(id),
      new Date(body.startTime),
      new Date(body.endTime),
    );

    return NextResponse.json(reservation, { status: 200 });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get("mode");

    if (mode === "hard") {
      await deleteReservation(toIntId(id));
      return new NextResponse(null, { status: 204 });
    }

    const role = searchParams.get("role") === "ADMIN" ? "ADMIN" : "USER";
    const userIdRaw = searchParams.get("userId");
    const userId = userIdRaw ? toIntId(userIdRaw) : undefined;

    const reservation = await cancelReservation(toIntId(id), role, userId);
    return NextResponse.json(reservation, { status: 200 });
  } catch (error) {
    return handleRouteError(error);
  }
}
